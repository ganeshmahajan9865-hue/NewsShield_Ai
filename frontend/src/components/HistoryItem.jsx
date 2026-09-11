import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Clock, ChevronRight } from 'lucide-react';
import Badge from './Badge';

export default function HistoryItem({ item, onClick }) {
  if (!item) return null;

  const verdict = (item.prediction || '').toLowerCase();
  const isReal = verdict.includes('real');
  const isFake = verdict.includes('fake');
  const badgeVariant = isReal ? 'real' : isFake ? 'fake' : 'mixed';
  const textPreview = (item.news_text || item.text || item.url || '').slice(0, 110);
  const timestamp = item.created_at ? new Date(item.created_at) : null;

  return (
    <div
      className="history-item"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick && onClick()}
      aria-label={`View analysis: ${textPreview}`}
    >
      <div style={{ flexShrink: 0, marginTop: 2 }}>
        {isReal ? (
          <CheckCircle2 size={18} color="var(--real-accent)" />
        ) : isFake ? (
          <XCircle size={18} color="var(--fake-accent)" />
        ) : (
          <AlertTriangle size={18} color="var(--mixed-accent)" />
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
          <Badge variant={badgeVariant} size="sm">{item.prediction}</Badge>
          {timestamp && (
            <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)', display: 'flex', alignItems: 'center', gap: 3 }}>
              <Clock size={10} />
              {timestamp.toLocaleString()}
            </span>
          )}
          {item.model_name && (
            <Badge variant="gray" size="sm">{item.model_name}</Badge>
          )}
          {item.confidence != null && (
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {Math.round(item.confidence * 100)}%
            </span>
          )}
        </div>

        <p style={{
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.4,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {textPreview || '(No text preview)'}
        </p>
      </div>

      <ChevronRight size={16} color="var(--text-faint)" style={{ flexShrink: 0 }} />
    </div>
  );
}
