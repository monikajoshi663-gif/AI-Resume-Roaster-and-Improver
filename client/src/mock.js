// Mock data and handlers for local development and testing without a running backend
// Matches the exact API contract defined in README.md

const SAMPLE_DEMO_RESUME = `Jane Doe | jane@email.com
Education: B.S. Computer Science, GPA 3.2
Skills: Python, Microsoft Office, teamwork
Experience:
  - Assisted with development of internal tools
  - Helped team members with various tasks
  - Participated in weekly stand-ups`;

const SAMPLE_DEMO_JD = `Software Engineering Intern
Requirements: React, Node.js, TypeScript, REST APIs, CI/CD, Docker, Jest, Agile`;

const MOCK_ROASTS = {
  Gentle: [
    "Your Microsoft Office skill is great, but developer roles prioritize modern frameworks like React and Node.",
    "You assisted well on internal tools, but highlighting what you owned and built will showcase your true potential.",
    "Adding a GitHub link with active commits will build strong confidence with the hiring manager.",
    "Consider highlighting your practical projects front and center ahead of your GPA.",
  ],
  Honest: [
    "Your 'proficient in Microsoft Office' line is doing heavy lifting for a dev role.",
    "Three bullet points start with 'Assisted' — you assisted your way through uni.",
    "No GitHub link. Are we supposed to take your word for it?",
    "GPA of 3.2 listed before any project: bold strategy.",
  ],
  Brutal: [
    "Listing 'Microsoft Office' in 2026? What's next, a certificate in double-clicking?",
    "Three bullet points start with 'Assisted' — congratulations on watching other people do real work.",
    "No GitHub link found. We have to assume your codebase is legally classified as a safety hazard.",
    "GPA of 3.2 listed before any project: a bold confession right at the top of the page.",
    "'Participated in weekly stand-ups' — surviving a morning Zoom call is not an engineering achievement.",
  ],
};

const DEFAULT_WEAK_BULLETS = [
  "Assisted with development of internal tools",
  "Helped team members with various tasks",
  "Participated in weekly stand-ups",
];

const REWRITE_TEMPLATES = [
  {
    original: "Assisted with development of internal tools",
    rewritten: "Built 3 internal React & Node.js dashboards that cut reporting time by 40% for 12 teammates",
  },
  {
    original: "Helped team members with various tasks",
    rewritten: "Engineered CI/CD automation and Docker containers, reducing build failures by 65%",
  },
  {
    original: "Participated in weekly stand-ups",
    rewritten: "Architected Jest test suites and spearheaded Agile sprint deliverables across a 6-dev team",
  },
];

/**
 * Simulate network latency
 */
const delay = (ms = 600) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Extract common tech keywords from text
 */
function extractKeywordsFromText(text) {
  const common = [
    'React', 'Node.js', 'TypeScript', 'JavaScript', 'Python', 'REST', 'REST APIs',
    'Docker', 'Kubernetes', 'CI/CD', 'Jest', 'Agile', 'Git', 'AWS', 'SQL',
    'MongoDB', 'PostgreSQL', 'GraphQL', 'Tailwind', 'Redux', 'Next.js', 'Express'
  ];
  return common.filter((kw) => new RegExp(`\\b${kw.replace('.', '\\.')}\\b`, 'i').test(text));
}

/**
 * Mock analyze endpoint handler
 */
export async function mockAnalyze({ resumeText = '', jobDescription = '', tone = 'Honest' }) {
  await delay(750);

  const text = (resumeText || '').trim();
  const jd = (jobDescription || '').trim();

  if (!text) {
    const error = new Error('Resume text is required.');
    error.status = 400;
    throw error;
  }

  if (!jd) {
    const error = new Error('Job description is required.');
    error.status = 400;
    throw error;
  }

  const wordCount = text.split(/\s+/).filter(Boolean).length;
  if (wordCount > 10000) {
    const error = new Error('Resume exceeds 10,000 words.');
    error.status = 400;
    throw error;
  }

  // Exact contract demo match check
  const isDemo = text.includes('Jane Doe') || text.includes('Assisted with development');

  let matchedKeywords = ['React', 'Node.js'];
  let missingKeywords = ['TypeScript', 'REST', 'CI/CD', 'Docker', 'Jest', 'Agile'];
  let score = 42;
  let scoreReason = 'Missing 6 of 10 keywords; bullets lack measurable results.';
  let weakBullets = [...DEFAULT_WEAK_BULLETS];

  if (!isDemo) {
    // Dynamic matching for custom input
    const jdKws = extractKeywordsFromText(jd);
    const resumeKws = extractKeywordsFromText(text);

    if (jdKws.length > 0) {
      matchedKeywords = jdKws.filter((k) =>
        resumeKws.some((rk) => rk.toLowerCase() === k.toLowerCase())
      );
      missingKeywords = jdKws.filter((k) =>
        !resumeKws.some((rk) => rk.toLowerCase() === k.toLowerCase())
      );
      const ratio = matchedKeywords.length / jdKws.length;
      score = Math.min(95, Math.max(20, Math.round(ratio * 70 + 20)));
      scoreReason = `Matched ${matchedKeywords.length} of ${jdKws.length} job keywords. Bullets need quantification.`;
    }

    // Extract potential weak bullets
    const lines = text
      .split('\n')
      .map((l) => l.trim().replace(/^[-*•]\s*/, ''))
      .filter((l) => l.length > 15 && l.length < 120);

    const candidates = lines.filter((l) =>
      /^(assisted|helped|worked|participated|handled|supported|responsible for)/i.test(l)
    );

    weakBullets = candidates.length > 0 ? candidates.slice(0, 3) : lines.slice(0, 3);
  }

  const selectedTone = MOCK_ROASTS[tone] ? tone : 'Honest';
  const roast = MOCK_ROASTS[selectedTone];

  return {
    analysisId: 'mock_' + Math.random().toString(36).substring(2, 9),
    score,
    scoreReason,
    matchedKeywords,
    missingKeywords,
    roast,
    weakBullets: weakBullets.length > 0 ? weakBullets : DEFAULT_WEAK_BULLETS,
  };
}

/**
 * Mock improve endpoint handler
 */
export async function mockImprove({ resumeText = '', jobDescription = '', weakBullets = [], tone = 'Honest' }) {
  await delay(850);

  const bulletsToRewrite = Array.isArray(weakBullets) && weakBullets.length > 0
    ? weakBullets
    : DEFAULT_WEAK_BULLETS;

  const rewrites = bulletsToRewrite.map((bullet, index) => {
    const template = REWRITE_TEMPLATES.find((t) =>
      bullet.toLowerCase().includes(t.original.toLowerCase().slice(0, 15))
    );

    if (template) {
      return {
        original: bullet,
        rewritten: template.rewritten,
      };
    }

    const verbs = ['Architected', 'Spearheaded', 'Engineered', 'Accelerated', 'Automated'];
    const chosenVerb = verbs[index % verbs.length];
    return {
      original: bullet,
      rewritten: `${chosenVerb} scalable solution with TypeScript & React, improving team delivery speed by 35%`,
    };
  });

  // Replace bullets in resume text
  let improvedResume = resumeText || SAMPLE_DEMO_RESUME;
  rewrites.forEach(({ original, rewritten }) => {
    improvedResume = improvedResume.replace(original, rewritten);
  });

  const originalScore = 42;
  const newScore = 68;
  const pointGain = 26;

  return {
    rewrites,
    improvedResume,
    newScore,
    pointGain,
  };
}

export { SAMPLE_DEMO_RESUME, SAMPLE_DEMO_JD };
