"""
NewsShield_AI - ML Training & Evaluation Pipeline
Trains and compares Logistic Regression, Linear SVM (with CalibratedClassifierCV),
and Multinomial Naive Bayes models on the news dataset.
Evaluates on an untouched test set, selects the best model, and saves artifacts.
Complies with PRD Section 16, 17, 29.
"""

import os
import sys
import json
import joblib
import numpy as np
import pandas as pd
from datetime import datetime
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.svm import LinearSVC
from sklearn.calibration import CalibratedClassifierCV
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import (
    accuracy_score,
    precision_recall_fscore_support,
    confusion_matrix,
    classification_report
)

# Ensure backend/ml is on sys.path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from preprocess import clean_text

DATASET_PATH = os.path.join(CURRENT_DIR, "..", "..", "dataset", "news.csv")
MODEL_PATH = os.path.join(CURRENT_DIR, "model.pkl")
VECTORIZER_PATH = os.path.join(CURRENT_DIR, "vectorizer.pkl")
METADATA_PATH = os.path.join(CURRENT_DIR, "model_metadata.json")


def load_and_validate_data(filepath: str) -> pd.DataFrame:
    """Loads dataset and performs validation and cleaning checks."""
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"Dataset not found at {filepath}. Run dataset_builder.py first.")

    df = pd.read_csv(filepath)
    print(f"[Data] Loaded dataset from {filepath} with {len(df)} rows.")

    # Validate required columns
    required_cols = {"text", "label"}
    if not required_cols.issubset(df.columns):
        raise ValueError(f"Dataset must contain columns: {required_cols}. Found: {df.columns.tolist()}")

    # Handle missing values
    df = df.dropna(subset=["text", "label"]).copy()
    df["label"] = df["label"].astype(int)

    # Clean text using the unified preprocessor
    print("[NLP] Preprocessing texts using NewsShield NLP pipeline...")
    df["clean_text"] = df["text"].apply(lambda t: clean_text(str(t)))
    df = df[df["clean_text"].str.len() > 10].reset_index(drop=True)

    print(f"[Data] After cleaning: {len(df)} valid records.")
    class_counts = df["label"].value_counts().to_dict()
    print(f"[Data] Class distribution: 0 (Fake): {class_counts.get(0, 0)}, 1 (Real): {class_counts.get(1, 0)}")

    return df


