NewsShield_AI

AI-Powered News Credibility & Evidence Analysis Platform

Product Requirements Document (PRD)

Version 1.0  |  September 2026

TaglineAnalyze. Verify. Stay Informed.NewsShield_AI is designed as an AI-assisted credibility analysis system. Its ML classifier predicts whether submitted content resembles reliable or unreliable examples, while the advanced verification layer retrieves evidence from external sources. The system must not claim absolute truth solely from a classifier.

Document Contents

1. Executive Summary

2. Product Vision

3. Problem Statement

4. Goals and Objectives

5. Target Users

6. Scope

7. Key Features

8. User Roles and Permissions

9. User Journey

10. End-to-End Working Flow

11. System Architecture

12. Detailed Component Architecture

13. Frontend Requirements

14. Backend and API Requirements

15. NLP Pipeline

16. Machine Learning Pipeline

17. Dataset and Data Engineering

18. RAG and Evidence Verification

19. Source Credibility Layer

20. Explainability and Results

21. Supabase Database and Authentication

22. URL Analysis

23. Multilingual Support

24. Verification Report / PDF

25. Dashboard and Analytics

26. Feedback and Improvement Loop

27. Security and Privacy

28. Error Handling

29. Testing Strategy

30. Deployment Architecture

31. Project Folder Structure

32. API Specification

33. Non-Functional Requirements

34. Functional Requirements

35. MVP vs Advanced Roadmap

36. Acceptance Criteria

37. Risks and Mitigations

38. Future Scope

39. Suggested Demo Flow

40. Viva / Interview Explanation

1. Executive Summary

NewsShield_AI is a full-stack AI/ML web platform for analyzing the credibility of news articles, headlines, claims, and optionally news URLs. The core system uses Natural Language Processing (NLP), TF-IDF feature extraction, and supervised machine learning models such as Logistic Regression and SVM to classify submitted text as Likely Real or Likely Fake. The advanced system adds claim extraction, retrieval of relevant information from trusted sources, RAG-based evidence analysis, and an AI-generated explanation. Supabase provides authentication and persistent analysis history.

The project is intentionally designed in phases. The first release must be a reliable text-classification pipeline. URL analysis, RAG, multilingual support, PDF reports, and other advanced features are added only after the core prediction pipeline is working and evaluated.

2. Product Vision

Build a user-friendly AI assistant that helps people understand whether a news claim resembles patterns seen in credible or unreliable training examples and, when evidence retrieval is enabled, shows relevant supporting or contradicting information. The product should emphasize transparency, evidence, uncertainty, and responsible AI rather than presenting an unverified binary verdict as absolute truth.

3. Problem Statement

False, misleading, exaggerated, and context-free information can spread rapidly through social media, messaging platforms, websites, and other online channels. Users often need a quick way to analyze a claim and find relevant evidence. Existing simple fake-news projects frequently stop at a binary ML label and do not explain the prediction or provide evidence.

Core problemUsers need an accessible system that combines fast ML-based classification with transparent evidence-assisted analysis, while clearly communicating that model predictions are not guaranteed fact checks.

4. Goals and Objectives

Provide a clean interface for entering news text or a claim.

Optionally support analysis of a news article URL.

Preprocess text using a consistent NLP pipeline.

Convert text into numerical features using TF-IDF for the baseline classifier.

Train and evaluate multiple ML models and select the best-performing documented model.

Return Likely Real / Likely Fake classification with an appropriately labeled confidence/probability value.

Provide model-oriented explanation signals instead of a black-box label only.

Extract important claims for advanced verification.

Retrieve relevant evidence from trusted external sources in Deep Verification mode.

Use RAG/LLM capabilities to summarize evidence without inventing sources.

Store analysis history securely using Supabase.

Generate a structured verification report.

Provide responsive UI for desktop and mobile.

Create a project architecture that is suitable for academic demonstration and future expansion.

5. Target Users

User Type

Needs

Main Features

Student / General User

Quickly analyze a news claim

Quick Analysis, Result, History

Researcher / Learner

Understand evidence and model behavior

Deep Verification, Sources, Explanation

Project Admin

Monitor system usage and model status

Dashboard, Analytics, Model Information

6. Scope

6.1 In Scope

Web-based news text analysis.

