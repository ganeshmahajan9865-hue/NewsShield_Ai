"""
NewsShield_AI - Feedback API Endpoint
Complies with PRD Section 26 & 32 (POST /feedback)
Supports numeric ratings (1-5) and qualitative ratings ("correct" / "incorrect")
"""

from typing import Optional, Union
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, field_validator
from backend.db.storage import save_user_feedback

router = APIRouter(tags=["Feedback"])


class FeedbackRequest(BaseModel):
    analysis_id: str
    rating: Union[int, str] = Field(..., description="Rating: integer 1-5 or string 'correct'/'incorrect'")
    comment: Optional[str] = ""
    user_id: Optional[str] = "guest_user"

    @field_validator("rating", mode="before")
    @classmethod
    def parse_rating(cls, v):
        if isinstance(v, str):
            v_lower = v.strip().lower()
            if v_lower in ("correct", "accurate", "good", "thumbs_up", "yes", "helpful"):
                return 5
            elif v_lower in ("incorrect", "inaccurate", "bad", "thumbs_down", "no", "unhelpful"):
                return 1
            try:
                numeric = int(v_lower)
                return max(1, min(5, numeric))
            except ValueError:
                return 3
        elif isinstance(v, (int, float)):
            return max(1, min(5, int(v)))
        return 3


@router.post("/feedback")
def submit_feedback(payload: FeedbackRequest):
    """
    Submits user feedback regarding an analysis for quality review and model auditing.
    Accepts both 1-5 integer ratings and 'correct'/'incorrect' strings.
    """
    try:
        saved = save_user_feedback(
            analysis_id=payload.analysis_id,
            rating=int(payload.rating),
            comment=payload.comment or "",
            user_id=payload.user_id or "guest_user"
        )
        return {
            "status": "success",
            "message": "Feedback recorded successfully",
            "feedback_id": saved["id"],
            "rating": payload.rating
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to submit feedback: {str(e)}")
