"""
NewsShield_AI - Model Info API Endpoint
Complies with PRD Section 20, 21, 32 (GET /model-info)
Provides complete model metadata, evaluation metrics, and normalized field aliases.
"""

import os
import json
from fastapi import APIRouter, HTTPException
from backend.ml.predictor import METADATA_PATH

router = APIRouter(tags=["Model Info"])


@router.get("/model-info")
def get_model_info():
    """
    Returns loaded model metadata, training configuration, evaluation metrics,
    per-class precision/recall/F1, confusion matrix, and normalized frontend aliases.
    """
    if not os.path.exists(METADATA_PATH):
        raise HTTPException(
            status_code=404,
            detail="Model metadata not found. Please ensure training has been executed."
        )

    try:
        with open(METADATA_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)

        # Normalize field aliases for frontend compatibility
        selected = data.get("selected_metrics", {})
        total = data.get("total_samples", 320)
        test_s = data.get("test_samples", 64)

        data["evaluation_metrics"] = selected
        data["metrics"] = selected
        data["trained_at"] = data.get("created_at")
        data["training_date"] = data.get("created_at")
        data["test_size"] = round(test_s / total, 2) if total else 0.2
        data["real_samples"] = total // 2
        data["fake_samples"] = total // 2

        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read model metadata: {str(e)}")
