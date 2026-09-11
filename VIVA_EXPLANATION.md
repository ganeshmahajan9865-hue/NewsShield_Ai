# NewsShield_AI: Comprehensive Viva & Technical Defense Guide

This document is prepared specifically for project viva examinations, academic presentations, and technical interviews based on **PRD Section 40**.

---

## 1. The 60-Second Elevator Pitch

> *"NewsShield_AI is an AI-powered news credibility and evidence analysis platform. The frontend is built with React, and the backend is powered by Python FastAPI. When a user submits news text or a URL, the system performs rigorous NLP preprocessing and TF-IDF feature extraction. A supervised machine learning classifier—specifically Logistic Regression with calibrated probabilities—evaluates the linguistic and statistical distribution of the text to predict whether it is 'Likely Real' or 'Likely Fake'. To avoid the black-box trap, the platform incorporates a Deep Verification layer that extracts factual claims, queries external trusted sources (such as Reuters, BBC, WHO, and NASA), filters sources by institutional credibility, and employs grounded RAG synthesis to categorize evidence status as Supporting, Contradicting, Mixed, or Insufficient Evidence. Persistent history and audit feedback are managed via Supabase PostgreSQL, and structured PDF reports can be exported."*

---

## 2. Core Architecture: The "Golden Flow"

Be ready to draw or explain this exact 8-stage sequence:

```
1. React Frontend UI
      ↓ (HTTP POST /analyze with JSON payload)
2. FastAPI REST Gateway (Input validation, length check, SSRF defense)
      ↓
3. NLP Preprocessing (Lowercasing, HTML/URL removal, punctuation & negation preservation)
      ↓
4. TF-IDF Feature Extraction (1-gram & 2-gram n-grams, sublinear TF scaling)
      ↓
5. Supervised ML Classifier (Calibrated confidence score, positive/negative feature extraction)
      ↓
6. Deep Verification & Claim Extraction (Isolating verifiable factual statements)
      ↓
7. Multi-Source Evidence Retrieval & Grounded RAG Synthesis (Strictly real sources, status assignment)
      ↓
8. Supabase PostgreSQL / Local Persistent History & React Result Visualization
```

---

## 3. High-Frequency Viva Questions & Model Answers

### Q1: Why not simply say "True" or "False"?
**Answer:** In journalism and machine learning, text classification models predict whether the text pattern *resembles* reliable or deceptive training samples. A model alone cannot verify real-world facts occurring right now. Presenting a binary "True/False" verdict would be misleading and violate Responsible AI ethics. Hence, we use **Likely Real** or **Likely Fake** with an explicitly labeled **calibrated confidence score** and clear disclaimers.

### Q2: Why preserve negation words during stop-word removal?
**Answer:** Standard stop-word lists aggressively strip words like *"not"*, *"never"*, *"no"*, *"against"*, and *"without"*. In fact-checking, negations completely flip semantic polarity. For example, *"The government did approve the bill"* vs *"The government did NOT approve the bill"*. Stripping "not" would make both sentences produce identical feature representations. Our pipeline preserves critical negations.

### Q3: Why is probability calibration needed for Linear SVM?
**Answer:** Linear Support Vector Machines maximize the geometric margin between classes, producing a signed distance to the hyperplane $w^T x + b$, not a probability. If we display this raw score to users, it cannot be interpreted as a percentage confidence. By applying Platt Scaling (`CalibratedClassifierCV` with sigmoid method), we fit a logistic regression model on the SVM outputs to generate true, calibrated posterior probabilities between 0.0 and 1.0.

### Q4: How does NewsShield_AI solve the hallucination issue in RAG?
**Answer:** Under PRD Section 18.1, *the system must never fabricate citations*. Every evidence card rendered in the UI directly maps to an actually retrieved document containing title, snippet, publisher, and external URL. If no external sources corroborate or refute the claim, the system explicitly returns **Insufficient Evidence** rather than prompting an LLM to invent an unsupported conclusion.

### Q5: What security measures protect against malicious URL analysis?
**Answer:** Server-Side Request Forgery (SSRF) defenses in `backend/api/url_analysis.py` resolve the target hostname to an IP address before sending any HTTP request. Any requests attempting to reach loopback (`127.0.0.1`), private RFC 1918 subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), or cloud metadata endpoints (`169.254.169.254`) are blocked with HTTP 400.

---

## 4. Evaluation Metrics Summary

| Metric | Logistic Regression | Linear SVM (Calibrated) | Naive Bayes |
| :--- | :---: | :---: | :---: |
| **Accuracy** | **98.44%** | 96.88% | 98.44% |
| **Weighted F1** | **0.9844** | 0.9687 | 0.9844 |
| **Fake Recall** | **96.88%** | 93.75% | 96.88% |
| **Real Recall** | **100.0%** | 100.0% | 100.0% |
