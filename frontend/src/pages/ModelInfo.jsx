import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import {
  Cpu, Database, BarChart3, CheckCircle2, RefreshCw,
  TrendingUp, BookOpen, AlertCircle
} from 'lucide-react';

function MetricRow({ label, value, sub }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      padding: '12px 0',
      borderBottom: '1px solid var(--border)',
    }}>
      <div>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{label}</span>
        {sub && <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', marginTop: 2 }}>{sub}</div>}
      </div>
      <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
        {value ?? '—'}
      </span>
    </div>
  );
}

const MODEL_DESCRIPTIONS = {
  LogisticRegression: 'A linear classifier that learns decision boundaries in TF-IDF feature space. Fast, interpretable, and effective for text classification tasks.',
  LinearSVC: 'Support Vector Machine with a linear kernel. Strong performance on high-dimensional sparse text features from TF-IDF.',
  MultinomialNB: 'Naive Bayes classifier using word frequency distributions. Very fast training; strong baseline for text classification.',
};

export default function ModelInfo() {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function fetchInfo() {
    setLoading(true);
    setError('');
    try {
      const data = await apiService.getModelInfo();
      setInfo(data);
    } catch (err) {
      setError(err.message?.includes('fetch')
        ? 'Cannot connect to backend. Make sure the server is running.'
        : 'Failed to load model information.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchInfo(); }, []);

  const metrics = info?.evaluation_metrics || info?.selected_metrics || info?.metrics || {};
  const modelName = info?.model_name || info?.name || '—';
  const modelDesc = MODEL_DESCRIPTIONS[modelName] || 'ML classifier trained on the news credibility dataset.';

  return (
    <div className="page">
      <div className="container-narrow">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div className="page-header" style={{ marginBottom: 0 }}>
            <h1 className="page-title">Model Information</h1>
            <p className="page-subtitle">Active ML model version, dataset, and evaluation metrics</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={fetchInfo} disabled={loading}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: 20 }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div className="spinner" style={{ margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--text-muted)' }}>Loading model metadata…</p>
          </div>
        ) : !info && !error ? (
          <div className="alert alert-warn">Model metadata not available.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Model identity card */}
            <div className="card-padded">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{
                  width: 40, height: 40, background: 'var(--brand-light)',
                  borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Cpu size={20} color="var(--brand)" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                    {modelName}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Version {info?.model_version || info?.version || '1.0'}
                  </div>
                </div>
                <span className="badge badge-real" style={{ marginLeft: 'auto' }}>
                  <CheckCircle2 size={11} /> Active
                </span>
              </div>

              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 20 }}>
                {modelDesc}
              </p>

              <MetricRow
                label="Model Name"
                value={modelName}
                sub="Trained classification algorithm"
              />
              <MetricRow
                label="Version"
                value={info?.model_version || info?.version || '1.0'}
              />
              <MetricRow
                label="Trained At"
                value={info?.trained_at ? new Date(info.trained_at).toLocaleDateString() : (info?.training_date || '—')}
              />
              <MetricRow
                label="Feature Extraction"
                value="TF-IDF"
                sub="ngram_range=(1,2), max_features=8000, sublinear_tf=True"
              />
              <MetricRow
                label="Vocabulary Size"
                value={info?.vocabulary_size ? info.vocabulary_size.toLocaleString() : '—'}
                sub="Number of learned features"
              />
            </div>

            {/* Dataset card */}
            <div className="card-padded">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <Database size={16} color="var(--brand)" />
                <span className="section-label" style={{ margin: 0 }}>Dataset Information</span>
              </div>
              <MetricRow label="Dataset" value={info?.dataset_name || info?.dataset || 'news.csv'} />
              <MetricRow label="Total Samples" value={info?.total_samples ? info.total_samples.toLocaleString() : '—'} />
              <MetricRow label="Real News Samples" value={info?.real_samples != null ? info.real_samples.toLocaleString() : '—'} />
              <MetricRow label="Fake News Samples" value={info?.fake_samples != null ? info.fake_samples.toLocaleString() : '—'} />
              <MetricRow
                label="Train/Test Split"
                value={info?.test_size ? `${Math.round((1 - info.test_size) * 100)}% / ${Math.round(info.test_size * 100)}%` : '80% / 20%'}
                sub="Stratified split to preserve class distribution"
              />
            </div>

            {/* Evaluation metrics card */}
            <div className="card-padded">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <BarChart3 size={16} color="var(--brand)" />
                <span className="section-label" style={{ margin: 0 }}>Evaluation Metrics (Test Set)</span>
              </div>

              {Object.keys(metrics).length === 0 ? (
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Metrics not available in model metadata.</p>
              ) : (
                <>
                  {/* Highlight best metric */}
                  {(metrics.accuracy != null) && (
                    <div style={{
                      background: 'var(--real-bg)',
                      border: '1px solid var(--real-border)',
                      borderRadius: 'var(--radius-md)',
                      padding: '16px 20px',
                      marginBottom: 16,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                    }}>
                      <div>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--real-text)', letterSpacing: '-0.02em' }}>
                          {(metrics.accuracy * 100).toFixed(2)}%
                        </div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--real-accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Accuracy
                        </div>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', flex: 1 }}>
                        Measured on a held-out test set not seen during training.
                        Higher accuracy reflects better generalization.
                      </div>
                    </div>
                  )}

                  {metrics.f1_score != null && (
                    <MetricRow
                      label="F1 Score"
                      value={(metrics.f1_score * 100).toFixed(2) + '%'}
                      sub="Harmonic mean of precision and recall"
                    />
                  )}
                  {metrics.precision != null && (
                    <MetricRow label="Precision" value={(metrics.precision * 100).toFixed(2) + '%'} />
                  )}
                  {metrics.recall != null && (
                    <MetricRow label="Recall" value={(metrics.recall * 100).toFixed(2) + '%'} />
                  )}

                  {/* Raw metrics fallback */}
                  {Object.entries(metrics)
                    .filter(([k]) => !['accuracy', 'f1_score', 'precision', 'recall'].includes(k))
                    .map(([k, v]) => (
                      <MetricRow
                        key={k}
                        label={k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                        value={typeof v === 'number' ? (v < 1 ? (v * 100).toFixed(2) + '%' : v.toFixed(2)) : String(v)}
                      />
                    ))}
                </>
              )}
            </div>

            {/* ML Pipeline explanation */}
            <div className="card-padded">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <TrendingUp size={16} color="var(--brand)" />
                <span className="section-label" style={{ margin: 0 }}>ML Pipeline</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {[
                  { step: '1', label: 'Input Text', desc: 'Raw news article, headline, or claim submitted by user' },
                  { step: '2', label: 'NLP Preprocessing', desc: 'Lowercase, remove HTML/URLs, preserve negations, tokenize' },
                  { step: '3', label: 'TF-IDF Vectorization', desc: 'Convert cleaned text to numerical feature matrix (sparse)' },
                  { step: '4', label: 'ML Classification', desc: `${modelName} predicts class and probability` },
                  { step: '5', label: 'RAG Verification', desc: 'Claim extraction + real-time evidence retrieval (Deep mode)' },
                  { step: '6', label: 'Prediction Output', desc: 'Likely Real / Likely Fake with calibrated confidence score' },
                ].map((s, i, arr) => (
                  <div key={s.step} style={{ display: 'flex', gap: 16, paddingBottom: i < arr.length - 1 ? 16 : 0 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%', background: 'var(--brand-light)',
                        color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.72rem', fontWeight: 700, flexShrink: 0,
                      }}>
                        {s.step}
                      </div>
                      {i < arr.length - 1 && (
                        <div style={{ width: 1, flex: 1, background: 'var(--border)', minHeight: 16, marginTop: 4 }} />
                      )}
                    </div>
                    <div style={{ paddingTop: 4, paddingBottom: i < arr.length - 1 ? 0 : 0 }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{s.label}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Responsible AI note */}
            <div className="disclaimer">
              <strong>Responsible AI Note:</strong> The model was trained on a custom balanced dataset (320 records).
              Performance metrics are from the held-out test set. The model predicts based on learned linguistic patterns —
              it cannot guarantee factual accuracy. Always use Deep Verification mode and review cited evidence for important claims.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
