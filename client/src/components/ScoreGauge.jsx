import React from 'react';

/**
 * ScoreGauge component – displays the match score as an animated circular gauge
 *
 * @param {object} props
 * @param {number} props.score - 0 to 100
 * @param {string} props.reason - one-sentence explanation
 * @param {number} [props.previousScore] - optional prior score for before/after diff
 */
export default function ScoreGauge({ score = 0, reason = '', previousScore }) {
  // Normalize score between 0 and 100
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));

  // SVG parameters
  const size = 180;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Use a 270-degree arc for a classic gauge look (leaving bottom open)
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (clampedScore / 100) * arcLength;

  // Determine color theme based on score
  let gradientId = 'gauge-grad-red';
  let badgeColor = 'badge-danger';
  let badgeText = 'Needs Serious Work';

  if (clampedScore >= 75) {
    gradientId = 'gauge-grad-green';
    badgeColor = 'badge-success';
    badgeText = 'Strong Match!';
  } else if (clampedScore >= 50) {
    gradientId = 'gauge-grad-amber';
    badgeColor = 'badge-warning';
    badgeText = 'Average — High Risk';
  }

  const pointGain = previousScore !== undefined ? clampedScore - previousScore : null;

  return (
    <div className="score-gauge-card" id="score-gauge-container">
      <div className="gauge-svg-wrapper">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="gauge-svg"
        >
          <defs>
            {/* Fiery Red Gradient (< 50) */}
            <linearGradient id="gauge-grad-red" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>

            {/* Amber Gradient (50 - 74) */}
            <linearGradient id="gauge-grad-amber" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#eab308" />
            </linearGradient>

            {/* Emerald Gradient (>= 75) */}
            <linearGradient id="gauge-grad-green" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>

          {/* Background Track Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
            transform={`rotate(135 ${size / 2} ${size / 2})`}
          />

          {/* Animated Value Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(135 ${size / 2} ${size / 2})`}
            style={{
              transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </svg>

        {/* Center Numbers */}
        <div className="gauge-center-content">
          <div className="gauge-score-number" id="gauge-score-value">
            {clampedScore}
            <span className="gauge-score-max">%</span>
          </div>
          <span className={`gauge-badge ${badgeColor}`}>{badgeText}</span>
        </div>
      </div>

      {pointGain !== null && pointGain > 0 && (
        <div className="gauge-gain-pill" id="score-gain-pill">
          <span>▲ +{pointGain} pts gain</span>
        </div>
      )}

      {reason && (
        <div className="gauge-reason" id="score-reason-text">
          <svg className="reason-icon" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <span>{reason}</span>
        </div>
      )}
    </div>
  );
}
