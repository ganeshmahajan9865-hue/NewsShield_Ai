"""
NewsShield_AI - Real-Time Multi-Source Evidence Retrieval
Combines Live Google News RSS Search and DuckDuckGo for zero-rate-limit,
real-time news verification and fact-checking.
Complies with PRD Section 18, 19, 31, 34.
"""

import re
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime
from typing import List, Dict, Any, Optional

try:
    from duckduckgo_search import DDGS
    HAS_DDGS = True
except ImportError:
    HAS_DDGS = False

# Comprehensive source credibility dictionary with tier ratings
REPUTABLE_DOMAINS = {
    # Fact-Checkers (Tier: FactCheck)
    "snopes.com": {"tier": "FactCheck", "publisher": "Snopes"},
    "politifact.com": {"tier": "FactCheck", "publisher": "PolitiFact"},
    "factcheck.org": {"tier": "FactCheck", "publisher": "FactCheck.org"},
    "altnews.in": {"tier": "FactCheck", "publisher": "Alt News"},
    "boomlive.in": {"tier": "FactCheck", "publisher": "Boom Live"},
    "afp.com": {"tier": "FactCheck", "publisher": "AFP Fact Check"},
    "factly.in": {"tier": "FactCheck", "publisher": "Factly"},
    "vishvasnews.com": {"tier": "FactCheck", "publisher": "Vishvas News"},
    "thequint.com": {"tier": "FactCheck", "publisher": "Quint WebQoof"},
    "fullfact.org": {"tier": "FactCheck", "publisher": "Full Fact"},
    "checkyourfact.com": {"tier": "FactCheck", "publisher": "Check Your Fact"},

    # Global Tier 1 News (Tier: High)
    "reuters.com": {"tier": "High", "publisher": "Reuters"},
    "apnews.com": {"tier": "High", "publisher": "Associated Press"},
    "bbc.com": {"tier": "High", "publisher": "BBC News"},
    "bbc.co.uk": {"tier": "High", "publisher": "BBC News"},
    "theguardian.com": {"tier": "High", "publisher": "The Guardian"},
    "nytimes.com": {"tier": "High", "publisher": "The New York Times"},
    "washingtonpost.com": {"tier": "High", "publisher": "The Washington Post"},
    "bloomberg.com": {"tier": "High", "publisher": "Bloomberg"},
    "wsj.com": {"tier": "High", "publisher": "The Wall Street Journal"},
    "ft.com": {"tier": "High", "publisher": "Financial Times"},
    "aljazeera.com": {"tier": "High", "publisher": "Al Jazeera"},
    "dw.com": {"tier": "High", "publisher": "Deutsche Welle"},
    "npr.org": {"tier": "High", "publisher": "NPR"},
    "pbs.org": {"tier": "High", "publisher": "PBS NewsHour"},
    "nature.com": {"tier": "High", "publisher": "Nature"},
    "science.org": {"tier": "High", "publisher": "Science Magazine"},
    "space.com": {"tier": "High", "publisher": "Space.com"},

    # Indian Tier 1 News (Tier: High)
    "thehindu.com": {"tier": "High", "publisher": "The Hindu"},
    "indianexpress.com": {"tier": "High", "publisher": "The Indian Express"},
    "hindustantimes.com": {"tier": "High", "publisher": "Hindustan Times"},
    "timesofindia.indiatimes.com": {"tier": "High", "publisher": "The Times of India"},
    "ndtv.com": {"tier": "High", "publisher": "NDTV"},
    "indiatoday.in": {"tier": "High", "publisher": "India Today"},
    "livemint.com": {"tier": "High", "publisher": "Livemint"},
    "business-standard.com": {"tier": "High", "publisher": "Business Standard"},
    "economictimes.indiatimes.com": {"tier": "High", "publisher": "The Economic Times"},
    "aninews.in": {"tier": "High", "publisher": "Asian News International (ANI)"},
    "ptinews.com": {"tier": "High", "publisher": "Press Trust of India (PTI)"},

    # Official Government & Health Agencies (Tier: Official)
    "who.int": {"tier": "Official", "publisher": "World Health Organization"},
    "nasa.gov": {"tier": "Official", "publisher": "NASA"},
    "isro.gov.in": {"tier": "Official", "publisher": "ISRO"},
    "cdc.gov": {"tier": "Official", "publisher": "CDC"},
    "nih.gov": {"tier": "Official", "publisher": "NIH"},
    "pib.gov.in": {"tier": "Official", "publisher": "Press Information Bureau (PIB)"},
    "un.org": {"tier": "Official", "publisher": "United Nations"}
}


def extract_domain(url: str) -> str:
    """Extracts clean base domain from a URL."""
    try:
        parsed = urllib.parse.urlparse(url)
        netloc = parsed.netloc.lower()
        if netloc.startswith("www."):
            netloc = netloc[4:]
        return netloc
    except Exception:
        return ""


def clean_html(text: str) -> str:
    """Strips HTML formatting."""
    if not text:
        return ""
    clean = re.sub(r'<.*?>', '', text)
    return clean.replace('&nbsp;', ' ').replace('&amp;', '&').strip()


