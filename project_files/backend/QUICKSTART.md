# 🚀 Quick Start Guide

## Step 1: Install Dependencies

```bash
# Option A: Using requirements file
pip install -r requirements_training.txt

# Option B: Manual installation
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
pip install transformers datasets scikit-learn matplotlib seaborn
```

## Step 2: Train Your Model

```bash
python train_bert.py
```

**Expected output:**
- GPU detection and CUDA info
- Dataset selection (IMDB recommended)
- Training progress bars for 3 epochs
- Metrics and model saved automatically
- **Total time: ~21-30 minutes on RTX 4050**

## Step 3: Test Your Model

```bash
python test_model.py
```

This tests your trained model on sample reviews.

## Step 4: Use in Your Backend

Edit `app.py` line 21:

```python
# Change this:
model_name = "distilbert-base-uncased-finetuned-sst-2-english"

# To this:
model_name = "./best_model"
```

Then restart your backend server.

---

## 📁 What You'll Get

```
backend/
├── train_bert.py              # Training script (run this first)
├── test_model.py              # Test script (run after training)
├── best_model/                # ✨ Your trained model
│   ├── config.json
│   ├── pytorch_model.bin      # The actual model weights
│   ├── tokenizer files...
└── metrics/                   # ✨ All performance metrics
    ├── classification_report.txt
    ├── confusion_matrix.png
    ├── accuracy.png
    ├── training_loss.png
    └── *.json files
```

---

## ⚡ Key Features

✅ **Automatic dataset selection** - tries IMDB, Yelp, then Amazon
✅ **GPU optimized** - FP16, gradient checkpointing for 6GB VRAM
✅ **Complete metrics** - confusion matrix, F1, accuracy plots
✅ **Ready for production** - just point your backend to `./best_model`
✅ **Single command** - no configuration needed

---

## 🎯 Expected Results (IMDB dataset)

- **Accuracy**: 90-93%
- **F1 Score**: 0.90-0.93
- **Training Time**: 21-30 minutes (3 epochs)
- **Model Size**: ~250 MB

---

## 🆘 Troubleshooting

**GPU not detected?**
```bash
python -c "import torch; print(torch.cuda.is_available())"
```
Should print `True`. If `False`, reinstall PyTorch with CUDA.

**Out of memory?**
Edit `train_bert.py` line 35: change `BATCH_SIZE = 16` to `BATCH_SIZE = 8`

---

## 📚 Full Documentation

See `TRAINING_README.md` for complete details on:
- Training configuration
- Customization options
- Using your model in production
- Advanced troubleshooting

---

**Questions? The scripts print detailed progress as they run!**
