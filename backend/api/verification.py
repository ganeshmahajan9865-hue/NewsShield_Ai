"""
NewsShield_AI - Verification API Endpoints with Real-Time Decision Fusion
Provides:
- POST /verify-claim (Claim-level evidence verification)
- POST /analyze (Complete end-to-end credibility & RAG verification with real-time decision fusion)
Complies with PRD Section 10, 18, 32.
"""

from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from backend.ml.predictor import predict_credibility
from backend.ml.multilingual import get_multilingual_metadata
from backend.rag.verification import verify_claims_with_rag
from backend.db.storage import save_analysis

router = APIRouter(tags=["Deep Verification"])


class VerifyClaimRequest(BaseModel):
    claim: str = Field(..., min_length=10, max_length=1000, description="Specific claim to verify against external evidence.")


class AnalyzeRequest(BaseModel):
    text: str = Field(..., min_length=10, max_length=25000, description="News text, article body, or headline.")
    mode: str = Field(default="deep", description="'quick' for ML only, 'deep' for ML + Evidence RAG")
    user_id: Optional[str] = Field(default="guest_user", description="Optional authenticated user ID")


@router.post("/verify-claim")
def verify_claim(payload: VerifyClaimRequest):
    """
    Extracts evidence from external sources for a claim and provides grounded status.
    """
    try:
        result = verify_claims_with_rag(payload.claim)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Claim verification failed: {str(e)}")


@router.post("/analyze")
def analyze_news_full(payload: AnalyzeRequest):
    """
    Full End-to-End Real-Time Analysis:
    1. Language Identification (English, Hindi, Marathi)
    2. ML Credibility Classification & Calibrated Probability
    3. Real-Time Deep Verification against live Google News & Fact-Checkers
    4. Dynamic Decision Fusion: Real-time evidence overrides or boosts ML confidence
    5. Automatic Persistence to Supabase / SQLite with analysis_id generation
    6. Responsible AI Disclaimer
    """
    try:
        # Step 1: Detect Language
        lang_meta = get_multilingual_metadata(payload.text)

        # Step 2: Run ML classification baseline
        ml_res = predict_credibility(payload.text)
        if "error" in ml_res:
            raise HTTPException(status_code=400, detail=ml_res["error"])

        final_prediction = ml_res["prediction"]
        final_confidence = ml_res["confidence"]
        prob_real = ml_res["probability_real"]
        prob_fake = ml_res["probability_fake"]
        model_display_name = ml_res["model_name"]
        rag_res = None
        evidence_cards = []
        explanation = ""
        evidence_status = "Evaluated"

        # Step 3: If Deep Verification mode requested, run Real-Time RAG verification
        if payload.mode.lower() == "deep":
            rag_res = verify_claims_with_rag(payload.text, ml_prediction=ml_res["prediction"])
            evidence_cards = rag_res.get("evidence_cards", [])
            explanation = rag_res.get("explanation", "")
            evidence_status = rag_res.get("evidence_status", "Evaluated")
            
            # Dynamic Decision Fusion
            override = rag_res.get("override_prediction")
            rag_score = rag_res.get("corroboration_score", 0.5)

            if override:
                # Real-time evidence (fact-check or multi-outlet consensus) overrides static model
                final_prediction = override
                final_confidence = round(rag_score, 2)
                
                if override == "Likely Real":
                    prob_real = final_confidence
                    prob_fake = round(1.0 - final_confidence, 3)
                else:
                    prob_fake = final_confidence
                    prob_real = round(1.0 - final_confidence, 3)

                model_display_name = f"{ml_res['model_name']} + Real-Time RAG Consensus"
        else:
            explanation = (
                f"Quick Analysis completed using {ml_res['model_name']} v{ml_res['model_version']}. "
                f"Prediction indicates patterns associated with {final_prediction.lower()} news with "
                f"{int(final_confidence * 100)}% calibrated model confidence."
            )

        # If text is Indic (Hindi/Marathi), add an advisory note to explanation
        if lang_meta.get("is_indic"):
            explanation = (
                f"[Language Note: Submitted in {lang_meta.get('language_name')}] "
                + (explanation or "")
            )

        # Step 4: Automatically save to database for history, PDF reporting, and feedback
        saved_record = save_analysis(
            news_text=payload.text,
            prediction=final_prediction,
            confidence=final_confidence,
            model_name=model_display_name,
            model_version=ml_res["model_version"],
            input_type="text",
            url="",
            evidence_status=evidence_status,
            evidence_cards=evidence_cards,
            user_id=payload.user_id or "guest_user"
        )
        analysis_id = saved_record.get("id")

        return {
            "analysis_id": analysis_id,
            "id": analysis_id,
            "prediction": final_prediction,
            "confidence": final_confidence,
            "probability_real": prob_real,
            "probability_fake": prob_fake,
            "model_name": model_display_name,
            "model_version": ml_res["model_version"],
            "evidence_status": evidence_status,
            "evidence": evidence_cards,
            "evidence_cards": evidence_cards,
            "explanation": explanation,
            "linguistic_signals": ml_res["linguistic_signals"],
            "matched_real_signals": ml_res["matched_real_signals"],
            "matched_fake_signals": ml_res["matched_fake_signals"],
            "detected_language": lang_meta,
            "deep_verification": rag_res,
            "disclaimer": ml_res["disclaimer"],
            "created_at": saved_record.get("created_at")
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis pipeline error: {str(e)}")
