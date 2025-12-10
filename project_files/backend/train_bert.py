"""
GPU-Optimized DistilBERT Sentiment Training Script
Model: distilbert-base-uncased
Optimized for: RTX 4050 (6GB VRAM)
"""

# Disable TensorFlow BEFORE any imports
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

import json
import time
import torch
import numpy as np
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime
from datasets import load_dataset

# Import transformers with PyTorch only
import transformers
transformers.logging.set_verbosity_error()
from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    TrainingArguments,
    Trainer,
    DataCollatorWithPadding
)
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    accuracy_score,
    f1_score
)

# ============================================
# Configuration
# ============================================
MODEL_NAME = "distilbert-base-uncased"
MAX_LENGTH = 256
BATCH_SIZE = 16
EPOCHS = 3
LEARNING_RATE = 2e-5
WARMUP_STEPS = 500
WEIGHT_DECAY = 0.01

# Output directories
METRICS_DIR = "metrics"
MODEL_DIR = "best_model"

# ============================================
# GPU Detection
# ============================================
def detect_gpu():
    """Detect and print GPU information"""
    print("=" * 60)
    print("GPU DETECTION")
    print("=" * 60)
    
    if torch.cuda.is_available():
        device = torch.device("cuda")
        gpu_name = torch.cuda.get_device_name(0)
        gpu_memory = torch.cuda.get_device_properties(0).total_memory / (1024**3)
        cuda_version = torch.version.cuda
        
        print(f"✓ GPU Available: {gpu_name}")
        print(f"✓ VRAM: {gpu_memory:.2f} GB")
        print(f"✓ CUDA Version: {cuda_version}")
        print(f"✓ PyTorch Version: {torch.__version__}")
        print(f"✓ Device: {device}")
    else:
        device = torch.device("cpu")
        print("⚠ No GPU detected. Training will use CPU (slow).")
        print(f"✓ PyTorch Version: {torch.__version__}")
        print(f"✓ Device: {device}")
    
    print("=" * 60)
    print()
    return device

# ============================================
# Dataset Selection
# ============================================
def select_and_load_dataset():
    """
    Automatically select the best dataset for fast training.
    Priority: IMDB > Yelp Polarity > Amazon Polarity (subsampled)
    """
    print("=" * 60)
    print("DATASET SELECTION")
    print("=" * 60)
    
    # Try IMDB first (best choice for fast training)
    try:
        print("Attempting to load IMDB dataset...")
        dataset = load_dataset("imdb")
        
        train_size = len(dataset["train"])
        test_size = len(dataset["test"])
        
        print(f"\n✓ Selected: IMDB Movie Reviews Dataset")
        print(f"  Reason: High-quality, perfect size for 10-20 min training")
        print(f"  Train samples: {train_size:,}")
        print(f"  Test samples: {test_size:,}")
        print(f"  Labels: Binary (Positive/Negative)")
        print("=" * 60)
        print()
        
        return dataset, "IMDB", train_size
    
    except Exception as e:
        print(f"✗ IMDB not available: {e}")
    
    # Try Yelp Polarity
    try:
        print("\nAttempting to load Yelp Polarity dataset...")
        dataset = load_dataset("yelp_polarity")
        
        # Subsample to 100k for fast training
        dataset["train"] = dataset["train"].shuffle(seed=42).select(range(100000))
        dataset["test"] = dataset["test"].shuffle(seed=42).select(range(20000))
        
        train_size = len(dataset["train"])
        test_size = len(dataset["test"])
        
        print(f"\n✓ Selected: Yelp Polarity (Subsampled)")
        print(f"  Reason: High-quality product reviews")
        print(f"  Train samples: {train_size:,}")
        print(f"  Test samples: {test_size:,}")
        print(f"  Labels: Binary (Positive/Negative)")
        print("=" * 60)
        print()
        
        return dataset, "Yelp Polarity", train_size
    
    except Exception as e:
        print(f"✗ Yelp Polarity not available: {e}")
    
    # Try Amazon Polarity with heavy subsampling
    try:
        print("\nAttempting to load Amazon Polarity dataset...")
        dataset = load_dataset("amazon_polarity")
        
        # Subsample to 150k for manageable training time
        dataset["train"] = dataset["train"].shuffle(seed=42).select(range(150000))
        dataset["test"] = dataset["test"].shuffle(seed=42).select(range(30000))
        
        train_size = len(dataset["train"])
        test_size = len(dataset["test"])
        
        print(f"\n✓ Selected: Amazon Polarity (Subsampled)")
        print(f"  Reason: Large dataset, subsampled for speed")
        print(f"  Train samples: {train_size:,}")
        print(f"  Test samples: {test_size:,}")
        print(f"  Labels: Binary (Positive/Negative)")
        print("=" * 60)
        print()
        
        return dataset, "Amazon Polarity", train_size
    
    except Exception as e:
        print(f"✗ Amazon Polarity not available: {e}")
        raise RuntimeError("No suitable dataset could be loaded.")

