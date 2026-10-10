import React, { useState } from 'react';
import InputForm from './components/InputForm';
import Results from './components/Results';
import Improved from './components/Improved';
import { analyzeResume, improveResume } from './api';

export default function App() {
  const [step, setStep] = useState('input'); // 'input' | 'results' | 'improved'
  const [formData, setFormData] = useState({
    resumeText: '',
    file: null,
    jobDescription: '',
    tone: 'Honest',
  });
  const [analysisData, setAnalysisData] = useState(null);
  const [improvedData, setImprovedData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const [globalError, setGlobalError] = useState('');

  const isMock = import.meta.env.VITE_USE_MOCK === 'true';

  // Step 1 -> Step 2: Handle Analyze
  const handleAnalyze = async (params) => {
    setIsLoading(true);
    setGlobalError('');
    setFormData(params);

    try {
      const data = await analyzeResume(params);
      setAnalysisData(data);
      setStep('results');
    } catch (err) {
      console.error('Analysis failed:', err);
      setGlobalError(err.message || 'Analysis failed. Please check inputs and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2 -> Step 3: Handle Improve
  const handleImprove = async () => {
    if (!analysisData) return;

    setIsImproving(true);
    setGlobalError('');

    try {
      const data = await improveResume({
        analysisId: analysisData.analysisId,
        resumeText: formData.resumeText,
        jobDescription: formData.jobDescription,
        weakBullets: analysisData.weakBullets,
        tone: formData.tone,
      });

      setImprovedData(data);
      setStep('improved');
    } catch (err) {
      console.error('Improvement failed:', err);
      setGlobalError(err.message || 'Failed to rewrite bullets. Please try again.');
    } finally {
      setIsImproving(false);
    }
  };

  const handleStartOver = () => {
    setAnalysisData(null);
    setImprovedData(null);
    setGlobalError('');
    setStep('input');
  };

  return (
    <div className="app-layout">
      {/* HEADER */}
      <header className="app-header">
        <div className="header-inner">
          <div className="logo-group" onClick={handleStartOver} style={{ cursor: 'pointer' }}>
            <span className="logo-flame">🔥</span>
            <div>
              <h1 className="logo-title">Resume Roaster</h1>
              <p className="logo-tagline">AI Resume Roaster & ATS Improver</p>
            </div>
          </div>

          <div className="header-badges">
            <span className={`env-pill ${isMock ? 'pill-mock' : 'pill-live'}`} id="env-mode-badge">
              {isMock ? '⚡ Mock Mode (VITE_USE_MOCK=true)' : '🌐 Live Backend API'}
            </span>
          </div>
        </div>

        {/* STEP PROGRESS BAR */}
        <div className="steps-indicator">
          <div className={`step-item ${step === 'input' ? 'current' : 'completed'}`}>
            <span className="step-circle">1</span>
            <span className="step-name">Input Resume & JD</span>
          </div>
          <div className="step-divider" />
          <div className={`step-item ${step === 'results' ? 'current' : step === 'improved' ? 'completed' : ''}`}>
            <span className="step-circle">2</span>
            <span className="step-name">Score & Roast</span>
          </div>
          <div className="step-divider" />
          <div className={`step-item ${step === 'improved' ? 'current' : ''}`}>
            <span className="step-circle">3</span>
            <span className="step-name">Improved Bullets</span>
          </div>
        </div>
      </header>

      {/* GLOBAL ERROR BANNER */}
      {globalError && (
        <div className="global-error-banner" id="global-error-banner" role="alert">
          <div className="error-content">
            <span className="error-icon">⚠️</span>
            <span>{globalError}</span>
          </div>
          <button
            type="button"
            className="btn-dismiss-error"
            onClick={() => setGlobalError('')}
          >
            ✕
          </button>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="main-content">
        {step === 'input' && (
          <InputForm onAnalyze={handleAnalyze} isLoading={isLoading} />
        )}

        {step === 'results' && (
          <Results
            analysisData={analysisData}
            onImprove={handleImprove}
            isImproving={isImproving}
            onReset={handleStartOver}
          />
        )}

        {step === 'improved' && (
          <Improved
            originalScore={analysisData?.score || 42}
            improvedData={improvedData}
            onBackToRoast={() => setStep('results')}
            onStartOver={handleStartOver}
          />
        )}
      </main>

      {/* FOOTER */}
      <footer className="app-footer">
        <div className="footer-inner">
          <div className="footer-privacy">
            <span>🔒 Privacy First: Resume text is processed in memory and never permanently stored by default.</span>
          </div>
          <div className="footer-meta">
            <span>Built with React, Vite & AI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
