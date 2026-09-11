import React from 'react';

export default function ConfidenceIndicator({
  value = 0.5,
  verdict = 'mixed', // 'real' | 'fake' | 'mixed'
  label = 'Model Confidence',
  showTierExplanation = true,
  height = 8,
}) {
  const pct = Math.round((value || 0) * 100);

  let tier = 'Low confidence — treat result with caution';
  if (pct >= 85) tier = 'High confidence (Strong statistical evidence & feature alignment)';
  else if (pct >= 65) tier = 'Moderate confidence (Corroborated patterns detected)';

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
          {pct}%
        </span>
      </div>

      <div className="confidence-bar-track" style={{ height }}>
        <div
          className={`confidence-bar-fill ${verdict}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {showTierExplanation && (
        <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', marginTop: 5 }}>
          {tier}
        </div>
      )}
    </div>
  );
}
