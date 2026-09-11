"""
NewsShield_AI - History & Dashboard API Endpoints
Complies with PRD Section 21, 25, 32 (GET /history, GET /analytics)
"""

from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from backend.db.storage import (
    save_analysis,
    get_history,
    get_analysis_by_id,
    get_analytics_metrics
)

router = APIRouter(tags=["History & Analytics"])


class SaveAnalysisRequest(BaseModel):
    news_text: str
    prediction: str
    confidence: float
    model_name: str
    model_version: str
    input_type: str = "text"
    url: Optional[str] = None
    evidence_status: Optional[str] = None
    evidence_cards: Optional[List[Dict[str, Any]]] = None
    user_id: Optional[str] = "guest_user"


@router.post("/history/save")
def record_analysis(payload: SaveAnalysisRequest):
    """Saves completed analysis and its retrieved evidence."""
    try:
        saved = save_analysis(
            news_text=payload.news_text,
            prediction=payload.prediction,
            confidence=payload.confidence,
            model_name=payload.model_name,
            model_version=payload.model_version,
            input_type=payload.input_type,
            url=payload.url,
            evidence_status=payload.evidence_status,
            evidence_cards=payload.evidence_cards,
            user_id=payload.user_id or "guest_user"
        )
        return saved
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save analysis: {str(e)}")


@router.get("/history")
def fetch_history(limit: int = Query(default=50, ge=1, le=100)):
    """Fetches user analysis history."""
    try:
        records = get_history(limit=limit)
        return {"history": records, "count": len(records)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch history: {str(e)}")


@router.get("/history/{analysis_id}")
def fetch_analysis_detail(analysis_id: str):
    """Fetches a specific analysis along with its attached evidence items."""
    record = get_analysis_by_id(analysis_id)
    if not record:
        raise HTTPException(status_code=404, detail="Analysis record not found.")
    return record


@router.get("/analytics")
def fetch_analytics():
    """Returns aggregated platform metrics for the dashboard."""
    try:
        metrics = get_analytics_metrics()
        return metrics
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to compute analytics: {str(e)}")
