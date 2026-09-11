import React from 'react';
import {
  ShieldCheck, Cpu, Globe, Database, FileText,
  AlertTriangle, ArrowRight, BookOpen, Code2, Server
} from 'lucide-react';

const ARCHITECTURE = [
  {
    layer: 'React Frontend',
    icon: <Code2 size={18} color="var(--brand)" />,
    items: [
      'User submits news text, headline, or URL',
      'Mode selection: Quick Analysis or Deep Verification',
      'Sends request to FastAPI backend via REST API',
      'Displays verdict, confidence, evidence, and explanation',
    ],
  },
  {
    layer: 'FastAPI Backend',
    icon: <Server size={18} color="var(--mixed-accent)" />,
    items: [
      'Input validation and request sanitization',
      'NLP preprocessing: normalize, tokenize, handle negations',
      'TF-IDF vectorization using saved vectorizer',
      'ML model prediction (Logistic Regression)',
      'Routes to claim extraction + evidence retrieval in Deep mode',
    ],
  },
  {
    layer: 'NLP & ML Pipeline',
    icon: <Cpu size={18} color="var(--real-accent)" />,
    items: [
      'Text normalization: lowercase, remove HTML/URLs',
      'Tokenization and stop-word handling',
      'TF-IDF: ngram (1,2), 8000 features, sublinear TF',
      'LogisticRegression (C=1.5, solver=liblinear)',
      'Calibrated probability output → confidence score',
    ],
  },
  {
    layer: 'RAG Evidence Layer',
    icon: <Globe size={18} color="var(--fake-accent)" />,
    items: [
      'Claim extraction: subject + predicate anchor terms',
      'Primary: Google News RSS (real-time, no rate limits)',
      'Fallback: DuckDuckGo text search',
      '50+ domain credibility dictionary',
      'Phrase-based debunk detection (DEBUNK_PHRASES list)',
      'Multi-outlet corroboration scoring',
    ],
  },
  {
    layer: 'Database (Supabase + SQLite)',
    icon: <Database size={18} color="var(--brand)" />,
    items: [
      'Supabase PostgreSQL: analysis history and evidence',
      'Local SQLite: dual-sync fallback for offline mode',
      'Row-Level Security (RLS) policies on all tables',
      'Tables: analyses, evidence, feedback, model_versions',
    ],
  },
];

const LIMITATIONS = [
  'The ML model is trained on a synthetic 320-record dataset. Real-world performance may vary.',
  'Deep Verification relies on public news availability. Obscure or local claims may lack evidence.',
  'The system cannot guarantee factual truth — it identifies linguistic patterns associated with credibility.',
  '"Likely Real" does not mean the content is verified truth. Always cross-check with trusted sources.',
  'URL extraction may fail for JavaScript-heavy, paywalled, or geographically restricted articles.',
  'Language support is primarily English. Hindi/Marathi support is experimental.',
];

