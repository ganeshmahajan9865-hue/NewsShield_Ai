import React from 'react';
import { CheckCircle2, Search, ArrowRight } from 'lucide-react';
import Badge from './Badge';

export default function ClaimCard({ claim, index, status = 'Extracted' }) {
  if (!claim) return null;

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: '14px 16px',
        marginBottom: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: 'var(--brand-light)',
            color: 'var(--brand)',
            fontSize: '0.7rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {index != null ? index + 1 : '•'}
          </span>
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Extracted Factual Proposition
          </span>
        </div>
        <Badge variant="blue" size="sm">{status}</Badge>
      </div>

      <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.5 }}>
        "{claim}"
      </p>
    </div>
  );
}
