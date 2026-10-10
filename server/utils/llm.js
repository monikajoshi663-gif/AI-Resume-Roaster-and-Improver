// Utility – wrapper for LLM API calls (Anthropic Claude) with mock mode
// Anthropic is loaded lazily inside callLLM() so mock mode never requires the package.

const MODEL = 'claude-3-5-haiku-20241022';
const MAX_TOKENS = 1024;

/* ── Mock responses by tone ──────────────────────────────────────────────── */
const MOCK_ROASTS = {
  Gentle: [
    'You clearly have a solid technical foundation, but highlight your concrete impact more prominently.',
    "Consider replacing 'Assisted with' to clearly state what you personally built and delivered.",
    'A prominent GitHub or portfolio link would showcase your actual code to recruiters.',
    'Moving your hands-on development projects above coursework will highlight your practical skills.',
  ],
  Honest: [
    "Your 'proficient in Microsoft Office' line is doing heavy lifting for a developer role.",
    "Three bullet points start with 'Assisted' — you assisted your way through university.",
    'No GitHub link provided. Recruiters are left guessing whether your code actually runs.',
    'GPA of 3.2 listed before any project: a bold strategic choice for a tech resume.',
  ],
  Brutal: [
    'This resume reads like you watched someone else build a software application from across the room.',
    'Listing HTML and Microsoft Word for a full-stack engineering role is grounds for instant rejection.',
    'Every bullet point is so passive it qualifies as emotional support engineering.',
    'If this resume were any more generic, it would come pre-installed as sample text on Windows 95.',
    'You claim to have worked with modern tools, but your descriptions sound like you merely read the Wikipedia page.',
  ],
};

function getMockAnalyze({ tone = 'Honest', resumeText = '' }) {
  const roast = MOCK_ROASTS[tone] || MOCK_ROASTS.Honest;
  // Try to pick actual lines from the resume text as weak bullets if available
  const candidateBullets = (resumeText || '')
    .split(/\r?\n/)
    .map((l) => l.replace(/^[-*•\d.]\s*/, '').trim())
    .filter((l) => l.length >= 10 && l.length <= 120);

  const weakBullets =
    candidateBullets.length >= 2
      ? candidateBullets.slice(0, 2)
      : candidateBullets.length === 1
      ? [candidateBullets[0], 'Assisted with development of internal tools']
      : [
          'Assisted with development of internal tools',
          'Helped team members with various tasks',
        ];

  return {
    aiScore: tone === 'Brutal' ? 28 : tone === 'Gentle' ? 42 : 35,
    scoreReason: 'Resume lacks measurable metrics, impact numbers, and several target role keywords.',
    roast,
    weakBullets,
  };
}

function getMockImprove({ weakBullets = [], resumeText = '' }) {
  const bullets =
    Array.isArray(weakBullets) && weakBullets.length > 0
      ? weakBullets
      : [
          'Assisted with development of internal tools',
          'Helped team members with various tasks',
        ];

  const rewrites = bullets.map((original, i) => {
    if (i === 0) {
      return {
        original,
        rewritten:
          'Built and deployed responsive React dashboard modules that cut manual report turnaround by 40% across a 12-person team',
      };
    }
    return {
      original,
      rewritten:
        'Architected Node.js and Express REST API endpoints with automated unit tests, reducing onboarding latency by 50%',
    };
  });

  return {
    rewrites,
    aiScoreImproved: 76,
  };
}

/* ── Real LLM call ───────────────────────────────────────────────────────── */
/**
 * Calls the Anthropic API and parses the JSON response.
 * Falls back to mock data when LLM_MOCK=true.
 *
 * @param {object} opts
 * @param {string} opts.system   - system prompt
 * @param {string} opts.user     - user message
 * @param {'analyze'|'improve'} opts.type - which mock to return
 * @param {string} [opts.tone]   - tone for analyze
 * @param {string} [opts.resumeText] - raw resume text
 * @param {string[]} [opts.weakBullets] - weak bullets for improve
 * @returns {Promise<object>} parsed JSON from the model
 * @throws {{ status: 502, message: string }} if response is unparseable
 */
async function callLLM({ system, user, type, tone, resumeText, weakBullets }) {
  if (process.env.LLM_MOCK === 'true') {
    // Simulate latency
    await new Promise((r) => setTimeout(r, 600));
    return type === 'improve'
      ? getMockImprove({ weakBullets, resumeText })
      : getMockAnalyze({ tone, resumeText });
  }

  const Anthropic = require('@anthropic-ai/sdk');
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system,
    messages: [{ role: 'user', content: user }],
  });

  const raw = message.content?.[0]?.text ?? '';

  // Extract JSON from markdown fence or bracket block
  let cleaned = raw.trim();
  const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenceMatch) {
    cleaned = fenceMatch[1].trim();
  } else {
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.slice(firstBrace, lastBrace + 1);
    }
  }

  try {
    return JSON.parse(cleaned);
  } catch {
    const err = new Error('AI service returned an unreadable response. Try again.');
    err.status = 502;
    throw err;
  }
}

module.exports = { callLLM };
