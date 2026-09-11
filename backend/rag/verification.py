"""
NewsShield_AI - Real-Time Deep Verification & Evidence Analysis Engine
Analyzes extracted claims against live web sources, fact-checking registries,
and multi-outlet news consensus.
Complies with PRD Section 18, 19, 20.
"""

from typing import List, Dict, Any, Tuple
from .claim_extraction import extract_claims, build_search_queries
from .retrieval import retrieve_realtime_evidence

DEBUNK_PHRASES = [
    "not cure", "does not cure", "doesn't cure", "not kill", "does not kill", "doesn't kill",
    "no scientific basis", "no proof", "no evidence", "unproven", "not true", "not lethal",
    "cancer myths", "myths vs facts", "myth", "myths", "false", "fake", "hoax", 
    "debunk", "debunked", "misleading", "fabricated", "baseless", "unfounded", 
    "refuted", "denied", "disproven", "fact check", "fact-check", "claim check",
    "altered video", "doctored", "bogus", "scam"
]

CONFIRM_PHRASES = [
    "confirmed", "official", "published", "announces", "approved", "study finds", 
    "discovered", "record high", "verified", "evidence shows", "concluded", 
    "demonstrates", "launches", "signs agreement", "passed bill"
]

EXTRAORDINARY_MARKERS = [
    "died", "killed", "arrested", "resigns", "resigned", "cures 100%", "miracle cure",
    "cancer cure", "war declared", "banned all", "secret mind control", "microchip",
    "flat earth", "aliens landed", "abolish cash", "confiscate"
]


def evaluate_evidence_item(item: Dict[str, Any], raw_claim: str) -> str:
    """
    Classifies an individual retrieved document as Contradicting, Supporting, or Contextual.
    """
    title_lower = (item["title"] + " " + item.get("snippet", "")).lower()
    tier = item.get("source_tier", "Standard")

    # 1. Direct Debunk / Refutation Check
    for phrase in DEBUNK_PHRASES:
        if phrase in title_lower:
            return "Contradicting"

    # If from a recognized Fact-Check publisher and contains negation
    if tier == "FactCheck":
        for neg in ["not", "no", "never", "cannot", "doesnt", "doesn't"]:
            if f" {neg} " in f" {title_lower} ":
                return "Contradicting"

    # 2. Corroboration Check
    for phrase in CONFIRM_PHRASES:
        if phrase in title_lower:
            return "Supporting"

    # 3. If reputable mainstream news reporting without refutation, it's supporting context
    if tier in ("High", "Official"):
        return "Supporting"

    return "Neutral / Contextual"


