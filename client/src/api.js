// API helper functions for communicating with backend or running with mocks
import { mockAnalyze, mockImprove } from './mock';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

/**
 * Health check helper
 */
export async function checkHealth() {
  if (USE_MOCK) return { ok: true, mock: true };
  try {
    const res = await fetch(`${API_BASE_URL}/api/health`);
    if (!res.ok) throw new Error(`Health check failed (${res.status})`);
    return await res.json();
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Analyze resume against job description
 *
 * @param {object} params
 * @param {string} [params.resumeText]
 * @param {File}   [params.file]
 * @param {string} params.jobDescription
 * @param {string} [params.tone] - 'Gentle' | 'Honest' | 'Brutal'
 */
export async function analyzeResume({ resumeText, file, jobDescription, tone = 'Honest' }) {
  if (USE_MOCK) {
    let text = resumeText;
    if (file && !text) {
      // If a file was uploaded in mock mode, attempt reading as text if plain text, or default to mock text
      try {
        if (file.type === 'text/plain') {
          text = await file.text();
        } else {
          text = `Extracted text from ${file.name}:\nJane Doe | jane@email.com\nEducation: B.S. Computer Science\nSkills: Python, Microsoft Office\nExperience:\n- Assisted with development of internal tools\n- Helped team members with various tasks\n- Participated in weekly stand-ups`;
        }
      } catch {
        text = 'Sample extracted resume text';
      }
    }
    return await mockAnalyze({ resumeText: text, jobDescription, tone });
  }

  // Live Backend API call
  let response;
  if (file) {
    const formData = new FormData();
    formData.append('file', file);
    if (resumeText) formData.append('resumeText', resumeText);
    formData.append('jobDescription', jobDescription);
    formData.append('tone', tone);

    response = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: 'POST',
      body: formData,
    });
  } else {
    response = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resumeText,
        jobDescription,
        tone,
      }),
    });
  }

  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.error || 'Failed to analyze resume');
    error.status = response.status;
    throw error;
  }

  return data;
}

/**
 * Improve weak bullets and rescore resume
 *
 * @param {object} params
 * @param {string} [params.analysisId]
 * @param {string} params.resumeText
 * @param {string} params.jobDescription
 * @param {string[]} params.weakBullets
 * @param {string} [params.tone]
 */
export async function improveResume({ analysisId, resumeText, jobDescription, weakBullets, tone = 'Honest' }) {
  if (USE_MOCK) {
    return await mockImprove({ analysisId, resumeText, jobDescription, weakBullets, tone });
  }

  const response = await fetch(`${API_BASE_URL}/api/improve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      analysisId,
      resumeText,
      jobDescription,
      weakBullets,
      tone,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.error || 'Failed to improve resume');
    error.status = response.status;
    throw error;
  }

  return data;
}