export default function About() {
  return (
    <div className="page">
      <div className="container-narrow">
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">How NewsShield_AI Works</h1>
          <p className="page-subtitle">
            System architecture, analysis pipeline, and responsible AI principles
          </p>
        </div>

        {/* Product intro */}
        <div className="card-padded" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <ShieldCheck size={20} color="var(--brand)" />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              What is NewsShield_AI?
            </h2>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 12 }}>
            NewsShield_AI is a full-stack AI/ML web platform for analyzing the credibility of news articles,
            headlines, and claims. It uses Natural Language Processing (NLP), TF-IDF feature extraction,
            and supervised machine learning (Logistic Regression) to classify submitted text as{' '}
            <strong>Likely Real</strong> or <strong>Likely Fake</strong>.
          </p>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            In Deep Verification mode, the system goes further: it extracts important factual claims,
            searches real-time news sources (Google News RSS, fact-checkers), and generates an
            evidence-grounded explanation using a RAG (Retrieval-Augmented Generation) pipeline.
          </p>
        </div>

        {/* Architecture walkthrough */}
        <div className="card-padded" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
            <BookOpen size={16} color="var(--brand)" />
            <span className="section-label" style={{ margin: 0 }}>System Architecture</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            {ARCHITECTURE.map((layer, i) => (
              <div key={layer.layer}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{
                    width: 36, height: 36, background: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {layer.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {layer.layer}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>Layer {i + 1}</div>
                  </div>
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6, paddingLeft: 46 }}>
                  {layer.items.map((item, j) => (
                    <li key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <ArrowRight size={13} color="var(--text-faint)" style={{ flexShrink: 0, marginTop: 3 }} />
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item}</span>
                    </li>
                  ))}
                </ul>
                {i < ARCHITECTURE.length - 1 && (
                  <div style={{
                    width: 2, height: 20, background: 'var(--border)',
                    margin: '16px 0 0 17px',
                  }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* End-to-end flow */}
        <div className="card-padded" style={{ marginBottom: 20 }}>
          <div className="section-label">End-to-End Flow</div>
          <div style={{
            background: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.78rem',
            color: 'var(--text-secondary)',
            lineHeight: 2,
          }}>
            <div>User Input</div>
            <div style={{ paddingLeft: 16, color: 'var(--text-faint)' }}>↓</div>
            <div>React Frontend → FastAPI /analyze</div>
            <div style={{ paddingLeft: 16, color: 'var(--text-faint)' }}>↓</div>
            <div>NLP Preprocessing → TF-IDF Vectorizer</div>
            <div style={{ paddingLeft: 16, color: 'var(--text-faint)' }}>↓</div>
            <div>LogisticRegression → Prediction + Confidence</div>
            <div style={{ paddingLeft: 16, color: 'var(--text-faint)' }}>↓ (Deep mode)</div>
            <div>Claim Extraction → Google News RSS Query</div>
            <div style={{ paddingLeft: 16, color: 'var(--text-faint)' }}>↓</div>
            <div>Credibility Scoring + Debunk Detection</div>
            <div style={{ paddingLeft: 16, color: 'var(--text-faint)' }}>↓</div>
            <div>Final Verdict (ML + RAG fusion)</div>
            <div style={{ paddingLeft: 16, color: 'var(--text-faint)' }}>↓</div>
            <div>Supabase / SQLite history storage</div>
            <div style={{ paddingLeft: 16, color: 'var(--text-faint)' }}>↓</div>
            <div>React Result Display + Evidence Cards</div>
          </div>
        </div>

        {/* Limitations */}
        <div className="card-padded" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <AlertTriangle size={16} color="var(--mixed-accent)" />
            <span className="section-label" style={{ margin: 0 }}>Known Limitations</span>
          </div>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 10, listStyle: 'none' }}>
            {LIMITATIONS.map((l, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span style={{
                  width: 20, height: 20, borderRadius: '50%', background: 'var(--mixed-bg)',
                  border: '1px solid var(--mixed-border)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, color: 'var(--mixed-text)',
                  flexShrink: 0,
                }}>!</span>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{l}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Tech stack */}
        <div className="card-padded" style={{ marginBottom: 20 }}>
          <div className="section-label">Technology Stack</div>
          <div className="grid-2">
            {[
              ['Frontend', 'React 19 + Vite 8 + Plain CSS'],
              ['Backend', 'Python FastAPI + Uvicorn'],
              ['ML', 'Scikit-learn (LogisticRegression, SVM, NB)'],
              ['NLP', 'NLTK + custom preprocessing'],
              ['Features', 'TF-IDF (Scikit-learn)'],
              ['Evidence', 'Google News RSS + DuckDuckGo'],
              ['Database', 'Supabase PostgreSQL + SQLite fallback'],
              ['Auth', 'Supabase Auth + RLS policies'],
              ['Reports', 'ReportLab PDF generation'],
              ['Testing', 'Pytest (11 tests)'],
            ].map(([label, value]) => (
              <div key={label} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Responsible AI */}
        <div className="disclaimer">
          <strong>Responsible AI Principle:</strong> NewsShield_AI is designed as an AI-assisted credibility
          decision-support tool, not an authoritative fact-checker. The system does not claim that a machine
          learning classifier alone can determine whether a claim is factually true or false.
          Users are encouraged to review cited sources, examine the evidence, and apply critical human judgment.
          The product is intentionally transparent about model limitations, confidence calibration, and the
          boundaries of automated news analysis.
        </div>
      </div>
    </div>
  );
}
