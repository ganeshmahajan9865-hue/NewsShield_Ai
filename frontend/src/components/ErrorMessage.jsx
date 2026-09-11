import React from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle2, X } from 'lucide-react';

export default function ErrorMessage({
  type = 'error', // 'error' | 'warn' | 'info' | 'success'
  title = null,
  message,
  onDismiss = null,
  style = {},
}) {
  if (!message) return null;

  const typeClass = {
    error: 'alert-error',
    warn: 'alert-warn',
    info: 'alert-info',
    success: 'alert-success',
  }[type] || 'alert-error';

  const defaultIcon = {
    error: <AlertCircle size={16} style={{ flexShrink: 0 }} />,
    warn: <AlertTriangle size={16} style={{ flexShrink: 0 }} />,
    info: <Info size={16} style={{ flexShrink: 0 }} />,
    success: <CheckCircle2 size={16} style={{ flexShrink: 0 }} />,
  }[type];

  return (
    <div className={`alert ${typeClass}`} style={{ position: 'relative', ...style }}>
      {defaultIcon}
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && <strong>{title}</strong>}
        <div style={{ marginTop: title ? 2 : 0, fontSize: '0.85rem' }}>
          {message}
        </div>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 2,
            color: 'inherit',
            opacity: 0.7,
          }}
          aria-label="Dismiss alert"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
