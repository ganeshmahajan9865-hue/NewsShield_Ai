"""
NewsShield_AI - Storage & Database Layer with Live Supabase Integration
Connects directly to Supabase PostgreSQL cloud database, with local SQLite fallback.
Complies with PRD Section 21 & Section 25.
"""

import os
import uuid
import sqlite3
from datetime import datetime
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

_supabase_client = None

try:
    if SUPABASE_URL and SUPABASE_KEY:
        from supabase import create_client, Client
        _supabase_client: Optional[Client] = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("[Database] Supabase client successfully initialized for:", SUPABASE_URL)
except Exception as e:
    print(f"[Database] Warning: Supabase client init warning: {e}. Falling back to SQLite.")
    _supabase_client = None

DB_PATH = os.path.join(os.path.dirname(__file__), "newsshield.db")


def is_valid_uuid(val: Any) -> bool:
    """Checks if a string is a valid UUID."""
    if not val or not isinstance(val, str):
        return False
    try:
        uuid.UUID(val)
        return True
    except (ValueError, AttributeError):
        return False


def get_sqlite_connection():
    """Initializes local SQLite database for fallback and local caching."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    with conn:
        conn.executescript("""
        CREATE TABLE IF NOT EXISTS analyses (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            input_type TEXT,
            news_text TEXT,
            url TEXT,
            prediction TEXT,
            confidence REAL,
            model_name TEXT,
            model_version TEXT,
            evidence_status TEXT,
            created_at TEXT
        );

        CREATE TABLE IF NOT EXISTS evidence (
            id TEXT PRIMARY KEY,
            analysis_id TEXT,
            source_name TEXT,
            source_url TEXT,
            title TEXT,
            snippet TEXT,
            evidence_type TEXT,
            retrieved_at TEXT,
            FOREIGN KEY(analysis_id) REFERENCES analyses(id)
        );

        CREATE TABLE IF NOT EXISTS feedback (
            id TEXT PRIMARY KEY,
            analysis_id TEXT,
            user_id TEXT,
            rating INTEGER,
            comment TEXT,
            created_at TEXT,
            FOREIGN KEY(analysis_id) REFERENCES analyses(id)
        );
        """)
    return conn


def save_analysis(
    news_text: str,
    prediction: str,
    confidence: float,
    model_name: str,
    model_version: str,
    input_type: str = "text",
    url: Optional[str] = None,
    evidence_status: Optional[str] = None,
    evidence_cards: Optional[List[Dict[str, Any]]] = None,
    user_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Saves an analysis record and attached evidence to Supabase,
    also mirroring to local SQLite.
    """
    analysis_id = str(uuid.uuid4())
    now_iso = datetime.utcnow().isoformat() + "Z"
    saved_to_supabase = False

    # 1. Try Supabase cloud database
    if _supabase_client:
        try:
            analysis_payload = {
                "id": analysis_id,
                "input_type": input_type,
                "news_text": news_text,
                "url": url or "",
                "prediction": prediction,
                "confidence": float(confidence),
                "model_name": model_name,
                "model_version": model_version,
                "evidence_status": evidence_status or ""
            }
            if user_id and is_valid_uuid(user_id):
                analysis_payload["user_id"] = user_id

            res = _supabase_client.table("analyses").insert(analysis_payload).execute()
            if res.data and len(res.data) > 0:
                analysis_id = res.data[0].get("id", analysis_id)
                saved_to_supabase = True

            # Insert evidence items to Supabase
            if evidence_cards and saved_to_supabase:
                evidence_payloads = []
                for ev in evidence_cards:
                    evidence_payloads.append({
                        "analysis_id": analysis_id,
                        "source_name": ev.get("publisher") or ev.get("source_name") or "Web Source",
                        "source_url": ev.get("source_url") or "",
                        "title": ev.get("title") or "Source",
                        "snippet": (ev.get("snippet") or "")[:500],
                        "evidence_type": ev.get("evidence_type") or "Neutral / Contextual"
                    })
                if evidence_payloads:
                    _supabase_client.table("evidence").insert(evidence_payloads).execute()

        except Exception as err:
            print(f"[Database] Supabase insert note: {err}. Persisting in local storage.")

    # 2. Mirror into local SQLite for fast caching & offline availability
    conn = get_sqlite_connection()
    with conn:
        conn.execute(
            """
            INSERT OR REPLACE INTO analyses (
                id, user_id, input_type, news_text, url, prediction, 
                confidence, model_name, model_version, evidence_status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                analysis_id, user_id or "guest_user", input_type, news_text, url or "",
                prediction, float(confidence), model_name, model_version, 
                evidence_status or "", now_iso
            )
        )

        if evidence_cards:
            for ev in evidence_cards:
                ev_id = str(uuid.uuid4())
                conn.execute(
                    """
                    INSERT OR REPLACE INTO evidence (
                        id, analysis_id, source_name, source_url, title, snippet, evidence_type, retrieved_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        ev_id, analysis_id, 
                        ev.get("publisher") or ev.get("source_name") or "Web Source",
                        ev.get("source_url") or "",
                        ev.get("title") or "", 
                        ev.get("snippet") or "", 
                        ev.get("evidence_type") or "",
                        ev.get("retrieved_at", now_iso)
                    )
                )

    return {
        "id": analysis_id, 
        "created_at": now_iso, 
        "database": "supabase" if saved_to_supabase else "local_sqlite"
    }


