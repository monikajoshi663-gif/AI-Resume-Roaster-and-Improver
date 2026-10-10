// Express server entry point – configures middleware and mounts routes
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const analyzeRouter = require('./routes/analyze');
const improveRouter = require('./routes/improve');

const app = express();
const PORT = process.env.PORT || 5000;

// ── CORS ────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow requests with no origin (curl, Postman) or matching origins
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  })
);

// ── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/analyze', analyzeRouter);
app.use('/api/improve', improveRouter);

// ── Global error handler ─────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// ── MongoDB (optional — app still runs without it) ───────────────────────────
if (process.env.MONGO_URI) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.warn('MongoDB connection failed (continuing without DB):', err.message));
} else {
  console.warn('MONGO_URI not set — running without database.');
}

// ── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => console.log(`Resume Roaster server running on http://localhost:${PORT}`));
