# 🤖 Model Setup Instructions

The fine-tuned DistilBERT model is **not included in this repository** due to its large size (267 MB). You have two options:

## Option 1: Train Your Own Model (Recommended)

This will train a DistilBERT model on the IMDB dataset, achieving ~91% accuracy.

### Requirements
- Python 3.8+
- GPU recommended (NVIDIA with CUDA support)
- ~4GB RAM for training
- ~2GB disk space for dataset and model

### Steps

1. **Install training dependencies:**
```bash
cd backend
pip install -r requirements_training.txt
```

2. **Run the training script:**
```bash
python train_bert.py
```

3. **Training will take approximately:**
   - With GPU (RTX 4050): ~16 minutes
   - With CPU: ~2-3 hours

4. **Output:**
   - Model saved to: `backend/best_model/`
   - Metrics saved to: `backend/metrics/`
   - Model automatically copied to: `backend/model/` (ready to use)

### Training Metrics You'll See:
```
Dataset: IMDB (25,000 training samples)
Accuracy: ~91.28%
F1 Score: ~0.913
Training Time: 15-20 minutes (GPU)
```

---

## Option 2: Use Pre-trained Model (Quick Start)

If you just want to test the application without training, the backend will automatically download a pre-trained model on first run.

### Steps

1. **Simply run the Flask app:**
```bash
cd backend
python app.py
```

2. **On first run, it will download:**
   - Model: `distilbert-base-uncased-finetuned-sst-2-english`
   - This is a pre-trained model from HuggingFace (not our custom trained one)
   - Accuracy: ~93% (trained on SST-2 dataset)

3. **Update `app.py` if needed:**
   - The app is currently configured to use `./model` (custom trained)
   - To use pre-trained, change line 21 in `backend/app.py`:
   ```python
   MODEL_PATH = "distilbert-base-uncased-finetuned-sst-2-english"
   ```

---

## Model Directory Structure

After training or downloading, you should have:

```
backend/
├── model/                      # Active model used by API
│   ├── config.json
│   ├── model.safetensors       # 267 MB model weights
│   ├── tokenizer.json
│   ├── vocab.txt
│   └── ...
├── best_model/                 # Backup of trained model
│   └── (same files as model/)
└── metrics/                    # Training metrics (included in repo)
    ├── eval_results.json       # Accuracy and F1 scores
    ├── training_config.json    # Training hyperparameters
    ├── f1_scores.json          # Detailed F1 metrics
    └── training_time.txt       # Training duration
```

---

## Troubleshooting

### "No module named 'transformers'"
```bash
pip install transformers torch
```

### "CUDA out of memory"
Reduce batch size in `train_bert.py`:
```python
batch_size = 8  # Default is 16
```

### "Dataset download failed"
The script auto-downloads IMDB from HuggingFace. If it fails:
```bash
# Try manual download
python -c "from datasets import load_dataset; load_dataset('imdb')"
```

### Model loading error in app.py
Make sure model files exist in `backend/model/`:
```bash
ls backend/model/
# Should show: config.json, model.safetensors, tokenizer.json, vocab.txt
```

---

## Performance Comparison

| Model | Accuracy | F1 Score | Training Time | Dataset |
|-------|----------|----------|---------------|---------|
| **Our Fine-Tuned Model** | 91.28% | 0.913 | 16 min | IMDB (25K) |
| Pre-trained SST-2 | 93.00% | 0.930 | N/A | SST-2 |

Both models work well for sentiment analysis. Our custom model is optimized for movie/product reviews.

---

## Questions?

If you encounter issues:
1. Check that all dependencies are installed
2. Ensure you have enough disk space (~2GB)
3. Verify Python version is 3.8 or higher
4. Check GPU drivers if using CUDA

For more help, open an issue on GitHub!