NLP preprocessing and TF-IDF.

Supervised text classification.

Model evaluation and model version information.

FastAPI backend and React frontend.

Supabase authentication and analysis history.

Evidence retrieval in an advanced verification mode.

Source and evidence display.

PDF/structured verification report.

Responsive dashboard.

Optional English, Marathi, and Hindi workflow.

API testing and deployment.

6.2 Out of Scope for MVP

Guaranteed truth determination.

Automatic legal or governmental decisions.

Real-time monitoring of every social media platform.

Perfect source credibility scoring.

Fully autonomous investigative journalism.

Guaranteed article extraction from every website.

Training a large language model from scratch.

7. Key Features

Feature

Description

Quick News Analysis

Paste text and receive a fast ML classification.

Deep Verification

Extract claims, retrieve evidence, and produce an evidence-assisted explanation.

URL Analysis

Optionally fetch and analyze article content where technically permitted.

Confidence / Probability

Show a calibrated/appropriately labeled model score when supported.

NLP Processing

Cleaning, tokenization, stop-word handling, and optional lemmatization/stemming.

ML Model Comparison

Compare Logistic Regression, SVM, Naive Bayes, and optionally other baselines.

Explainability

Show meaningful model signals and evidence used in the analysis.

Evidence Cards

Display source title, publisher, date if available, relevant snippet, and source link.

History

Store and retrieve prior analyses for authenticated users.

Dashboard

Show user analysis counts and recent activity.

Multilingual Support

English first; Marathi/Hindi as an advanced feature.

PDF Report

Export a structured NewsShield verification report.

Feedback

Allow users to rate usefulness/correctness and store feedback.

Model Information

Show model name, version, dataset information, and evaluation metrics.

8. User Roles and Permissions

Role

Permissions

Guest

Analyze limited text; no private history unless anonymous mode is intentionally supported.

Authenticated User

Analyze content, view/save history, download own reports, submit feedback.

Admin

View aggregate analytics, model status, moderation/feedback data, and system health where implemented.

9. User Journey

User opens NewsShield_AI.

User chooses Quick Analysis or Deep Verification.

User enters a news article, headline, claim, or URL.

Frontend validates the input and sends a request to FastAPI.

Backend validates the request and selects the required pipeline.

NLP preprocessing prepares the text.

TF-IDF converts text into numerical features for the baseline ML model.

The trained model predicts a class and score.

In Deep Verification mode, important claims are extracted and relevant evidence is retrieved.

The system displays classification, score, evidence, explanation, and limitations.

Authenticated users can save the analysis to Supabase.

User can view history, submit feedback, or export a report.

10. End-to-End Working Flow

USER  |  vReact Frontend  |  | POST /predict or /analyze  vFastAPI Backend  |  +--> Input validation  |  +--> NLP preprocessing  |  +--> TF-IDF vectorization  |  +--> ML classifier  |       |  |       +--> class  |       +--> probability/confidence (if supported)  |  +--> [Deep Verification]          |          +--> Claim extraction          +--> Evidence retrieval          +--> Source filtering          +--> RAG/LLM synthesis  |  vStructured JSON response  |  vReact Result UI  |  +--> Prediction  +--> Score  +--> Explanation  +--> Evidence  +--> Sources  |  vSupabase (authenticated history)

Golden flow for vivaReact → FastAPI → NLP → TF-IDF → ML Model → Prediction → optional Claim Extraction → RAG/Evidence → Explanation → Supabase History → React Result.

11. System Architecture

                    +----------------------+                    |       User           |                    +----------+-----------+                               |                               v                    +----------------------+                    | React Frontend       |                    | UI / State / Router   |                    +----------+-----------+                               |                         HTTPS / JSON                               |                               v                    +----------------------+                    | FastAPI Backend      |                    | Validation / APIs     |                    +----------+-----------+                               |              +----------------+----------------+              |                                 |              v                                 v   +----------------------+           +----------------------+   | ML/NLP Pipeline      |           | Deep Verification    |   | Preprocess            |           | Claim Extraction    |   | TF-IDF                |           | Retrieval            |   | Classifier            |           | RAG / LLM            |   +----------+-----------+           +----------+-----------+              |                                  |              +----------------+-----------------+                               |                               v                    +----------------------+                    | Result / Report      |                    +----------+-----------+                               |                    +----------+-----------+                    |                      |                    v                      v             +-------------+        +-------------+             | Supabase    |        | External    |             | Auth/DB     |        | Sources     |             +-------------+        +-------------+

