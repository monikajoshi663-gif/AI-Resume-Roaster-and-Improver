# Shared API contract and run instructions (both team members edit only by mutual agreement)
# AI Resume Roaster and Improver: PRD

Oct 10, 2026 · @Monika

A MERN web app that scores a resume against a job description, roasts its weaknesses and rewrites weak bullets, built by a team of two in 2 hours.

## Problem and goals

Job seekers send one generic resume to every company, and ATS software rejects it for missing keywords without telling them why. Paid reviews are slow and expensive, and free feedback is rarely tied to the specific role.

**Goals**

- Give a 0 to 100 match score between a resume and a job description in under 15 seconds.
- Show which keywords are matched and which are missing.
- Give honest, funny but constructive feedback (the roast).
- Rewrite weak bullet points and show the score before and after.

**Non-goals**

- No resume design or template builder.
- No job search or application tracking.
- No permanent storage of resume text unless the user opts in.

## Users and use cases

The primary user is a student or fresher applying for internships and first jobs, with no access to a career coach.

| User | Need | Typical scenario |
| --- | --- | --- |
| Final-year student | Know why applications get no reply | Pastes resume and an internship JD, sees a 42% match and the missing keywords |
| Career switcher | Reframe past experience for a new role | Rewrites bullets to use the new field's language |
| Placement cell mentor | Review many resumes quickly | Runs each student resume against a target JD and shares the roast |

## Features and requirements

Six features are must-haves for the demo; the rest are added only if time remains.

| ID | Feature | Requirement | Priority |
| --- | --- | --- | --- |
| F1 | Input | Upload a PDF or paste resume text, and paste the job description. Reject empty or over 10,000-word input with a clear message. | Must |
| F2 | Match score | Score from 0 to 100 from keyword overlap and LLM relevance rating, with a one-line reason. | Must |
| F3 | Keyword gap | Matched keywords shown as green chips, missing keywords as red chips. | Must |
| F4 | Roast mode | 4 to 6 specific, witty observations (buzzwords, no numbers, passive voice, weak verbs). | Must |
| F5 | Bullet rewriter | Each weak bullet rewritten with a strong action verb, a measurable result and JD keywords. | Must |
| F6 | Before and after | Rescore the improved resume and show the score gain. | Must |
| F7 | Tone toggle | Gentle, Honest or Brutal roast. | Good to have |
| F8 | Export | Download the improved resume as text or PDF. | Good to have |
| F9 | Section scores | Separate scores for skills, experience, projects and education. | Good to have |
| F10 | Login and history | JWT login and a list of past analyses. | Good to have |

## User flow

1. The user opens the app and uploads a resume PDF or pastes its text.
2. The user pastes the job description and picks a roast tone (default Honest).
3. The user clicks Analyze; a loading state shows while the backend extracts text and calls the AI.
4. The results page shows the match score gauge, green and red keyword chips, and the roast cards.
5. The user clicks Improve; weak bullets appear as original and rewritten pairs.
6. The app rescores the improved resume and shows the before and after score.
7. The user copies or downloads the improved text.

## Technical design

The React client sends the resume and job description to an Express API, which extracts text, computes the keyword score locally, and calls an LLM API for the roast and rewrites. MongoDB stores analysis results only.

| Layer | Technology | Responsibility |
| --- | --- | --- |
| Frontend | React, Vite, Axios | Upload and paste form, score gauge, keyword chips, roast cards, before and after view |
| Backend | Node.js, Express, multer, pdf-parse | File upload, PDF text extraction, keyword matching, LLM calls |
| Database | MongoDB, Mongoose | Analysis records and optional user accounts |
| AI | Claude API or another LLM API | Roast, bullet rewriting, relevance rating |

**API endpoints**

| Method and path | Input | Output |
| --- | --- | --- |
| POST /api/analyze | resume file or text, job description, tone | score, matched and missing keywords, roast items, weak bullets |
| POST /api/improve | resume text, job description, weak bullets | rewritten bullets, improved resume text, new score |
| GET /api/history | none (login required) | list of past analyses |

**Data model (Analysis)**

| Field | Type | Note |
| --- | --- | --- |
| jobTitle | String | From the first line of the job description |
| score | Number | 0 to 100 |
| improvedScore | Number | Set after /improve |
| missingKeywords | \[String\] | Stored for history |
| resumeText | String | Off by default for privacy |
| createdAt | Date | Set automatically |

**Scoring logic.** Extract keywords from the job description (skills, tools, role terms), count how many appear in the resume, then blend that overlap (60%) with an LLM relevance rating (40%). The weights are a starting point and can be tuned after testing on 3 sample resumes.

## Success metrics

| Metric | Target |
| --- | --- |
| Time from click to results | Under 15 seconds |
| Score gain after rewrite | At least 20 points on the demo resume |
| Keyword accuracy | At least 8 of 10 JD keywords correctly matched or flagged on 3 test resumes |
| Crash-free runs | 10 of 10 on PDF and pasted text, including a 2-page resume |
| Judge test | A judge pastes their own resume and sees results in under 1 minute |

## 2-hour build plan

Two teammates work in parallel after agreeing the API shape in the first 15 minutes.

| Time | Frontend | Backend |
| --- | --- | --- |
| 0:00 to 0:15 | Agree on /analyze and /improve request and response JSON, set up repo, Vite app and Express server | Same |
| 0:15 to 0:45 | Input form, PDF upload, loading state | Express setup, multer and pdf-parse, keyword extraction and scoring |
| 0:45 to 1:15 | Score gauge, keyword chips, roast cards | LLM prompts for roast and rewrite, /analyze and /improve endpoints |
| 1:15 to 1:40 | Before and after view, error states, connect to real API | MongoDB save, input validation, bug fixes |
| 1:40 to 2:00 | Polish, deploy to Vercel and Render | Test with 3 resumes, README, demo script |

## Risks and demo script

| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| LLM API is slow or rate limited | Medium | Cache the demo run and keep a prepared sample result as fallback |
| PDF text extraction fails on scanned or designed resumes | Medium | Show a clear error and offer the paste option |
| Scores feel arbitrary to judges | Medium | Show the reason line and the exact keywords behind the score |
| Resume privacy concerns | Low | Do not store resume text by default and say so on the page |
| Scope creep | High | Build F1 to F6 first; start F7 to F10 only after the demo works end to end |

**Demo script (2 minutes)**

1. Paste a deliberately weak resume and a real internship job description.
2. Click Analyze and show the 42% score with red missing keywords.
3. Read two of the roast lines aloud.
4. Click Improve and show the original and rewritten bullets side by side.
5. Show the score rising to about 85% and close with the privacy note.