# ============================================
# Training Time Estimation
# ============================================
def estimate_training_time(train_size, epochs, batch_size):
    """Estimate training time based on RTX 4050 benchmarks"""
    print("=" * 60)
    print("TRAINING TIME ESTIMATION")
    print("=" * 60)
    
    # DistilBERT on RTX 4050: ~300-400 samples/second
    samples_per_second = 350
    
    total_steps = (train_size * epochs) / batch_size
    estimated_seconds = (train_size * epochs) / samples_per_second
    estimated_minutes = estimated_seconds / 60
    
    print(f"Total training samples: {train_size * epochs:,}")
    print(f"Total training steps: {int(total_steps):,}")
    print(f"Estimated time: {estimated_minutes:.1f} minutes ({estimated_minutes/epochs:.1f} min/epoch)")
    print(f"GPU: RTX 4050 (6GB VRAM)")
    print(f"Model: {MODEL_NAME}")
    print("=" * 60)
    print()

# ============================================
# Data Preprocessing
# ============================================
def preprocess_function(examples, tokenizer):
    """Tokenize and prepare data"""
    # Handle different dataset formats
    if "text" in examples:
        texts = examples["text"]
    elif "content" in examples:
        texts = examples["content"]
    elif "review" in examples:
        texts = examples["review"]
    else:
        texts = examples[list(examples.keys())[0]]
    
    return tokenizer(
        texts,
        truncation=True,
        max_length=MAX_LENGTH,
        padding=False  # Dynamic padding via data collator
    )

# ============================================
# Metrics Computation
# ============================================
def compute_metrics(eval_pred):
    """Compute accuracy and F1 score during training"""
    predictions, labels = eval_pred
    predictions = np.argmax(predictions, axis=1)
    
    accuracy = accuracy_score(labels, predictions)
    f1 = f1_score(labels, predictions, average='binary')
    
    return {
        'accuracy': accuracy,
        'f1': f1
    }