12. Detailed Component Architecture

Component

Responsibility

React Frontend

Pages, components, forms, API client, loading/error states, result visualization.

FastAPI

REST API layer, validation, routing, orchestration, CORS, authentication integration.

NLP Module

Text normalization and preprocessing used consistently during training and inference.

TF-IDF Vectorizer

Transforms processed text into sparse numerical feature vectors.

ML Classifier

Predicts class using the trained model.

Model Registry/Files

Stores model, vectorizer, metadata, version, and evaluation metrics.

Claim Extraction

Identifies important factual statements for Deep Verification.

Retriever

Finds relevant documents or passages from configured sources.

RAG/LLM Layer

Uses retrieved evidence to generate a grounded explanation.

Source Filter

Applies source/domain rules and removes duplicate or irrelevant evidence.

Supabase

Authentication, PostgreSQL database, and analysis history.

Report Generator

Creates structured verification reports.

Monitoring/Logging

Captures errors, latency, request IDs, and model version usage without storing unnecessary sensitive data.

13. Frontend Requirements

13.1 Recommended Pages

Landing / Home

Analyze

Result / Verification Report

History

Dashboard

Login / Register

Profile / Settings

About / How It Works

Model Information

13.2 UI Design

Professional security/verification visual identity.

Clear primary action: Analyze News.

Separate Quick Analysis and Deep Verification modes.

Use status indicators with text labels; do not rely on color alone.

Show loading states while model/evidence retrieval is running.

Show source cards and evidence snippets.

Provide mobile-responsive layouts.

Include a visible disclaimer on result pages.

13.3 Example Result Layout

NEWSHIELD ANALYSISPrediction: Likely FakeModel confidence: 91%Model: SVM v1.0Why this result?- Model-derived signals...- Text patterns...- Evidence status: Mixed / Supporting / Contradicting / InsufficientEvidence1. Source A - relevant passage...2. Source B - relevant passage...Disclaimer:AI-assisted analysis; not a guaranteed fact check.

14. Backend and API Requirements

Python backend using FastAPI.

Uvicorn as the development ASGI server.

Pydantic models for request/response validation.

CORS configured for the deployed frontend origin.

Environment variables for secrets and configuration.

Separate modules for prediction, history, verification, and health checks.

Consistent JSON error responses.

Request IDs/logging for debugging.

15. NLP Pipeline

Raw Text   |   vNormalize / Lowercase   |   vRemove or normalize URLs, HTML, unwanted characters   |   vTokenization   |   vStop-word handling (validated experimentally)   |   vOptional stemming OR lemmatization   |   vClean Text   |   vTF-IDF Vectorization

15.1 Preprocessing Rules

Use the same preprocessing implementation for training and inference.

Preserve meaningful negations and punctuation if experiments show they matter.

Do not remove all stop words automatically; compare validation results.

Handle empty/very short text gracefully.

Normalize Unicode and whitespace consistently.

Document every preprocessing step in the model card/project report.

16. Machine Learning Pipeline

Collect a suitable labeled dataset.

Inspect class distribution, missing values, duplicates, and label quality.

Split data into training and final test sets; use stratification when appropriate.

Fit the preprocessing and TF-IDF vectorizer only on training data.

Train baseline models such as Logistic Regression, Linear SVM, and Naive Bayes.

Evaluate on validation/test data using accuracy, precision, recall, F1-score, and confusion matrix.

Select a model based on measured performance and project requirements.

Calibrate probability outputs if a numerical confidence is presented as a probability.

Save the trained model, vectorizer, preprocessing configuration, and metadata.

Version the model and record dataset/version and evaluation metrics.

16.1 Model Comparison

Model

Purpose

Notes

Logistic Regression

Strong baseline for sparse text

Simple, fast, interpretable coefficients.

Linear SVM

Text classification comparison

Often strong with high-dimensional TF-IDF features.

Naive Bayes

Fast baseline

Useful comparison for text classification.

Random Forest

Optional comparison

