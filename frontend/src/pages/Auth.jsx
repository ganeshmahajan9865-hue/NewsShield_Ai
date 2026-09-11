import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, User, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { authService } from '../services/auth';

export default function Auth({ initialMode = 'login', onAuthSuccess, onSwitchMode }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    if (mode === 'register') {
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === 'register') {
        const res = await authService.signUp(email.trim(), password, name.trim());
        if (res.access_token) {
          setSuccessMsg('Account created successfully!');
          if (onAuthSuccess) onAuthSuccess(res.user);
        } else {
          setSuccessMsg('Registration submitted! Please check your email to confirm your account.');
        }
      } else {
        const res = await authService.signIn(email.trim(), password);
        setSuccessMsg('Signed in successfully!');
        if (onAuthSuccess) onAuthSuccess(res.user);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="container-narrow" style={{ maxWidth: 440 }}>
        {/* Auth card */}
        <div className="card-padded" style={{ boxShadow: 'var(--shadow-md)' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{
              width: 44,
              height: 44,
              background: 'var(--brand-light)',
              borderRadius: 'var(--radius-md)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
            }}>
              <ShieldCheck size={24} color="var(--brand)" />
            </div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 6 }}>
              {mode === 'login' ? 'Sign In to NewsShield' : 'Create an Account'}
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {mode === 'login'
                ? 'Access your private verification history and saved reports.'
                : 'Join to track news analyses, save evidence, and monitor claims.'}
            </p>
          </div>

          {/* Mode switch buttons */}
          <div className="mode-selector" style={{ marginBottom: 20 }}>
            <button
              type="button"
              className={`mode-btn${mode === 'login' ? ' active' : ''}`}
              onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`mode-btn${mode === 'register' ? ' active' : ''}`}
              onClick={() => { setMode('register'); setError(''); setSuccessMsg(''); }}
            >
              Register
            </button>
          </div>

          {/* Alert messages */}
          {error && (
            <div className="alert alert-error" style={{ marginBottom: 16 }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="alert alert-success" style={{ marginBottom: 16 }}>
              <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {mode === 'register' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. Jane Doe"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    style={{ paddingLeft: 36 }}
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
                <input
                  type="email"
                  className="input"
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{ paddingLeft: 36 }}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
                <input
                  type="password"
                  className="input"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ paddingLeft: 36 }}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Confirm Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
                  <input
                    type="password"
                    className="input"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    style={{ paddingLeft: 36 }}
                    disabled={loading}
                    required
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: 8 }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)', width: 16, height: 16 }} />
                  Processing…
                </>
              ) : (
                <>
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* Privacy & guest note */}
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)', textAlign: 'center' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-faint)', lineHeight: 1.5 }}>
              Secured with Supabase Authentication & PostgreSQL Row-Level Security.
              Your data remains private.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
