import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Zap, Shield } from 'lucide-react';

export default function Badge({
  children,
  variant = 'gray', // 'real' | 'fake' | 'mixed' | 'blue' | 'gray' | 'live'
  icon = null,
  size = 'md',      // 'sm' | 'md'
  style = {},
  className = '',
}) {
  const variantClass = {
    real: 'badge-real',
    fake: 'badge-fake',
    mixed: 'badge-mixed',
    blue: 'badge-blue',
    gray: 'badge-gray',
    live: 'live-badge',
  }[variant] || 'badge-gray';

  // Default icons for known variants if none provided
  let defaultIcon = null;
  if (!icon) {
    if (variant === 'real') defaultIcon = <CheckCircle2 size={11} />;
    else if (variant === 'fake') defaultIcon = <XCircle size={11} />;
    else if (variant === 'mixed') defaultIcon = <AlertTriangle size={11} />;
    else if (variant === 'live') defaultIcon = <Zap size={10} />;
  }

  const finalIcon = icon || defaultIcon;

  return (
    <span
      className={`badge ${variantClass} ${className}`.trim()}
      style={{
        fontSize: size === 'sm' ? '0.7rem' : '0.75rem',
        padding: size === 'sm' ? '2px 8px' : '3px 10px',
        ...style,
      }}
    >
      {finalIcon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{finalIcon}</span>}
      <span>{children}</span>
    </span>
  );
}