def verify_claims_with_rag(text: str, ml_prediction: str = "") -> Dict[str, Any]:
    """
    Executes real-time deep verification against live web sources:
    1. Extract core claims and generate specialized search queries
    2. Query live Google News RSS and DuckDuckGo
    3. Detect fact-check debunks, media consensus, and lack of coverage
    4. Compute grounded status and real-time confidence modifier
    """
    claims = extract_claims(text, max_claims=2)
    if not claims:
        return {
            "evidence_status": "Insufficient Evidence",
            "realtime_verdict": "Unverified Claim",
            "extracted_claims": [],
            "evidence_cards": [],
            "explanation": "No specific verifiable factual propositions could be extracted from the text.",
            "sources_count": 0,
            "corroboration_score": 0.5,
            "override_prediction": None
        }

    all_evidence = []
    seen_urls = set()

    for claim in claims:
        queries = build_search_queries(claim)
        
        # 1. Primary news search
        news_results = retrieve_realtime_evidence(queries["news_query"], max_results=4)
        for ev in news_results:
            if ev["source_url"] not in seen_urls:
                seen_urls.add(ev["source_url"])
                all_evidence.append(ev)

        # 2. Fact-check targeted search
        fc_results = retrieve_realtime_evidence(queries["factcheck_query"], max_results=3)
        for ev in fc_results:
            if ev["source_url"] not in seen_urls:
                seen_urls.add(ev["source_url"])
                all_evidence.append(ev)

    if not all_evidence:
        is_extraordinary = any(marker in text.lower() for marker in EXTRAORDINARY_MARKERS)
        override = "Likely Fake" if is_extraordinary else None
        
        return {
            "evidence_status": "Insufficient Evidence",
            "realtime_verdict": "Zero News Coverage Found",
            "extracted_claims": claims,
            "evidence_cards": [],
            "explanation": (
                "Real-time search across global news and fact-checking registries found ZERO authoritative coverage "
                "confirming this event. In journalism and open-source intelligence, the complete absence of reporting "
                "on high-impact claims is a primary indicator of an unverified social media rumor."
            ) if is_extraordinary else (
                "No authoritative external news sources or official bulletins were found directly corroborating this statement."
            ),
            "sources_count": 0,
            "corroboration_score": 0.25 if is_extraordinary else 0.50,
            "override_prediction": override
        }

    # Evaluate each retrieved source
    contradict_count = 0
    support_count = 0
    factcheck_debunk_found = False
    reputable_publishers = set()

    for ev in all_evidence:
        ev_type = evaluate_evidence_item(ev, text)
        ev["evidence_type"] = ev_type
        
        pub = ev.get("publisher", "Web Source")
        tier = ev.get("source_tier", "Standard")

        if tier in ("High", "Official"):
            reputable_publishers.add(pub)

        if ev_type == "Contradicting":
            contradict_count += 1
            if tier == "FactCheck":
                factcheck_debunk_found = True
        elif ev_type == "Supporting":
            support_count += 1

    # Real-Time Decision Logic
    override_prediction = None
    corroboration_score = 0.50

    # CASE A: Explicit Fact-Check Debunk Found OR Contradicting outweighs Supporting
    if factcheck_debunk_found or contradict_count >= 1 and contradict_count >= support_count:
        evidence_status = "Contradicting"
        realtime_verdict = "Debunked by Fact-Checkers / Independent Media"
        override_prediction = "Likely Fake"
        corroboration_score = 0.94
        explanation = (
            f"Live fact-checking investigations and external media reports directly contradict or debunk this claim. "
            f"Located {contradict_count} refuting document(s). Real-time veracity status: Refuted."
        )

    # CASE B: Strong Multi-Outlet News Consensus (2+ major publishers reporting event)
    elif len(reputable_publishers) >= 2 and contradict_count == 0:
        evidence_status = "Supporting"
        realtime_verdict = f"Confirmed by Multi-Outlet News Coverage ({len(reputable_publishers)} major publishers)"
        override_prediction = "Likely Real"
        corroboration_score = 0.93
        pubs_str = ", ".join(list(reputable_publishers)[:4])
        explanation = (
            f"Real-time news coverage confirms this event. Multiple leading publications (including {pubs_str}) "
            f"are actively reporting this news without contradiction. Real-time veracity status: Corroborated."
        )

    # CASE C: General Supporting Context
    elif support_count > contradict_count:
        evidence_status = "Supporting"
        realtime_verdict = "Corroborated by News Coverage"
        override_prediction = "Likely Real"
        corroboration_score = 0.86
        explanation = (
            f"External reporting aligns with this statement. Located {support_count} corroborating news passage(s). "
            f"Real-time veracity status: Corroborated."
        )

    # CASE D: Mixed Evidence
    elif support_count > 0 and contradict_count > 0:
        evidence_status = "Mixed"
        realtime_verdict = "Conflicting Media Reports"
        override_prediction = None
        corroboration_score = 0.55
        explanation = (
            f"External coverage presents conflicting or disputed accounts ({support_count} supporting vs "
            f"{contradict_count} contradicting). Independent primary source verification recommended."
        )

    # CASE E: Default Insufficient
    else:
        evidence_status = "Insufficient Evidence"
        realtime_verdict = "Insufficient Direct Evidence"
        override_prediction = None
        corroboration_score = 0.50
        explanation = (
            f"Retrieved {len(all_evidence)} source document(s) provide general background, but do not firmly validate "
            f"or refute the specific factual statement."
        )

    return {
        "evidence_status": evidence_status,
        "realtime_verdict": realtime_verdict,
        "extracted_claims": claims,
        "evidence_cards": all_evidence,
        "explanation": explanation,
        "sources_count": len(all_evidence),
        "reputable_publishers_count": len(reputable_publishers),
        "corroboration_score": corroboration_score,
        "override_prediction": override_prediction
    }