def query_google_news_rss(query: str, max_results: int = 5) -> List[Dict[str, Any]]:
    """
    Fetches real-time, live news articles from Google News RSS feed.
    """
    results = []
    try:
        encoded = urllib.parse.quote(query.strip())
        rss_url = f"https://news.google.com/rss/search?q={encoded}&hl=en&gl=US&ceid=US:en"
        
        req = urllib.request.Request(
            rss_url,
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        )
        with urllib.request.urlopen(req, timeout=5) as response:
            xml_data = response.read()

        root = ET.fromstring(xml_data)
        items = root.findall(".//item")

        for item in items[:max_results]:
            title_elem = item.find("title")
            link_elem = item.find("link")
            pubdate_elem = item.find("pubDate")
            source_elem = item.find("source")

            raw_title = title_elem.text if title_elem is not None else "News Article"
            link = link_elem.text if link_elem is not None else ""
            pub_date = pubdate_elem.text if pubdate_elem is not None else ""
            source_name = source_elem.text if source_elem is not None else ""

            # Extract publisher from title ("Headline - Publisher")
            title = raw_title
            if " - " in raw_title:
                parts = raw_title.rsplit(" - ", 1)
                title = parts[0]
                if not source_name:
                    source_name = parts[1]

            domain = extract_domain(link)
            publisher = source_name or domain or "Web Source"
            tier = "Standard"

            # Check domain reputation
            if domain in REPUTABLE_DOMAINS:
                tier = REPUTABLE_DOMAINS[domain]["tier"]
                publisher = REPUTABLE_DOMAINS[domain]["publisher"]
            else:
                source_lower = publisher.lower()
                for dom, meta in REPUTABLE_DOMAINS.items():
                    if meta["publisher"].lower() in source_lower or dom in source_lower:
                        tier = meta["tier"]
                        publisher = meta["publisher"]
                        break

            if domain.endswith(".gov") or domain.endswith(".gov.in") or domain.endswith(".nic.in"):
                tier = "Official"

            # Check if source name contains Fact Check
            if "fact check" in publisher.lower() or "factly" in publisher.lower():
                tier = "FactCheck"

            results.append({
                "title": clean_html(title),
                "publisher": publisher,
                "domain": domain,
                "source_url": link,
                "snippet": clean_html(title),
                "publication_date": pub_date,
                "source_tier": tier,
                "retrieved_at": datetime.utcnow().isoformat() + "Z"
            })
    except Exception as e:
        print(f"[Retriever] Google News RSS query note: {e}")

    return results


def query_duckduckgo(query: str, max_results: int = 4) -> List[Dict[str, Any]]:
    """Secondary search engine using DuckDuckGo."""
    results = []
    if not HAS_DDGS:
        return results

    try:
        with DDGS() as ddgs:
            raw_items = list(ddgs.text(query, max_results=max_results))
            for r in raw_items:
                url = r.get("href", "")
                if not url:
                    continue
                domain = extract_domain(url)
                publisher = domain or "Web Source"
                tier = "Standard"
                if domain in REPUTABLE_DOMAINS:
                    tier = REPUTABLE_DOMAINS[domain]["tier"]
                    publisher = REPUTABLE_DOMAINS[domain]["publisher"]
                
                results.append({
                    "title": clean_html(r.get("title", "Web Source")),
                    "publisher": publisher,
                    "domain": domain,
                    "source_url": url,
                    "snippet": clean_html(r.get("body", "")),
                    "publication_date": "",
                    "source_tier": tier,
                    "retrieved_at": datetime.utcnow().isoformat() + "Z"
                })
    except Exception as e:
        print(f"[Retriever] DuckDuckGo query note: {e}")

    return results


def retrieve_realtime_evidence(query: str, max_results: int = 6) -> List[Dict[str, Any]]:
    """
    Multi-source evidence retrieval:
    1. Queries Google News RSS for live breaking news coverage & fact checks
    2. Queries DuckDuckGo for web context
    3. Deduplicates results by title and URL
    4. Prioritizes FactCheck and High-tier sources
    """
    all_items = []
    seen_titles = set()

    # Step 1: Real-time News RSS search
    news_items = query_google_news_rss(query, max_results=max_results)
    for it in news_items:
        normalized_title = it["title"].lower()[:40]
        if normalized_title not in seen_titles:
            seen_titles.add(normalized_title)
            all_items.append(it)

    # Step 2: Also run a fact-check search on RSS
    if len(all_items) < max_results:
        fc_items = query_google_news_rss(f"{query} fact check", max_results=3)
        for it in fc_items:
            normalized_title = it["title"].lower()[:40]
            if normalized_title not in seen_titles:
                seen_titles.add(normalized_title)
                all_items.append(it)

    # Step 3: Backfill with DuckDuckGo if needed
    if len(all_items) < 3:
        ddg_items = query_duckduckgo(query, max_results=3)
        for it in ddg_items:
            normalized_title = it["title"].lower()[:40]
            if normalized_title not in seen_titles:
                seen_titles.add(normalized_title)
                all_items.append(it)

    # Sort so FactCheck and High/Official tiers appear first
    tier_priority = {"FactCheck": 3, "Official": 2, "High": 1, "Standard": 0}
    all_items.sort(key=lambda x: tier_priority.get(x.get("source_tier", "Standard"), 0), reverse=True)

    return all_items[:max_results]
