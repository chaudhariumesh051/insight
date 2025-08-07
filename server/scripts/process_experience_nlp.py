#!/usr/bin/env python3
"""
Enhanced NLP Pipeline for Processing Interview Experiences
Improved error handling and dependency management
"""

import json
import re
import sys
import os
from datetime import datetime
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Try to import required packages with fallbacks
try:
    import nltk
    from nltk.sentiment import SentimentIntensityAnalyzer
    from nltk.tokenize import sent_tokenize, word_tokenize
    from nltk.corpus import stopwords
    from nltk.tag import pos_tag
    NLTK_AVAILABLE = True
    logger.info("NLTK imported successfully")
except ImportError as e:
    logger.warning(f"NLTK not available: {e}")
    NLTK_AVAILABLE = False

try:
    import spacy
    SPACY_AVAILABLE = True
    logger.info("spaCy imported successfully")
except ImportError as e:
    logger.warning(f"spaCy not available: {e}")
    SPACY_AVAILABLE = False

from collections import Counter

class InterviewExperienceProcessor:
    def __init__(self):
        self.nltk_ready = False
        self.spacy_ready = False
        
        # Initialize NLTK components
        if NLTK_AVAILABLE:
            try:
                self._setup_nltk()
                self.nltk_ready = True
                logger.info("NLTK setup completed")
            except Exception as e:
                logger.warning(f"NLTK setup failed: {e}")
        
        # Initialize spaCy
        if SPACY_AVAILABLE:
            try:
                self.nlp = spacy.load("en_core_web_sm")
                self.spacy_ready = True
                logger.info("spaCy model loaded successfully")
            except Exception as e:
                logger.warning(f"spaCy model loading failed: {e}")
                self.nlp = None
        
        # Question patterns for categorization
        self.question_patterns = {
            'technical': [
                r'\b(algorithm|data structure|complexity|optimization|performance|database|api|framework|library|testing|deployment|architecture|design pattern|microservices|distributed|concurrency|threading|memory|network|protocol|security|authentication|encryption|caching|monitoring|logging)\b',
                r'\b(implement|code|write|solve|optimize|design|build|create|develop|function|class|method|loop|recursion|sorting|searching|graph|tree|array|stack|queue|heap|hash table|binary search|dynamic programming)\b',
                r'\b(dns|dhcp|tcp|ip|http|https|ssl|tls|rest|graphql|json|xml|sql|nosql|mysql|postgresql|mongodb|redis|elasticsearch|docker|kubernetes|aws|azure|gcp|linux|windows|bash|shell|git|ci/cd)\b'
            ],
            'behavioral': [
                r'\b(experience|project|team|leadership|conflict|challenge|problem|solution|collaboration|communication|feedback|mentor|growth|learning|improvement|goal|achievement|failure|success|stress|pressure|deadline|priority|decision|difficult customer|customer service)\b',
                r'\b(tell me about|describe|explain|how did you|what would you|situation|example|instance|time when|handled|managed|resolved|overcame|learned|grew|developed|improved|stay calm|prioritize|communication skills)\b'
            ],
            'system_design': [
                r'\b(system|architecture|design|scale|scalability|performance|throughput|latency|availability|reliability|fault tolerance|redundancy|load balancing|caching|database|storage|distributed|microservices|api|message queue|real-time|batch processing)\b',
                r'\b(design a|build a|create a|architect|scale to|handle|support|serve|process|store|retrieve|search|recommend|notify|authenticate|monitor|deploy|containerize|manage|operate|maintain|backup|recovery)\b'
            ],
            'coding': [
                r'\b(code|program|implement|write|solve|algorithm|data structure|complexity|time complexity|space complexity|optimization|efficiency|correctness|edge case|test case|debug|fix|refactor|clean code)\b',
                r'\b(leetcode|hackerrank|codility|competitive programming|interview question|coding challenge|whiteboard|pair programming|code review|version control|git|branch|commit)\b'
            ]
        }
        
        # Sentiment keywords
        self.sentiment_keywords = {
            'positive': ['excellent', 'great', 'good', 'amazing', 'wonderful', 'fantastic', 'smooth', 'easy', 'helpful', 'supportive', 'professional', 'organized', 'clear', 'fair', 'selected', 'offered', 'positive', 'successful'],
            'negative': ['difficult', 'hard', 'stressful', 'unclear', 'confusing', 'disorganized', 'unprofessional', 'rude', 'unhelpful', 'negative', 'rejected', 'failed', 'disappointing', 'frustrating', 'terrible', 'awful', 'bad', 'poor'],
            'neutral': ['okay', 'fine', 'average', 'standard', 'normal', 'typical', 'expected', 'reasonable', 'fair', 'balanced', 'mixed']
        }

    def _setup_nltk(self):
        """Setup NLTK with required data"""
        required_data = [
            ('tokenizers/punkt', 'punkt'),
            ('tokenizers/punkt_tab', 'punkt_tab'),  # New NLTK version requirement
            ('vader_lexicon', 'vader_lexicon'),
            ('averaged_perceptron_tagger', 'averaged_perceptron_tagger'),
            ('averaged_perceptron_tagger_eng', 'averaged_perceptron_tagger_eng'),  # Alternative tagger
            ('stopwords', 'stopwords')
        ]
        
        for data_path, download_name in required_data:
            try:
                nltk.data.find(data_path)
            except LookupError:
                try:
                    logger.info(f"Downloading NLTK data: {download_name}")
                    nltk.download(download_name, quiet=True)
                except Exception as e:
                    logger.warning(f"Failed to download {download_name}: {e}")
        
        self.sia = SentimentIntensityAnalyzer()
        self.stop_words = set(stopwords.words('english'))

    def extract_questions(self, text):
        """Extract questions from text using simple pattern matching"""
        questions = []
        
        # Split into sentences using simple splitting if NLTK not available
        if self.nltk_ready:
            try:
                sentences = sent_tokenize(text)
            except Exception as e:
                logger.warning(f"NLTK tokenization failed: {e}")
                # Fallback sentence splitting
                sentences = re.split(r'[.!?]+', text)
                sentences = [s.strip() for s in sentences if s.strip()]
        else:
            # Fallback sentence splitting
            sentences = re.split(r'[.!?]+', text)
            sentences = [s.strip() for s in sentences if s.strip()]
        
        for sentence in sentences:
            sentence = sentence.strip()
            # Look for questions (ending with ? or containing question words)
            if (sentence.endswith('?') or 
                any(word in sentence.lower() for word in ['asked', 'question', 'what', 'how', 'why', 'when', 'where', 'which', 'who', 'explain', 'describe', 'tell me'])):
                questions.append(sentence)
        
        return questions

    def categorize_questions(self, questions):
        """Categorize questions by type"""
        categorized = {
            'technical': [],
            'behavioral': [],
            'system_design': [],
            'coding': [],
            'other': []
        }
        
        for question in questions:
            question_lower = question.lower()
            max_score = 0
            best_category = 'other'
            
            for category, patterns in self.question_patterns.items():
                score = 0
                for pattern in patterns:
                    matches = re.findall(pattern, question_lower, re.IGNORECASE)
                    score += len(matches)
                
                if score > max_score:
                    max_score = score
                    best_category = category
            
            categorized[best_category].append(question)
        
        return categorized

    def analyze_sentiment(self, text):
        """Perform sentiment analysis with fallback"""
        text_lower = text.lower()
        
        # Try VADER sentiment analysis if available
        if self.nltk_ready:
            try:
                vader_scores = self.sia.polarity_scores(text)
            except Exception as e:
                logger.warning(f"VADER analysis failed: {e}")
                vader_scores = {'compound': 0.0, 'pos': 0.0, 'neu': 1.0, 'neg': 0.0}
        else:
            vader_scores = {'compound': 0.0, 'pos': 0.0, 'neu': 1.0, 'neg': 0.0}
        
        # Keyword-based sentiment analysis
        keyword_scores = {'positive': 0, 'negative': 0, 'neutral': 0}
        
        for sentiment, keywords in self.sentiment_keywords.items():
            for keyword in keywords:
                keyword_scores[sentiment] += text_lower.count(keyword)
        
        # Determine overall sentiment
        if self.nltk_ready and vader_scores['compound'] >= 0.05:
            sentiment = 'positive'
        elif self.nltk_ready and vader_scores['compound'] <= -0.05:
            sentiment = 'negative'
        elif keyword_scores['positive'] > keyword_scores['negative']:
            sentiment = 'positive'
        elif keyword_scores['negative'] > keyword_scores['positive']:
            sentiment = 'negative'
        else:
            sentiment = 'neutral'
        
        # Calculate confidence
        if self.nltk_ready:
            confidence = abs(vader_scores['compound'])
        else:
            total_keywords = sum(keyword_scores.values())
            if total_keywords > 0:
                confidence = max(keyword_scores.values()) / total_keywords
            else:
                confidence = 0.5
        
        return {
            'sentiment': sentiment,
            'vader_scores': vader_scores,
            'keyword_scores': keyword_scores,
            'confidence': confidence
        }

    def extract_key_insights(self, text):
        """Extract key insights from the experience"""
        insights = {
            'topics': [],
            'skills': [],
            'technologies': [],
            'companies_mentioned': [],
            'difficulty_indicators': [],
            'preparation_tips': [],
            'red_flags': [],
            'positive_aspects': []
        }
        
        text_lower = text.lower()
        
        # Extract technologies using pattern matching
        tech_patterns = [
            r'\b(python|java|javascript|typescript|react|angular|vue|node|express|django|flask|spring|hibernate|mysql|postgresql|mongodb|redis|docker|kubernetes|aws|azure|gcp|git|jenkins|jira|zendesk)\b'
        ]
        
        for pattern in tech_patterns:
            matches = re.findall(pattern, text_lower, re.IGNORECASE)
            insights['technologies'].extend(matches)
        
        # Extract difficulty indicators
        difficulty_patterns = [
            r'\b(easy|simple|straightforward|basic|fundamental)\b',
            r'\b(medium|moderate|reasonable|standard|typical)\b',
            r'\b(hard|difficult|challenging|complex|advanced)\b',
            r'\b(very hard|extremely difficult|intense|rigorous)\b'
        ]
        
        for pattern in difficulty_patterns:
            matches = re.findall(pattern, text_lower, re.IGNORECASE)
            insights['difficulty_indicators'].extend(matches)
        
        # Extract preparation tips
        tip_patterns = [
            r'\b(study|practice|prepare|review|learn|read|watch|mock interview|leetcode|hackerrank)\b'
        ]
        
        for pattern in tip_patterns:
            matches = re.findall(pattern, text_lower, re.IGNORECASE)
            insights['preparation_tips'].extend(matches)
        
        # Extract red flags and positive aspects
        for keyword in self.sentiment_keywords['negative']:
            if keyword in text_lower:
                insights['red_flags'].append(keyword)
        
        for keyword in self.sentiment_keywords['positive']:
            if keyword in text_lower:
                insights['positive_aspects'].append(keyword)
        
        # Use spaCy for entity extraction if available
        if self.spacy_ready and self.nlp:
            try:
                doc = self.nlp(text)
                for ent in doc.ents:
                    if ent.label_ in ['ORG']:
                        insights['companies_mentioned'].append(ent.text)
                    elif ent.label_ in ['PRODUCT', 'GPE']:
                        insights['technologies'].append(ent.text)
            except Exception as e:
                logger.warning(f"spaCy processing failed: {e}")
        
        # Remove duplicates and clean up
        for key in insights:
            if isinstance(insights[key], list):
                insights[key] = list(dict.fromkeys(insights[key]))  # Remove duplicates while preserving order
        
        return insights

    def extract_rounds(self, text):
        """Extract interview rounds information"""
        rounds = []
        
        # Common round patterns
        round_patterns = [
            (r'\b(phone screen|phone interview|screening|initial)\b', 'Phone Screen'),
            (r'\b(technical|coding|programming|algorithm)\b', 'Technical Round'),
            (r'\b(behavioral|culture|personality|soft skills)\b', 'Behavioral Round'),
            (r'\b(system design|architecture|design)\b', 'System Design'),
            (r'\b(onsite|on-site|in-person|final)\b', 'Onsite Round'),
            (r'\b(hr|human resources|recruiter)\b', 'HR Round')
        ]
        
        sentences = re.split(r'[.!?]+', text)
        sentences = [s.strip() for s in sentences if s.strip()]
        
        for sentence in sentences:
            sentence_lower = sentence.lower()
            
            for pattern, round_type in round_patterns:
                if re.search(pattern, sentence_lower):
                    round_info = {
                        'type': round_type,
                        'description': sentence,
                        'questions': []
                    }
                    
                    # Look for questions in the same sentence
                    if '?' in sentence:
                        round_info['questions'].append(sentence)
                    
                    rounds.append(round_info)
                    break
        
        return rounds

    def generate_highlights(self, insights, sentiment_analysis):
        """Generate highlights from insights"""
        highlights = []
        
        # Add sentiment-based highlights
        if sentiment_analysis['sentiment'] == 'positive':
            highlights.append("Overall positive interview experience")
        elif sentiment_analysis['sentiment'] == 'negative':
            highlights.append("Challenging interview experience")
        else:
            highlights.append("Mixed interview experience")
        
        # Add difficulty highlights
        if insights['difficulty_indicators']:
            difficulty = insights['difficulty_indicators'][0]
            highlights.append(f"Interview difficulty: {difficulty}")
        
        # Add technology highlights
        if insights['technologies']:
            tech_list = ', '.join(insights['technologies'][:3])
            highlights.append(f"Technologies mentioned: {tech_list}")
        
        # Add preparation tips
        if insights['preparation_tips']:
            highlights.append("Includes preparation advice")
        
        # Add red flags or positive aspects
        if insights['red_flags']:
            highlights.append("Contains potential concerns")
        elif insights['positive_aspects']:
            highlights.append("Highlights positive aspects")
        
        return highlights

    def process_experience(self, experience_data):
        """Main processing function"""
        try:
            logger.info(f"Processing experience: {experience_data.get('id', 'unknown')}")
            
            # Extract text content
            text_content = experience_data.get('experience', '')
            if not text_content:
                logger.warning("No experience text found")
                return None
            
            logger.info(f"Processing text of length: {len(text_content)}")
            
            # Extract questions
            questions = self.extract_questions(text_content)
            logger.info(f"Extracted {len(questions)} questions")
            
            # Categorize questions
            categorized_questions = self.categorize_questions(questions)
            
            # Analyze sentiment
            sentiment_analysis = self.analyze_sentiment(text_content)
            logger.info(f"Sentiment analysis: {sentiment_analysis['sentiment']}")
            
            # Extract insights
            insights = self.extract_key_insights(text_content)
            
            # Extract rounds
            rounds = self.extract_rounds(text_content)
            logger.info(f"Extracted {len(rounds)} interview rounds")
            
            # Generate highlights
            highlights = self.generate_highlights(insights, sentiment_analysis)
            
            # Create processed experience
            processed_experience = {
                'id': experience_data.get('id', f"exp_{datetime.now().strftime('%Y%m%d_%H%M%S')}"),
                'title': experience_data.get('title', f"Interview at {experience_data.get('company', 'Unknown Company')}"),
                'company': experience_data.get('company', ''),
                'role': experience_data.get('role', ''),
                'verdict': experience_data.get('verdict', ''),
                'difficulty': experience_data.get('difficulty', ''),
                'source': 'User Submission',
                'timestamp': datetime.now().isoformat(),
                
                # NLP processed data
                'nlp_processed': True,
                'nlp_tools_used': {
                    'nltk': self.nltk_ready,
                    'spacy': self.spacy_ready
                },
                'sentiment_analysis': sentiment_analysis,
                'categorized_questions': categorized_questions,
                'extracted_insights': insights,
                'interview_rounds': rounds,
                'highlights': highlights,
                'feedback_sentiment': sentiment_analysis['sentiment'],
                'raw_questions': questions,
                
                # Original data preservation
                'original_experience': text_content,
                'user_data': {
                    'name': experience_data.get('name', ''),
                    'email': experience_data.get('email', ''),
                    'tags': experience_data.get('tags', ''),
                    'interviewType': experience_data.get('interviewType', ''),
                    'experienceLevel': experience_data.get('experienceLevel', ''),
                    'preparationTime': experience_data.get('preparationTime', ''),
                    'location': experience_data.get('location', ''),
                    'salary': experience_data.get('salary', ''),
                    'overallExperience': experience_data.get('overallExperience', ''),
                    'tips': experience_data.get('tips', ''),
                    'feedback': experience_data.get('feedback', ''),
                    'technicalQuestions': experience_data.get('technicalQuestions', []),
                    'behavioralQuestions': experience_data.get('behavioralQuestions', []),
                    'systemDesignQuestions': experience_data.get('systemDesignQuestions', []),
                    'codingQuestions': experience_data.get('codingQuestions', [])
                }
            }
            
            logger.info("Experience processed successfully")
            return processed_experience
            
        except Exception as e:
            logger.error(f"Error processing experience: {str(e)}")
            return None

