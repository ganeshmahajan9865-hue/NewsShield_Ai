import React from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Analyze from './pages/Analyze';
import History from './pages/History';
import Dashboard from './pages/Dashboard';
import ModelInfo from './pages/ModelInfo';
import About from './pages/About';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Result from './pages/Result';
import NotFound from './pages/NotFound';
import { ShieldCheck } from 'lucide-react';

function AppLayout() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/analyze" element={<Analyze />} />
          <Route path="/history" element={<History />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/model-info" element={<ModelInfo />} />
          <Route path="/about" element={<About />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/result/:id" element={<Result />} />
          <Route path="/login" element={<Auth initialMode="login" onAuthSuccess={() => navigate('/')} />} />
          <Route path="/register" element={<Auth initialMode="register" onAuthSuccess={() => navigate('/')} />} />
          <Route path="/profile" element={<Profile onLogout={() => navigate('/')} onNavigateHistory={() => navigate('/history')} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <footer className="footer">
        <div className="footer-inner">
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 28, height: 28, background: 'var(--brand)',
              borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ShieldCheck size={15} color="white" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                NewsShield<span style={{ color: 'var(--brand)' }}>_AI</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                AI-Powered News Credibility & Evidence Analysis Platform
              </div>
            </div>
          </div>

          {/* Nav links */}
          <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
            {[
              { to: '/analyze',    label: 'Analyze' },
              { to: '/history',    label: 'History' },
              { to: '/dashboard',  label: 'Dashboard' },
              { to: '/model-info', label: 'Model Info' },
              { to: '/about',      label: 'How It Works' },
              { to: '/settings',   label: 'Settings' },
            ].map(item => (
              <Link
                key={item.to}
                to={item.to}
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  textDecoration: 'none',
                }}
                onMouseOver={e => e.target.style.color = 'var(--brand)'}
                onMouseOut={e => e.target.style.color = 'var(--text-muted)'}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Tagline + version */}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>
              PRD v1.0 · Responsible AI · September 2026
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', marginTop: 2 }}>
              Analyze. Verify. Stay Informed.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
