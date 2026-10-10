// Mongoose model for storing resume analysis results in MongoDB
const mongoose = require('mongoose');

const AnalysisSchema = new mongoose.Schema(
  {
    // NOTE: We intentionally do NOT store resumeText for privacy
    jobTitle: { type: String, default: '' },
    score: { type: Number, required: true },
    improvedScore: { type: Number, default: null },
    missingKeywords: { type: [String], default: [] },
    matchedKeywords: { type: [String], default: [] },
    tone: { type: String, enum: ['Gentle', 'Honest', 'Brutal'], default: 'Honest' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Analysis', AnalysisSchema);
