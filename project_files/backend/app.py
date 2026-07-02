from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
from supabase import create_client, Client
import re
from collections import Counter
import traceback
import requests
import time

load_dotenv()

app = Flask(__name__)
CORS(app)

supabase_url = os.getenv("VITE_SUPABASE_URL")
supabase_key = os.getenv("VITE_SUPABASE_ANON_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

MODEL_PATH = "distilbert-base-uncased-finetuned-sst-2-english"
HF_API_URL = f"https://api-inference.huggingface.co/models/{MODEL_PATH}"
headers = {}
hf_token = os.getenv("HF_TOKEN")
if hf_token:
    headers["Authorization"] = f"Bearer {hf_token}"

ASPECT_KEYWORDS = {
    'battery': ['battery', 'charge', 'charging', 'power', 'battery life'],
    'performance': ['performance', 'speed', 'fast', 'slow', 'lag', 'responsive'],
    'quality': ['quality', 'build', 'material', 'durable', 'sturdy', 'cheap'],
    'design': ['design', 'look', 'appearance', 'style', 'aesthetic', 'beautiful', 'ugly'],
    'price': ['price', 'cost', 'expensive', 'cheap', 'worth', 'value'],
    'delivery': ['delivery', 'shipping', 'package', 'arrived', 'damaged'],
    'screen': ['screen', 'display', 'brightness', 'resolution'],
    'camera': ['camera', 'photo', 'picture', 'image quality'],
    'sound': ['sound', 'audio', 'speaker', 'volume', 'music'],
    'customer_service': ['service', 'support', 'help', 'customer care']
}

def predict_sentiment(text):
    max_retries = 3
    for attempt in range(max_retries):
        try:
            response = requests.post(HF_API_URL, headers=headers, json={"inputs": text}, timeout=10)
            data = response.json()
            
            # Handle Hugging Face model loading state
            if isinstance(data, dict) and "error" in data:
                if "loading" in data.get("error", "").lower():
                    wait_time = min(data.get("estimated_time", 5), 10)
                    print(f"HF Model is loading, waiting {wait_time}s (attempt {attempt + 1}/{max_retries})...", flush=True)
                    time.sleep(wait_time)
                    continue
                else:
                    raise Exception(data["error"])
            
            # Parse Hugging Face SST-2 model response format: [[{"label": "POSITIVE", "score": 0.99}, ...]]
            predictions = data[0]
            scores = {p["label"].upper(): p["score"] for p in predictions}
            
            pos_score = scores.get("POSITIVE", 0.0) * 100
            neg_score = scores.get("NEGATIVE", 0.0) * 100
            
            sentiment = "Positive" if pos_score > neg_score else "Negative"
            confidence = max(pos_score, neg_score)
            
            return {
                "sentiment": sentiment,
                "confidence": round(confidence, 2),
                "positive_score": round(pos_score, 2),
                "negative_score": round(neg_score, 2)
            }
        except Exception as e:
            print(f"HF API attempt {attempt + 1} failed: {e}", flush=True)
            if attempt == max_retries - 1:
                # Fallback to standard rule-based heuristic
                pos_words = ["good", "great", "love", "excellent", "best", "perfect", "amazing", "happy", "recommend"]
                neg_words = ["bad", "worst", "hate", "poor", "cheap", "terrible", "slow", "disappointed", "refund"]
                text_lower = text.lower()
                pos_count = sum(text_lower.count(w) for w in pos_words)
                neg_count = sum(text_lower.count(w) for w in neg_words)
                
                sentiment = "Positive" if pos_count >= neg_count else "Negative"
                return {
                    "sentiment": sentiment,
                    "confidence": 70.0,
                    "positive_score": 70.0 if sentiment == "Positive" else 30.0,
                    "negative_score": 30.0 if sentiment == "Positive" else 70.0
                }
            time.sleep(2)

def extract_aspects(text):
    text_lower = text.lower()
    found_aspects = {}

    for aspect, keywords in ASPECT_KEYWORDS.items():
        for keyword in keywords:
            if keyword in text_lower:
                sentences = re.split(r'[.!?]', text)
                for sentence in sentences:
                    if keyword in sentence.lower():
                        sentiment = predict_sentiment(sentence)
                        if aspect not in found_aspects:
                            found_aspects[aspect] = {
                                'sentiment': sentiment['sentiment'],
                                'confidence': sentiment['confidence'],
                                'mentions': []
                            }
                        found_aspects[aspect]['mentions'].append(sentence.strip())
                        break
                break

    return found_aspects

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()

        if not data or 'review' not in data:
            return jsonify({'error': 'No review text provided'}), 400

        review_text = data['review']

        if not review_text.strip():
            return jsonify({'error': 'Review text is empty'}), 400

        result = predict_sentiment(review_text)

        try:
            supabase.table('reviews').insert({
                'review_text': review_text,
                'sentiment': result['sentiment'],
                'confidence': result['confidence']
            }).execute()
        except Exception as e:
            print(f"Database insert error: {e}")

        return jsonify(result), 200

    except Exception as e:
        print(f"Error in /predict: {traceback.format_exc()}")
        return jsonify({'error': str(e)}), 500

@app.route('/aspects', methods=['POST'])
def analyze_aspects():
    try:
        data = request.get_json()

        if not data or 'review' not in data:
            return jsonify({'error': 'No review text provided'}), 400

        review_text = data['review']

        if not review_text.strip():
            return jsonify({'error': 'Review text is empty'}), 400

        overall_sentiment = predict_sentiment(review_text)
        aspects = extract_aspects(review_text)

        strengths = []
        weaknesses = []

        for aspect, details in aspects.items():
            if details['sentiment'] == 'Positive':
                strengths.append({
                    'aspect': aspect.replace('_', ' ').title(),
                    'confidence': details['confidence'],
                    'example': details['mentions'][0] if details['mentions'] else ''
                })
            else:
                weaknesses.append({
                    'aspect': aspect.replace('_', ' ').title(),
                    'confidence': details['confidence'],
                    'example': details['mentions'][0] if details['mentions'] else ''
                })

        return jsonify({
            'overall_sentiment': overall_sentiment,
            'strengths': sorted(strengths, key=lambda x: x['confidence'], reverse=True),
            'weaknesses': sorted(weaknesses, key=lambda x: x['confidence'], reverse=True),
            'total_aspects': len(aspects)
        }), 200

    except Exception as e:
        print(f"Error in /aspects: {traceback.format_exc()}")
        return jsonify({'error': str(e)}), 500

@app.route('/batch', methods=['POST'])
def batch_predict():
    try:
        data = request.get_json()

        if not data or 'reviews' not in data:
            return jsonify({'error': 'No reviews provided'}), 400

        reviews = data['reviews']

        if not isinstance(reviews, list):
            return jsonify({'error': 'Reviews must be a list'}), 400

        results = []

        for review in reviews:
            if review.strip():
                result = predict_sentiment(review)
                result['review'] = review
                results.append(result)

                try:
                    supabase.table('reviews').insert({
                        'review_text': review,
                        'sentiment': result['sentiment'],
                        'confidence': result['confidence']
                    }).execute()
                except Exception as e:
                    print(f"Database insert error: {e}")

        positive_count = sum(1 for r in results if r['sentiment'] == 'Positive')
        negative_count = len(results) - positive_count

        return jsonify({
            'results': results,
            'summary': {
                'total': len(results),
                'positive': positive_count,
                'negative': negative_count,
                'positive_percentage': round((positive_count / len(results) * 100), 2) if results else 0
            }
        }), 200

    except Exception as e:
        print(f"Error in /batch: {traceback.format_exc()}")
        return jsonify({'error': str(e)}), 500

@app.route('/stats', methods=['GET'])
def get_stats():
    try:
        response = supabase.table('reviews').select('sentiment').execute()
        reviews = response.data

        if not reviews:
            return jsonify({
                'total': 0,
                'positive': 0,
                'negative': 0,
                'positive_percentage': 0
            }), 200

        positive_count = sum(1 for r in reviews if r['sentiment'] == 'Positive')
        negative_count = len(reviews) - positive_count

        return jsonify({
            'total': len(reviews),
            'positive': positive_count,
            'negative': negative_count,
            'positive_percentage': round((positive_count / len(reviews) * 100), 2)
        }), 200

    except Exception as e:
        print(f"Error in /stats: {traceback.format_exc()}")
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'model': MODEL_PATH}), 200

if __name__ == '__main__':
    print(f"Loading model: {MODEL_PATH}")
    print("Flask server starting...")
    app.run(debug=True, host='0.0.0.0', port=5000)
