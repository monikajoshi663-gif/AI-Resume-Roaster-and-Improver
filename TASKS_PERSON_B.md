# Backend tasks for Person B
# Person B: Backend (folder: `server/` only)

You build the API, the scoring and the AI calls. You do NOT need the frontend to start: test with `curl`.

**Setup (first 15 min, together with Person A)**
- [ ] Create the GitHub repo, push the skeleton (`SETUP_PROMPT.md`), add Person A as collaborator
- [ ] Read the API contract in `README.md` and `GIT_RULES.md`
- [ ] `cd server && cp .env.example .env`, add `ANTHROPIC_API_KEY` (or set `LLM_MOCK=true` to start without a key)
- [ ] `npm i && npm run dev`, then check http://localhost:5000/api/health returns `{"ok":true}`

## Tasks (in this order)

### B1. Analyze endpoint with input handling (F1) 0:15 to 0:45
Files: `index.js`, `routes/analyze.js`
- [ ] multer memory upload and `pdf-parse` text extraction
- [ ] Reject empty input and anything over 10,000 words, with a clear `{ "error": "..." }`
- [ ] Friendly error for unreadable or scanned PDFs ("paste the text instead")
- **Done when:**
  ```bash
  curl -X POST localhost:5000/api/analyze -F resumeText="Built a React app" -F jobDescription="Intern\nReact Node.js" -F tone=Honest
  ```
  returns the contract JSON, and an empty `resumeText` returns a 400 with a message.

### B2. Keyword matching and score (F2, F3) 0:15 to 0:45
Files: `utils/keywords.js`, `utils/scoring.js`
- [ ] Extract keywords from the job description, split into matched and missing
- [ ] Score = 60% keyword overlap + 40% AI relevance (weights are at the top of `scoring.js`)
- **Done when:** on 3 sample resumes, at least 8 of 10 job description keywords are correctly marked matched or missing (check by hand).

### B3. AI prompts for roast and rewrite (F4, F5) 0:45 to 1:15
Files: `utils/prompts.js`, `utils/llm.js`
- [ ] Roast: 4 to 6 specific, witty lines, tone changes with Gentle / Honest / Brutal
- [ ] Weak bullets: lines copied exactly from the resume
- [ ] Always valid JSON back; unreadable answers return a clear 502 error
- **Done when:** the three tones give clearly different roasts, and `/api/analyze` answers in under 15 seconds.

### B4. Improve endpoint and rescoring (F6) 0:45 to 1:15
Files: `routes/improve.js`
- [ ] Rewrite weak bullets (action verb, measurable result, job description keywords)
- [ ] Swap rewrites into the resume text and rescore
- **Done when:**
  ```bash
  curl -X POST localhost:5000/api/improve -H "Content-Type: application/json" \
    -d '{"resumeText":"...","jobDescription":"...","weakBullets":["..."],"tone":"Honest"}'
  ```
  returns `rewrites`, `improvedResume` and a `newScore` at least 20 points above the first score on the demo resume.

### B5. MongoDB save and bug fixes 1:15 to 1:40
Files: `models/Analysis.js`, `routes/*.js`
- [ ] Save jobTitle, score, improvedScore, missingKeywords (NOT the resume text)
- [ ] App must still run when `MONGO_URI` is empty
- [ ] Run Person A's frontend against your server and fix whatever breaks
- **Done when:** 10 of 10 runs succeed on PDF and pasted text, including a 2-page resume.

### B6. Deploy and demo prep 1:40 to 2:00
- [ ] Deploy `server/` to Render (root directory `server`, start command `npm start`)
- [ ] Set env vars on Render: `ANTHROPIC_API_KEY`, `MONGO_URI`, `CLIENT_ORIGIN` (Person A's Vercel URL)
- [ ] Send Person A the Render URL
- [ ] Prepare a weak demo resume and a real internship job description; keep a saved sample result as a fallback in case the AI API is slow
- **Done when:** the deployed frontend and backend run the 2-minute demo script from `README.md`.

## Commit messages
`server: analyze endpoint`, `server: keyword scoring`, `server: prompts`, `server: improve endpoint`, `server: mongo save`, `server: deploy config`

## Ask Person A for
- A heads-up when their form sends something new
- Their Vercel URL (for `CLIENT_ORIGIN`)