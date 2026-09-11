"""
NewsShield_AI - ML Inference Engine & Predictor
Loads trained model and vectorizer artifacts and executes credibility classification.
Provides calibrated probability, top signal matches, and linguistic indicators.
"""

import os
import json
import joblib
import numpy as np
from typing import Dict, Any, List, Optional
from .preprocess import clean_text, extract_linguistic_signals

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(CURRENT_DIR, "model.pkl")
VECTORIZER_PATH = os.path.join(CURRENT_DIR, "vectorizer.pkl")
METADATA_PATH = os.path.join(CURRENT_DIR, "model_metadata.json")

_MODEL = None
_VECTORIZER = None
_METADATA = None


def load_artifacts():
    """Loads and caches model, vectorizer, and metadata."""
    global _MODEL, _VECTORIZER, _METADATA

    if _MODEL is not None and _VECTORIZER is not None:
        return _MODEL, _VECTORIZER, _METADATA

    if not os.path.exists(MODEL_PATH) or not os.path.exists(VECTORIZER_PATH):
        raise FileNotFoundError(
            "Model artifacts not found. Please run backend/ml/train.py first."
        )

    _MODEL = joblib.load(MODEL_PATH)
    _VECTORIZER = joblib.load(VECTORIZER_PATH)

    if os.path.exists(METADATA_PATH):
        with open(METADATA_PATH, "r", encoding="utf-8") as f:
            _METADATA = json.load(f)
    else:
        _METADATA = {
            "model_name": "NewsShieldClassifier",
            "model_version": "1.0",
            "dataset_name": "Curated Benchmark"
        }

    return _MODEL, _VECTORIZER, _METADATA


def predict_credibility(raw_text: str) -> Dict[str, Any]:
    """
    Executes NLP preprocessing, TF-IDF vectorization, and inference.
    Returns prediction, calibrated score, explanation signals, and model metadata.
    """
    if not raw_text or len(raw_text.strip()) < 10:
        return {
            "error": "Input text too short. Please provide a substantive headline or news statement (at least 10 characters)."
        }

    model, vectorizer, metadata = load_artifacts()

    # Preprocess text
    cleaned = clean_text(raw_text)
    if not cleaned:
        cleaned = raw_text.lower()

    # Vectorize
    vec = vectorizer.transform([cleaned])

    # Model inference
    pred_raw = model.predict(vec)[0]
    is_real = int(pred_raw) == 1

    # Probability calibration check
    prob_real = 0.5
    prob_fake = 0.5
    if hasattr(model, "predict_proba"):
        probs = model.predict_proba(vec)[0]
        # In scikit-learn binary classification, classes are typically [0, 1]
        prob_fake = float(probs[0])
        prob_real = float(probs[1])
    elif hasattr(model, "decision_function"):
        dec = model.decision_function(vec)[0]
        # Sigmoid calibration fallback
        prob_real = float(1 / (1 + np.exp(-dec)))
        prob_fake = float(1 - prob_real)

    # Appropriate confidence score for the predicted label
    confidence = round(prob_real if is_real else prob_fake, 2)
    # Clamp confidence between 0.51 and 0.98 to avoid claiming absolute 100% truth
    confidence = min(max(confidence, 0.51), 0.98)

    label = "Likely Real" if is_real else "Likely Fake"

    # Linguistic credibility signals
    linguistic = extract_linguistic_signals(raw_text)

    # Match text words with known predictive features from training
    top_features = metadata.get("top_features", {})
    words_in_text = set(cleaned.split())

    real_signals_found = []
    fake_signals_found = []

    for term, score in top_features.get("indicates_real", []):
        if term in cleaned:
            real_signals_found.append(term)

    for term, score in top_features.get("indicates_fake", []):
        if term in cleaned:
            fake_signals_found.append(term)

    return {
        "prediction": label,
        "confidence": confidence,
        "probability_real": round(prob_real, 3),
        "probability_fake": round(prob_fake, 3),
        "model_name": metadata.get("model_name", "LinearSVM_Calibrated"),
        "model_version": metadata.get("model_version", "1.0"),
        "linguistic_signals": linguistic,
        "matched_real_signals": real_signals_found[:5],
        "matched_fake_signals": fake_signals_found[:5],
        "disclaimer": (
            "NewsShield_AI provides AI-assisted credibility analysis based on learned patterns. "
            "A 'Likely Real' or 'Likely Fake' result is not a guarantee that a claim is true or false. "
            "Users should review cited sources and use independent judgment."
        )
    }
