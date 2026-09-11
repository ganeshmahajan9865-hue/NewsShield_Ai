import React from 'react';
import { FileQuestion } from 'lucide-react';
import Button from './Button';

export default function EmptyState({
  icon = null,
  title = 'No records found',
  description = 'There is no data to display at this time.',
  actionLabel = null,
  onAction = null,
  style = {},
}) {
  return (
    <div className="empty-state" style={style}>
      <div className="empty-state-icon">
        {icon || <FileQuestion size={24} />}
      </div>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
        {title}
      </h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: 400, margin: '0 auto 16px', lineHeight: 1.5 }}>
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
