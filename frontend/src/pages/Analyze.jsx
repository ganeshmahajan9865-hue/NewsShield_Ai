import React, { useState } from 'react';
import NewsInput from '../components/NewsInput';
import ResultCard from '../components/ResultCard';
import DisclaimerBanner from '../components/DisclaimerBanner';
import { apiService } from '../services/api';
import { AlertCircle } from 'lucide-react';

const STAGES_TEXT = [
  'Normalizing text & removing noise…',
  'Running TF-IDF vectorization…',
  'Running ML classification model…',
  'Extracting factual claims…',
  'Searching real-time news sources…',
  'Evaluating evidence strength…',
  'Preparing explanation…',
];

export default function Analyze() {
  const [result, setResult] = useState(null);
  const [originalInput, setOriginalInput] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progressStage, setProgressStage] = useState('');
  const [error, setError] = useState('');

  async function handleAnalyze(inputData) {
    setIsLoading(true);
    setError('');
    setResult(null);
    setOriginalInput(inputData);

    let stageIdx = 0;
    const stageInterval = setInterval(() => {
      stageIdx = Math.min(stageIdx + 1, STAGES_TEXT.length - 1);
      setProgressStage(STAGES_TEXT[stageIdx]);
    }, inputData.mode === 'deep' ? 1400 : 700);

    setProgressStage(STAGES_TEXT[0]);

    try {
      let res;
      if (inputData.inputType === 'text') {
        if (inputData.mode === 'quick') {
          res = await apiService.predictQuick(inputData.text);
        } else {
          res = await apiService.analyzeFull(inputData.text, 'deep');
        }
      } else {
        res = await apiService.analyzeUrl(inputData.url, inputData.mode);
      }
      setResult(res);
    } catch (err) {
      setError(
        err.message?.includes('ERR_CONNECTION_REFUSED') || err.message?.includes('Failed to fetch')
          ? 'Backend is not running. Please start the backend server (uvicorn) and try again.'
          : err.message || 'An unexpected error occurred. Please try again.'
      );
    } finally {
      clearInterval(stageInterval);
      setIsLoading(false);
      setProgressStage('');
    }
  }

  function handleReset() {
    setResult(null);
    setOriginalInput(null);
    setError('');
  }

  return (
    <div className="page">
      <div className="container-narrow">
        {/* Page header */}
        <div className="page-header">
          <h1 className="page-title">News Credibility Analysis</h1>
          <p className="page-subtitle">
            Evaluate headlines, full articles, or URLs using ML classification and real-time evidence retrieval.
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="alert alert-error" style={{ marginBottom: 20 }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <div>
              <strong>Analysis Error</strong>
              <div style={{ marginTop: 2, fontWeight: 400 }}>{error}</div>
            </div>
          </div>
        )}

        {/* Input form */}
        {!result && (
          <>
            <DisclaimerBanner />
            <NewsInput
              onAnalyze={handleAnalyze}
              isLoading={isLoading}
              progressStage={progressStage}
            />
          </>
        )}

        {/* Results */}
        {result && (
          <ResultCard
            result={result}
            originalInput={originalInput}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  );
}
