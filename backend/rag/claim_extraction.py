"""
NewsShield_AI - Enhanced Real-Time Claim & Query Extraction
Isolates core factual propositions and formulates targeted search queries for:
1. Live Breaking News
2. Fact-Checking Databases
3. Official Institutional Releases
Complies with PRD Section 18, 31, 34.
"""

import re
from typing import List, Dict, Any

# Common function words to strip when building search queries so subject + predicate are retained
EXTENDED_STOP_WORDS = {
    "a", "about", "above", "after", "again", "all", "am", "an", "and", "any", "are", 
    "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", 
    "but", "by", "can", "could", "did", "do", "does", "doing", "down", "during", "each", 
    "few", "for", "from", "further", "had", "has", "have", "having", "he", "her", "here", 
    "hers", "herself", "him", "himself", "his", "how", "i", "if", "in", "into", "is", 
    "it", "its", "itself", "just", "me", "more", "most", "my", "myself", "no", "nor", 
    "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours", 
    "ourselves", "out", "over", "own", "same", "she", "should", "so", "some", "such", 
    "than", "that", "the", "their", "theirs", "them", "themselves", "then", "there", 
    "these", "they", "this", "those", "through", "to", "too", "under", "until", "up", 
    "very", "was", "we", "were", "what", "when", "where", "which", "while", "who", 
    "whom", "why", "with", "would", "you", "your", "yours", "yourself", "yourselves",
    # Editorial noise
    "breaking", "urgent", "shocking", "viral", "alert", "watch", "video", "unbelievable", 
    "please", "share", "must", "read", "exposed", "truth", "real", "fake", "news", 
    "exclusive", "update", "hours", "days", "completely", "without", "every", "single"
}


def extract_claims(text: str, max_claims: int = 3) -> List[str]:
    """
    Extracts verifiable factual claims from the input text.
    """
    if not text:
        return []

    # Clean text and split by sentence boundaries
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    candidate_claims = []

    for s in sentences:
        s_clean = s.strip()
        words = s_clean.split()
        if len(words) < 4 or len(words) > 60:
            continue
        
        lower = s_clean.lower()
        if lower.startswith(("i think", "in my opinion", "personally", "what if", "do you think")):
            continue
            
        candidate_claims.append(s_clean)
        if len(candidate_claims) >= max_claims:
            break

    if not candidate_claims:
        first_few = " ".join(text.strip().split()[:30])
        if first_few:
            candidate_claims.append(first_few)

    return candidate_claims


def build_search_queries(claim_text: str) -> Dict[str, str]:
    """
    Extracts substantive anchor terms (nouns, verbs, entities) spanning
    both the subject and predicate to ensure highly accurate search results.
    """
    # Clean text
    clean = re.sub(r'https?://\S+', '', claim_text)
    clean = re.sub(r'[^a-zA-Z0-9\s]', ' ', clean)
    words = clean.split()

    # Extract substantive terms preserving original order
    substantive = [w for w in words if w.lower() not in EXTENDED_STOP_WORDS and len(w) > 2]
    
    # Pick the most informative terms (up to 7 terms)
    if len(substantive) >= 4:
        # Take first 3 (subject) and last 3 (predicate/outcome) if long
        if len(substantive) > 6:
            chosen_terms = substantive[:3] + substantive[-3:]
        else:
            chosen_terms = substantive
    else:
        chosen_terms = words[:6]

    base_query = " ".join(chosen_terms)

    # 1. Direct news query
    news_query = base_query

    # 2. Targeted Fact-Check query
    factcheck_query = f"{base_query} fact check"

    return {
        "news_query": news_query,
        "factcheck_query": factcheck_query,
        "base_query": base_query
    }