def process_experience_file(input_file, output_file):
    """Process experiences from a JSON file"""
    logger.info(f"Processing file: {input_file} -> {output_file}")
    
    processor = InterviewExperienceProcessor()
    
    try:
        # Check if input file exists
        if not os.path.exists(input_file):
            logger.error(f"Input file not found: {input_file}")
            return
        
        with open(input_file, 'r', encoding='utf-8') as f:
            experiences = json.load(f)
        
        logger.info(f"Loaded {len(experiences)} experiences from file")
        
        processed_experiences = []
        
        for i, experience in enumerate(experiences):
            logger.info(f"Processing experience {i+1}/{len(experiences)}")
            processed = processor.process_experience(experience)
            if processed:
                processed_experiences.append(processed)
        
        # Ensure output directory exists
        os.makedirs(os.path.dirname(output_file), exist_ok=True)
        
        # Save processed experiences
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(processed_experiences, f, indent=2, ensure_ascii=False)
        
        logger.info(f"Successfully processed {len(processed_experiences)} experiences. Output saved to {output_file}")
        print(f"Processed {len(processed_experiences)} experiences successfully")
        
    except Exception as e:
        logger.error(f"Error processing file: {str(e)}")
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python process_experience_nlp.py input_file.json output_file.json")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    process_experience_file(input_file, output_file)