Can be tested but may be less natural for sparse TF-IDF text.

17. Dataset and Data Engineering

The project should use a documented public or permitted dataset containing labeled news statements/articles. A common academic starting point is the LIAR dataset, but the final dataset must be selected based on the classification task and label semantics.

Document dataset name, source, license/usage terms, record count, and label definitions.

Check for class imbalance.

Remove or handle missing text.

Remove duplicate or near-duplicate examples where appropriate.

Prevent train/test leakage.

Keep a separate final test set.

Do not merge unrelated datasets without checking label compatibility.

18. RAG and Evidence Verification

Deep Verification extends the classifier by retrieving external evidence. RAG stands for Retrieval-Augmented Generation. The system retrieves relevant documents or passages first, then an LLM synthesizes an explanation grounded in those retrieved sources.

Claim  |  vClaim Extraction  |  vQuery Generation  |  vRetriever  |  +--> Search / APIs / Indexed Documents  |  vRelevant Evidence  |  vSource Filtering + Deduplication  |  vLLM / RAG Synthesis  |  vEvidence-grounded Explanation

18.1 Evidence Status

Supporting: retrieved evidence supports the claim.

Contradicting: retrieved evidence conflicts with the claim.

Mixed: credible evidence exists on both sides or details differ.

Insufficient Evidence: available evidence is not enough to make a supported assessment.

The system should never fabricate citations or present an LLM-generated statement as evidence. Every evidence item displayed to the user must correspond to an actually retrieved source or document.

19. Source Credibility Layer

Maintain a configurable source/domain policy rather than a hard-coded universal 'trust score'.

Prioritize official sources and recognized organizations for claims where they are authoritative.

Display publisher, title, publication date when available, and source link.

Use source diversity to reduce dependence on one document.

Deduplicate identical or syndicated content.

Show the source basis for each evidence classification.

Avoid treating HTTPS, domain age, or visual design alone as proof of journalistic credibility.

20. Explainability and Results

20.1 Result Components

Prediction: Likely Real or Likely Fake.

Model confidence/probability, clearly labeled and calibrated where appropriate.

Model name and version.

Short explanation of model-derived signals.

Evidence status for Deep Verification.

Supporting/contradicting evidence cards.

AI summary grounded in retrieved evidence.

Disclaimer and limitations.

20.2 Optional Advanced Explainability

Show important words/features influencing the linear classifier when technically appropriate.

Use SHAP/LIME only after the baseline system is stable and explanations are validated.

Never imply that a highlighted word alone proves a claim is false.

21. Supabase Database and Authentication

Recommended tables:

Table

Important Fields

Purpose

profiles

id, name, email, role, created_at

User profile and role.

analyses

id, user_id, input_type, news_text, url, prediction, confidence, model_name, model_version, created_at

Analysis history.

evidence

id, analysis_id, source_name, source_url, title, snippet, evidence_type, retrieved_at

Evidence attached to an analysis.

feedback

id, analysis_id, user_id, rating, comment, created_at

User feedback.

model_versions

id, name, version, dataset, metrics_json, created_at

Model metadata and evaluation.

21.1 Authentication

Use Supabase Auth for registration/login if authentication is enabled.

Protect private analysis history using row-level security policies.

Never expose Supabase service-role keys in the React frontend.

Store only necessary user information.

22. URL Analysis

News URL   |   vValidate URL   |   vFetch Article (where permitted)   |   vExtract title/date/author/content   |   vClean content   |   vNLP + TF-IDF + ML   |   vClaim Extraction + Evidence   |   vReport

Handle blocked, paywalled, JavaScript-only, malformed, and unsupported pages.

Respect website terms, robots policies, copyright, and rate limits.

Do not store full third-party articles unnecessarily.

If extraction fails, ask the user to paste the text instead.

23. Multilingual Support

English should be the initial supported language. Marathi and Hindi can be added as an advanced feature.

Input Language      |      vLanguage Detection      |      +--> English pipeline      |      +--> Marathi/Hindi multilingual or translation pipeline      |      vClassification / Verification      |      vResult in selected language

Evaluate each language separately.

Do not assume an English-trained TF-IDF model will perform well on Marathi/Hindi.

Use language-appropriate tokenization and datasets.

Translate only when the chosen approach has been tested for semantic preservation.

