"""
NewsShield_AI - Health API Endpoint
Complies with PRD Section 32 (GET /health)
"""

import os
from datetime import datetime
from fastapi import APIRouter
from backend.ml.predictor import MODEL_PATH, VECTORIZER_PATH

router = APIRouter(tags=["Health"])


@router.get("/health")
def get_health():
    """
    Checks backend health, model readiness, and server status.
    """
    model_ready = os.path.exists(MODEL_PATH) and os.path.exists(VECTORIZER_PATH)
    return {
        "status": "healthy",
        "service": "NewsShield_AI Backend",
        "model_loaded": model_ready,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