# ============================================
# Save Metrics
# ============================================
def save_metrics(trainer, test_dataset, tokenizer, start_time, dataset_name, train_size):
    """Generate and save all metrics and plots"""
    print("\n" + "=" * 60)
    print("SAVING METRICS AND GENERATING REPORTS")
    print("=" * 60)
    
    os.makedirs(METRICS_DIR, exist_ok=True)
    
    # Get predictions
    print("Generating predictions on test set...")
    predictions = trainer.predict(test_dataset)
    pred_labels = np.argmax(predictions.predictions, axis=1)
    true_labels = predictions.label_ids
    
    # 1. Classification Report
    print("Creating classification report...")
    report = classification_report(
        true_labels,
        pred_labels,
        target_names=['Negative', 'Positive'],
        digits=4
    )
    
    with open(os.path.join(METRICS_DIR, "classification_report.txt"), "w") as f:
        f.write("CLASSIFICATION REPORT\n")
        f.write("=" * 60 + "\n\n")
        f.write(report)
    
    # 2. Confusion Matrix Plot
    print("Creating confusion matrix...")
    cm = confusion_matrix(true_labels, pred_labels)
    
    plt.figure(figsize=(8, 6))
    sns.heatmap(
        cm,
        annot=True,
        fmt='d',
        cmap='Blues',
        xticklabels=['Negative', 'Positive'],
        yticklabels=['Negative', 'Positive']
    )
    plt.title('Confusion Matrix')
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    plt.tight_layout()
    plt.savefig(os.path.join(METRICS_DIR, "confusion_matrix.png"), dpi=300)
    plt.close()
    
    # 3. Training History Plot
    print("Creating training history plot...")
    log_history = trainer.state.log_history
    
    train_loss = [x['loss'] for x in log_history if 'loss' in x]
    eval_loss = [x['eval_loss'] for x in log_history if 'eval_loss' in x]
    
    if train_loss and eval_loss:
        plt.figure(figsize=(10, 6))
        plt.plot(train_loss, label='Training Loss', marker='o')
        plt.plot(eval_loss, label='Validation Loss', marker='s')
        plt.xlabel('Training Steps')
        plt.ylabel('Loss')
        plt.title('Training and Validation Loss')
        plt.legend()
        plt.grid(True, alpha=0.3)
        plt.tight_layout()
        plt.savefig(os.path.join(METRICS_DIR, "training_loss.png"), dpi=300)
        plt.close()
    
    # 4. Accuracy Plot
    print("Creating accuracy plot...")
    eval_accuracy = [x['eval_accuracy'] for x in log_history if 'eval_accuracy' in x]
    
    if eval_accuracy:
        plt.figure(figsize=(10, 6))
        plt.plot(eval_accuracy, label='Validation Accuracy', marker='o', color='green')
        plt.xlabel('Evaluation Step')
        plt.ylabel('Accuracy')
        plt.title('Validation Accuracy Over Time')
        plt.legend()
        plt.grid(True, alpha=0.3)
        plt.ylim([0, 1])
        plt.tight_layout()
        plt.savefig(os.path.join(METRICS_DIR, "accuracy.png"), dpi=300)
        plt.close()
    
    # 5. F1 Scores JSON
    print("Calculating F1 scores...")
    accuracy = accuracy_score(true_labels, pred_labels)
    f1 = f1_score(true_labels, pred_labels, average='binary')
    f1_neg = f1_score(true_labels, pred_labels, average=None)[0]
    f1_pos = f1_score(true_labels, pred_labels, average=None)[1]
    
    f1_scores = {
        "overall_accuracy": float(accuracy),
        "f1_binary": float(f1),
        "f1_negative": float(f1_neg),
        "f1_positive": float(f1_pos)
    }
    
    with open(os.path.join(METRICS_DIR, "f1_scores.json"), "w") as f:
        json.dump(f1_scores, f, indent=2)
    
    # 6. Training Results JSON
    print("Saving training results...")
    train_results = {
        "final_train_loss": float(train_loss[-1]) if train_loss else None,
        "final_eval_loss": float(eval_loss[-1]) if eval_loss else None,
        "final_accuracy": float(eval_accuracy[-1]) if eval_accuracy else None,
        "total_training_steps": len(train_loss),
        "total_eval_steps": len(eval_loss)
    }
    
    with open(os.path.join(METRICS_DIR, "train_results.json"), "w") as f:
        json.dump(train_results, f, indent=2)
    
    # 7. Eval Results JSON
    print("Saving evaluation results...")
    eval_results = {
        "accuracy": float(accuracy),
        "f1_score": float(f1),
        "total_samples": len(true_labels),
        "correct_predictions": int(np.sum(pred_labels == true_labels)),
        "incorrect_predictions": int(np.sum(pred_labels != true_labels))
    }
    
    with open(os.path.join(METRICS_DIR, "eval_results.json"), "w") as f:
        json.dump(eval_results, f, indent=2)
    
    # 8. Training Time
    training_time = time.time() - start_time
    training_minutes = training_time / 60
    
    with open(os.path.join(METRICS_DIR, "training_time.txt"), "w") as f:
        f.write(f"Total Training Time: {training_minutes:.2f} minutes\n")
        f.write(f"Total Training Time: {training_time:.2f} seconds\n")
        f.write(f"Time per epoch: {training_minutes/EPOCHS:.2f} minutes\n")
    
    # 9. Training Config
    print("Saving training configuration...")
    config = {
        "model_name": MODEL_NAME,
        "dataset": dataset_name,
        "train_samples": train_size,
        "test_samples": len(test_dataset),
        "max_length": MAX_LENGTH,
        "batch_size": BATCH_SIZE,
        "epochs": EPOCHS,
        "learning_rate": LEARNING_RATE,
        "warmup_steps": WARMUP_STEPS,
        "weight_decay": WEIGHT_DECAY,
        "device": "cuda" if torch.cuda.is_available() else "cpu",
        "gpu_name": torch.cuda.get_device_name(0) if torch.cuda.is_available() else "N/A"
    }
    
    with open(os.path.join(METRICS_DIR, "training_config.json"), "w") as f:
        json.dump(config, f, indent=2)
    
    print(f"\n✓ All metrics saved to: {METRICS_DIR}/")
    print("=" * 60)
    
    return accuracy, f1, training_minutes

