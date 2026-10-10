// Utility – calculates resume score based on keyword matches and structure
/**
 * Weights (must sum to 1.0):
 *   KEYWORD_WEIGHT  – ratio of matched keywords
 *   AI_WEIGHT       – AI-provided relevance score (0-100) from the LLM call
 */
const KEYWORD_WEIGHT = 0.6;
const AI_WEIGHT = 0.4;

/**
 * Compute the composite resume score.
 *
 * @param {object} params
 * @param {string[]} params.matched     - keywords found in resume
 * @param {string[]} params.missing     - keywords not found
 * @param {number}   params.aiScore     - 0-100 AI relevance score
 * @returns {number} integer score 0-100
 */
function computeScore({ matched, missing, aiScore }) {
  const total = matched.length + missing.length;
  const keywordRatio = total === 0 ? 0 : matched.length / total;
  const raw = keywordRatio * KEYWORD_WEIGHT * 100 + aiScore * AI_WEIGHT;
  return Math.round(Math.min(100, Math.max(0, raw)));
}

module.exports = { computeScore, KEYWORD_WEIGHT, AI_WEIGHT };
