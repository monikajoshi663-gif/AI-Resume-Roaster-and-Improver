// Utility – prompt templates for LLM roast and improve requests

/**
 * Builds the system + user messages for the /api/analyze call.
 *
 * @param {object} p
 * @param {string}   p.resumeText
 * @param {string}   p.jobDescription
 * @param {string[]} p.missingKeywords
 * @param {string}   p.tone  "Gentle" | "Honest" | "Brutal"
 * @returns {{ system: string, user: string }}
 */
function analyzePrompt({ resumeText, jobDescription, missingKeywords, tone }) {
  const toneGuide = {
    Gentle:
      'Be encouraging and constructive. Point out real weaknesses gently, like a supportive mentor.',
    Honest:
      'Be direct and candid. Point out real weaknesses without sugarcoating, but stay professional.',
    Brutal:
      'Be mercilessly blunt and witty. Roast the resume like a seasoned hiring manager who has seen it all. No mercy, but keep it specific and accurate.',
  }[tone] || 'Be direct and candid.';

  const system = `You are a world-class resume reviewer and hiring manager with 20 years of experience.
${toneGuide}
You MUST respond with ONLY valid JSON — no markdown, no explanation outside the JSON object.`;

  const user = `Job Description:
${jobDescription}

Resume:
${resumeText}

Missing keywords from the job description (not found in resume): ${missingKeywords.join(', ') || 'none'}

Return exactly this JSON shape (no other keys):
{
  "aiScore": <integer 0-100 — how relevant is this resume to the job, ignoring keyword count>,
  "scoreReason": "<one sentence explaining the score>",
  "roast": ["<line 1>", "<line 2>", "<line 3>", "<line 4>"],
  "weakBullets": ["<exact bullet copied from resume>", "..."]
}

Rules:
- roast: 4-6 specific, witty lines based on actual resume content. Tone: ${tone}.
- weakBullets: 2-4 bullet points from the resume that are vague, passive, or unmeasurable. Copy them EXACTLY as they appear.
- aiScore: 0-100 integer, independent of keyword count.`;

  return { system, user };
}

/**
 * Builds the system + user messages for the /api/improve call.
 *
 * @param {object} p
 * @param {string}   p.resumeText
 * @param {string}   p.jobDescription
 * @param {string[]} p.weakBullets
 * @param {string}   p.tone
 * @returns {{ system: string, user: string }}
 */
function improvePrompt({ resumeText, jobDescription, weakBullets, tone }) {
  const system = `You are an expert resume writer who transforms weak bullet points into powerful, measurable achievements.
You MUST respond with ONLY valid JSON — no markdown, no explanation outside the JSON object.`;

  const user = `Job Description:
${jobDescription}

Original Resume:
${resumeText}

Weak bullets to rewrite (tone: ${tone}):
${weakBullets.map((b, i) => `${i + 1}. ${b}`).join('\n')}

Return exactly this JSON shape:
{
  "rewrites": [
    { "original": "<exact original bullet>", "rewritten": "<improved bullet>" }
  ],
  "aiScoreImproved": <integer 0-100 — estimated relevance of the improved resume>
}

Rules for rewrites:
- Start with a strong action verb (Built, Reduced, Automated, Shipped, Led, …)
- Include a measurable result where possible (%, $, time saved, users, …)
- Naturally weave in relevant job description keywords
- Keep each bullet to one sentence, ≤25 words`;

  return { system, user };
}

module.exports = { analyzePrompt, improvePrompt };
