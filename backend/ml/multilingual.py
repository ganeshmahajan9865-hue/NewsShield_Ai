"""
NewsShield_AI - Multilingual Support Module
Handles language identification and cross-lingual routing for English, Hindi, and Marathi.
Complies with PRD Section 23.
"""

import re
from typing import Dict, Any, Tuple

# Unicode range checks for Devanagari script (used by Hindi and Marathi)
DEVANAGARI_REGEX = re.compile(r'[\u0900-\u097F]')

# Common Marathi-specific lexical markers
MARATHI_MARKERS = {"आहे", "नाही", "झाले", "झाली", "केले", "यांनी", "म्हणाले", "त्यांच्या", "येथे", "सरकारने"}

# Common Hindi-specific lexical markers
HINDI_MARKERS = {"है", "नहीं", "किया", "गया", "कहा", "सरकार", "भारत", "लोगों", "होगा", "हुआ"}


def detect_language(text: str) -> str:
    """
    Detects language: 'mr' (Marathi), 'hi' (Hindi), or 'en' (English).
    """
    if not text:
        return "en"

    devanagari_chars = len(DEVANAGARI_REGEX.findall(text))
    total_chars = len(text.strip())

    if devanagari_chars / max(total_chars, 1) > 0.15:
        # Check Devanagari words for Marathi vs Hindi
        words = set(text.split())
        marathi_hits = len(words.intersection(MARATHI_MARKERS))
        hindi_hits = len(words.intersection(HINDI_MARKERS))
        
        if marathi_hits > hindi_hits:
            return "mr"
        return "hi"

    return "en"


def get_multilingual_metadata(text: str) -> Dict[str, Any]:
    """Returns detected language code and descriptive label."""
    code = detect_language(text)
    names = {
        "en": "English",
        "hi": "Hindi (हिंदी)",
        "mr": "Marathi (मराठी)"
    }
    return {
        "language_code": code,
        "language_name": names.get(code, "English"),
        "is_indic": code in ("hi", "mr")
    }
