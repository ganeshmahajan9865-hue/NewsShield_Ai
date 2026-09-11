import React from 'react';

export default function Button({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'ghost' | 'danger' | 'icon'
  size = 'md',        // 'sm' | 'md' | 'lg'
  loading = false,
  disabled = false,
  leftIcon = null,
  rightIcon = null,
  className = '',
  onClick,
  type = 'button',
  style = {},
  ...props
}) {
  const variantClass = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    danger: 'btn-secondary', // styled with red text
    icon: 'btn-icon',
  }[variant] || 'btn-primary';

  const sizeClass = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
  }[size] || '';

  const dangerStyle = variant === 'danger' ? { color: 'var(--fake-accent)', borderColor: 'var(--fake-border)' } : {};

  return (
    <button
      type={type}
      className={`btn ${variantClass} ${sizeClass} ${className}`.trim()}
      disabled={disabled || loading}
      onClick={onClick}
      style={{ ...dangerStyle, ...style }}
      {...props}
    >
      {loading ? (
        <>
          <div
            className="spinner"
            style={{
              width: size === 'sm' ? 12 : 16,
              height: size === 'sm' ? 12 : 16,
              borderColor: variant === 'primary' ? 'rgba(255,255,255,0.3)' : 'var(--border)',
              borderTopColor: variant === 'primary' ? '#fff' : 'var(--brand)',
            }}
          />
          <span>{children || 'Loading…'}</span>
        </>
      ) : (
        <>
          {leftIcon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{leftIcon}</span>}
          {children}
          {rightIcon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{rightIcon}</span>}
        </>
      )}
    </button>
  );
}
