"""
NewsShield_AI - Predict API Endpoint
Complies with PRD Section 32 (POST /predict)
"""

from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from backend.ml.predictor import predict_credibility

router = APIRouter(tags=["Prediction"])


class PredictRequest(BaseModel):
    text: str = Field(
        ...,
        min_length=10,
        max_length=25000,
        description="The news headline, article body, or claim to evaluate."
    )


class PredictResponse(BaseModel):
    prediction: str = Field(..., description="'Likely Real' or 'Likely Fake'")
    confidence: float = Field(..., description="Calibrated model score between 0.50 and 0.99")
    probability_real: float
    probability_fake: float
    model_name: str
    model_version: str
    linguistic_signals: Dict[str, Any]
    matched_real_signals: List[str]
    matched_fake_signals: List[str]
    disclaimer: str


@router.post("/predict", response_model=PredictResponse)
def predict_news(payload: PredictRequest):
    """
    Analyzes submitted text using the NLP preprocessing and trained ML classifier.
    Returns prediction, calibrated confidence score, and explainability signals.
    """
    try:
        result = predict_credibility(payload.text)
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        return result
    except FileNotFoundError as fnf:
        raise HTTPException(
            status_code=503,
            detail=f"Model service temporarily unavailable. {str(fnf)}"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")
