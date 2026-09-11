import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({
  message,
  type = 'info', // 'success' | 'error' | 'info'
  onClose,
  duration = 4000,
}) {
  useEffect(() => {
    if (duration && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  if (!message) return null;

  const bg = {
    success: 'var(--real-bg)',
    error: 'var(--fake-bg)',
    info: 'var(--bg-surface)',
  }[type] || 'var(--bg-surface)';

  const border = {
    success: 'var(--real-border)',
    error: 'var(--fake-border)',
    info: 'var(--border)',
  }[type] || 'var(--border)';

  const icon = {
    success: <CheckCircle2 size={16} color="var(--real-accent)" />,
    error: <AlertCircle size={16} color="var(--fake-accent)" />,
    info: <Info size={16} color="var(--brand)" />,
  }[type];

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 1000,
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 'var(--radius-md)',
        padding: '12px 16px',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        maxWidth: 360,
        fontSize: '0.85rem',
        color: 'var(--text-primary)',
        animation: 'slideUp 0.2s ease-out',
      }}
    >
      {icon}
      <span style={{ flex: 1 }}>{message}</span>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'var(--text-muted)' }}
          aria-label="Close notification"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
