import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import {
  BarChart3, CheckCircle2, XCircle, AlertTriangle,
  TrendingUp, Activity, RefreshCw, Clock
} from 'lucide-react';

function StatCard({ value, label, sub, color, icon }) {
  return (
    <div className="stat-card">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </div>
      </div>
      <div className="stat-value" style={{ color: color || 'var(--text-primary)' }}>{value}</div>
      <div className="stat-label">{label}</div>
      {sub && <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function ConfidenceBar({ label, value, color, total }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 80, fontSize: '0.8rem', color: 'var(--text-secondary)', flexShrink: 0 }}>{label}</div>
      <div className="confidence-bar-track" style={{ flex: 1 }}>
        <div
          className="confidence-bar-fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <div style={{ width: 40, fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', textAlign: 'right', flexShrink: 0 }}>
        {value}
      </div>
    </div>
  );
}

function RecentItem({ item }) {
  const v = (item.prediction || '').toLowerCase();
  const isReal = v.includes('real');
  const isFake = v.includes('fake');
  const color = isReal ? 'var(--real-accent)' : isFake ? 'var(--fake-accent)' : 'var(--mixed-accent)';

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '10px 0',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: color,
        flexShrink: 0,
      }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: '0.8rem',
          color: 'var(--text-secondary)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {(item.news_text || item.text || '').slice(0, 80) || '—'}
        </p>
      </div>
      <div style={{ flexShrink: 0, textAlign: 'right' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 600, color }}>{item.prediction}</div>
        {item.created_at && (
          <div style={{ fontSize: '0.68rem', color: 'var(--text-faint)' }}>
            {new Date(item.created_at).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Dashboard({ setActiveTab }) {
  const navigate = useNavigate();
  const go = (path, tab) => {
    if (navigate) navigate(path);
    if (setActiveTab) setActiveTab(tab);
  };

  const [analytics, setAnalytics] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [analyticsData, historyData] = await Promise.all([
        apiService.getAnalytics(),
        apiService.getHistory(10),
      ]);
      setAnalytics(analyticsData);
      const items = Array.isArray(historyData)
        ? historyData
        : (historyData.history || historyData.analyses || []);
      setHistory(items.slice(0, 10));
    } catch (err) {
      setError(err.message?.includes('fetch')
        ? 'Cannot connect to backend server. Please ensure it is running.'
        : err.message || 'Failed to load dashboard data.');
      // Set zero defaults so UI still renders
      setAnalytics({ total: 0, real_count: 0, fake_count: 0, deep_count: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const total = analytics?.total ?? analytics?.total_analyses ?? 0;
  const realCount = analytics?.real_count ?? analytics?.likely_real_count ?? analytics?.likely_real ?? 0;
  const fakeCount = analytics?.fake_count ?? analytics?.likely_fake_count ?? analytics?.likely_fake ?? 0;
  const deepCount = analytics?.deep_count ?? analytics?.deep_verification ?? 0;

  return (
    <div className="page">
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="page-title">Analytics Dashboard</h1>
            <p className="page-subtitle">Overview of analysis activity and model performance</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={load} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'pulse' : ''} /> Refresh
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-warn" style={{ marginBottom: 20 }}>
            <AlertTriangle size={16} style={{ flexShrink: 0 }} />
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div className="spinner" style={{ margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--text-muted)' }}>Loading dashboard…</p>
          </div>
        ) : (
          <>
            {/* Stat cards */}
            <div className="grid-4" style={{ marginBottom: 28 }}>
              <StatCard
                value={total || '—'}
                label="Total Analyses"
                sub="All time"
                color="var(--brand)"
                icon={<BarChart3 size={20} color="var(--brand)" />}
              />
              <StatCard
                value={realCount || '—'}
                label="Likely Real"
                sub={total > 0 ? `${Math.round((realCount / total) * 100)}% of total` : '—'}
                color="var(--real-accent)"
                icon={<CheckCircle2 size={20} color="var(--real-accent)" />}
              />
              <StatCard
                value={fakeCount || '—'}
                label="Likely Fake"
                sub={total > 0 ? `${Math.round((fakeCount / total) * 100)}% of total` : '—'}
                color="var(--fake-accent)"
                icon={<XCircle size={20} color="var(--fake-accent)" />}
              />
              <StatCard
                value={deepCount || '—'}
                label="Deep Verified"
                sub="With evidence retrieval"
                color="var(--mixed-accent)"
                icon={<Activity size={20} color="var(--mixed-accent)" />}
              />
            </div>

            {/* Bottom row */}
            <div className="grid-2">
              {/* Distribution chart */}
              <div className="card-padded">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                  <TrendingUp size={16} color="var(--brand)" />
                  <span className="section-label" style={{ margin: 0 }}>Verdict Distribution</span>
                </div>
                {total === 0 ? (
                  <div className="empty-state" style={{ padding: '32px 0' }}>
                    <p>No data yet. Run your first analysis.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <ConfidenceBar label="Likely Real" value={realCount} color="var(--real-accent)" total={total} />
                    <ConfidenceBar label="Likely Fake" value={fakeCount} color="var(--fake-accent)" total={total} />
                    <ConfidenceBar label="Deep Mode"   value={deepCount} color="var(--brand)"       total={total} />
                  </div>
                )}

                <div style={{ marginTop: 24, padding: '14px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8 }}>Quick Actions</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button className="btn btn-primary btn-sm" onClick={() => go('/analyze', 'analyze')}>
                      New Analysis
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => go('/history', 'history')}>
                      View All History
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => go('/model-info', 'model-info')}>
                      Model Info
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent analyses */}
              <div className="card-padded">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                  <Clock size={16} color="var(--brand)" />
                  <span className="section-label" style={{ margin: 0 }}>Recent Analyses</span>
                </div>
                {history.length === 0 ? (
                  <div className="empty-state" style={{ padding: '32px 0' }}>
                    <p>No history yet.</p>
                  </div>
                ) : (
                  <div>
                    {history.map((item, i) => (
                      <RecentItem key={item.id || item.analysis_id || i} item={item} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="disclaimer" style={{ marginTop: 24 }}>
              Analytics are based on analyses stored in the local database. Data shown here reflects
              system usage and should not be interpreted as ground-truth misinformation statistics.
            </div>
          </>
        )}
      </div>
    </div>
  );
}