def get_history(user_id: Optional[str] = None, limit: int = 50) -> List[Dict[str, Any]]:
    """Retrieves previous analysis records with evidence count from Supabase (or local SQLite)."""
    if _supabase_client:
        try:
            query = _supabase_client.table("analyses").select("*").order("created_at", desc=True).limit(limit)
            if user_id:
                query = query.eq("user_id", user_id)
            res = query.execute()
            if res.data and len(res.data) > 0:
                results = []
                for item in res.data:
                    # Query attached evidence count
                    ev_count = 0
                    try:
                        ev_res = _supabase_client.table("evidence").select("id", count="exact").eq("analysis_id", item["id"]).execute()
                        ev_count = ev_res.count if ev_res.count is not None else len(ev_res.data or [])
                    except Exception:
                        pass
                    item["evidence_count"] = ev_count
                    results.append(item)
                return results
        except Exception as err:
            print(f"[Database] Supabase query note: {err}. Reading from local SQLite.")

    # Fallback to local SQLite
    conn = get_sqlite_connection()
    cur = conn.cursor()
    query = """
    SELECT a.*, COUNT(e.id) as evidence_count
    FROM analyses a
    LEFT JOIN evidence e ON a.id = e.analysis_id
    GROUP BY a.id
    ORDER BY a.created_at DESC
    LIMIT ?
    """
    rows = cur.execute(query, (limit,)).fetchall()
    return [dict(r) for r in rows]


def get_analysis_by_id(analysis_id: str) -> Optional[Dict[str, Any]]:
    """Fetches full analysis and attached evidence items from Supabase or SQLite."""
    if _supabase_client:
        try:
            res = _supabase_client.table("analyses").select("*").eq("id", analysis_id).execute()
            if res.data and len(res.data) > 0:
                record = res.data[0]
                ev_res = _supabase_client.table("evidence").select("*").eq("analysis_id", analysis_id).execute()
                record["evidence_items"] = ev_res.data or []
                return record
        except Exception as err:
            print(f"[Database] Supabase get_by_id note: {err}.")

    # Local SQLite fallback
    conn = get_sqlite_connection()
    cur = conn.cursor()
    a_row = cur.execute("SELECT * FROM analyses WHERE id = ?", (analysis_id,)).fetchone()
    if not a_row:
        return None

    analysis_dict = dict(a_row)
    ev_rows = cur.execute("SELECT * FROM evidence WHERE analysis_id = ?", (analysis_id,)).fetchall()
    analysis_dict["evidence_items"] = [dict(ev) for ev in ev_rows]
    return analysis_dict


