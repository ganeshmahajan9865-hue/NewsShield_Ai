import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Database, Globe, Sliders, Trash2, CheckCircle2, Shield } from 'lucide-react';
import Button from '../components/Button';
import Badge from '../components/Badge';
import Toast from '../components/Toast';

export default function Settings() {
  const [defaultMode, setDefaultMode] = useState(
    () => localStorage.getItem('newsshield_default_mode') || 'deep'
  );
  const [prefLanguage, setPrefLanguage] = useState(
    () => localStorage.getItem('newsshield_pref_lang') || 'en'
  );
  const [toastMsg, setToastMsg] = useState('');

  function handleSaveSettings(e) {
    e.preventDefault();
    localStorage.setItem('newsshield_default_mode', defaultMode);
    localStorage.setItem('newsshield_pref_lang', prefLanguage);
    setToastMsg('Settings saved successfully!');
  }

  function handleClearCache() {
    if (window.confirm('Clear all locally cached analysis drafts and form inputs?')) {
      localStorage.removeItem('newsshield_draft_input');
      setToastMsg('Local analysis draft cache cleared.');
    }
  }

  return (
    <div className="page">
      <div className="container-narrow" style={{ maxWidth: 640 }}>
        {toastMsg && (
          <Toast
            message={toastMsg}
            type="success"
            onClose={() => setToastMsg('')}
          />
        )}

        <div className="page-header">
          <h1 className="page-title">Platform Settings</h1>
          <p className="page-subtitle">Configure your default analysis preferences and data management</p>
        </div>

        <form onSubmit={handleSaveSettings}>
          {/* Preferences Card */}
          <div className="card-padded" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Sliders size={16} color="var(--brand)" />
              <span className="section-label" style={{ margin: 0 }}>Analysis Preferences</span>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                Default Verification Mode
              </label>
              <select
                className="input"
                value={defaultMode}
                onChange={e => setDefaultMode(e.target.value)}
              >
                <option value="deep">Deep Verification (ML + Live Google News RAG)</option>
                <option value="quick">Quick Analysis (Fast TF-IDF + LogisticRegression only)</option>
              </select>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                Selected mode will be pre-selected when opening the Analyze page.
              </p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                Preferred Analysis Language
              </label>
              <select
                className="input"
                value={prefLanguage}
                onChange={e => setPrefLanguage(e.target.value)}
              >
                <option value="en">English (Primary Model Vocabulary)</option>
                <option value="hi">Hindi (हिंदी - Experimental)</option>
                <option value="mr">Marathi (मराठी - Experimental)</option>
              </select>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                Assists automated language detection when evaluating non-English claims.
              </p>
            </div>

            <div style={{ marginTop: 20 }}>
              <Button type="submit" size="sm">Save Preferences</Button>
            </div>
          </div>

          {/* Connectivity & Environment Card */}
          <div className="card-padded" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Database size={16} color="var(--brand)" />
              <span className="section-label" style={{ margin: 0 }}>Database & Endpoints</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Cloud Database</span>
                <Badge variant="real" size="sm">Supabase PostgreSQL</Badge>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Local Storage Fallback</span>
                <Badge variant="blue" size="sm">SQLite Dual-Sync</Badge>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>API Base URL</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-faint)' }}>
                  {import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}
                </span>
              </div>
            </div>
          </div>

          {/* Cache Management Card */}
          <div className="card-padded" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Trash2 size={16} color="var(--fake-accent)" />
              <span className="section-label" style={{ margin: 0, color: 'var(--fake-accent)' }}>Local Cache</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 14 }}>
              Clear local analysis drafts and form inputs stored in your browser's localStorage.
            </p>
            <Button variant="danger" size="sm" onClick={handleClearCache}>
              Clear Local Drafts
            </Button>
          </div>
        </form>

        <div className="disclaimer">
          <strong>Security & Privacy:</strong> NewsShield_AI operates with minimal data retention. Settings are stored locally in your browser and never transmitted to third parties.
        </div>
      </div>
    </div>
  );
}
