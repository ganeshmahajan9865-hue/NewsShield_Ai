import React from 'react';
import { BookOpen, ShieldAlert, Globe } from 'lucide-react';
import Badge from './Badge';

export default function ExplanationCard({ explanation, detectedLanguage = null }) {
  if (!explanation) return null;

  return (
    <div className="card-padded">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <BookOpen size={16} color="var(--brand)" />
          <span className="section-label" style={{ margin: 0 }}>AI-Assisted Explanation</span>
        </div>
        {detectedLanguage?.is_indic && (
          <Badge variant="gray" size="sm" icon={<Globe size={11} />}>
            Analyzed in {detectedLanguage.language_name}
          </Badge>
        )}
      </div>

      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
        {explanation}
      </p>

      <div className="disclaimer" style={{ marginTop: 16 }}>
        <strong>Responsible AI Note:</strong> This explanation synthesizes retrieved news evidence and trained linguistic features. It provides AI decision support, not an absolute guarantee of factual truth.
      </div>
    </div>
  );
}