def save_user_feedback(analysis_id: str, rating: int, comment: str = "", user_id: Optional[str] = None) -> Dict[str, Any]:
    """Stores user feedback on an analysis in Supabase."""
    feedback_id = str(uuid.uuid4())
    now_iso = datetime.utcnow().isoformat() + "Z"
    saved_supabase = False

    if _supabase_client:
        try:
            payload = {
                "id": feedback_id,
                "analysis_id": analysis_id,
                "rating": rating,
                "comment": comment
            }
            if user_id and is_valid_uuid(user_id):
                payload["user_id"] = user_id
            _supabase_client.table("feedback").insert(payload).execute()
            saved_supabase = True
        except Exception as err:
            print(f"[Database] Supabase feedback insert note: {err}.")

    # Also record in SQLite
    conn = get_sqlite_connection()
    with conn:
        conn.execute(
            """
            INSERT OR REPLACE INTO feedback (id, analysis_id, user_id, rating, comment, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (feedback_id, analysis_id, user_id or "guest_user", rating, comment, now_iso)
        )
    return {"id": feedback_id, "created_at": now_iso, "database": "supabase" if saved_supabase else "sqlite"}


def get_analytics_metrics() -> Dict[str, Any]:
    """Computes aggregate analytics for dashboard from Supabase (or local SQLite)."""
    if _supabase_client:
        try:
            all_res = _supabase_client.table("analyses").select("prediction, confidence, evidence_status").execute()
            if all_res.data is not None:
                data = all_res.data
                total = len(data)
                real_count = sum(1 for d in data if d.get("prediction") == "Likely Real")
                fake_count = sum(1 for d in data if d.get("prediction") == "Likely Fake")
                deep_count = sum(1 for d in data if d.get("evidence_status") and d.get("evidence_status") not in ("", "None"))
                avg_conf = (sum(float(d.get("confidence", 0.5)) for d in data) / total) if total > 0 else 0.0
                recent = get_history(limit=5)
                return {
                    "total": total,
                    "total_analyses": total,
                    "real_count": real_count,
                    "likely_real_count": real_count,
                    "fake_count": fake_count,
                    "likely_fake_count": fake_count,
                    "deep_count": deep_count,
                    "deep_verification": deep_count,
                    "average_confidence": round(avg_conf, 2),
                    "recent_analyses": recent,
                    "database": "supabase"
                }
        except Exception as err:
            print(f"[Database] Supabase analytics note: {err}.")

    # Fallback to local SQLite
    conn = get_sqlite_connection()
    cur = conn.cursor()
    total_analyses = cur.execute("SELECT COUNT(*) FROM analyses").fetchone()[0]
    likely_real_count = cur.execute("SELECT COUNT(*) FROM analyses WHERE prediction = 'Likely Real'").fetchone()[0]
    likely_fake_count = cur.execute("SELECT COUNT(*) FROM analyses WHERE prediction = 'Likely Fake'").fetchone()[0]
    deep_count = cur.execute("SELECT COUNT(*) FROM analyses WHERE evidence_status IS NOT NULL AND evidence_status != '' AND evidence_status != 'None'").fetchone()[0]
    avg_conf = cur.execute("SELECT AVG(confidence) FROM analyses").fetchone()[0] or 0.0
    recent = get_history(limit=5)

    return {
        "total": total_analyses,
        "total_analyses": total_analyses,
        "real_count": likely_real_count,
        "likely_real_count": likely_real_count,
        "fake_count": likely_fake_count,
        "likely_fake_count": likely_fake_count,
        "deep_count": deep_count,
        "deep_verification": deep_count,
        "average_confidence": round(float(avg_conf), 2),
        "recent_analyses": recent,
        "database": "sqlite"
    }
