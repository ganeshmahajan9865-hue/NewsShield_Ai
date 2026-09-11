import React, { useState } from 'react';
import { FileText, Link2, Zap, SearchCheck, ChevronRight, Info } from 'lucide-react';

const SAMPLE_REAL = "NASA's Roman Space Telescope is set to launch in 2027 and will survey hundreds of millions of galaxies, helping scientists study dark energy and discover exoplanets.";
const SAMPLE_FAKE = "Doctors don't want you to know: drinking lemon juice with baking soda cures cancer within weeks, confirmed by studies suppressed by Big Pharma.";

export default function NewsInput({ onAnalyze, isLoading, progressStage }) {
  const [inputType, setInputType] = useState('text'); // 'text' | 'url'
  const [mode, setMode] = useState('deep');           // 'quick' | 'deep'
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [charError, setCharError] = useState('');

  const MIN_CHARS = 20;
  const MAX_CHARS = 5000;

  function handleTextChange(e) {
    const val = e.target.value;
    setText(val);
    if (val.length > 0 && val.length < MIN_CHARS) {
      setCharError(`Enter at least ${MIN_CHARS} characters (${val.length}/${MIN_CHARS})`);
    } else if (val.length > MAX_CHARS) {
      setCharError(`Maximum ${MAX_CHARS.toLocaleString()} characters allowed`);
    } else {
      setCharError('');
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (isLoading) return;

    if (inputType === 'text') {
      const trimmed = text.trim();
      if (!trimmed) return;
      if (trimmed.length < MIN_CHARS) { setCharError(`Please enter at least ${MIN_CHARS} characters.`); return; }
      if (trimmed.length > MAX_CHARS) { setCharError(`Text too long. Maximum ${MAX_CHARS.toLocaleString()} characters.`); return; }
      onAnalyze({ inputType: 'text', text: trimmed, mode });
    } else {
      const trimmedUrl = url.trim();
      if (!trimmedUrl) return;
      try { new URL(trimmedUrl); } catch { return; }
      onAnalyze({ inputType: 'url', url: trimmedUrl, mode });
    }
  }

  function useSample(sample) {
    setInputType('text');
    setText(sample);
    setCharError('');
  }

  const canSubmit = inputType === 'text'
    ? text.trim().length >= MIN_CHARS && text.length <= MAX_CHARS
    : url.trim().length > 5;

  const STAGES = [
    'Preprocessing text',
    'Running ML classification',
    'Extracting claims',
    'Retrieving evidence',
    'Preparing results',
  ];

  return (
    <div className="card-padded" style={{ marginBottom: 32 }}>
      {/* Input type tabs */}
      <div className="input-tabs">
        <button
          className={`input-tab${inputType === 'text' ? ' active' : ''}`}
          onClick={() => setInputType('text')}
          type="button"
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <FileText size={14} /> News Text
          </span>
        </button>
        <button
          className={`input-tab${inputType === 'url' ? ' active' : ''}`}
          onClick={() => setInputType('url')}
          type="button"
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Link2 size={14} /> Article URL
          </span>
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Text input */}
        {inputType === 'text' && (
          <div style={{ marginBottom: 16 }}>
            <label
              htmlFor="news-input"
              style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}
            >
              News headline, article, or claim
            </label>
            <textarea
              id="news-input"
              className="input"
              placeholder="Paste a news article, headline, or claim you want to verify..."
              value={text}
              onChange={handleTextChange}
              style={{ minHeight: 140, resize: 'vertical' }}
              disabled={isLoading}
              aria-describedby="char-count"
            />
            <div
              id="char-count"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: 6,
                fontSize: '0.75rem',
              }}
            >
              {charError
                ? <span style={{ color: 'var(--fake-accent)' }}>{charError}</span>
                : <span style={{ color: 'var(--text-faint)' }}>Minimum {MIN_CHARS} characters required</span>
              }
              <span style={{ color: text.length > MAX_CHARS ? 'var(--fake-accent)' : 'var(--text-faint)' }}>
                {text.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}
              </span>
            </div>

            {/* Sample buttons */}
            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', alignSelf: 'center' }}>Try sample:</span>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => useSample(SAMPLE_REAL)}
                style={{ fontSize: '0.75rem' }}
              >
                ✓ Real news example
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => useSample(SAMPLE_FAKE)}
                style={{ fontSize: '0.75rem' }}
              >
                ✗ Fake news example
              </button>
            </div>
          </div>
        )}

        {/* URL input */}
        {inputType === 'url' && (
          <div style={{ marginBottom: 16 }}>
            <label
              htmlFor="url-input"
              style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}
            >
              News article URL
            </label>
            <input
              id="url-input"
              type="url"
              className="input"
              placeholder="https://example.com/news-article"
              value={url}
              onChange={e => setUrl(e.target.value)}
              disabled={isLoading}
            />
            <div style={{ marginTop: 8 }} className="alert alert-info">
              <Info size={14} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>Some paywalled or JavaScript-heavy articles may not be extractable. If extraction fails, paste the article text instead.</span>
            </div>
          </div>
        )}

        {/* Analysis Mode */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>
            Analysis Mode
          </div>
          <div className="mode-selector">
            <button
              type="button"
              className={`mode-btn${mode === 'quick' ? ' active' : ''}`}
              onClick={() => setMode('quick')}
            >
              <Zap size={14} />
              Quick Analysis
              <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)', fontWeight: 400 }}>(~1 sec)</span>
            </button>
            <button
              type="button"
              className={`mode-btn${mode === 'deep' ? ' active' : ''}`}
              onClick={() => setMode('deep')}
            >
              <SearchCheck size={14} />
              Deep Verification
              <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)', fontWeight: 400 }}>(~8 sec)</span>
            </button>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8 }}>
            {mode === 'quick'
              ? 'Fast ML classification using TF-IDF features and trained Logistic Regression model.'
              : 'Full pipeline: ML classification + claim extraction + real-time evidence retrieval from trusted sources.'}
          </p>
        </div>

        {/* Loading stage indicator */}
        {isLoading && (
          <div className="loading-stage" style={{ marginBottom: 16 }}>
            <div className="spinner" />
            <span>{progressStage || 'Analyzing...'}</span>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          className="btn btn-primary btn-lg"
          disabled={!canSubmit || isLoading}
          style={{ width: '100%' }}
          aria-label={isLoading ? 'Analysis in progress' : 'Analyze news'}
        >
          {isLoading ? (
            <>
              <div className="spinner" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} />
              Analyzing…
            </>
          ) : (
            <>
              <SearchCheck size={18} />
              Analyze News
              <ChevronRight size={16} />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
