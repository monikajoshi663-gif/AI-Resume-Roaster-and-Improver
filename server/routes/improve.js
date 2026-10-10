// Express route – POST /api/improve – returns AI-improved resume suggestions
const express = require('express');
const mongoose = require('mongoose');

const { extractKeywords, matchKeywords } = require('../utils/keywords');
const { computeScore } = require('../utils/scoring');
const { improvePrompt } = require('../utils/prompts');
const { callLLM } = require('../utils/llm');
const Analysis = require('../models/Analysis');

const router = express.Router();

/* ── POST /api/improve ──────────────────────────────────────────────────── */
router.post('/', async (req, res, next) => {
  try {
    const {
      analysisId,
      resumeText: rawResumeText = '',
      jobDescription: rawJobDesc = '',
      weakBullets = [],
      tone = 'Honest',
    } = req.body;

    const resumeText = rawResumeText.trim();
    const jobDescription = rawJobDesc.trim();

    // ── Validation ────────────────────────────────────────────────────────────
    if (!resumeText) {
      return res.status(400).json({ error: 'Resume text is required.' });
    }
    if (!jobDescription) {
      return res.status(400).json({ error: 'Job description is required.' });
    }
    if (!Array.isArray(weakBullets) || weakBullets.length === 0) {
      return res.status(400).json({ error: 'At least one weak bullet is required.' });
    }

    // ── LLM call for rewrites ─────────────────────────────────────────────────
    const { system, user } = improvePrompt({ resumeText, jobDescription, weakBullets, tone });
    const llmResult = await callLLM({ system, user, type: 'improve', tone, resumeText, weakBullets });

    const { rewrites = [], aiScoreImproved } = llmResult;

    // ── Swap rewrites into the resume text ────────────────────────────────────
    let improvedResume = resumeText;
    for (const { original, rewritten } of rewrites) {
      if (original && rewritten) {
        improvedResume = improvedResume.split(original).join(rewritten);
      }
    }

    // ── Rescore the improved resume ───────────────────────────────────────────
    const keywords = extractKeywords(jobDescription);
    const { matched, missing } = matchKeywords(keywords, improvedResume);
    const newScore = computeScore({ matched, missing, aiScore: aiScoreImproved ?? 70 });

    // Original score for pointGain (re-score original resume the same way)
    const { matched: origMatched, missing: origMissing } = matchKeywords(keywords, resumeText);
    // Use a conservative ai score baseline (40) if we don't have the original aiScore
    const origScore = computeScore({ matched: origMatched, missing: origMissing, aiScore: 40 });
    const pointGain = Math.max(0, newScore - origScore);

    // ── Update MongoDB record if we have an analysisId ────────────────────────
    if (analysisId && mongoose.connection.readyState === 1) {
      try {
        await Analysis.findByIdAndUpdate(analysisId, { improvedScore: newScore });
      } catch (dbErr) {
        console.warn('DB update failed (non-fatal):', dbErr.message);
      }
    }

    res.json({
      rewrites,
      improvedResume,
      newScore,
      pointGain,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