24. Verification Report / PDF

The report should contain:

NewsShield_AI branding.

Date/time of analysis.

Submitted text or a short input reference.

Prediction and model score.

Model name/version.

Evidence status.

Retrieved source list.

Relevant evidence snippets within allowed limits.

AI-generated summary grounded in evidence.

Limitations and disclaimer.

For third-party copyrighted articles, the report should avoid reproducing large portions of the original content. Prefer short excerpts or summaries and provide source links.

25. Dashboard and Analytics

Total analyses.

Likely Real count.

Likely Fake count.

Recent analysis list.

Analysis trend over time.

Model version used.

Evidence verification usage.

User feedback summary for admins, where implemented.

Analytics must not expose another user's private history.

26. Feedback and Improvement Loop

User Analysis     |     vPrediction + Evidence     |     vUser Feedback     |     vError / Quality Review     |     vDataset Improvement     |     vRetraining / Evaluation     |     vNew Model Version

Feedback should be treated as a signal, not automatically as ground truth.

A model should only be retrained after human/quality review of feedback.

Maintain model version history so results can be reproduced.

27. Security and Privacy

Use HTTPS in production.

Keep API keys and service credentials in environment variables.

Never commit .env files or secrets to GitHub.

Validate input length and content type.

Apply rate limits to expensive endpoints where appropriate.

Use authentication and database row-level security for private history.

Sanitize and validate URLs.

Avoid logging sensitive user text unless required.

Use structured error messages without exposing stack traces in production.

Protect admin endpoints with role-based authorization.

28. Error Handling

Situation

Expected Response

Empty text

Ask user to enter a news statement/article.

Text too long

Show size limit and ask user to shorten input.

Model unavailable

Return temporary service error; log internally.

Invalid URL

Show URL validation error.

Article extraction fails

Ask user to paste article text.

No evidence found

Show Insufficient Evidence rather than inventing a conclusion.

External source unavailable

Show retrieval limitation and allow retry.

Unauthorized history request

Return authorization error; never expose data.

29. Testing Strategy

29.1 ML Testing

Train/test leakage checks.

Class distribution checks.

Accuracy, precision, recall, F1-score.

Confusion matrix.

Cross-validation on training data where useful.

Final evaluation on an untouched test set.

Probability calibration if probabilities are shown.

29.2 Backend Testing

Unit tests for preprocessing.

Unit tests for prediction response schema.

API tests for /health and /predict.

Invalid input tests.

Authentication/authorization tests.

External retrieval failure tests.

29.3 Frontend Testing

Form validation.

Loading states.

API success/error handling.

Responsive layouts.

History pagination/filtering where implemented.

29.4 Security Testing

Secret exposure checks.

CORS configuration.

Authorization tests.

Rate-limit behavior.

Malicious/oversized input tests.

URL abuse/SSRF protections for server-side URL fetching.

30. Deployment Architecture

                 Internet                    |                    v             React Frontend             (e.g. Vercel)                    |                  HTTPS                    |                    v             FastAPI Backend       (Python-capable cloud host)                    |        +-----------+-----------+        |                       |        v                       v   ML/NLP Model           RAG / External APIs        |                       |        +-----------+-----------+                    |                    v              Supabase          Auth + PostgreSQL

Frontend deployment can use a React-compatible platform.

Backend deployment must support Python/FastAPI.

Supabase hosts authentication and PostgreSQL.

Use environment variables separately for development and production.

Enable logging and health checks after deployment.

31. Project Folder Structure

NewsShield_AI/|+-- frontend/|   +-- src/|       +-- components/|       |   +-- Navbar.jsx|       |   +-- NewsInput.jsx|       |   +-- ResultCard.jsx|       |   +-- EvidenceCard.jsx|       |   +-- ScoreCard.jsx|       ||       +-- pages/|       |   +-- Home.jsx|       |   +-- Analyze.jsx|       |   +-- Result.jsx|       |   +-- History.jsx|       |   +-- Dashboard.jsx|       |   +-- Login.jsx|       ||       +-- services/|       |   +-- api.js|       +-- App.jsx|       +-- main.jsx|   +-- package.json|+-- backend/|   +-- main.py|   +-- requirements.txt|   +-- api/|   |   +-- predict.py|   |   +-- history.py|   |   +-- verification.py|   |   +-- health.py|   ||   +-- ml/|   |   +-- train.py|   |   +-- preprocess.py|   |   +-- model.pkl|   |   +-- vectorizer.pkl|   |   +-- model_metadata.json|   ||   +-- rag/|       +-- retrieval.py|       +-- claim_extraction.py|       +-- verification.py|+-- dataset/|   +-- news.csv|+-- reports/+-- tests/+-- .env.example+-- .gitignore+-- README.md

