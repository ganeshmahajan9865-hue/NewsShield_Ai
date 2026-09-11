import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Calendar, LogOut, ArrowRight, FileText } from 'lucide-react';
import { authService } from '../services/auth';

export default function Profile({ onLogout, onNavigateHistory }) {
  const [user, setUser] = useState(authService.getCurrentUser());

  useEffect(() => {
    const unsub = authService.onAuthStateChange(u => setUser(u));
    return unsub;
  }, []);

  async function handleLogout() {
    await authService.signOut();
    if (onLogout) onLogout();
  }

  if (!user) {
    return (
      <div className="page">
        <div className="container-narrow" style={{ textAlign: 'center', padding: '60px 24px' }}>
          <User size={48} color="var(--text-faint)" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 8 }}>Not Signed In</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 20 }}>
            Sign in to access your personal profile and saved analyses.
          </p>
        </div>
      </div>
    );
  }

  const role = user.app_metadata?.role || user.user_metadata?.role || 'Authenticated User';
  const name = user.user_metadata?.name || user.email?.split('@')[0] || 'User';
  const joinedDate = user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Active Member';

  return (
    <div className="page">
      <div className="container-narrow" style={{ maxWidth: 580 }}>
        <div className="page-header">
          <h1 className="page-title">User Profile</h1>
          <p className="page-subtitle">Your credentials and account information</p>
        </div>

        <div className="card-padded" style={{ marginBottom: 20 }}>
          {/* Avatar & Name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
            <div style={{
              width: 54,
              height: 54,
              borderRadius: '50%',
              background: 'var(--brand)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
              fontWeight: 800,
            }}>
              {name[0].toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>{name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.email}</div>
            </div>
            <span className="badge badge-blue" style={{ marginLeft: 'auto' }}>
              <Shield size={11} /> {role}
            </span>
          </div>

          {/* Account Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Mail size={14} /> Email
              </span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user.email}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Shield size={14} /> Account Role
              </span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{role}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Calendar size={14} /> Member Since
              </span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{joinedDate}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>User ID</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-faint)' }}>
                {user.id}
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            {onNavigateHistory && (
              <button className="btn btn-secondary btn-sm" onClick={onNavigateHistory}>
                <FileText size={14} /> View My Analyses
              </button>
            )}
            <button className="btn btn-ghost btn-sm" onClick={handleLogout} style={{ color: 'var(--fake-accent)', marginLeft: 'auto' }}>
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>

        {/* Responsible AI & Privacy note */}
        <div className="disclaimer">
          <strong>Account Privacy:</strong> Your analyses and verification queries are securely indexed with your unique ID and isolated via Row-Level Security policies.
        </div>
      </div>
    </div>
  );
}
