/**
 * NewsShield_AI - Frontend API Client Service
 * Bridges React UI with FastAPI REST Backend.
 * Complies with PRD Section 14, 31, 32.
 */

const rawApiBase = import.meta.env.VITE_API_BASE_URL;

// Determine active API base URL:
// 1. If explicit VITE_API_BASE_URL is provided, use it (strip trailing slash).
// 2. In local development (DEV mode), default to localhost:8000.
// 3. In production, if VITE_API_BASE_URL is not configured or points to localhost,
//    prevent browser CORS / Private Network loopback blocks.
const isDev = import.meta.env.DEV;
const isLocalhost = (url) => !url || url.includes('localhost') || url.includes('127.0.0.1');

export const API_BASE = (() => {
  if (rawApiBase && (!import.meta.env.PROD || !isLocalhost(rawApiBase))) {
    return rawApiBase.replace(/\/$/, '');
  }
  if (isDev) {
    return 'http://localhost:8000';
  }
  return '';
})();

function assertApiConfigured() {
  if (!API_BASE && import.meta.env.PROD) {
    throw new Error(
      'Backend API is not connected. Please deploy the FastAPI backend (e.g. Render/Railway) and set VITE_API_BASE_URL in your Vercel Project Settings.'
    );
  }
}

async function handleResponse(response) {
  if (!response.ok) {
    let errorDetail = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const body = await response.json();
      if (body.detail) errorDetail = body.detail;
    } catch (_) {}
    throw new Error(errorDetail);
  }
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('text/html')) {
    throw new Error(
      'Received HTML instead of JSON. Backend API is not connected or route is missing.'
    );
  }
  return response.json();
}

export const apiService = {
  // Health & Service Status
  async getHealth() {
    if (!API_BASE) {
      throw new Error('Backend URL not configured');
    }
    const res = await fetch(`${API_BASE}/health`);
    return handleResponse(res);
  },

  // Quick ML Classification (POST /predict)
  async predictQuick(text) {
    assertApiConfigured();
    const res = await fetch(`${API_BASE}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    return handleResponse(res);
  },

  // Full Analysis - ML + Deep Verification (POST /analyze)
  async analyzeFull(text, mode = 'deep') {
    assertApiConfigured();
    const res = await fetch(`${API_BASE}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, mode }),
    });
    return handleResponse(res);
  },

  // URL Article Extraction & Analysis (POST /analyze-url)
  async analyzeUrl(url, mode = 'deep') {
    assertApiConfigured();
    const res = await fetch(`${API_BASE}/analyze-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, mode }),
    });
    return handleResponse(res);
  },

  // Claim-level RAG Verification (POST /verify-claim)
  async verifyClaim(claim) {
    assertApiConfigured();
    const res = await fetch(`${API_BASE}/verify-claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ claim }),
    });
    return handleResponse(res);
  },

  // Model Metadata & Evaluation Metrics (GET /model-info)
  async getModelInfo() {
    assertApiConfigured();
    const res = await fetch(`${API_BASE}/model-info`);
    return handleResponse(res);
  },

  // History API
  async getHistory(limit = 50) {
    assertApiConfigured();
    const res = await fetch(`${API_BASE}/history?limit=${limit}`);
    return handleResponse(res);
  },

  async getAnalysisDetail(analysisId) {
    assertApiConfigured();
    const res = await fetch(`${API_BASE}/history/${analysisId}`);
    return handleResponse(res);
  },

  async saveAnalysis(analysisData) {
    assertApiConfigured();
    const res = await fetch(`${API_BASE}/history/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(analysisData),
    });
    return handleResponse(res);
  },

  // Analytics API (GET /analytics)
  async getAnalytics() {
    assertApiConfigured();
    const res = await fetch(`${API_BASE}/analytics`);
    return handleResponse(res);
  },

  // User Feedback API (POST /feedback)
  async submitFeedback(analysisId, rating, comment = '') {
    assertApiConfigured();
    const res = await fetch(`${API_BASE}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        analysis_id: analysisId,
        rating,
        comment,
      }),
    });
    return handleResponse(res);
  },

  // Download PDF Report URL
  getPdfReportUrl(analysisId) {
    return `${API_BASE}/reports/${analysisId}/pdf`;
  },
};
