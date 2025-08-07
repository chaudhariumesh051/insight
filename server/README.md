# Interview Experience Analyzer - Server

This server provides API endpoints for submitting and processing interview experiences using NLP (Natural Language Processing) to extract insights and categorize information.

## Features

- **Structured Experience Submission**: Two formats - simple and detailed
- **NLP Processing**: Automatic extraction of questions, sentiment analysis, and insights
- **Question Categorization**: Technical, Behavioral, System Design, and Coding questions
- **Sentiment Analysis**: VADER sentiment analysis with keyword-based enhancement
- **Insight Extraction**: Topics, skills, technologies, difficulty indicators, and tips
- **Interview Round Analysis**: Automatic detection and organization of interview rounds

## Setup Instructions

### 1. Install Python Dependencies

```bash
cd server
pip install -r requirements.txt
```

### 2. Install spaCy Model

```bash
python -m spacy download en_core_web_sm
```

### 3. Install Node.js Dependencies

```bash
npm install
```

### 4. Start the Server

```bash
node index.cjs
```

The server will run on `http://localhost:5000`

## API Endpoints

### Submit Experience
- **POST** `/api/submit-experience`
- Accepts structured interview experience data
- Processes with NLP pipeline
- Returns processed experience with insights

### Get Experiences
- **GET** `/api/experiences`
- Returns all processed experiences

### Filter Experiences
- **GET** `/api/experiences/filter?company=Google&role=Software Engineer&difficulty=Hard&sentiment=positive`
- Returns filtered experiences based on criteria

### Get Experience Statistics
- **GET** `/api/experiences/stats`
- Returns statistics about all experiences

## Experience Data Format

### Simple Format
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "company": "Google",
  "role": "Software Engineer",
  "experience": "Complete interview experience text...",
  "verdict": "Selected",
  "difficulty": "Hard",
  "tags": "SDE, Frontend, React"
}
```

### Detailed Format
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "company": "Google",
  "role": "Software Engineer",
  "interviewType": "Onsite",
  "experienceLevel": "Mid Level",
  "preparationTime": "2 weeks",
  "location": "Mountain View, CA",
  "salary": "$150k-180k",
  "technicalQuestions": [
    {
      "question": "Implement a binary search tree",
      "answer": "My approach was...",
      "difficulty": "Medium"
    }
  ],
  "behavioralQuestions": [...],
  "systemDesignQuestions": [...],
  "codingQuestions": [...],
  "overallExperience": "The interview was...",
  "tips": "My advice for others...",
  "verdict": "Selected",
  "difficulty": "Hard",
  "tags": "SDE, System Design, Algorithms"
}
```

## NLP Processing Features

### Question Extraction
- Automatically identifies questions in the text
- Categorizes into Technical, Behavioral, System Design, and Coding
- Uses pattern matching and keyword analysis

### Sentiment Analysis
- VADER sentiment analysis for overall tone
- Keyword-based sentiment enhancement
- Confidence scoring for sentiment predictions

### Insight Extraction
- **Topics**: Extracted from noun phrases and entities
- **Skills**: Identified technical and soft skills
- **Technologies**: Named entity recognition for tech mentions
- **Difficulty Indicators**: Pattern matching for difficulty levels
- **Preparation Tips**: Extracted advice and tips
- **Red Flags**: Identified negative aspects
- **Positive Aspects**: Highlighted positive experiences

### Interview Round Analysis
- Automatic detection of different interview rounds
- Organization of questions by round type
- Round-specific insights and feedback

## File Structure

```
server/
├── index.cjs                 # Main server file
├── routes/
│   └── experience.js         # Experience API routes
├── scripts/
│   └── process_experience_nlp.py  # NLP processing script
├── data/
│   ├── processed_experiences.json  # Processed experiences
│   ├── temp_experience.json        # Temporary input file
│   └── temp_processed.json         # Temporary output file
├── requirements.txt          # Python dependencies
└── README.md               # This file
```

## Error Handling

The system includes comprehensive error handling:
- Fallback processing if NLP fails
- Validation of required fields
- Graceful degradation for missing data
- Detailed error messages for debugging

## Performance Considerations

- NLP processing is asynchronous
- Temporary files are cleaned up automatically
- Large datasets are processed efficiently
- Memory usage is optimized for production

## Security Notes

- Input validation for all user data
- Sanitization of text content
- Secure file handling
- Error messages don't expose sensitive information 