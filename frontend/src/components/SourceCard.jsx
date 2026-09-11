import React from 'react';
import { Globe, Shield, ExternalLink } from 'lucide-react';
import Badge from './Badge';

export default function SourceCard({ domain, publisher, tier = 'Standard', count = 1 }) {
  const tierColor = {
    FactCheck: 'var(--fake-accent)',
    Official: 'var(--real-accent)',
    High: 'var(--brand)',
    Standard: 'var(--text-muted)',
  }[tier] || 'var(--text-muted)';

  const tierBadgeVariant = {
    FactCheck: 'fake',
    Official: 'real',
    High: 'blue',
    Standard: 'gray',
  }[tier] || 'gray';

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: tierColor,
          }}
        >
          <Globe size={16} />
        </div>
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {publisher || domain}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
            {domain}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Badge variant={tierBadgeVariant} size="sm">{tier} Tier</Badge>
        {count > 1 && (
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {count} reports
          </span>
        )}
      </div>
    </div>
  );
}