32. API Specification

Method

Endpoint

Purpose

Priority

GET

/health

Check backend status

MVP

POST

/predict

Classify news text

MVP

POST

/analyze

Run complete analysis

Advanced

POST

/verify-claim

Evidence-based claim verification

Advanced

POST

/analyze-url

Extract and analyze article URL

Advanced

GET

/history

Get authenticated user's history

Phase 2

GET

/model-info

Return model metadata and metrics

Phase 2

POST

/feedback

Submit analysis feedback

Phase 2

32.1 Example /predict Request

POST /predictContent-Type: application/json{  "text": "Government announced a new education scheme."}

32.2 Example /predict Response

{  "prediction": "Likely Real",  "confidence": 0.87,  "model_name": "LogisticRegression",  "model_version": "1.0"}

The exact confidence field must reflect the model's actual output and calibration strategy. If a model does not produce a meaningful probability, use a score with a different label rather than calling it a probability.

33. Non-Functional Requirements

Requirement

Target / Principle

Performance

Quick Analysis should normally return within a few seconds on a warm backend; external retrieval may take longer.

Availability

Health endpoint and clear degraded-mode behavior.

Scalability

Stateless FastAPI API where possible; externalize persistent data to Supabase.

Security

HTTPS, secrets management, auth, validation, RLS.

Usability

Simple flow with clear explanations and accessible labels.

Maintainability

Modular frontend/backend and versioned ML artifacts.

Observability

Structured logs, request IDs, errors, latency metrics.

Responsiveness

Desktop, tablet, and mobile layouts.

34. Functional Requirements

ID

Requirement

FR-01

User can enter news text or a claim.

FR-02

System validates input before processing.

FR-03

System preprocesses text using the configured NLP pipeline.

FR-04

System transforms text with the saved TF-IDF vectorizer.

FR-05

System runs the saved ML model.

FR-06

System returns prediction and appropriate score/confidence.

FR-07

System displays model name/version.

FR-08

Authenticated users can save and view analysis history.

FR-09

Deep Verification can extract claims.

FR-10

Deep Verification can retrieve relevant evidence.

FR-11

Every displayed evidence item maps to a real retrieved source.

FR-12

System displays a disclaimer and uncertainty.

FR-13

User can export a structured report.

FR-14

User can submit feedback.

FR-15

Admin can view permitted aggregate analytics.

35. MVP vs Advanced Roadmap

Phase

Build

Outcome

Phase 1

Dataset + preprocessing + TF-IDF + Logistic Regression/SVM

Working ML classifier

Phase 2

FastAPI + /predict + Postman/docs

Working AI backend

Phase 3

React UI + API integration

Working web application

Phase 4

Supabase Auth + history + dashboard

Complete product foundation

Phase 5

Explainability + report

More transparent and demo-ready

Phase 6

Claim extraction + retrieval + RAG

Advanced evidence verification

Phase 7

URL analysis + multilingual support

Extended real-world usability

Phase 8

Deployment + testing + documentation

Production-style academic project

36. Acceptance Criteria

A user can enter valid news text and receive a prediction.

The backend returns a valid JSON response.

The saved vectorizer and model are used for inference; the model is not retrained per request.

Evaluation metrics are generated from a separate evaluation set and documented.

React displays prediction, score, model version, and disclaimer.

Authenticated users can save and retrieve their own history.

Unauthorized users cannot access another user's history.

Deep Verification does not fabricate evidence or sources.

If no evidence is found, the system reports insufficient evidence.

The UI works on desktop and mobile.

The deployed frontend can communicate securely with the deployed backend.

Project documentation includes architecture, setup steps, dataset information, evaluation results, limitations, and future scope.

37. Risks and Mitigations

Risk

Mitigation

