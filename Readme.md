# Resume Roaster — API Contract & Run Instructions

> **Both team members edit this file only by mutual agreement.**  
> Commit message prefix: `contract: ...`

---

## API base URL

| Environment | URL |
|---|---|
| Local (Person B) | `http://localhost:5000` |
| Deployed (Render) | Set as `VITE_API_URL` in client `.env` |

---

## Endpoints

### `GET /api/health`
Returns `{"ok":true}` — used by Person A to confirm the server is up.

---

### `POST /api/analyze`
Accepts `multipart/form-data` **or** `application/json`.

**Request fields**

| Field | Type | Required | Notes |
|---|---|---|---|
| `resumeText` | string | yes (or file) | Plain text of the resume |
| `file` | File (PDF) | yes (or text) | PDF upload; server extracts text |
| `jobDescription` | string | yes | Full job posting text |
| `tone` | string | no | `"Gentle"` / `"Honest"` (default) / `"Brutal"` |

**Success response `200`**

```json
{
  "analysisId": "abc123",
  "score": 42,
  "scoreReason": "Missing 6 of 10 keywords; bullets lack measurable results.",
  "matchedKeywords": ["React", "Node.js"],
  "missingKeywords": ["TypeScript", "REST", "CI/CD", "Docker", "Jest", "Agile"],
  "roast": [
    "Your 'proficient in Microsoft Office' line is doing heavy lifting for a dev role.",
    "Three bullet points start with 'Assisted' — you assisted your way through uni.",
    "No GitHub link. Are we supposed to take your word for it?",
    "GPA of 3.2 listed before any project: bold strategy."
  ],
  "weakBullets": [
    "Assisted with development of internal tools",
    "Helped team members with various tasks"
  ]
}
```

**Error responses**

| Status | `error` value |
|---|---|
| 400 | `"Resume text is required."` |
| 400 | `"Resume exceeds 10,000 words."` |
| 400 | `"Could not extract text from PDF — please paste the text instead."` |
| 502 | `"AI service returned an unreadable response. Try again."` |

---

### `POST /api/improve`
Content-Type: `application/json`

**Request body**

```json
{
  "analysisId": "abc123",
  "resumeText": "...",
  "jobDescription": "...",
  "weakBullets": ["Assisted with development of internal tools"],
  "tone": "Honest"
}
```

**Success response `200`**

```json
{
  "rewrites": [
    {
      "original": "Assisted with development of internal tools",
      "rewritten": "Built 3 internal React dashboards that cut reporting time by 40%"
    }
  ],
  "improvedResume": "... full resume text with bullets swapped in ...",
  "newScore": 68,
  "pointGain": 26
}
```

**Error responses** — same shape as `/api/analyze`.

---

## Running locally

```bash
# Terminal 1 — backend (Person B)
cd server
cp .env.example .env      # fill in ANTHROPIC_API_KEY (or set LLM_MOCK=true)
npm install
npm run dev               # → http://localhost:5000

# Terminal 2 — frontend (Person A)
cd client
cp .env.example .env      # set VITE_USE_MOCK=true to skip the backend
npm install
npm run dev               # → http://localhost:5173
```

## Demo script (2 min)

1. Open the deployed Vercel URL.
2. Paste the weak demo resume (saved in `README.md` below or in chat).
3. Paste the internship job description.
4. Select tone **Brutal** → click **Analyze**.
5. Score ~42% appears with roast cards and red keyword chips.
6. Click **Fix my weak bullets** → score jumps to ~68%, green chips appear.
7. Click **Copy improved resume**.

---

## Weak demo resume (for fallback)

```
Jane Doe | jane@email.com
Education: B.S. Computer Science, GPA 3.2
Skills: Python, Microsoft Office, teamwork
Experience:
  - Assisted with development of internal tools
  - Helped team members with various tasks
  - Participated in weekly stand-ups
```

## Demo job description

```
Software Engineering Intern
Requirements: React, Node.js, TypeScript, REST APIs, CI/CD, Docker, Jest, Agile
```