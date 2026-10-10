// Utility – extracts and matches keywords from resume and job description
/**
 * Extracts meaningful keywords from a job description.
 * Filters out stop-words, short tokens, and generic filler.
 *
 * @param {string} jobDescription
 * @returns {string[]} lowercase keyword list
 */
function extractKeywords(jobDescription) {
  const STOP_WORDS = new Set([
    'a','an','the','and','or','but','in','on','at','to','for','of','with',
    'is','are','was','were','be','been','being','have','has','had','do',
    'does','did','will','would','could','should','may','might','shall',
    'can','not','no','nor','so','yet','both','either','neither','as','if',
    'then','than','that','this','these','those','we','you','they','he',
    'she','it','our','your','their','its','my','by','from','up','about',
    'into','through','during','including','until','while','per','between',
    'such','when','where','who','which','how','all','any','most','other',
    'some','such','same','own','just','also','well','new','strong','must',
    'able','good','work','working','knowledge','experience','skills',
    'required','preferred','bonus','plus','role','team','join','help',
    'build','make','use','using','ability','understanding','familiarity',
  ]);

  const words = jobDescription
    .toLowerCase()
    .replace(/[^a-z0-9#+.\s-]/g, ' ')
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length >= 2 && !STOP_WORDS.has(w));

  // Deduplicate while preserving order
  return [...new Set(words)];
}

/**
 * Splits keywords into matched (found in resume) and missing (not found).
 *
 * @param {string[]} keywords
 * @param {string}   resumeText
 * @returns {{ matched: string[], missing: string[] }}
 */
function matchKeywords(keywords, resumeText) {
  const lower = resumeText.toLowerCase();
  const matched = [];
  const missing = [];

  for (const kw of keywords) {
    // Build a loose regex: "node.js" → matches "node.js" anywhere
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`\\b${escaped}\\b`, 'i');
    (re.test(lower) ? matched : missing).push(kw);
  }

  return { matched, missing };
}

module.exports = { extractKeywords, matchKeywords };
