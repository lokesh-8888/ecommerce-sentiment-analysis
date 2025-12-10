# DistilBERT Sentiment Model Training Guide

## 📋 Overview

This script trains a **DistilBERT** sentiment analysis model optimized for your **RTX 4050 GPU (6GB VRAM)**. It automatically selects the best dataset, trains efficiently, and saves comprehensive metrics.

## 🚀 Quick Start

### 1. Install Required Packages

```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
pip install transformers datasets scikit-learn matplotlib seaborn
```

### 2. Run Training

```bash
cd backend
python train_bert.py
```

That's it! The script runs end-to-end automatically.

---

## 📊 What Gets Created

After training completes, you'll have:

### **`best_model/`** - Your Trained Model
```
best_model/
├── config.json
├── pytorch_model.bin
├── tokenizer.json
├── tokenizer_config.json
├── vocab.txt
└── special_tokens_map.json
```

### **`metrics/`** - All Training Metrics
```
metrics/
├── train_results.json          # Training loss and steps
├── eval_results.json           # Accuracy, F1, predictions
├── classification_report.txt   # Precision, recall, F1 per class
├── confusion_matrix.png        # Visual confusion matrix
├── training_loss.png           # Training vs validation loss curves
├── accuracy.png                # Accuracy over time
├── f1_scores.json              # Detailed F1 scores
├── training_time.txt           # Total training time
└── training_config.json        # All hyperparameters used
```

---

## ⚙️ Training Configuration

The script uses these optimized settings:

| Parameter | Value | Why |
|-----------|-------|-----|
| Model | `distilbert-base-uncased` | Fast, efficient, 6x smaller than BERT |
| Epochs | 3 | Optimal for convergence without overfitting |
| Batch Size | 16 | Maximizes RTX 4050 6GB VRAM |
| Learning Rate | 2e-5 | Standard for fine-tuning transformers |
| Max Length | 256 tokens | Balances speed and context |
| FP16 | Enabled | 2x faster training, uses less VRAM |
| Gradient Checkpointing | Enabled | Saves VRAM at slight speed cost |
| Gradient Accumulation | 2 steps | Effective batch size = 32 |

---

## 📦 Dataset Selection

The script automatically tries datasets in this order:

1. **IMDB** (50k samples) - **BEST CHOICE**
   - High quality movie reviews
   - Perfect size for 10-20 min training
   - Binary sentiment (Positive/Negative)

2. **Yelp Polarity** (subsampled to 100k)
   - Product/service reviews
   - High quality, diverse

3. **Amazon Polarity** (subsampled to 150k)
   - Large dataset, trimmed for speed
   - Last resort option

**The script picks the first available dataset.**

---

## ⏱️ Expected Training Time

On **RTX 4050 (6GB VRAM)**:

| Dataset | Samples | Time per Epoch | Total (3 epochs) |
|---------|---------|----------------|------------------|
| IMDB | 25,000 | 7-10 min | **21-30 minutes** |
| Yelp | 100,000 | 25-30 min | 75-90 minutes |
| Amazon | 150,000 | 35-40 min | 105-120 minutes |

---

## 🎯 Expected Performance

After training on IMDB, you should see:

- **Accuracy**: ~90-93%
- **F1 Score**: ~0.90-0.93
- **Confusion Matrix**: Clear diagonal pattern

These are excellent results for sentiment analysis!

---

## 🔧 Using Your Trained Model

### Replace Model in Your Backend

Edit `backend/app.py`:

**Before:**
```python
model_name = "distilbert-base-uncased-finetuned-sst-2-english"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(model_name)
```

**After:**
```python
model_name = "./best_model"  # Use your trained model
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(model_name)
```

### Test Your Model

```python
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch

# Load your model
tokenizer = AutoTokenizer.from_pretrained("./best_model")
model = AutoModelForSequenceClassification.from_pretrained("./best_model")

# Test it
text = "This product is amazing! I love it!"
inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=256)

with torch.no_grad():
    outputs = model(**inputs)
    predictions = torch.nn.functional.softmax(outputs.logits, dim=-1)
    
print(f"Positive: {predictions[0][1].item():.2%}")
print(f"Negative: {predictions[0][0].item():.2%}")
```

---

## 🐛 Troubleshooting

### "CUDA out of memory"
- Reduce `BATCH_SIZE` from 16 to 8 in `train_bert.py` (line 35)
- Close other GPU applications

### "No module named 'transformers'"
```bash
pip install transformers datasets scikit-learn matplotlib seaborn
```

### "PyTorch not detecting GPU"
```bash
# Reinstall PyTorch with CUDA support
pip uninstall torch torchvision torchaudio
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
```

### Training is slow (CPU mode)
- Ensure CUDA drivers are installed
- Check GPU detection in first output section

---

## 📈 Customization

Want to tweak settings? Edit `train_bert.py`:

```python
# Line 33-39: Main configuration
MODEL_NAME = "distilbert-base-uncased"
MAX_LENGTH = 256        # Increase for longer texts
BATCH_SIZE = 16         # Decrease if OOM errors
EPOCHS = 3              # More epochs = better fit (but watch for overfitting)
LEARNING_RATE = 2e-5    # Lower = more stable, higher = faster convergence
```

---

## 📝 Notes

- **First run downloads datasets** (~1-2 GB) - this is normal
- **Model checkpoints saved every epoch** in `./results/`
- **Best model automatically selected** based on accuracy
- **All metrics auto-generated** - no manual work needed

---

## 💡 Next Steps

After training:

1. Check `metrics/classification_report.txt` for detailed performance
2. View `metrics/confusion_matrix.png` to see prediction patterns
3. Replace your backend model with the trained one
4. Test on real product reviews to validate performance

---

## 🎓 What This Script Does

1. ✅ Detects your GPU and CUDA setup
2. ✅ Automatically selects best available dataset
3. ✅ Estimates training time before starting
4. ✅ Preprocesses and tokenizes data
5. ✅ Trains with optimal settings for RTX 4050
6. ✅ Generates comprehensive metrics and plots
7. ✅ Saves trained model ready for production
8. ✅ Provides clear summary of results

---

## 📧 Questions?

The script is fully self-contained and verbose - it explains each step as it runs!

**Happy Training! 🚀**
