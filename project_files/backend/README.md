# E-Commerce Review Sentiment Analysis - Backend

Flask backend with BERT-based sentiment analysis using HuggingFace Transformers.

## Features

- **Sentiment Prediction**: Analyze single reviews with confidence scores
- **Aspect Extraction**: Identify product strengths and weaknesses
- **Batch Processing**: Analyze multiple reviews simultaneously
- **Supabase Integration**: Store and retrieve review analytics
- **REST API**: Clean JSON endpoints for frontend integration

## Requirements

- Python 3.8+
- pip

## Installation

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Download SpaCy language model:
```bash
python -m spacy download en_core_web_sm
```

4. Set up environment variables:
Create a `.env` file in the backend directory with:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Running the Server

```bash
python app.py
```

The server will start on `http://localhost:5000`

## API Endpoints

### 1. Health Check
**GET** `/health`

Response:
```json
{
  "status": "healthy",
  "model": "distilbert-base-uncased-finetuned-sst-2-english"
}
```

### 2. Single Review Prediction
**POST** `/predict`

Request:
```json
{
  "review": "This product is amazing! Great quality."
}
```

Response:
```json
{
  "sentiment": "Positive",
  "confidence": 99.87,
  "positive_score": 99.87,
  "negative_score": 0.13
}
```

### 3. Aspect-Based Analysis
**POST** `/aspects`

Request:
```json
{
  "review": "The battery life is excellent but the screen quality is poor."
}
```

Response:
```json
{
  "overall_sentiment": {
    "sentiment": "Positive",
    "confidence": 85.23
  },
  "strengths": [
    {
      "aspect": "Battery",
      "confidence": 95.67,
      "example": "The battery life is excellent"
    }
  ],
  "weaknesses": [
    {
      "aspect": "Screen",
      "confidence": 92.34,
      "example": "the screen quality is poor"
    }
  ],
  "total_aspects": 2
}
```

### 4. Batch Analysis
**POST** `/batch`

Request:
```json
{
  "reviews": [
    "Great product!",
    "Terrible quality.",
    "Good value for money."
  ]
}
```

Response:
```json
{
  "results": [
    {
      "review": "Great product!",
      "sentiment": "Positive",
      "confidence": 99.45
    }
  ],
  "summary": {
    "total": 3,
    "positive": 2,
    "negative": 1,
    "positive_percentage": 66.67
  }
}
```

### 5. Get Statistics
**GET** `/stats`

Response:
```json
{
  "total": 150,
  "positive": 98,
  "negative": 52,
  "positive_percentage": 65.33
}
```

## Model Information

- **Model**: DistilBERT (distilbert-base-uncased-finetuned-sst-2-english)
- **Source**: HuggingFace Transformers
- **Task**: Binary sentiment classification (Positive/Negative)
- **Performance**: ~95% accuracy on SST-2 dataset

## Aspect Keywords

The system detects the following product aspects:

- **Battery**: battery, charge, charging, power, battery life
- **Performance**: performance, speed, fast, slow, lag, responsive
- **Quality**: quality, build, material, durable, sturdy, cheap
- **Design**: design, look, appearance, style, aesthetic
- **Price**: price, cost, expensive, cheap, worth, value
- **Delivery**: delivery, shipping, package, arrived, damaged
- **Screen**: screen, display, brightness, resolution
- **Camera**: camera, photo, picture, image quality
- **Sound**: sound, audio, speaker, volume, music
- **Customer Service**: service, support, help, customer care

## Error Handling

All endpoints return appropriate HTTP status codes:
- 200: Success
- 400: Bad Request (missing or invalid data)
- 500: Internal Server Error

Error response format:
```json
{
  "error": "Error message description"
}
```

## CORS

CORS is enabled for all origins to allow frontend integration.
