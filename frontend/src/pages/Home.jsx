import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, Zap, SearchCheck, Globe, FileText,
  ArrowRight, CheckCircle2, BarChart3, Clock, Users
} from 'lucide-react';

const FEATURES = [
  {
    icon: <Zap size={22} color="var(--brand)" />,
    title: 'Quick ML Analysis',
    desc: 'Fast TF-IDF + Logistic Regression classification returning a calibrated confidence score in under 2 seconds.',
  },
  {
    icon: <SearchCheck size={22} color="var(--real-accent)" />,
    title: 'Deep Verification',
    desc: 'Claim extraction + real-time evidence retrieval from Google News, fact-checkers, and trusted publications.',
  },
  {
    icon: <Globe size={22} color="var(--mixed-accent)" />,
    title: 'URL Article Analysis',
    desc: 'Paste a news article URL and the system fetches and analyzes the content automatically.',
  },
  {
    icon: <FileText size={22} color="var(--fake-accent)" />,
    title: 'PDF Verification Report',
    desc: 'Export a structured report with prediction, evidence, sources, and disclaimer for sharing.',
  },
];

const STATS = [
  { value: '98.4%', label: 'ML Accuracy', sub: 'On evaluation dataset' },
  { value: '50+',   label: 'Trusted Domains', sub: 'In source credibility index' },
  { value: '2',     label: 'Analysis Modes', sub: 'Quick & Deep Verification' },
  { value: '3',     label: 'Languages',  sub: 'EN, HI, MR (advanced)' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Submit News',    desc: 'Paste a headline, article, or URL into the analyzer.' },
  { step: '02', title: 'NLP Processing', desc: 'Text is cleaned, tokenized, and converted to TF-IDF features.' },
  { step: '03', title: 'ML Prediction',  desc: 'Logistic Regression model classifies: Likely Real or Likely Fake.' },
  { step: '04', title: 'Evidence Search', desc: 'Claims are extracted and matched against live news sources.' },
  { step: '05', title: 'Results',        desc: 'Verdict, confidence score, evidence cards, and AI explanation.' },
];

export default function Home({ setActiveTab }) {
  const navigate = useNavigate();
  const go = (path, tab) => {
    if (navigate) navigate(path);
    if (setActiveTab) setActiveTab(tab);
  };

  return (
    <div>
      {/* ── Hero ── */}
      <section style={{
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)',
        padding: '72px 24px 60px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'var(--brand-light)',
            color: 'var(--brand)',
            border: '1px solid var(--brand-border)',
            borderRadius: 'var(--radius-full)',
            padding: '4px 14px',
            fontSize: '0.8rem',
            fontWeight: 600,
            marginBottom: 24,
          }}>
            <ShieldCheck size={14} />
            AI-Powered News Credibility Platform
          </div>

          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.25rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: 'var(--text-primary)',
            lineHeight: 1.15,
            marginBottom: 20,
          }}>
            Analyze. Verify.<br />
            <span style={{ color: 'var(--brand)' }}>Stay Informed.</span>
          </h1>

          <p style={{
            fontSize: '1.1rem',
            color: 'var(--text-muted)',
            lineHeight: 1.7,
            marginBottom: 36,
          }}>
            NewsShield_AI uses machine learning and real-time evidence retrieval to help you evaluate
            the credibility of news headlines, articles, and claims.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary btn-lg"
              onClick={() => go('/analyze', 'analyze')}
            >
              Start Analyzing
              <ArrowRight size={18} />
            </button>
            <button
              className="btn btn-secondary btn-lg"
              onClick={() => go('/about', 'about')}
            >
              How It Works
            </button>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section style={{
        background: 'var(--bg-base)',
        borderBottom: '1px solid var(--border)',
        padding: '28px 24px',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div className="grid-4">
            {STATS.map(s => (
              <div key={s.label} style={{ textAlign: 'center', padding: '8px' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand)', letterSpacing: '-0.02em' }}>
                  {s.value}
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{s.label}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: '64px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.025em', marginBottom: 10 }}>
              What NewsShield_AI Does
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: 540, margin: '0 auto' }}>
              A layered analysis pipeline: fast ML classification supplemented by real-time evidence retrieval.
            </p>
          </div>
          <div className="grid-2">
            {FEATURES.map(f => (
              <div key={f.title} className="card-padded">
                <div style={{
                  width: 44,
                  height: 44,
                  background: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 14,
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works (steps) ── */}
      <section style={{ padding: '48px 24px 64px', background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.025em', marginBottom: 36, textAlign: 'center' }}>
            How It Works
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {HOW_IT_WORKS.map((s, i) => (
              <div key={s.step} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 20,
                paddingBottom: i < HOW_IT_WORKS.length - 1 ? 28 : 0,
                marginBottom: i < HOW_IT_WORKS.length - 1 ? 0 : 0,
                position: 'relative',
              }}>
                {/* Step number + connector line */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: 'var(--brand)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    flexShrink: 0,
                  }}>
                    {s.step}
                  </div>
                  {i < HOW_IT_WORKS.length - 1 && (
                    <div style={{ width: 2, flex: 1, background: 'var(--border)', minHeight: 28, marginTop: 4 }} />
                  )}
                </div>
                <div style={{ paddingTop: 8, flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: 4 }}>
                    {s.title}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    {s.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <button className="btn btn-primary btn-lg" onClick={() => go('/analyze', 'analyze')}>
              Try It Now <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* ── Disclaimer ── */}
      <section style={{ padding: '36px 24px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div className="disclaimer">
            <strong>Responsible AI Disclaimer:</strong> NewsShield_AI provides AI-assisted credibility analysis based on
            learned text patterns and, where enabled, retrieved evidence. A "Likely Real" or "Likely Fake" result is
            not a guarantee of truth or falsehood. Users should review cited sources and apply independent judgment,
            especially for high-impact claims. The system is designed to support — not replace — critical human thinking.
          </div>
        </div>
      </section>
    </div>
  );
}
