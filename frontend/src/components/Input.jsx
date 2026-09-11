import React from 'react';

export default function Input({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  helperText,
  disabled = false,
  required = false,
  icon = null,
  isTextArea = false,
  rows = 4,
  style = {},
  className = '',
  ...props
}) {
  return (
    <div style={{ width: '100%', marginBottom: 14 }}>
      {label && (
        <label
          htmlFor={id}
          style={{
            display: 'block',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            marginBottom: 6,
          }}
        >
          {label} {required && <span style={{ color: 'var(--fake-accent)' }}>*</span>}
        </label>
      )}

      <div style={{ position: 'relative' }}>
        {icon && (
          <span
            style={{
              position: 'absolute',
              left: 12,
              top: isTextArea ? 14 : '50%',
              transform: isTextArea ? 'none' : 'translateY(-50%)',
              color: 'var(--text-faint)',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none',
            }}
          >
            {icon}
          </span>
        )}

        {isTextArea ? (
          <textarea
            id={id}
            className={`input ${className}`.trim()}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            disabled={disabled}
            rows={rows}
            style={{
              paddingLeft: icon ? 38 : 14,
              borderColor: error ? 'var(--fake-border)' : undefined,
              ...style,
            }}
            {...props}
          />
        ) : (
          <input
            id={id}
            type={type}
            className={`input ${className}`.trim()}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            disabled={disabled}
            style={{
              paddingLeft: icon ? 38 : 14,
              borderColor: error ? 'var(--fake-border)' : undefined,
              ...style,
            }}
            {...props}
          />
        )}
      </div>

      {error ? (
        <p style={{ fontSize: '0.75rem', color: 'var(--fake-accent)', marginTop: 4 }}>
          {error}
        </p>
      ) : helperText ? (
        <p style={{ fontSize: '0.75rem', color: 'var(--text-faint)', marginTop: 4 }}>
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
