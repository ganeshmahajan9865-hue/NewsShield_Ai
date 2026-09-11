import React from 'react';

export default function StatCard({
  value = '—',
  label,
  sub = null,
  color = 'var(--text-primary)',
  icon = null,
  trend = null,
}) {
  return (
    <div className="stat-card">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        {icon && (
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </div>
        )}
        {trend && (
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--real-accent)' }}>
            {trend}
          </span>
        )}
      </div>

      <div className="stat-value" style={{ color }}>{value}</div>
      <div className="stat-label">{label}</div>
      {sub && <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}
