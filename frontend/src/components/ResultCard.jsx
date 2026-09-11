import React, { useState } from 'react';
import {
  CheckCircle2, XCircle, AlertTriangle, RefreshCw, Download,
  ExternalLink, ThumbsUp, ThumbsDown, ChevronDown, ChevronUp,
  Zap, ShieldCheck, Clock, BarChart3, BookOpen, MessageSquare, Globe
} from 'lucide-react';
import { apiService } from '../services/api';

function getVerdict(prediction) {
  const p = (prediction || '').toLowerCase();
  if (p.includes('real')) return 'real';
  if (p.includes('fake')) return 'fake';
  return 'mixed';
}

function VerdictIcon({ verdict, size = 32 }) {
  if (verdict === 'real') return <CheckCircle2 size={size} color="var(--real-accent)" />;
  if (verdict === 'fake') return <XCircle size={size} color="var(--fake-accent)" />;
  return <AlertTriangle size={size} color="var(--mixed-accent)" />;
}

function ConfidenceBar({ value, verdict }) {
  const pct = Math.round((value || 0) * 100);
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Model Confidence</span>
        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>{pct}%</span>
      </div>
      <div className="confidence-bar-track">
        <div
          className={`confidence-bar-fill ${verdict}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', marginTop: 5 }}>
        {pct >= 85 ? 'High confidence' : pct >= 65 ? 'Moderate confidence' : 'Low confidence — treat result with caution'}
      </div>
    </div>
  );
}

function EvidenceCard({ ev, index }) {
  const [expanded, setExpanded] = useState(false);
  const type = (ev.evidence_type || ev.type || 'news').toLowerCase().replace(/ /g, '_');
  const isFactCheck = type.includes('fact') || type.includes('debunk');
  const isSupporting = type.includes('support') || type.includes('corrobor');

  let borderColor = 'var(--brand)';
  let badgeClass = 'badge-blue';
  let badgeLabel = 'News';
  if (isFactCheck) { borderColor = 'var(--fake-accent)'; badgeClass = 'badge-fake'; badgeLabel = 'Fact Check'; }
  else if (isSupporting) { borderColor = 'var(--real-accent)'; badgeClass = 'badge-real'; badgeLabel = 'Supporting'; }

  const snippet = ev.snippet || ev.text || '';
  const truncated = snippet.length > 180 ? snippet.slice(0, 180) + '…' : snippet;

  return (
    <div
      className="evidence-card"
      style={{ borderLeft: `3px solid ${borderColor}` }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
            <span className={`badge ${badgeClass}`}>{badgeLabel}</span>
            {ev.source_name && (
              <span className="source-domain">{ev.source_name}</span>
            )}
            {ev.publisher && ev.publisher !== ev.source_name && (
              <span className="source-domain">{ev.publisher}</span>
            )}
            {(ev.publication_date || ev.retrieved_at) && (
              <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)', display: 'flex', alignItems: 'center', gap: 3 }}>
                <Clock size={10} />
                {ev.publication_date || new Date(ev.retrieved_at).toLocaleDateString()}
              </span>
            )}
          </div>
          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6, lineHeight: 1.4 }}>
            {ev.title || ev.source_name || `Evidence ${index + 1}`}
          </p>
        </div>
      </div>

      {snippet && (
        <div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {expanded ? snippet : truncated}
          </p>
          {snippet.length > 180 && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setExpanded(e => !e)}
              style={{ marginTop: 4, padding: '2px 0', fontSize: '0.75rem' }}
            >
              {expanded ? <><ChevronUp size={12} /> Show less</> : <><ChevronDown size={12} /> Read more</>}
            </button>
          )}
        </div>
      )}

      {ev.source_url && (
        <div>
          <a
            href={ev.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex' }}
          >
            <ExternalLink size={12} />
            View Source
          </a>
        </div>
      )}
    </div>
  );
}

function FeedbackSection({ analysisId }) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [comment, setComment] = useState('');

  async function submitFeedback(ratingVal) {
    setSubmitting(true);
    try {
      await apiService.submitFeedback(analysisId, ratingVal, comment);
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="alert alert-success" style={{ marginTop: 24 }}>
        <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
        Thank you for your feedback — it helps improve NewsShield_AI.
      </div>
    );
  }

  return (
    <div style={{ marginTop: 24, padding: '16px 20px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
      <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
        <MessageSquare size={14} />
        Was this analysis helpful?
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          className="input"
          placeholder="Optional comment…"
          value={comment}
          onChange={e => setComment(e.target.value)}
          style={{ flex: 1, minWidth: 200, fontSize: '0.8rem', padding: '8px 12px' }}
        />
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => submitFeedback(5)}
          disabled={submitting}
          title="Analysis was correct (5 stars)"
        >
          <ThumbsUp size={14} /> Correct
        </button>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => submitFeedback(1)}
          disabled={submitting}
          title="Analysis was incorrect (1 star)"
        >
          <ThumbsDown size={14} /> Incorrect
        </button>
      </div>
    </div>
  );
}

export default function ResultCard({ result, originalInput, onReset }) {
  const verdict = getVerdict(result.prediction);
  const confidence = result.confidence || result.probability || 0;
  const evidence = result.evidence || result.evidence_cards || result.deep_verification?.evidence_cards || [];
  const explanation = result.explanation || result.deep_verification?.explanation || '';
  const evidenceStatus = result.evidence_status || result.deep_verification?.evidence_status || '';
  const analysisId = result.analysis_id || result.id || '';
  const isLive = !!(result.override_prediction || result.deep_verification?.override_prediction || result.model_name?.includes('Consensus'));
  const signals = result.linguistic_signals || result.signals || {};
  const langMeta = result.detected_language || {};

  const verdictColors = {
    real:  { bg: 'var(--real-bg)',   border: 'var(--real-border)',   text: 'var(--real-text)',   accent: 'var(--real-accent)'   },
    fake:  { bg: 'var(--fake-bg)',   border: 'var(--fake-border)',   text: 'var(--fake-text)',   accent: 'var(--fake-accent)'   },
    mixed: { bg: 'var(--mixed-bg)',  border: 'var(--mixed-border)',  text: 'var(--mixed-text)',  accent: 'var(--mixed-accent)'  },
  };
  const vc = verdictColors[verdict];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Main verdict card ── */}
      <div
        className="card"
        style={{ background: vc.bg, borderColor: vc.border, overflow: 'hidden' }}
      >
        {/* Header strip */}
        <div style={{
          background: vc.accent,
          padding: '6px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <ShieldCheck size={14} color="white" />
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'white', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            NewsShield Analysis Result
          </span>
          {isLive && (
            <span className="live-badge" style={{ marginLeft: 'auto' }}>
              <Zap size={10} /> Live Decision Fusion
            </span>
          )}
        </div>

        <div style={{ padding: '24px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
            {/* Verdict icon + label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1 }}>
              <VerdictIcon verdict={verdict} size={40} />
              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: vc.text, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                  {result.prediction}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span>{result.model_name || 'ML Model'} · v{result.model_version || '1.0'}</span>
                  {langMeta.is_indic && (
                    <span className="badge badge-gray" style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                      <Globe size={10} /> {langMeta.language_name}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {analysisId && (
                <a
                  href={apiService.getPdfReportUrl(analysisId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                >
                  <Download size={14} /> PDF Report
                </a>
              )}
              <button className="btn btn-ghost btn-sm" onClick={onReset}>
                <RefreshCw size={14} /> Analyze Another
              </button>
            </div>
          </div>

          {/* Confidence bar */}
          <div style={{ marginTop: 20 }}>
            <ConfidenceBar value={confidence} verdict={verdict} />
          </div>

          {/* Evidence status summary */}
          {evidenceStatus && (
            <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <BarChart3 size={14} color="var(--text-muted)" />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                Evidence status:{' '}
                <strong style={{ color: 'var(--text-primary)' }}>{evidenceStatus}</strong>
              </span>
            </div>
          )}

          {/* Submitted text preview */}
          {originalInput?.text && (
            <div style={{
              marginTop: 20,
              background: 'rgba(0,0,0,0.03)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              borderLeft: `3px solid ${vc.accent}`,
            }}>
              <p style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Analyzed Text
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {originalInput.text.length > 300
                  ? originalInput.text.slice(0, 300) + '…'
                  : originalInput.text}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Explanation card ── */}
      {explanation && (
        <div className="card-padded">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <BookOpen size={16} color="var(--brand)" />
            <span className="section-label" style={{ margin: 0 }}>AI-Assisted Explanation</span>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            {explanation}
          </p>
          <div className="disclaimer" style={{ marginTop: 16 }}>
            <strong>Note:</strong> This explanation is synthesized from retrieved external evidence and trained linguistic features. It is an AI decision-support indicator, not a definitive fact check.
          </div>
        </div>
      )}

      {/* ── Model signals ── */}
      {signals && Object.keys(signals).length > 0 && (
        <div className="card-padded">
          <div className="section-label">Linguistic & Credibility Indicators</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {Object.entries(signals).map(([k, v]) => (
              <div key={k} style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '8px 14px',
              }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', marginBottom: 2, textTransform: 'capitalize' }}>
                  {k.replace(/_/g, ' ')}
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {Array.isArray(v) ? (v.length > 0 ? v.join(', ') : 'None') : (typeof v === 'number' ? (v <= 1 ? (v * 100).toFixed(0) + '%' : v) : String(v))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Evidence cards ── */}
      {evidence.length > 0 && (
        <div className="card-padded">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div className="section-label" style={{ margin: 0 }}>
              Retrieved Evidence ({evidence.length} source{evidence.length > 1 ? 's' : ''})
            </div>
            {isLive && (
              <span className="badge badge-blue">
                <Zap size={10} /> Real-time Verified
              </span>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {evidence.map((ev, i) => (
              <EvidenceCard key={ev.id || i} ev={ev} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* ── Feedback Section ── */}
      {analysisId && (
        <div className="card-padded">
          <FeedbackSection analysisId={analysisId} />
        </div>
      )}

      {/* ── Disclaimer ── */}
      <div className="disclaimer">
        <strong>NewsShield_AI Disclaimer:</strong> This analysis is AI-assisted and based on learned text patterns and, where enabled, retrieved external evidence.
        A "Likely Real" or "Likely Fake" result is <em>not</em> a guarantee of truth or falsehood.
        Always review the cited sources and apply independent judgment, especially for high-impact claims.
      </div>
    </div>
  );
}
