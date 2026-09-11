import React from 'react';
import { Zap, SearchCheck } from 'lucide-react';

export default function AnalysisModeSelector({ mode = 'deep', onChange, disabled = false }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>
        Analysis Mode
      </div>
      <div className="mode-selector">
        <button
          type="button"
          className={`mode-btn${mode === 'quick' ? ' active' : ''}`}
          onClick={() => onChange('quick')}
          disabled={disabled}
        >
          <Zap size={14} />
          <span>Quick Analysis</span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)', fontWeight: 400 }}>(~1s)</span>
        </button>
        <button
          type="button"
          className={`mode-btn${mode === 'deep' ? ' active' : ''}`}
          onClick={() => onChange('deep')}
          disabled={disabled}
        >
          <SearchCheck size={14} />
          <span>Deep Verification</span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)', fontWeight: 400 }}>(~8s)</span>
        </button>
      </div>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8 }}>
        {mode === 'quick'
          ? 'Fast ML classification using TF-IDF feature extraction and trained Logistic Regression model.'
          : 'Full multi-source verification: ML model + claim extraction + live search across Google News RSS & fact-checkers.'}
      </p>
    </div>
  );
}
