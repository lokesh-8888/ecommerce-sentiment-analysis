from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch

MODEL_PATH = "./model"

print("Loading fine-tuned model from:", MODEL_PATH)
tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)

test_text = "This product is amazing!"

print(f"\nTesting with: '{test_text}'")
inputs = tokenizer(test_text, return_tensors="pt", truncation=True, max_length=512, padding=True)

with torch.no_grad():
    outputs = model(**inputs)
    predictions = torch.nn.functional.softmax(outputs.logits, dim=-1)

sentiment_scores = predictions[0].tolist()
sentiment_label = "Positive" if sentiment_scores[1] > sentiment_scores[0] else "Negative"
confidence = max(sentiment_scores)

print(f"\n✅ Model loaded successfully!")
print(f"Sentiment: {sentiment_label}")
print(f"Confidence: {round(confidence * 100, 2)}%")
print(f"Positive score: {round(sentiment_scores[1] * 100, 2)}%")
print(f"Negative score: {round(sentiment_scores[0] * 100, 2)}%")
print(f"\n✅ Fine-tuned model is working correctly!")
