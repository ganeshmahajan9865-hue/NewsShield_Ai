"""
NewsShield_AI - URL Article Extraction & Analysis Endpoint
Complies with PRD Section 22 & 32 (POST /analyze-url)
Implements SSRF protection, article scraping, and graceful fallback.
"""

import socket
import ipaddress
import urllib.parse
import requests
from bs4 import BeautifulSoup
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from backend.api.verification import analyze_news_full, AnalyzeRequest

router = APIRouter(tags=["URL Analysis"])


class AnalyzeUrlRequest(BaseModel):
    url: str = Field(..., description="Full HTTP/HTTPS URL of the news article to analyze.")
    mode: str = Field(default="deep", description="'quick' or 'deep'")


def is_safe_public_url(url_str: str) -> bool:
    """
    SSRF Protection:
    Ensures URL uses http/https and does not resolve to private/loopback/link-local IP addresses.
    """
    try:
        parsed = urllib.parse.urlparse(url_str)
        if parsed.scheme not in ("http", "https"):
            return False
        
        hostname = parsed.hostname
        if not hostname or hostname in ("localhost", "127.0.0.1", "::1"):
            return False

        # Resolve hostname to IP
        ip_addr = socket.gethostbyname(hostname)
        ip = ipaddress.ip_address(ip_addr)
        if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved:
            return False

        return True
    except Exception:
        return False


def extract_article_content(url: str) -> dict:
    """
    Fetches and extracts article title, metadata, and clean body text.
    """
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
        ),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
    }

    try:
        response = requests.get(url, headers=headers, timeout=8, allow_redirects=True)
        response.raise_for_status()
    except Exception as req_err:
        raise ValueError(f"Unable to access URL: {str(req_err)}")

    soup = BeautifulSoup(response.text, "html.parser")

    # Remove script, style, navigation, footer tags
    for tag in soup(["script", "style", "nav", "footer", "header", "aside", "form"]):
        tag.decompose()

    # Extract title
    title = ""
    if soup.title and soup.title.string:
        title = soup.title.string.strip()
    elif soup.find("h1"):
        title = soup.find("h1").get_text().strip()

    # Extract paragraphs
    paragraphs = [p.get_text().strip() for p in soup.find_all("p") if len(p.get_text().strip()) > 30]
    body_text = " ".join(paragraphs)

    if len(body_text) < 50:
        raise ValueError(
            "Extracted article text was too short or protected by a paywall/JavaScript. "
            "Please copy and paste the article text directly."
        )

    return {
        "title": title,
        "text": body_text[:15000],  # Limit to 15k chars for safety
        "source_url": url
    }


@router.post("/analyze-url")
def analyze_article_url(payload: AnalyzeUrlRequest):
    """
    Validates URL, extracts news article content, and passes it through NewsShield_AI analysis.
    """
    if not is_safe_public_url(payload.url):
        raise HTTPException(
            status_code=400,
            detail="Invalid or prohibited URL. Only public HTTP/HTTPS news websites can be accessed."
        )

    try:
        extracted = extract_article_content(payload.url)
    except ValueError as ve:
        raise HTTPException(status_code=422, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch content from URL: {str(e)}. Please paste the article text directly."
        )

    # Combine title and text for analysis
    full_text = f"{extracted['title']}. {extracted['text']}" if extracted['title'] else extracted['text']
    
    # Run full analysis
    analysis_res = analyze_news_full(AnalyzeRequest(text=full_text, mode=payload.mode))
    analysis_res["article_title"] = extracted["title"]
    analysis_res["source_url"] = payload.url

    return analysis_res
