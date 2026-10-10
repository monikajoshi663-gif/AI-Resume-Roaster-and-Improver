// Utility – wrapper for LLM API calls (Anthropic Claude) with mock mode
const Anthropic = process.env.LLM_MOCK !== 'true' ? require('anthropic') : null;

const MODEL = 'claude-3-5-haiku-20241022';
const MAX_TOKENS = 1024;

/* ── Mock responses ──────────────────────────────────────────────────────── */
const MOCK_ANALYZE = {
  aiScore: 35,
  scoreReason: 'Resume lacks measurable results and most required keywords.',
  roast: [
    "Your 'proficient in Microsoft Office' line is doing heavy lifting for a dev role.",
    "Three bullet points start with 'Assisted' — you assisted your way through uni.",
    'No GitHub link. Are we supposed to take your word for it?',
    'GPA of 3.2 listed before any project: bold strategy.',
  ],
  weakBullets: [
    'Assisted with development of internal tools',
    'Helped team members with various tasks',
  ],
};

const MOCK_IMPROVE = {
  rewrites: [
    {
      original: 'Assisted with development of internal tools',
      rewritten:
        'Built 3 internal React dashboards that reduced reporting time by 40% for a 12-person ops team',
    },
    {
      original: 'Helped team members with various tasks',
      rewritten:
        'Mentored 4 junior devs on REST API design, cutting onboarding time from 2 weeks to 4 days',
    },
  ],
  aiScoreImproved: 72,
};

/* ── Real LLM call ───────────────────────────────────────────────────────── */
/**
 * Calls the Anthropic API and parses the JSON response.
 * Falls back to mock data when LLM_MOCK=true.
 *
 * @param {object} opts
 * @param {string} opts.system   - system prompt
 * @param {string} opts.user     - user message
 * @param {'analyze'|'improve'} opts.type - which mock to return
 * @returns {Promise<object>} parsed JSON from the model
 * @throws {{ status: 502, message: string }} if response is unparseable
 */
async function callLLM({ system, user, type }) {
  if (process.env.LLM_MOCK === 'true') {
    // Simulate latency
    await new Promise((r) => setTimeout(r, 600));
    return type === 'improve' ? MOCK_IMPROVE : MOCK_ANALYZE;
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system,
    messages: [{ role: 'user', content: user }],
  });

  const raw = message.content?.[0]?.text ?? '';

  // Strip accidental markdown code fences
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const err = new Error('AI service returned an unreadable response. Try again.');
    err.status = 502;
    throw err;
  }
}

module.exports = { callLLM };
