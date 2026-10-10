// Express route – POST /api/analyze – runs resume analysis and roast
const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');

const { extractKeywords, matchKeywords } = require('../utils/keywords');
const { computeScore } = require('../utils/scoring');
const { analyzePrompt } = require('../utils/prompts');
const { callLLM } = require('../utils/llm');
const Analysis = require('../models/Analysis');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const MAX_WORDS = 10_000;

/* ── POST /api/analyze ──────────────────────────────────────────────────── */
router.post('/', upload.single('file'), async (req, res, next) => {
  try {
    let resumeText = req.body.resumeText || '';
    const jobDescription = (req.body.jobDescription || '').trim();
    const tone = req.body.tone || 'Honest';

    // ── PDF extraction ──────────────────────────────────────────────────────
    if (req.file) {
      try {
        const pdfParse = require('pdf-parse');
        const data = await pdfParse(req.file.buffer);
        resumeText = (data && data.text) ? data.text.trim() : '';
        if (!resumeText) {
          return res.status(400).json({
            error: 'Could not extract text from PDF (it may be scanned or unreadable) — please paste the text instead.',
          });
        }
      } catch {
        return res.status(400).json({
          error: 'Could not extract text from PDF — please paste the text instead.',
        });
      }
    }

    resumeText = resumeText.trim();

    // ── Validation ──────────────────────────────────────────────────────────
    if (!resumeText) {
      return res.status(400).json({ error: 'Resume text is required.' });
    }
    if (!jobDescription) {
      return res.status(400).json({ error: 'Job description is required.' });
    }
    if (resumeText.split(/\s+/).filter(Boolean).length > MAX_WORDS) {
      return res.status(400).json({ error: 'Resume exceeds 10,000 words.' });
    }
    if (jobDescription.split(/\s+/).filter(Boolean).length > MAX_WORDS) {
      return res.status(400).json({ error: 'Job description exceeds 10,000 words.' });
    }

    // ── Keyword matching ────────────────────────────────────────────────────
    const keywords = extractKeywords(jobDescription);
    const { matched, missing } = matchKeywords(keywords, resumeText);

    // ── LLM call ────────────────────────────────────────────────────────────
    const { system, user } = analyzePrompt({ resumeText, jobDescription, missingKeywords: missing, tone });
    const llmResult = await callLLM({ system, user, type: 'analyze' });

    const { aiScore, scoreReason, roast, weakBullets } = llmResult;

    // ── Compute composite score ─────────────────────────────────────────────
    const score = computeScore({ matched, missing, aiScore: aiScore ?? 50 });

    // ── Persist to MongoDB (fire-and-forget, non-blocking) ──────────────────
    let analysisId = null;
    if (mongoose.connection.readyState === 1) {
      try {
        const doc = await Analysis.create({
          score,
          missingKeywords: missing,
          matchedKeywords: matched,
          tone,
        });
        analysisId = doc._id.toString();
      } catch (dbErr) {
        console.warn('DB save failed (non-fatal):', dbErr.message);
      }
    }

    res.json({
      analysisId,
      score,
      scoreReason,
      matchedKeywords: matched,
      missingKeywords: missing,
      roast,
      weakBullets,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
