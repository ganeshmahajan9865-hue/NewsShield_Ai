import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Menu, X, Zap, User, LogIn } from 'lucide-react';
import { apiService } from '../services/api';
import { authService } from '../services/auth';

const NAV_ITEMS = [
  { path: '/',           label: 'Home' },
  { path: '/analyze',    label: 'Analyze' },
  { path: '/history',    label: 'History' },
  { path: '/dashboard',  label: 'Dashboard' },
  { path: '/model-info', label: 'Model Info' },
  { path: '/about',      label: 'How It Works' },
  { path: '/settings',   label: 'Settings' },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking'); // checking | online | offline
  const [user, setUser] = useState(authService.getCurrentUser());

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    const unsub = authService.onAuthStateChange(u => setUser(u));
    return () => {
      clearInterval(interval);
      unsub();
    };
  }, []);

  async function checkHealth() {
    try {
      await apiService.getHealth();
      setBackendStatus('online');
    } catch {
      setBackendStatus('offline');
    }
  }

  function handleNav(path) {
    navigate(path);
    setMenuOpen(false);
  }

  const currentPath = location.pathname;

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="navbar-inner">
        {/* Logo */}
        <button
          className="navbar-logo"
          onClick={() => handleNav('/')}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          aria-label="NewsShield_AI — go to home"
        >
          <div className="navbar-logo-icon">
            <ShieldCheck size={18} />
          </div>
          <span className="navbar-logo-text">NewsShield<span style={{ color: 'var(--brand)' }}>_AI</span></span>
        </button>

        {/* Desktop Nav */}
        <ul className={`navbar-nav${menuOpen ? ' open' : ''}`} role="list">
          {NAV_ITEMS.map(item => (
            <li key={item.path}>
              <button
                className={`nav-link${currentPath === item.path ? ' active' : ''}`}
                onClick={() => handleNav(item.path)}
                aria-current={currentPath === item.path ? 'page' : undefined}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>

        {/* Right actions */}
        <div className="navbar-actions">
          {/* Backend status indicator */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border)',
              fontSize: '0.75rem',
              fontWeight: 500,
              color: 'var(--text-muted)',
            }}
            title={`API ${backendStatus}`}
          >
            <span className={`status-dot ${backendStatus}`} />
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Zap size={11} />
              {backendStatus === 'online' ? 'Live' : backendStatus === 'offline' ? 'Offline' : '...'}
            </span>
          </div>

          {/* Auth Button (Sign In / User Profile) */}
          {user ? (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => handleNav('/profile')}
              title={`Logged in as ${user.email}`}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <User size={13} color="var(--brand)" />
              <span style={{ maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.user_metadata?.name || user.email?.split('@')[0]}
              </span>
            </button>
          ) : (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => handleNav('/login')}
              style={{ display: 'flex', alignItems: 'center', gap: 5 }}
            >
              <LogIn size={13} />
              <span>Sign In</span>
            </button>
          )}

          {/* Primary CTA */}
          <button
            className="btn btn-primary btn-sm"
            onClick={() => handleNav('/analyze')}
          >
            <span>Analyze</span>
          </button>

          {/* Mobile toggle */}
          <button
            className="nav-toggle"
            onClick={() => setMenuOpen(o => !o)}
            aria-expanded={menuOpen}
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