# ============================================
# Main Training Function
# ============================================
def main():
    """Main training pipeline"""
    print("\n")
    print("=" * 60)
    print("DISTILBERT SENTIMENT ANALYSIS TRAINING")
    print("=" * 60)
    print()
    
    start_time = time.time()
    
    # 1. Detect GPU
    device = detect_gpu()
    
    # 2. Load Dataset
    dataset, dataset_name, train_size = select_and_load_dataset()
    
    # 3. Estimate Training Time
    estimate_training_time(train_size, EPOCHS, BATCH_SIZE)
    
    # 4. Load Tokenizer and Model
    print("=" * 60)
    print("LOADING MODEL AND TOKENIZER")
    print("=" * 60)
    print(f"Loading tokenizer: {MODEL_NAME}")
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    
    print(f"Loading model: {MODEL_NAME}")
    model = AutoModelForSequenceClassification.from_pretrained(
        MODEL_NAME,
        num_labels=2
    )
    print("✓ Model and tokenizer loaded successfully")
    print("=" * 60)
    print()
    
    # 5. Preprocess Data
    print("=" * 60)
    print("PREPROCESSING DATA")
    print("=" * 60)
    print("Tokenizing training data...")
    train_dataset = dataset["train"].map(
        lambda x: preprocess_function(x, tokenizer),
        batched=True,
        remove_columns=[col for col in dataset["train"].column_names if col != 'label']
    )
    
    print("Tokenizing test data...")
    test_dataset = dataset["test"].map(
        lambda x: preprocess_function(x, tokenizer),
        batched=True,
        remove_columns=[col for col in dataset["test"].column_names if col != 'label']
    )
    
    print("✓ Data preprocessing complete")
    print("=" * 60)
    print()
    
    # 6. Training Arguments
    print("=" * 60)
    print("TRAINING CONFIGURATION")
    print("=" * 60)
    
    training_args = TrainingArguments(
        output_dir="./results",
        eval_strategy="epoch",
        save_strategy="epoch",
        learning_rate=LEARNING_RATE,
        per_device_train_batch_size=BATCH_SIZE,
        per_device_eval_batch_size=BATCH_SIZE,
        num_train_epochs=EPOCHS,
        weight_decay=WEIGHT_DECAY,
        warmup_steps=WARMUP_STEPS,
        logging_dir="./logs",
        logging_steps=100,
        load_best_model_at_end=True,
        metric_for_best_model="accuracy",
        fp16=torch.cuda.is_available(),  # Mixed precision for GPU
        gradient_checkpointing=True,  # Save VRAM
        gradient_accumulation_steps=2,  # Effective batch size = 32
        report_to=[],  # Disable wandb/tensorboard
        save_total_limit=2,  # Keep only 2 checkpoints
    )
    
    print(f"Epochs: {EPOCHS}")
    print(f"Batch Size: {BATCH_SIZE}")
    print(f"Learning Rate: {LEARNING_RATE}")
    print(f"FP16 (Mixed Precision): {training_args.fp16}")
    print(f"Gradient Checkpointing: {training_args.gradient_checkpointing}")
    print(f"Gradient Accumulation Steps: {training_args.gradient_accumulation_steps}")
    print("=" * 60)
    print()
    
    # 7. Initialize Trainer
    data_collator = DataCollatorWithPadding(tokenizer=tokenizer)
    
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=test_dataset,
        tokenizer=tokenizer,
        data_collator=data_collator,
        compute_metrics=compute_metrics
    )
    
    # 8. Train Model
    print("=" * 60)
    print("STARTING TRAINING")
    print("=" * 60)
    print()
    
    trainer.train()
    
    print()
    print("=" * 60)
    print("TRAINING COMPLETE")
    print("=" * 60)
    print()
    
    # 9. Save Model
    print("=" * 60)
    print("SAVING MODEL")
    print("=" * 60)
    os.makedirs(MODEL_DIR, exist_ok=True)
    
    print(f"Saving model to: {MODEL_DIR}/")
    trainer.save_model(MODEL_DIR)
    tokenizer.save_pretrained(MODEL_DIR)
    
    print("✓ Model saved successfully")
    print("=" * 60)
    print()
    
    # 10. Save Metrics
    accuracy, f1, training_minutes = save_metrics(
        trainer,
        test_dataset,
        tokenizer,
        start_time,
        dataset_name,
        train_size
    )
    
    # 11. Final Summary
    print("\n")
    print("=" * 60)
    print("TRAINING COMPLETE - SUMMARY")
    print("=" * 60)
    print()
    print(f"Model saved to: {MODEL_DIR}/")
    print(f"Metrics saved to: {METRICS_DIR}/")
    print()
    print(f"Dataset used: {dataset_name}")
    print(f"Total training samples: {train_size:,}")
    print(f"Evaluation accuracy: {accuracy:.4f} ({accuracy*100:.2f}%)")
    print(f"Evaluation F1 score: {f1:.4f}")
    print(f"Training time: {training_minutes:.2f} minutes")
    print(f"GPU used: {torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'CPU'}")
    print()
    print("=" * 60)
    print()

if __name__ == "__main__":
    main()
