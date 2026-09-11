"""
NewsShield_AI - NLP Preprocessing Pipeline
Provides unified text cleaning and normalization for both training and real-time inference.
Complies with PRD Section 15 requirements.
"""

import re
import html
import unicodedata
from typing import List, Union

# Common English stop words curated to preserve critical negation and contrast words
# Words like "not", "no", "never", "against", "without", "hardly", "barely" are preserved
# as they significantly alter claim veracity and sentiment semantics.
CRITICAL_NEGATIONS = {
    "not", "no", "never", "neither", "nor", "none", "nobody", "nowhere", 
    "nothing", "hardly", "scarcely", "barely", "without", "against", "cannot", "cant"
}

BASE_STOP_WORDS = {
    "a", "about", "above", "after", "again", "all", "am", "an", "and", "any", "are", 
    "aren't", "as", "at", "be", "because", "been", "before", "being", "below", "between", 
    "both", "but", "by", "can", "could", "did", "didn't", "do", "does", "doesn't", 
    "doing", "don't", "down", "during", "each", "few", "for", "from", "further", "had", 
    "hadn't", "has", "hasn't", "have", "haven't", "having", "he", "he'd", "he'll", 
    "he's", "her", "here", "here's", "hers", "herself", "him", "himself", "his", 
    "how", "how's", "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", 
    "isn't", "it", "it's", "its", "itself", "let's", "me", "more", "most", "mustn't", 
    "my", "myself", "of", "off", "on", "once", "only", "or", "other", "ought", "our", 
    "ours", "ourselves", "out", "over", "own", "same", "shan't", "she", "she'd", 
    "she'll", "she's", "should", "shouldn't", "so", "some", "such", "than", "that", 
    "that's", "the", "their", "theirs", "them", "themselves", "then", "there", "there's", 
    "these", "they", "they'd", "they'll", "they're", "they've", "this", "those", 
    "through", "to", "too", "under", "until", "up", "very", "was", "wasn't", "we", 
    "we'd", "we'll", "we're", "we've", "were", "weren't", "what", "what's", "when", 
    "when's", "where", "where's", "which", "while", "who", "who's", "whom", "why", 
    "why's", "with", "won't", "would", "wouldn't", "you", "you'd", "you'll", "you're", 
    "you've", "your", "yours", "yourself", "yourselves"
}

# Final effective stop words excluding negations
EFFECTIVE_STOP_WORDS = BASE_STOP_WORDS - CRITICAL_NEGATIONS

# Regex patterns for fast cleaning
URL_PATTERN = re.compile(r'https?://\S+|www\.\S+')
HTML_PATTERN = re.compile(r'<.*?>')
SPECIAL_CHARS_PATTERN = re.compile(r'[^a-zA-Z0-9\s.,!?-]')
MULTI_SPACE_PATTERN = re.compile(r'\s+')


def clean_text(text: Union[str, None], remove_stopwords: bool = True) -> str:
    """
    Standard text normalization pipeline for NewsShield_AI.
    
    Steps:
    1. Handle empty / None / non-string input
    2. HTML unescape and tag removal
    3. URL removal
    4. Unicode NFKD normalization
    5. Lowercasing
    6. Special character filtering (retaining basic punctuation for phrase boundaries)
    7. Optional negation-aware stop-word removal
    8. Whitespace consolidation
    """
    if not text or not isinstance(text, str):
        return ""

    # 1. Unescape HTML entities and strip HTML tags
    cleaned = html.unescape(text)
    cleaned = HTML_PATTERN.sub(' ', cleaned)

    # 2. Remove URLs
    cleaned = URL_PATTERN.sub(' ', cleaned)

    # 3. Unicode normalization (converts smart quotes, accented chars to plain equivalents)
    cleaned = unicodedata.normalize('NFKD', cleaned)

    # 4. Lowercasing
    cleaned = cleaned.lower()

    # 5. Filter exotic symbols while keeping basic alphanumerics and essential punctuation
    cleaned = SPECIAL_CHARS_PATTERN.sub(' ', cleaned)

    # 6. Stop-word filtering if enabled
    if remove_stopwords:
        tokens = cleaned.split()
        filtered_tokens = [
            token.strip('.,!?-') for token in tokens 
            if (token.strip('.,!?-') not in EFFECTIVE_STOP_WORDS and len(token.strip('.,!?-')) > 1) 
            or token.strip('.,!?-') in CRITICAL_NEGATIONS
        ]
        cleaned = " ".join([t for t in filtered_tokens if t])
    else:
        # Standardize punctuation spacing
        cleaned = MULTI_SPACE_PATTERN.sub(' ', cleaned)

    return cleaned.strip()


def preprocess_batch(texts: List[str], remove_stopwords: bool = True) -> List[str]:
    """
    Applies the cleaning pipeline to a list of texts.
    """
    return [clean_text(t, remove_stopwords=remove_stopwords) for t in texts]


def extract_linguistic_signals(raw_text: str) -> dict:
    """
    Computes heuristic credibility signals from raw text for explainability:
    - Uppercase ratio (shouting/sensationalism indicator)
    - Exclamation mark count
    - Question mark count
    - Clickbait headline trigger words
    - Subjectivity markers
    """
    if not raw_text:
        return {
            "sensationalism_score": 0.0,
            "uppercase_ratio": 0.0,
            "exclamation_count": 0,
            "clickbait_triggers": []
        }

    total_len = len(raw_text)
    letters = [c for c in raw_text if c.isalpha()]
    upper_count = sum(1 for c in letters if c.isupper())
    uppercase_ratio = round((upper_count / len(letters)), 3) if letters else 0.0

    exclamation_count = raw_text.count('!')
    question_count = raw_text.count('?')

    clickbait_words = [
        "shocking", "you won't believe", "unbelievable", "secret revealed", "miracle cure",
        "they don't want you to know", "proof that", "mind blowing", "bombshell", "conspiracy",
        "exposed", "urgent alert", "banned by government", "instant cure", "hidden truth"
    ]
    lower = raw_text.lower()
    found_triggers = [word for word in clickbait_words if word in lower]

    # Simple heuristic sensationalism index [0 to 1]
    sensationalism_score = min(
        1.0, 
        round((uppercase_ratio * 0.4) + (min(exclamation_count, 5) * 0.08) + (len(found_triggers) * 0.2), 2)
    )

    return {
        "sensationalism_score": sensationalism_score,
        "uppercase_ratio": uppercase_ratio,
        "exclamation_count": exclamation_count,
        "question_count": question_count,
        "clickbait_triggers": found_triggers
    }
