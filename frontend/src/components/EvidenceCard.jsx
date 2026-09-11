import React, { useState } from 'react';
import { ExternalLink, Clock, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';
import Badge from './Badge';

export default function EvidenceCard({ ev, index = 0 }) {
  const [expanded, setExpanded] = useState(false);
  if (!ev) return null;

  const type = (ev.evidence_type || ev.type || 'news').toLowerCase().replace(/ /g, '_');
  const isFactCheck = type.includes('fact') || type.includes('debunk');
  const isSupporting = type.includes('support') || type.includes('corrobor');

  let borderColor = 'var(--brand)';
  let badgeVariant = 'blue';
  let badgeLabel = 'News Report';

  if (isFactCheck) {
    borderColor = 'var(--fake-accent)';
    badgeVariant = 'fake';
    badgeLabel = 'Fact Check';
  } else if (isSupporting) {
    borderColor = 'var(--real-accent)';
    badgeVariant = 'real';
    badgeLabel = 'Supporting Evidence';
  }

  const snippet = ev.snippet || ev.text || '';
  const truncated = snippet.length > 180 ? snippet.slice(0, 180) + '…' : snippet;
  const publisher = ev.publisher || ev.source_name || 'Web Source';
  const tier = ev.source_tier || 'Standard';

  return (
    <div
      className="evidence-card"
      style={{ borderLeft: `3px solid ${borderColor}` }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Badge variant={badgeVariant} size="sm">{badgeLabel}</Badge>
          <span className="source-domain">{publisher}</span>
          {tier !== 'Standard' && (
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              [{tier} Tier]
            </span>
          )}
        </div>

        {(ev.publication_date || ev.retrieved_at) && (
          <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)', display: 'flex', alignItems: 'center', gap: 3 }}>
            <Clock size={10} />
            {ev.publication_date || new Date(ev.retrieved_at).toLocaleDateString()}
          </span>
        )}
      </div>

      <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4, margin: '2px 0' }}>
        {ev.title || `Evidence Item ${index + 1}`}
      </p>

      {snippet && (
        <div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {expanded ? snippet : truncated}
          </p>
          {snippet.length > 180 && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setExpanded(e => !e)}
              style={{ marginTop: 4, padding: '2px 0', fontSize: '0.75rem' }}
            >
              {expanded ? <><ChevronUp size={12} /> Show less</> : <><ChevronDown size={12} /> Read more</>}
            </button>
          )}
        </div>
      )}

      {ev.source_url && (
        <div style={{ marginTop: 2 }}>
          <a
            href={ev.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', fontSize: '0.75rem' }}
          >
            <ExternalLink size={12} />
            View Source
          </a>
        </div>
      )}
    </div>
  );
}
