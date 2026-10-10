import React, { useState, useRef } from 'react';
import { SAMPLE_DEMO_RESUME, SAMPLE_DEMO_JD } from '../mock';

export default function InputForm({ onAnalyze, isLoading }) {
  const [inputMode, setInputMode] = useState('paste'); // 'paste' | 'upload'
  const [resumeText, setResumeText] = useState('');
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [tone, setTone] = useState('Honest');
  const [errorMessage, setErrorMessage] = useState('');

  const fileInputRef = useRef(null);

  // Word count helper
  const getWordCount = (str) => (str ? str.trim().split(/\s+/).filter(Boolean).length : 0);
  const resumeWords = getWordCount(resumeText);
  const jdWords = getWordCount(jobDescription);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.size > 10 * 1024 * 1024) {
        setErrorMessage('File size exceeds 10MB limit.');
        return;
      }
      setFile(selected);
      setErrorMessage('');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0];
      setFile(dropped);
      setErrorMessage('');
    }
  };

  const handleLoadDemo = () => {
    setInputMode('paste');
    setResumeText(SAMPLE_DEMO_RESUME);
    setJobDescription(SAMPLE_DEMO_JD);
    setTone('Brutal'); // As per the demo script: "Select tone Brutal -> click Analyze"
    setFile(null);
    setErrorMessage('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Validation matching PRD & contract
    if (inputMode === 'paste' && !resumeText.trim()) {
      setErrorMessage('Resume text is required.');
      return;
    }
    if (inputMode === 'upload' && !file && !resumeText.trim()) {
      setErrorMessage('Please select a resume file or paste text.');
      return;
    }
    if (!jobDescription.trim()) {
      setErrorMessage('Job description is required.');
      return;
    }
    if (resumeWords > 10000) {
      setErrorMessage('Resume exceeds 10,000 words.');
      return;
    }

    onAnalyze({
      resumeText: inputMode === 'paste' ? resumeText : '',
      file: inputMode === 'upload' ? file : null,
      jobDescription,
      tone,
    });
  };

  return (
    <div className="input-form-container">
      <div className="form-header-bar">
        <div>
          <h2 className="section-title">Upload or Paste Resume & Target JD</h2>
          <p className="section-subtitle">
            Get an instant ATS match score, keyword breakdown, and a constructive roast.
          </p>
        </div>
        <button
          type="button"
          className="btn-demo-fill"
          onClick={handleLoadDemo}
          id="btn-load-demo"
        >
          <span>⚡ Load Demo Resume</span>
        </button>
      </div>

      {errorMessage && (
        <div className="alert alert-error" id="form-error-alert" role="alert">
          <svg className="alert-icon" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="roast-form" id="roast-form">
        <div className="form-grid">
          {/* LEFT: Resume Input */}
          <div className="card form-column">
            <div className="column-header">
              <label className="column-label">1. Resume Input</label>
              <div className="mode-toggle-group">
                <button
                  type="button"
                  className={`mode-btn ${inputMode === 'paste' ? 'active' : ''}`}
                  onClick={() => setInputMode('paste')}
                  id="tab-paste-resume"
                >
                  Paste Text
                </button>
                <button
                  type="button"
                  className={`mode-btn ${inputMode === 'upload' ? 'active' : ''}`}
                  onClick={() => setInputMode('upload')}
                  id="tab-upload-resume"
                >
                  Upload File
                </button>
              </div>
            </div>

            {inputMode === 'paste' ? (
              <div className="textarea-wrapper">
                <textarea
                  id="resume-text-input"
                  className="form-textarea"
                  rows={12}
                  placeholder="Paste plain resume text here (experience, skills, projects)..."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  disabled={isLoading}
                />
                <div className="counter-row">
                  <span>{resumeWords} words {resumeWords > 10000 ? '(Exceeds 10,000 max!)' : ''}</span>
                  <span className="privacy-badge">🔒 Not stored permanently</span>
                </div>
              </div>
            ) : (
              <div
                className="dropzone-box"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                id="file-dropzone"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt,.docx"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  id="file-input-element"
                />
                <div className="dropzone-content">
                  <div className="dropzone-icon">📄</div>
                  {file ? (
                    <div className="selected-file-info">
                      <strong>{file.name}</strong>
                      <span className="file-size">({(file.size / 1024).toFixed(1)} KB)</span>
                      <button
                        type="button"
                        className="btn-remove-file"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="dropzone-main-text">
                        Drag & drop your resume PDF or click to browse
                      </p>
                      <p className="dropzone-sub-text">Supports PDF or TXT up to 10MB</p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Job Description */}
          <div className="card form-column">
            <div className="column-header">
              <label className="column-label" htmlFor="jd-text-input">
                2. Job Description (Target Role)
              </label>
              <span className="header-meta">{jdWords} words</span>
            </div>

            <div className="textarea-wrapper">
              <textarea
                id="jd-text-input"
                className="form-textarea"
                rows={12}
                placeholder="Paste the job posting requirements, skills, and qualifications here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                disabled={isLoading}
              />
              <div className="counter-row">
                <span>Provide key skills and qualifications for better ATS matching</span>
              </div>
            </div>
          </div>
        </div>

        {/* TONE SELECTION BAR */}
        <div className="tone-selection-card">
          <div className="tone-label-group">
            <span className="tone-title">3. Choose Roast Tone</span>
            <span className="tone-subtitle">How harsh should the AI critique be?</span>
          </div>

          <div className="tone-options-grid">
            <label
              className={`tone-radio-card ${tone === 'Gentle' ? 'selected' : ''}`}
              htmlFor="tone-gentle"
            >
              <input
                type="radio"
                id="tone-gentle"
                name="roastTone"
                value="Gentle"
                checked={tone === 'Gentle'}
                onChange={() => setTone('Gentle')}
              />
              <span className="tone-emoji">🌱</span>
              <div className="tone-text">
                <span className="tone-name">Gentle</span>
                <span className="tone-desc">Encouraging mentor</span>
              </div>
            </label>

            <label
              className={`tone-radio-card ${tone === 'Honest' ? 'selected' : ''}`}
              htmlFor="tone-honest"
            >
              <input
                type="radio"
                id="tone-honest"
                name="roastTone"
                value="Honest"
                checked={tone === 'Honest'}
                onChange={() => setTone('Honest')}
              />
              <span className="tone-emoji">⚖️</span>
              <div className="tone-text">
                <span className="tone-name">Honest</span>
                <span className="tone-desc">Direct & candid (Default)</span>
              </div>
            </label>

            <label
              className={`tone-radio-card ${tone === 'Brutal' ? 'selected' : ''}`}
              htmlFor="tone-brutal"
            >
              <input
                type="radio"
                id="tone-brutal"
                name="roastTone"
                value="Brutal"
                checked={tone === 'Brutal'}
                onChange={() => setTone('Brutal')}
              />
              <span className="tone-emoji">🔥</span>
              <div className="tone-text">
                <span className="tone-name">Brutal</span>
                <span className="tone-desc">Merciless hiring manager</span>
              </div>
            </label>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="form-submit-row">
          <button
            type="submit"
            className="btn btn-primary btn-submit-large"
            disabled={isLoading}
            id="btn-analyze-submit"
          >
            {isLoading ? (
              <span className="spinner-wrapper">
                <span className="spinner"></span>
                <span>Roasting & Matching ATS Keywords...</span>
              </span>
            ) : (
              <span>🔥 Analyze & Roast Resume</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
