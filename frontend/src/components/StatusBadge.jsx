import React from 'react';
import { Zap } from 'lucide-react';

export default function StatusBadge({ status = 'online', label = null, showIcon = true }) {
  const displayLabel = label || (status === 'online' ? 'Live' : status === 'offline' ? 'Offline' : 'Connecting');

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '3px 10px',
        borderRadius: 'var(--radius-full)',
        background: 'var(--bg-subtle)',
        border: '1px solid var(--border)',
        fontSize: '0.75rem',
        fontWeight: 500,
        color: 'var(--text-muted)',
      }}
      title={`System status: ${status}`}
    >
      <span className={`status-dot ${status}`} />
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        {showIcon && <Zap size={11} />}
        {displayLabel}
      </span>
    </div>
  );
}
