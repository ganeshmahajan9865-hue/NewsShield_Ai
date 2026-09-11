import React from 'react';
import { ShieldAlert } from 'lucide-react';

export default function DisclaimerBanner() {
  return (
    <div className="alert alert-warn" style={{ marginBottom: 24 }}>
      <ShieldAlert size={16} style={{ flexShrink: 0 }} />
      <span>
        <strong>AI-Assisted Analysis.</strong> NewsShield_AI provides credibility signals based on text patterns and evidence retrieval.
        Results are not guaranteed fact-checks. Always verify with trusted sources.
      </span>
    </div>
  );
}
