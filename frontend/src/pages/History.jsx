import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import {
  CheckCircle2, XCircle, AlertTriangle, Clock, Search,
  RefreshCw, ExternalLink, FileText, ChevronRight
} from 'lucide-react';

function getVerdict(prediction) {
  const p = (prediction || '').toLowerCase();
  if (p.includes('real')) return 'real';
  if (p.includes('fake')) return 'fake';
  return 'mixed';
}

function VerdictBadge({ prediction }) {
  const v = getVerdict(prediction);
  if (v === 'real') return <span className="badge badge-real"><CheckCircle2 size={11} />{prediction}</span>;
  if (v === 'fake') return <span className="badge badge-fake"><XCircle size={11} />{prediction}</span>;
  return <span className="badge badge-mixed"><AlertTriangle size={11} />{prediction}</span>;
}

function HistoryItemRow({ item, onViewDetail }) {
  const timestamp = item.created_at ? new Date(item.created_at) : null;
  const textPreview = (item.news_text || item.text || item.url || '').slice(0, 120);

  return (
    <div
      className="history-item"
      onClick={() => onViewDetail(item)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onViewDetail(item)}
      aria-label={`View analysis: ${textPreview}`}
    >
      {/* Verdict icon */}
      <div style={{ flexShrink: 0, marginTop: 2 }}>
        {getVerdict(item.prediction) === 'real'
          ? <CheckCircle2 size={20} color="var(--real-accent)" />
          : getVerdict(item.prediction) === 'fake'
          ? <XCircle size={20} color="var(--fake-accent)" />
          : <AlertTriangle size={20} color="var(--mixed-accent)" />}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
          <VerdictBadge prediction={item.prediction} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-faint)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={11} />
            {timestamp ? timestamp.toLocaleString() : '—'}
          </span>
          {item.model_name && (
            <span className="badge badge-gray">{item.model_name}</span>
          )}
          {item.confidence != null && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {Math.round(item.confidence * 100)}% confidence
            </span>
          )}
        </div>
        <p style={{
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.5,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {textPreview || '(no text preview)'}
        </p>
      </div>

      <ChevronRight size={16} color="var(--text-faint)" style={{ flexShrink: 0 }} />
    </div>
  );
}

function EmptyHistory() {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <FileText size={24} />
      </div>
      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
        No analysis history yet
      </h3>
      <p style={{ fontSize: '0.875rem' }}>
        Run your first analysis and it will appear here.
      </p>
    </div>
  );
}

export default function History() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterVerdict, setFilterVerdict] = useState('all');
  const [selected, setSelected] = useState(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiService.getHistory(100);
      setItems(Array.isArray(data) ? data : (data.history || data.analyses || []));
    } catch (err) {
      if (err.message?.includes('fetch')) {
        setError('Cannot connect to backend. Make sure the server is running on port 8000.');
      } else {
        setError(err.message || 'Failed to load history.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const filtered = items.filter(item => {
    const text = (item.news_text || item.text || item.url || '').toLowerCase();
    const matchSearch = !search || text.includes(search.toLowerCase());
    const matchVerdict = filterVerdict === 'all'
      || (filterVerdict === 'real' && getVerdict(item.prediction) === 'real')
      || (filterVerdict === 'fake' && getVerdict(item.prediction) === 'fake');
    return matchSearch && matchVerdict;
  });

  if (selected) {
    return (
      <div className="page">
        <div className="container-narrow">
          <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)} style={{ marginBottom: 20 }}>
            ← Back to History
          </button>
          <div className="card-padded">
            <div style={{ marginBottom: 16 }}>
              <VerdictBadge prediction={selected.prediction} />
              {selected.confidence != null && (
                <span style={{ marginLeft: 8, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  {Math.round(selected.confidence * 100)}% confidence
                </span>
              )}
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 16 }}>
              {selected.news_text || selected.text || selected.url}
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {selected.model_name && <span className="badge badge-gray">Model: {selected.model_name}</span>}
              {selected.model_version && <span className="badge badge-gray">v{selected.model_version}</span>}
              {selected.created_at && (
                <span className="badge badge-gray">
                  {new Date(selected.created_at).toLocaleString()}
                </span>
              )}
            </div>
            {selected.explanation && (
              <div style={{ marginTop: 20 }}>
                <div className="section-label">Explanation</div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  {selected.explanation}
                </p>
              </div>
            )}
            {selected.analysis_id && (
              <div style={{ marginTop: 16 }}>
                <a
                  href={apiService.getPdfReportUrl(selected.analysis_id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                >
                  <ExternalLink size={13} /> Download PDF Report
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
          <div className="page-header" style={{ marginBottom: 0 }}>
            <h1 className="page-title">Analysis History</h1>
            <p className="page-subtitle">
              {items.length > 0 ? `${items.length} analysis records found` : 'Your past analyses'}
            </p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={fetchHistory} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'pulse' : ''} /> Refresh
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search
              size={15}
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }}
            />
            <input
              className="input"
              placeholder="Search by text content…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 38 }}
            />
          </div>
          <select
            className="input"
            value={filterVerdict}
            onChange={e => setFilterVerdict(e.target.value)}
            style={{ width: 'auto', minWidth: 140 }}
          >
            <option value="all">All verdicts</option>
            <option value="real">Likely Real</option>
            <option value="fake">Likely Fake</option>
          </select>
        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-error" style={{ marginBottom: 20 }}>
            {error}
          </div>
        )}

        {/* List */}
        <div className="card" style={{ overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '48px 24px', textAlign: 'center' }}>
              <div className="spinner" style={{ margin: '0 auto 12px' }} />
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading history…</p>
            </div>
          ) : filtered.length === 0 ? (
            <EmptyHistory />
          ) : (
            filtered.map((item, i) => (
              <HistoryItemRow
                key={item.id || item.analysis_id || i}
                item={item}
                onViewDetail={setSelected}
              />
            ))
          )}
        </div>

        {filtered.length > 0 && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-faint)', marginTop: 12, textAlign: 'center' }}>
            Showing {filtered.length} of {items.length} records
          </p>
        )}
      </div>
    </div>
  );
}
