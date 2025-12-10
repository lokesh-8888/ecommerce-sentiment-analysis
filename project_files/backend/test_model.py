"""
Quick test script for your trained DistilBERT model
Usage: python test_model.py
"""

import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

# Load your trained model
MODEL_PATH = "./best_model"

print("Loading model...")
try:
    tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
    model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)
    print("✓ Model loaded successfully!\n")
except Exception as e:
    print(f"✗ Error loading model: {e}")
    print(f"\nMake sure you've trained the model first by running:")
    print(f"  python train_bert.py")
    exit(1)

# Test examples
test_reviews = [
    "This product is absolutely amazing! Best purchase ever!",
    "Terrible quality. Broke after one day. Complete waste of money.",
    "It's okay. Nothing special but does the job.",
    "Fast shipping and great customer service!",
    "Disappointed. Not what I expected at all.",
]

print("=" * 60)
print("TESTING TRAINED MODEL")
print("=" * 60)
print()

model.eval()  # Set to evaluation mode

for i, text in enumerate(test_reviews, 1):
    print(f"Review {i}: \"{text}\"")
    
    # Tokenize
    inputs = tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        max_length=256,
        padding=True
    )
    
    # Predict
    with torch.no_grad():
        outputs = model(**inputs)
        predictions = torch.nn.functional.softmax(outputs.logits, dim=-1)
    
    positive_score = predictions[0][1].item()
    negative_score = predictions[0][0].item()
    
    sentiment = "Positive" if positive_score > negative_score else "Negative"
    confidence = max(positive_score, negative_score)
    
    print(f"  → Sentiment: {sentiment}")
    print(f"  → Confidence: {confidence:.2%}")
    print(f"  → Positive: {positive_score:.2%} | Negative: {negative_score:.2%}")
    print()

print("=" * 60)
print("Testing complete!")
print("=" * 60)
