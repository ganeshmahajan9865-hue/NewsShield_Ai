"""
NewsShield_AI - FastAPI Integration Tests
Tests all core endpoints with FastAPI TestClient.
Complies with PRD Section 29 & 32.
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["model_loaded"] is True


def test_predict_endpoint_success():
    payload = {
        "text": "European Space Agency releases deep space survey mapping billions of distant stars and galaxies."
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["prediction"] in ("Likely Real", "Likely Fake")
    assert "confidence" in data
    assert "disclaimer" in data


def test_predict_endpoint_validation_error():
    # Input too short (< 10 chars)
    payload = {"text": "hi"}
    response = client.post("/predict", json=payload)
    assert response.status_code == 422


def test_model_info_endpoint():
    response = client.get("/model-info")
    assert response.status_code == 200
    data = response.json()
    assert "model_name" in data
    assert "model_version" in data
    assert "selected_metrics" in data


def test_full_analysis_quick_mode():
    payload = {
        "text": "Scientists discover high-efficiency solid-state battery with increased energy density in laboratory tests.",
        "mode": "quick"
    }
    response = client.post("/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "prediction" in data
    assert "confidence" in data


def test_history_and_analytics_flow():
    # 1. Save an analysis
    save_payload = {
        "news_text": "Sample test statement for history verification.",
        "prediction": "Likely Real",
        "confidence": 0.88,
        "model_name": "LogisticRegression",
        "model_version": "1.0",
        "evidence_status": "Supporting"
    }
    res_save = client.post("/history/save", json=save_payload)
    assert res_save.status_code == 200
    analysis_id = res_save.json()["id"]

    # 2. Retrieve history
    res_hist = client.get("/history")
    assert res_hist.status_code == 200
    assert res_hist.json()["count"] > 0

    # 3. Retrieve specific detail
    res_detail = client.get(f"/history/{analysis_id}")
    assert res_detail.status_code == 200
    assert res_detail.json()["id"] == analysis_id

    # 4. Check analytics
    res_analytics = client.get("/analytics")
    assert res_analytics.status_code == 200
    assert res_analytics.json()["total_analyses"] >= 1