Model bias / dataset bias

Evaluate across classes and sources; document dataset limitations.

False positives/negatives

Show uncertainty; use precision/recall/F1; do not claim certainty.

Data leakage

Separate train/test data and fit vectorizer only on training data.

Hallucinated RAG explanations

Force evidence-grounded generation and show source mapping.

Source quality

Use configured source policy and multiple sources where possible.

URL extraction failures

Provide paste-text fallback and clear error states.

API abuse

Rate limits, validation, authentication where needed.

Secrets exposed

Environment variables and server-side secret handling.

Multilingual accuracy

Train/evaluate language-specific pipelines.

Latency from external retrieval

Separate Quick and Deep modes and use caching where appropriate.

38. Future Scope

Transformer-based classifiers such as BERT-family models after establishing a baseline.

Multilingual transformer models.

Knowledge graphs for claim relationships.

Continuous trusted-source indexing.

Browser extension for on-page analysis.

Mobile application.

Real-time monitoring dashboards for public datasets or permitted feeds.

Human-in-the-loop review workflows.

Model drift monitoring.

Active learning from reviewed examples.

Source-specific credibility models.

Claim-level temporal verification using publication dates and historical context.

39. Suggested Demo Flow

Open the NewsShield_AI landing page.

Explain the Quick Analysis and Deep Verification modes.

Paste a sample news claim.

Click Analyze.

Show FastAPI request/response flow briefly.

Show NLP preprocessing and TF-IDF as the ML pipeline.

Display prediction and model score.

Open Deep Verification for the same claim.

Show retrieved sources and supporting/contradicting evidence.

Show the AI explanation grounded in the evidence.

Save the analysis.

Open History and Dashboard.

Download the verification report.

Explain limitations and future RAG/multilingual improvements.

40. Viva / Interview Explanation

NewsShield_AI is an AI-powered news credibility and evidence analysis platform. The frontend is developed using React, while the backend uses Python FastAPI. When the user enters news text, the frontend sends it to the backend through a REST API. The backend performs NLP preprocessing and uses TF-IDF to convert the text into numerical features. A trained machine learning model such as Logistic Regression or SVM then predicts whether the text is likely real or likely fake. The system returns the prediction and an appropriate confidence or probability score. In the advanced Deep Verification mode, the system extracts important claims, retrieves relevant information from configured trusted sources, and uses a RAG/LLM layer to generate an evidence-grounded explanation. Supabase is used for authentication and storing analysis history. The system is designed as an AI-assisted credibility tool, so it does not claim that a classifier alone can guarantee the truth of a claim.

Appendix A — Recommended Technology Stack

Layer

Technology

Role

Frontend

React.js

User interface and interaction

Styling

HTML5 + CSS3 + JavaScript

Responsive UI

API

FastAPI

REST backend

Server

Uvicorn

Run FastAPI application

Language

Python

ML/NLP/backend

Data

Pandas + NumPy

Dataset processing

NLP

NLTK / spaCy

Text preprocessing

Features

Scikit-learn TF-IDF

Text vectorization

ML

Scikit-learn

Classification models

Persistence

Joblib

Model/vectorizer serialization

Database/Auth

Supabase/PostgreSQL

History and authentication

API Testing

Postman / FastAPI Docs

API testing

Version Control

Git + GitHub

Source control

Advanced AI

RAG + LLM + retrieval

Evidence-grounded verification

Appendix B — Core Screens

Home: product introduction and primary Analyze CTA.

Analyze: text/URL input and Quick/Deep mode selection.

Loading: progress indicator with stage information.

Result: prediction, score, model info, explanation, evidence.

Evidence: source cards and claim/evidence mapping.

History: searchable list of previous analyses.

Dashboard: statistics and recent activity.

Login/Register: authentication.

Model Info: model version and evaluation metrics.

Report: printable/exportable verification summary.

About/How It Works: architecture and responsible-AI explanation.

Appendix C — Responsible AI Disclaimer

Recommended disclaimer textNewsShield_AI provides AI-assisted credibility analysis based on learned patterns and, where enabled, retrieved evidence. A 'Likely Real' or 'Likely Fake' result is not a guarantee that a claim is true or false. Users should review the cited sources and use independent judgment, especially for high-impact claims.