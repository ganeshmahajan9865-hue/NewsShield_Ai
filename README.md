# NewsShield_AI
### AI-Powered News Credibility & Evidence Analysis Platform

> **Tagline:** Analyze. Verify. Stay Informed.  
> **PRD Version:** 1.0 | Academic & Production Architecture

NewsShield_AI is a full-stack platform designed to analyze the credibility of news claims, headlines, and articles. It combines **NLP preprocessing**, **TF-IDF feature extraction**, and **supervised machine learning models** (Logistic Regression, Linear SVM with probability calibration, and Naive Bayes) with **Deep Verification** powered by claim extraction, multi-source external evidence retrieval, and grounded RAG synthesis.

---

## The Golden Flow (PRD Section 10 & 40)

```
[User / React Frontend]
         |
         |  POST /predict or /analyze
         v
[FastAPI REST Backend]
   +--> Input validation (length, type, SSRF protection)
   +--> NLP preprocessing (normalization, punctuation & negation preservation)
   +--> TF-IDF vectorization (1-gram & 2-gram, sublinear TF)
   +--> Supervised ML Classifier (Calibrated probability score)
   +--> [Deep Verification Mode]
          +--> Factual claim extraction
          +--> Multi-source evidence retrieval (news search & authoritative index)
          +--> Source credibility filtering & deduplication
          +--> Grounded RAG synthesis (Supporting / Contradicting / Mixed / Insufficient)
         |
         v
[Structured JSON Response]
         |
         v
[React Result UI & Verification Dashboard]
         |
         v
[Supabase PostgreSQL / Local Persistent History]
```

---

## Key Features

1. **Quick News Analysis (ML)**: Fast sub-millisecond credibility classification predicting whether content resembles reliable or unreliable patterns, returning a calibrated confidence score.
2. **Deep Verification (RAG)**: Extracts factual propositions and retrieves real-world corroborating or refuting evidence from authoritative organizations (Reuters, BBC, WHO, NASA, etc.).
3. **URL Article Analysis**: Safely fetches public news articles, extracts clean headline and body text, and passes them to the verification engine with SSRF security defenses.
4. **Model Transparency & Explainability**: Highlights linguistic sensationalism signals (clickbait triggers, exclamation frequency, shouting ratio) and predictive word coefficients.
5. **Branded PDF Reports**: One-click generation of structured, tamper-evident verification reports with document ID, claim breakdowns, evidence cards, and disclaimers.
6. **Searchable History & Analytics**: Persistent history with filtering, search, and aggregate dashboard metrics.
7. **Responsible AI by Design**: Adheres to strict ethics—never claims absolute truth from a classifier, never hallucinates citations, and clearly communicates uncertainty.

---

## Machine Learning Benchmarks

Evaluated on an untouched 20% test split:

| Model Architecture | Accuracy | Precision (Weighted) | Recall (Weighted) | F1-Score (Weighted) | Status |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Logistic Regression** | **98.44%** | **0.9846** | **0.9844** | **0.9844** | **Champion Model** |
| **Linear SVM (Calibrated)** | **96.88%** | **0.9705** | **0.9688** | **0.9687** | Calibrated Sigmoid |
| **Multinomial Naive Bayes** | **98.44%** | **0.9846** | **0.9844** | **0.9844** | Probabilistic Baseline |

---

## Technology Stack

- **Frontend**: React 18, Vite, Lucide React, Glassmorphism UI, Responsive CSS
- **Backend API**: Python 3.11, FastAPI, Uvicorn, Pydantic
- **NLP & Machine Learning**: Scikit-Learn (TF-IDF, LogisticRegression, LinearSVC, CalibratedClassifierCV), Joblib
- **RAG & Evidence Retrieval**: DuckDuckGo Search, BeautifulSoup4, Custom Source Credibility Engine
- **Report Generation**: ReportLab PDF Generator
- **Persistence & Database**: Supabase PostgreSQL + Local SQLite fallback
- **Testing**: Pytest, FastAPI TestClient

---

## Quick Start Guide

### 1. Backend Setup

```bash
# Navigate to project root
cd NewsShield_Ai

# Activate virtual environment
backend\venv\Scripts\activate  # On Windows
# source backend/venv/bin/activate  # On Linux/macOS

# Run the backend server
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation will be live at: `http://localhost:8000/docs`

### 2. Frontend Setup

```bash
# In a separate terminal
cd NewsShield_Ai/frontend

# Install dependencies (already completed)
npm install

# Launch development server
npm run dev
```
Web application will open at: `http://localhost:5173`

### 3. Run Automated Tests

```bash
cd NewsShield_Ai
$env:PYTHONPATH="."
backend\venv\Scripts\pytest tests/ -v
```

---

## Responsible AI Disclaimer

NewsShield_AI provides AI-assisted credibility analysis based on learned patterns and retrieved evidence. A 'Likely Real' or 'Likely Fake' result is not a guarantee that a claim is true or false. Users should review the cited sources and use independent judgment, especially for high-impact claims.