def train_and_evaluate():
    """Main training routine with model comparison and artifact export."""
    df = load_and_validate_data(DATASET_PATH)

    X = df["clean_text"]
    y = df["label"]

    # Stratified 80/20 train/test split (leakage prevention)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    print(f"[Data Split] Train set: {len(X_train)} samples, Test set: {len(X_test)} samples.")

    # Fit TF-IDF strictly on the training set
    print("[Vectorization] Fitting TF-IDF Vectorizer on training data...")
    vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),
        max_features=8000,
        sublinear_tf=True,
        min_df=2
    )
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)
    print(f"[Vectorization] Vocabulary size: {len(vectorizer.vocabulary_)} features.")

    # Define candidate models
    models = {
        "LogisticRegression": LogisticRegression(
            C=1.5,
            max_iter=1000,
            solver="liblinear",
            random_state=42
        ),
        "LinearSVM_Calibrated": CalibratedClassifierCV(
            LinearSVC(C=1.0, random_state=42, dual="auto"),
            cv=3,
            method="sigmoid"
        ),
        "MultinomialNB": MultinomialNB(alpha=0.5)
    }

    comparison_results = {}
    best_model_name = None
    best_f1 = -1.0
    trained_models = {}

    print("\n" + "="*60)
    print("MODEL EVALUATION COMPARISON ON UNTOUCHED TEST SET")
    print("="*60)

    for name, clf in models.items():
        # Fit model
        clf.fit(X_train_vec, y_train)
        trained_models[name] = clf

        # Predict on untouched test set
        y_pred = clf.predict(X_test_vec)

        # Calculate metrics
        acc = accuracy_score(y_test, y_pred)
        p, r, f1, _ = precision_recall_fscore_support(y_test, y_pred, average="weighted")
        p_classes, r_classes, f1_classes, _ = precision_recall_fscore_support(y_test, y_pred, average=None)
        cm = confusion_matrix(y_test, y_pred).tolist()

        metrics = {
            "accuracy": round(float(acc), 4),
            "precision_weighted": round(float(p), 4),
            "recall_weighted": round(float(r), 4),
            "f1_weighted": round(float(f1), 4),
            "per_class": {
                "fake_0": {
                    "precision": round(float(p_classes[0]), 4),
                    "recall": round(float(r_classes[0]), 4),
                    "f1": round(float(f1_classes[0]), 4)
                },
                "real_1": {
                    "precision": round(float(p_classes[1]), 4),
                    "recall": round(float(r_classes[1]), 4),
                    "f1": round(float(f1_classes[1]), 4)
                }
            },
            "confusion_matrix": cm  # [[TN, FP], [FN, TP]]
        }
        comparison_results[name] = metrics

        print(f"\nModel: {name}")
        print(f"  Accuracy:  {metrics['accuracy'] * 100:.2f}%")
        print(f"  Weighted F1: {metrics['f1_weighted']:.4f}")
        print(f"  Fake (0) -> Precision: {metrics['per_class']['fake_0']['precision']}, Recall: {metrics['per_class']['fake_0']['recall']}, F1: {metrics['per_class']['fake_0']['f1']}")
        print(f"  Real (1) -> Precision: {metrics['per_class']['real_1']['precision']}, Recall: {metrics['per_class']['real_1']['recall']}, F1: {metrics['per_class']['real_1']['f1']}")
        print(f"  Confusion Matrix: {cm}")

        if metrics["f1_weighted"] > best_f1:
            best_f1 = metrics["f1_weighted"]
            best_model_name = name

    print("\n" + "="*60)
    print(f"BEST PERFORMING MODEL SELECTED: {best_model_name} (F1: {best_f1:.4f})")
    print("="*60)

    best_model = trained_models[best_model_name]

    # Extract top indicative features from Logistic Regression for model explainability signals
    feature_names = vectorizer.get_feature_names_out()
    lr_model = trained_models["LogisticRegression"]
    top_fake_features = []
    top_real_features = []
    if hasattr(lr_model, "coef_"):
        coefs = lr_model.coef_[0]
        # Class 1 is Real (positive coef), Class 0 is Fake (negative coef)
        top_real_idx = np.argsort(coefs)[-15:][::-1]
        top_fake_idx = np.argsort(coefs)[:15]
        top_real_features = [(feature_names[i], round(float(coefs[i]), 3)) for i in top_real_idx]
        top_fake_features = [(feature_names[i], round(float(coefs[i]), 3)) for i in top_fake_idx]

    # Save artifacts
    print(f"\n[Artifacts] Saving serialized model to: {MODEL_PATH}")
    joblib.dump(best_model, MODEL_PATH)

    print(f"[Artifacts] Saving serialized vectorizer to: {VECTORIZER_PATH}")
    joblib.dump(vectorizer, VECTORIZER_PATH)

    # Compile comprehensive metadata according to PRD Section 16 & 21
    metadata = {
        "model_name": best_model_name,
        "model_version": "1.0",
        "created_at": datetime.utcnow().isoformat() + "Z",
        "dataset_name": "NewsShield_AI Curated Benchmark Dataset",
        "total_samples": len(df),
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "vocabulary_size": len(vectorizer.vocabulary_),
        "selected_metrics": comparison_results[best_model_name],
        "model_comparison": comparison_results,
        "top_features": {
            "indicates_real": top_real_features,
            "indicates_fake": top_fake_features
        },
        "preprocessing_config": {
            "lowercase": True,
            "html_strip": True,
            "url_strip": True,
            "negation_preserved": True,
            "stop_words": "custom_curated",
            "ngram_range": [1, 2],
            "sublinear_tf": True
        }
    }

    print(f"[Artifacts] Saving metadata to: {METADATA_PATH}")
    with open(METADATA_PATH, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    print("\n[Complete] ML pipeline training and evaluation finished successfully!")
    return metadata


if __name__ == "__main__":
    train_and_evaluate()
