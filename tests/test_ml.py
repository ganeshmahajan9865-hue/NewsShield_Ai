"""
NewsShield_AI - ML Pipeline Unit Tests
Complies with PRD Section 29 (Testing Strategy)
"""

import pytest
from backend.ml.preprocess import clean_text, extract_linguistic_signals
from backend.ml.predictor import predict_credibility


def test_clean_text_basic():
    raw = "<b>Breaking News:</b> Check out https://example.com/story for details!"
    cleaned = clean_text(raw)
    assert "https" not in cleaned
    assert "<b>" not in cleaned
    assert "breaking" in cleaned
    assert "news" in cleaned


def test_clean_text_preserves_negations():
    raw = "The government did NOT approve the controversial budget and never will."
    cleaned = clean_text(raw)
    assert "not" in cleaned
    assert "never" in cleaned


def test_linguistic_signals():
    clickbait_text = "SHOCKING SECRET REVEALED: YOU WON'T BELIEVE THIS MIRACLE CURE!!!"
    signals = extract_linguistic_signals(clickbait_text)
    assert signals["exclamation_count"] >= 3
    assert signals["uppercase_ratio"] > 0.5
    assert len(signals["clickbait_triggers"]) > 0
    assert signals["sensationalism_score"] > 0.5


def test_predict_credibility_real_sample():
    sample = "World Health Organization publishes verified clinical guidance on pediatric malaria immunization trials."
    res = predict_credibility(sample)
    assert "prediction" in res
    assert res["prediction"] in ("Likely Real", "Likely Fake")
    assert 0.50 <= res["confidence"] <= 1.0
    assert "disclaimer" in res


def test_predict_credibility_fake_sample():
    sample = "URGENT ALERT: Secret 5G mind control frequencies secretly installed by military elites to control citizens!"
    res = predict_credibility(sample)
    assert res["prediction"] == "Likely Fake"
    assert res["confidence"] >= 0.60
