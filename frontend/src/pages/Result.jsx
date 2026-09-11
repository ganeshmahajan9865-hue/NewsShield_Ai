import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import ResultCard from '../components/ResultCard';
import Button from '../components/Button';
import ErrorMessage from '../components/ErrorMessage';
import { ArrowLeft, RefreshCw } from 'lucide-react';

export default function Result() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchAnalysis() {
      if (!id) return;
      setLoading(true);
      setError('');
      try {
        const data = await apiService.getAnalysisDetail(id);
        if (!data) throw new Error('Analysis record not found.');

        // Normalize retrieved record into ResultCard format
        const evidenceCards = (data.evidence_items || []).map(e => ({
          title: e.title,
          publisher: e.source_name,
          source_name: e.source_name,
          source_url: e.source_url,
          snippet: e.snippet,
          evidence_type: e.evidence_type,
          retrieved_at: e.retrieved_at,
        }));

        setResult({
          analysis_id: data.id,
          id: data.id,
          prediction: data.prediction,
          confidence: data.confidence,
          model_name: data.model_name,
          model_version: data.model_version,
          evidence_status: data.evidence_status || 'Evaluated',
          evidence: evidenceCards,
          evidence_cards: evidenceCards,
          explanation: data.explanation || (
            `Historical verification record generated with ${data.model_name} v${data.model_version}. ` +
            `Classified as ${data.prediction} with ${Math.round(data.confidence * 100)}% calibrated confidence.`
          ),
          original_text: data.news_text,
          created_at: data.created_at,
        });
      } catch (err) {
        setError(err.message || 'Failed to load verification report.');
      } finally {
        setLoading(false);
      }
    }

    fetchAnalysis();
  }, [id]);

  return (
    <div className="page">
      <div className="container-narrow">
        <div style={{ marginBottom: 20 }}>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft size={14} />}
            onClick={() => navigate('/history')}
          >
            Back to History
          </Button>
        </div>

        {error && (
          <ErrorMessage
            type="error"
            title="Unable to load report"
            message={error}
          />
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div className="spinner" style={{ margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--text-muted)' }}>Retrieving verification report…</p>
          </div>
        ) : result ? (
          <ResultCard
            result={result}
            originalInput={{ text: result.original_text }}
            onReset={() => navigate('/analyze')}
          />
        ) : null}
      </div>
    </div>
  );
}
