import os
os.environ["TRANSFORMERS_NO_TF"] = "1"

import json
import re
import spacy
from collections import defaultdict

from transformers import pipeline
from sentence_transformers import SentenceTransformer, util

# Load models once
nlp = spacy.load("en_core_web_sm")
sbert_model = SentenceTransformer("all-MiniLM-L6-v2")
sentiment_pipeline = pipeline("sentiment-analysis")

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
DATA_DIR = os.path.join(BASE_DIR, 'data')
RAW_DATA_PATH = os.path.join(DATA_DIR, 'raw_data.json')
ENHANCED_DATA_PATH = os.path.join(DATA_DIR, 'enhanced_gfg_data.json')


# Normalize round names
ROUND_MAPPING = {
    "technical interview 1": "Technical",
    "technical interview 2": "Technical",
    "technical round": "Technical",
    "hr round": "HR",
    "managerial round": "Managerial",
    "coding round": "Coding",
    "group discussion": "Group Discussion",
    "gd round": "Group Discussion",
    "aptitude round": "Aptitude",
    "online assessment": "Online Assessment",
    "resume shortlisting": "Resume Shortlisting",
    "exploratory round": "Initial Screening"
}

def normalize_round_name(name):
    name = name.lower().strip()
    for key in ROUND_MAPPING:
        if key in name:
            return ROUND_MAPPING[key]
    return name.title()

def extract_verdict(text):
    verdict_keywords = {
        "selected": "Selected",
        "rejected": "Rejected",
        "not selected": "Rejected",
        "shortlisted": "Shortlisted",
    }
    for line in text.split("\n"):
        for key in verdict_keywords:
            if key in line.lower():
                return verdict_keywords[key]
    return ""

def deduplicate_questions_semantically(questions, threshold=0.8):
    embeddings = sbert_model.encode(questions, convert_to_tensor=True)
    deduped = []
    used = set()

    for i, q in enumerate(questions):
        if i in used:
            continue
        deduped.append(q)
        for j in range(i + 1, len(questions)):
            if j not in used and util.cos_sim(embeddings[i], embeddings[j]) > threshold:
                used.add(j)
    return deduped


def extract_questions_by_round(content):
    rounds = defaultdict(list)
    current_round = "General"

    for line in content.split("\n"):
        line = line.strip()

        # Detect round headers
        if re.match(r"(?i)^round\s*\d*[:\-]?\s*", line):
            current_round = normalize_round_name(line)
            continue
        elif any(keyword in line.lower() for keyword in ROUND_MAPPING.keys()):
            current_round = normalize_round_name(line)
            continue

        # Filter actual questions
        if (
            len(line) < 10 or
            not re.search(r"\?$|^(what|why|how|could|do|explain|when|which|are|did|describe|have|name)", line.lower())
        ):
            continue

        rounds[current_round].append(line)

    # Deduplicate + add topics
    final = {}
    for round_name, qs in rounds.items():
        deduped = deduplicate_questions_semantically(qs)
        final[round_name] = [{"question": q} for q in deduped]


    return final

def extract_highlights(text, max_sentences=8):
    doc = nlp(text)
    highlights = []
    seen = set()

    for sent in doc.sents:
        sent_text = sent.text.strip()

        # Skip too short or uninformative lines
        if len(sent_text) < 40 or len(sent_text.split()) < 5:
            continue

        # Clean up
        sent_text = re.sub(r"\s+", " ", sent_text)

        # Only keep lines that are relevant
        if any(word in sent_text.lower() for word in [
            "selected", "shortlisted", "focused on", "asked", "interview", "round",
            "cleared", "explained", "project", "resume", "background", "assessment"
        ]):
            # Remove duplicate or near-duplicate sentences
            if sent_text not in seen:
                highlights.append(sent_text)
                seen.add(sent_text)

        if len(highlights) >= max_sentences:
            break

    return highlights


def analyze_sentiment(text):
    """
    Analyze sentiment using Hugging Face Transformers.
    Returns 'POSITIVE' or 'NEGATIVE'.
    """
    result = sentiment_pipeline(text[:512])
    return result[0]['label']

# def analyze_sentiment_transformer(text):
#     try:
#         result = sentiment_pipeline(text[:512])[0]  # Limit to 512 tokens
#         return result["label"]  # 'POSITIVE' or 'NEGATIVE'
#     except:
#         return "Neutral"

def extract_metadata(entry):
    title = entry.get("title", "")
    content = entry.get("content", "")

    # Company & role
    company = title.split("Interview Experience")[0].strip()
    role_match = re.search(r"for ([A-Za-z0-9()+\- ]+)", title, re.IGNORECASE)
    role = role_match.group(1).strip() if role_match else ""

    round_keywords = ["Online Assessment", "Technical", "HR", "Managerial", "Coding", "Aptitude", "Telephonic", "Group Discussion"]
    found_rounds = list({r for r in round_keywords if re.search(rf"(?i)\b{re.escape(r)}\b", content)})

    diff_match = re.search(r"(easy|medium|moderate|hard|difficult|tough)", content.lower())
    difficulty = {"easy": "Easy", "medium": "Medium", "moderate": "Medium", "hard": "Hard", "difficult": "Hard", "tough": "Hard"}.get(diff_match.group(1)) if diff_match else ""

    verdict = extract_verdict(content)
    questions_by_round = extract_questions_by_round(content)
    total_questions = sum(len(v) for v in   questions_by_round.values())
    highlights = extract_highlights(content)
    sentiment = analyze_sentiment(content)

    return {
        "company": company,
        "role": role,
        "rounds": found_rounds,
        "difficulty": difficulty,
        "verdict": verdict,
        "question_count": total_questions,
        "questions_by_round": questions_by_round,
        "highlights": highlights,
        "feedback_sentiment": sentiment
    }
def process_enhanced_pipeline(input_file=RAW_DATA_PATH, output_file=ENHANCED_DATA_PATH):
    # Load raw data (new experiences)
    with open(input_file, "r", encoding="utf-8") as f:
        raw_data = json.load(f)

    # Load existing enhanced data if exists
    if os.path.exists(output_file):
        with open(output_file, "r", encoding="utf-8") as ef:
            existing_enhanced = json.load(ef)
    else:
        existing_enhanced = []

    # Filter new entries (not already in enhanced)
    already_titles = {entry['title'] for entry in existing_enhanced if 'title' in entry}
    new_enriched = []

    for entry in raw_data:
        if entry.get("title") not in already_titles:
            new_enriched.append({**entry, **extract_metadata(entry)})

    # Merge and write back
    merged = existing_enhanced + new_enriched

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(merged, f, indent=2, ensure_ascii=False)

    print(f"[✓] Appended {len(new_enriched)} entries to '{output_file}'")



def summarize_text_spacy(text, max_sentences=3):
    """
    Generate a simple summary of the input text using spaCy sentence splitting.
    """
    doc = nlp(text)
    sentences = [sent.text.strip() for sent in doc.sents if len(sent.text.strip()) > 40]
    return " ".join(sentences[:max_sentences])



if __name__ == "__main__":
    process_enhanced_pipeline()



