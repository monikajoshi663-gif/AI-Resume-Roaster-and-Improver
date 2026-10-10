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
    // Articles / conjunctions / prepositions
    'a','an','the','and','or','but','in','on','at','to','for','of','with',
    'is','are','was','were','be','been','being','have','has','had','do',
    'does','did','will','would','could','should','may','might','shall',
    'can','not','no','nor','so','yet','both','either','neither','as','if',
    'then','than','that','this','these','those','we','you','they','he',
    'she','it','our','your','their','its','my','by','from','up','about',
    'into','through','during','including','until','while','per','between',
    'such','when','where','who','which','how','all','any','most','other',
    'some','same','own','just','also','well','new','strong','must',
    'able','good','work','working','knowledge','experience','skills',
    'required','preferred','bonus','plus','role','team','join','help',
    'build','building','make','use','using','ability','understanding','familiarity',
    // Job posting boilerplate
    'software','engineering','engineer','intern','internship','requirements',
    'requirement','responsibilities','responsibility','qualifications',
    'qualification','about','company','position','candidate','candidates',
    'looking','opportunity','apply','application','hiring','hire','years',
    'minimum','minimum','ideal','great','like','love','excellent','solid',
    'proven','demonstrated','hands','hands-on','real','world','day','days',
    'time','full','part','remote','onsite','hybrid','location','salary',
    'benefits','perks','what','bring','offer','want','need','expect',
    'following','least','level','entry','senior','junior','mid','plus',
    'nice','have','bonus','preferred','fast','paced','environment','startup',
    'stack','database','databases','pipeline','pipelines','problem','solving',
    'communication','written','verbal','degree','bachelor','bachelors','master',
    'masters','computer','science','related','field','looking','must-have',
  ]);

  // First: extract recognised multi-word tech terms before splitting
  const MULTI_WORD = [
    'node.js','react.js','vue.js','next.js','ci/cd','rest apis','rest api',
    'graphql','postgresql','mongodb','machine learning','deep learning',
    'natural language processing','large language model','version control',
    'test driven development','object oriented programming',
  ];

  let text = jobDescription.toLowerCase();
  const extracted = [];

  for (const term of MULTI_WORD) {
    if (text.includes(term)) {
      extracted.push(term);
      text = text.split(term).join(' '); // remove so it's not double-counted
    }
  }

  // Second: single tokens
  const singleTokens = text
    .replace(/[^a-z0-9#+.\s-]/g, ' ')
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length >= 2 && !STOP_WORDS.has(w));

  return [...new Set([...extracted, ...singleTokens])];
}

/**
 * Splits keywords into matched (found in resume) and missing (not found).
 * Uses boundary matching safe for symbols like C++, C#, node.js, CI/CD.
 *
 * @param {string[]} keywords
 * @param {string}   resumeText
 * @returns {{ matched: string[], missing: string[] }}
 */
function matchKeywords(keywords, resumeText) {
  const lower = ' ' + (resumeText || '').toLowerCase() + ' ';
  const matched = [];
  const missing = [];

  for (const kw of keywords) {
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp('(^|[^a-zA-Z0-9#+])' + escaped + '($|[^a-zA-Z0-9#+])', 'i');
    (re.test(lower) ? matched : missing).push(kw);
  }

  return { matched, missing };
}

module.exports = { extractKeywords, matchKeywords };
