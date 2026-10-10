# Frontend tasks for Person A
# Person A: Frontend (folder: `client/` only)

You build everything the judge sees. You do NOT need the backend to start: use mock mode.

**Setup (first 15 min, together with Person B)**
- [ ] Clone the repo, read the API contract in `README.md`, read `GIT_RULES.md`
- [ ] `cd client && cp .env.example .env`, set `VITE_USE_MOCK=true`
- [ ] `npm i && npm run dev` and open http://localhost:5173

## Tasks (in this order)

### A1. Input form (F1 + tone toggle) 0:15 to 0:45
Files: `src/components/InputForm.jsx`, `src/api.js`
- [ ] Textarea for resume, PDF file picker, textarea for job description
- [ ] Tone toggle: Gentle / Honest (default) / Brutal
- [ ] Block empty input with a clear message
- [ ] Button shows a loading state while waiting
- **Done when:** clicking Analyze in mock mode shows the loading state for about a second and then calls `onSubmit` with `{file, resumeText, jobDescription, tone}`.

### A2. Score, keyword chips, roast cards (F2, F3, F4) 0:45 to 1:15
Files: `src/components/ScoreGauge.jsx`, `src/components/Results.jsx`
- [ ] Circular gauge with the 0 to 100 score and the one-line reason
- [ ] Green chips for matched keywords, red chips for missing ones
- [ ] One card per roast line
- **Done when:** the mock result (42%, 4 roast lines, red and green chips) renders correctly on desktop and on a phone-width window.

### A3. Improve view and before/after (F5, F6) 1:15 to 1:40
Files: `src/components/Improved.jsx`, `src/App.jsx`
- [ ] "Fix my weak bullets" button calls `improve()` with `{analysisId, resumeText, jobDescription, weakBullets, tone}`
- [ ] Original and rewritten bullets shown as pairs
- [ ] Before and after gauges with the point gain
- [ ] Copy-improved-resume button
- [ ] Every API error shows the server's `error` message in the red banner
- **Done when:** the full flow (analyze, improve, copy) works end to end on mock data.

### A4. Connect the real API 1:15 to 1:40 (when Person B's server runs)
- [ ] Set `VITE_USE_MOCK=false` in `.env`, run Person B's server on port 5000
- [ ] Test with pasted text AND a PDF upload
- [ ] Test errors: empty resume, empty job description, scanned PDF
- **Done when:** a real resume gives a real score and rewrites with no console errors.

### A5. Polish and deploy 1:40 to 2:00
- [ ] Deploy `client/` to Vercel. Set env `VITE_API_URL` to Person B's Render URL
- [ ] Add the privacy line "Your resume text is never stored" (already in the form)
- [ ] Keep a screenshot of the 42% to 85% result as a fallback for the demo
- **Done when:** a judge can open the deployed link and run the demo script from `README.md`.

## Commit messages
`client: input form`, `client: score gauge and chips`, `client: improve view`, `client: connect real api`, `client: polish`

## Ask Person B for
- The Render URL of the server (for `VITE_API_URL`)
- A heads-up before any change to the JSON contract