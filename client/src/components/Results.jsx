import React from 'react';
import ScoreGauge from './ScoreGauge';

export default function Results({
  analysisData,
  onImprove,
  isImproving,
  onReset,
}) {
  if (!analysisData) return null;

  const {
    score = 0,
    scoreReason = '',
    matchedKeywords = [],
    missingKeywords = [],
    roast = [],
    weakBullets = [],
  } = analysisData;

  const totalKeywords = matchedKeywords.length + missingKeywords.length;
  const matchPercentage = totalKeywords > 0
    ? Math.round((matchedKeywords.length / totalKeywords) * 100)
    : 0;

  return (
    <div className="results-container" id="results-view">
      {/* TOP HEADER & ACTIONS */}
      <div className="results-header-bar">
        <div>
          <span className="results-tag">Analysis Completed</span>
          <h2 className="section-title">Resume Breakdown & Roast</h2>
        </div>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onReset}
          id="btn-edit-inputs"
        >
          <span>← Edit Inputs</span>
        </button>
      </div>

      {/* TOP GRID: SCORE GAUGE & KEYWORD SUMMARY */}
      <div className="results-hero-grid">
        <ScoreGauge score={score} reason={scoreReason} />

        {/* KEYWORD OVERVIEW CARD */}
        <div className="card keyword-overview-card" id="keyword-gap-card">
          <div className="card-header-line">
            <div>
              <h3 className="card-heading">ATS Keyword Gap Analysis</h3>
              <p className="card-subheading">
                {matchedKeywords.length} of {totalKeywords} required skills detected ({matchPercentage}%)
              </p>
            </div>
            <div className="keyword-ratio-badge">
              <span className="ratio-num">{matchedKeywords.length}</span>
              <span className="ratio-sep">/</span>
              <span className="ratio-den">{totalKeywords}</span>
            </div>
          </div>

          {/* Matched Keywords (Green Chips) */}
          <div className="keyword-group">
            <div className="keyword-group-title text-success">
              <svg className="group-icon" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Matched Keywords ({matchedKeywords.length})</span>
            </div>
            <div className="chips-wrap" id="matched-keywords-container">
              {matchedKeywords.length > 0 ? (
                matchedKeywords.map((kw, i) => (
                  <span key={i} className="chip chip-green" id={`matched-chip-${i}`}>
                    <span className="chip-icon">✓</span>
                    <span>{kw}</span>
                  </span>
                ))
              ) : (
                <span className="empty-hint">No matched keywords found.</span>
              )}
            </div>
          </div>

          {/* Missing Keywords (Red Chips) */}
          <div className="keyword-group">
            <div className="keyword-group-title text-danger">
              <svg className="group-icon" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Missing Keywords ({missingKeywords.length})</span>
            </div>
            <div className="chips-wrap" id="missing-keywords-container">
              {missingKeywords.length > 0 ? (
                missingKeywords.map((kw, i) => (
                  <span key={i} className="chip chip-red" id={`missing-chip-${i}`}>
                    <span className="chip-icon">✕</span>
                    <span>{kw}</span>
                  </span>
                ))
              ) : (
                <span className="empty-hint">Great job! No key requirements missing.</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ROAST CARDS SECTION */}
      <div className="card roast-section" id="roast-section">
        <div className="roast-header">
          <div className="roast-badge">
            <span className="fire-icon">🔥</span>
            <span>The AI Roast</span>
          </div>
          <span className="roast-subtitle">Unvarnished observations from the reviewer</span>
        </div>

        <div className="roast-cards-grid" id="roast-cards-grid">
          {roast.map((line, idx) => (
            <div key={idx} className="roast-card" id={`roast-card-${idx}`}>
              <div className="roast-card-num">0{idx + 1}</div>
              <p className="roast-card-text">"{line}"</p>
            </div>
          ))}
        </div>
      </div>

      {/* WEAK BULLETS & IMPROVE CALL-TO-ACTION */}
      {weakBullets && weakBullets.length > 0 && (
        <div className="card weak-bullets-card" id="weak-bullets-card">
          <div className="weak-bullets-header">
            <div>
              <div className="weak-badge">Identified Weak Bullets ({weakBullets.length})</div>
              <h3 className="card-heading">Vague or Passive Points Dragging Your Score</h3>
              <p className="card-subheading">
                These lines lack strong action verbs, quantifiable metrics, or key JD skills.
              </p>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-improve-large"
              onClick={onImprove}
              disabled={isImproving}
              id="btn-fix-weak-bullets"
            >
              {isImproving ? (
                <span className="spinner-wrapper">
                  <span className="spinner"></span>
                  <span>Rewriting with AI & Rescoring...</span>
                </span>
              ) : (
                <span>⚡ Fix my weak bullets</span>
              )}
            </button>
          </div>

          <div className="weak-bullets-list">
            {weakBullets.map((bullet, idx) => (
              <div key={idx} className="weak-bullet-item" id={`weak-bullet-${idx}`}>
                <span className="bullet-bullet-icon">⚠️</span>
                <span className="bullet-text">{bullet}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
