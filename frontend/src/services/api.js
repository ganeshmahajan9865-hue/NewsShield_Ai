/**
 * NewsShield_AI - Frontend API Client Service
 * Bridges React UI with FastAPI REST Backend.
 * Complies with PRD Section 14, 31, 32.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

async function handleResponse(response) {
  if (!response.ok) {
    let errorDetail = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const body = await response.json();
      if (body.detail) errorDetail = body.detail;
    } catch (_) {}
    throw new Error(errorDetail);
  }
  return response.json();
}

export const apiService = {
  // Health & Service Status
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return handleResponse(res);
  },

  // Quick ML Classification (POST /predict)
  async predictQuick(text) {
    const res = await fetch(`${API_BASE}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    return handleResponse(res);
  },

  // Full Analysis - ML + Deep Verification (POST /analyze)
  async analyzeFull(text, mode = 'deep') {
    const res = await fetch(`${API_BASE}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, mode }),
    });
    return handleResponse(res);
  },

  // URL Article Extraction & Analysis (POST /analyze-url)
  async analyzeUrl(url, mode = 'deep') {
    const res = await fetch(`${API_BASE}/analyze-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, mode }),
    });
    return handleResponse(res);
  },

  // Claim-level RAG Verification (POST /verify-claim)
  async verifyClaim(claim) {
    const res = await fetch(`${API_BASE}/verify-claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ claim }),
    });
    return handleResponse(res);
  },

  // Model Metadata & Evaluation Metrics (GET /model-info)
  async getModelInfo() {
    const res = await fetch(`${API_BASE}/model-info`);
    return handleResponse(res);
  },

  // History API
  async getHistory(limit = 50) {
    const res = await fetch(`${API_BASE}/history?limit=${limit}`);
    return handleResponse(res);
  },

  async getAnalysisDetail(analysisId) {
    const res = await fetch(`${API_BASE}/history/${analysisId}`);
    return handleResponse(res);
  },

  async saveAnalysis(analysisData) {
    const res = await fetch(`${API_BASE}/history/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(analysisData),
    });
    return handleResponse(res);
  },

  // Analytics API (GET /analytics)
  async getAnalytics() {
    const res = await fetch(`${API_BASE}/analytics`);
    return handleResponse(res);
  },

  // User Feedback API (POST /feedback)
  async submitFeedback(analysisId, rating, comment = '') {
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
