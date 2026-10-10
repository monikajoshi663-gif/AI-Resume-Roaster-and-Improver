import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import ScoreGauge from './ScoreGauge';

export default function Improved({
  originalScore = 42,
  improvedData,
  onBackToRoast,
  onStartOver,
}) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('diff'); // 'diff' | 'fulltext'

  const {
    rewrites = [],
    improvedResume = '',
    newScore = 68,
    pointGain = 26,
  } = improvedData || {};

  // Trigger celebration confetti on mount
  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#3b82f6', '#f59e0b', '#ec4899'],
      });
    } catch {
      // Ignore if confetti fails in headless/test environments
    }
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(improvedResume);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = improvedResume;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([improvedResume], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'improved_resume.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="improved-container" id="improved-view">
      {/* HEADER BAR */}
      <div className="results-header-bar">
        <div>
          <span className="results-tag tag-success">Rewrites Generated & Rescored</span>
          <h2 className="section-title">AI-Improved Resume & Bullet Boost</h2>
        </div>
        <div className="button-group">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onBackToRoast}
            id="btn-back-to-roast"
          >
            <span>← Back to Roast</span>
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onStartOver}
            id="btn-start-over"
          >
            <span>Roast Another Resume</span>
          </button>
        </div>
      </div>

      {/* SCORE JUMP BANNER */}
      <div className="score-jump-card" id="score-jump-banner">
        <div className="score-jump-content">
          <div className="score-comparison-row">
            <div className="score-stat-box before">
              <span className="stat-label">Initial Match Score</span>
              <span className="stat-value text-muted-red">{originalScore}%</span>
            </div>

            <div className="score-arrow-wrapper">
              <span className="arrow-icon">➔</span>
              <span className="gain-badge" id="point-gain-badge">
                +{pointGain} pts gain!
              </span>
            </div>

            <div className="score-stat-box after">
              <span className="stat-label">Rescored Match</span>
              <span className="stat-value text-success">{newScore}%</span>
            </div>
          </div>

          <p className="score-jump-summary">
            By transforming passive bullet points into high-impact, keyword-aligned achievements,
            your ATS match readiness jumped by <strong>{pointGain} points</strong>.
          </p>
        </div>
      </div>

      {/* VIEW TOGGLE TABS */}
      <div className="tabs-bar">
        <button
          type="button"
          className={`tab-btn ${activeTab === 'diff' ? 'active' : ''}`}
          onClick={() => setActiveTab('diff')}
          id="tab-bullet-diff"
        >
          <span>Side-by-Side Bullet Rewrites ({rewrites.length})</span>
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'fulltext' ? 'active' : ''}`}
          onClick={() => setActiveTab('fulltext')}
          id="tab-full-improved-text"
        >
          <span>Full Improved Resume Text</span>
        </button>
      </div>

      {/* TAB 1: SIDE-BY-SIDE BULLET REWRITES */}
      {activeTab === 'diff' && (
        <div className="bullet-diff-grid" id="bullet-diff-container">
          {rewrites.map((item, idx) => (
            <div key={idx} className="card rewrite-card" id={`rewrite-card-${idx}`}>
              <div className="rewrite-card-header">
                <span className="rewrite-badge">Bullet #{idx + 1}</span>
                <span className="diff-tag">Action Verb + Metrics + Keywords</span>
              </div>

              <div className="diff-columns-grid">
                {/* BEFORE / ORIGINAL */}
                <div className="diff-col col-before">
                  <div className="diff-col-title text-danger">
                    <span>✕ Original (Weak)</span>
                  </div>
                  <div className="diff-text-box original-text">
                    "{item.original}"
                  </div>
                </div>

                {/* AFTER / REWRITTEN */}
                <div className="diff-col col-after">
                  <div className="diff-col-title text-success">
                    <span>✓ AI Rewritten (High Impact)</span>
                  </div>
                  <div className="diff-text-box rewritten-text">
                    "{item.rewritten}"
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: FULL IMPROVED TEXT */}
      {activeTab === 'fulltext' && (
        <div className="card full-improved-card" id="full-improved-card">
          <div className="full-improved-header">
            <div>
              <h3 className="card-heading">Complete Ready-to-Use Resume</h3>
              <p className="card-subheading">
                All rewritten bullets have been seamlessly swapped into your original resume.
              </p>
            </div>
          </div>

          <div className="resume-preview-box">
            <pre className="resume-pre-text" id="improved-resume-pre">
              {improvedResume}
            </pre>
          </div>
        </div>
      )}

      {/* BOTTOM ACTION BAR */}
      <div className="improved-actions-bar">
        <button
          type="button"
          className="btn btn-primary btn-copy-large"
          onClick={handleCopy}
          id="btn-copy-improved-resume"
        >
          <span>{copied ? '✓ Copied to Clipboard!' : '📋 Copy Improved Resume'}</span>
        </button>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleDownload}
          id="btn-download-txt"
        >
          <span>⬇ Download TXT</span>
        </button>
      </div>
    </div>
  );
}
