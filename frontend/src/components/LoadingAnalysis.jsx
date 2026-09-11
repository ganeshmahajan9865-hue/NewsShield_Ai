import React from 'react';
import { CheckCircle2, CircleDot } from 'lucide-react';

const DEFAULT_STAGES = [
  'Cleaning text & preserving negations',
  'TF-IDF sparse feature extraction',
  'Executing ML classification model',
  'Extracting factual claim propositions',
  'Querying live Google News RSS & fact-checkers',
  'Synthesizing consensus & generating explanation',
];

export default function LoadingAnalysis({ currentStage = '', stageIndex = 0, mode = 'deep' }) {
  const stages = mode === 'quick' ? DEFAULT_STAGES.slice(0, 3) : DEFAULT_STAGES;

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: 24,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div className="spinner" />
        <div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Analyzing News Credibility…
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {currentStage || stages[stageIndex] || 'Processing request'}
          </div>
        </div>
      </div>

      {/* Stage items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {stages.map((stage, i) => {
          const isDone = i < stageIndex;
          const isCurrent = i === stageIndex;

          return (
            <div
              key={stage}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontSize: '0.8rem',
                color: isDone ? 'var(--text-muted)' : isCurrent ? 'var(--brand)' : 'var(--text-faint)',
                fontWeight: isCurrent ? 600 : 400,
              }}
            >
              {isDone ? (
                <CheckCircle2 size={14} color="var(--real-accent)" style={{ flexShrink: 0 }} />
              ) : isCurrent ? (
                <CircleDot size={14} color="var(--brand)" className="pulse" style={{ flexShrink: 0 }} />
              ) : (
                <div
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    border: '1.5px solid var(--border)',
                    flexShrink: 0,
                  }}
                />
              )}
              <span>{stage}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
