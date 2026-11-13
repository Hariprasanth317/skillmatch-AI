import { getIndustry, ROLE_LEVELS, type Industry } from "./industries";

export interface DimensionScore {
  key: string;
  label: string;
  score: number;
  weight: number;
  max: number;
  explanation: string;
  status: "Excellent" | "Good" | "Average" | "Weak";
}

export interface AtsCheck {
  label: string;
  passed: boolean;
  detail: string;
  points: number;
  max: number;
}

export interface SkillResult {
  name: string;
  category: string;
  weight: number;
  demand: string;
  found: boolean;
  evidence: string;
  course: string;
}

export interface EvaluationResult {
  evaluationId: string;
  industryId: string;
  industryName: string;
  roleLevel: string;
  roleLevelLabel: string;
  roleTitle: string;
  overallScore: number;
  grade: string;
  verdict: string;
  verdictColor: string;
  wordCount: number;
  dimensionScores: DimensionScore[];
  matchedSkills: SkillResult[];
  missingSkills: SkillResult[];
  skillCoverage: number;
  atsChecks: AtsCheck[];
  atsScore: number;
  strengths: string[];
  gaps: string[];
  recommendations: { title: string; detail: string; priority: "High" | "Medium" | "Low"; action: string }[];
  roadmap: { phase: string; items: string[] }[];
  keywords: { found: string[]; missing: string[]; jdGaps: string[] };
  contactInfo: { email: string; phone: string; linkedin: boolean; github: boolean; portfolio: boolean };
  experienceYears: number;
  educationLevel: string;
}

const ACTION_VERBS = [
  "achieved", "accelerated", "administered", "analysed", "analyzed", "architected", "audited", "automated",
  "boosted", "built", "commissioned", "completed", "constructed", "decreased", "delivered", "deployed",
  "designed", "developed", "diagnosed", "directed", "drove", "engineered", "established", "estimated",
  "executed", "forecasted", "founded", "generated", "grew", "headed", "implemented", "improved",
  "increased", "initiated", "launched", "led", "maintained", "managed", "mentored", "migrated", "mitigated",
  "monitored", "negotiated", "onboarded", "optimized", "orchestrated", "owned", "pioneered", "reduced",
  "reconciled", "redesigned", "resolved", "scaled", "secured", "shipped", "sourced", "spearheaded",
  "streamlined", "supervised", "tested", "trained", "transformed", "upgraded",
];

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function containsSkill(text: string, alias: string): boolean {
  const a = alias.trim().toLowerCase();
  if (!a) return false;
  // for very short aliases (<=2 chars) require word boundaries strictly
  const pattern = new RegExp(`(?<!\\w)${escapeRegExp(a)}(?!\\w)`, "i");
  return pattern.test(text);
}

function findEvidence(original: string, alias: string): string {
  const idx = original.toLowerCase().indexOf(alias.toLowerCase());
  if (idx === -1) return "";
  const start = Math.max(0, idx - 60);
  const end = Math.min(original.length, idx + alias.length + 60);
  return "…" + original.slice(start, end).replace(/\s+/g, " ").trim() + "…";
}

function extractContact(resumeText: string) {
  const emailMatch = resumeText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = resumeText.match(/(\+91[\s-]?)?[6-9]\d{9}|\+?\d[\d\s\-()]{7,}\d/);
  const lower = resumeText.toLowerCase();
  return {
    email: emailMatch ? emailMatch[0] : "",
    phone: phoneMatch ? phoneMatch[0].trim().slice(0, 20) : "",
    linkedin: lower.includes("linkedin"),
    github: lower.includes("github"),
    portfolio: lower.includes("portfolio") || lower.includes("behance") || lower.includes("website") || lower.includes("http"),
  };
}

function extractExperienceYears(text: string): number {
  let maxYears = 0;
  const patterns = [
    /(\d+(?:\.\d+)?)\s*\+?\s*(years?|yrs?)\s*(of\s*)?(experience|exp)/gi,
    /experience\s*(of|:)?\s*(\d+(?:\.\d+)?)\s*\+?\s*(years?|yrs?)/gi,
    /(\d+(?:\.\d+)?)\s*\+?\s*(years?|yrs?)\s*experience/gi,
  ];
  for (const re of patterns) {
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      const nums = m[0].match(/\d+(?:\.\d+)?/g);
      if (nums) {
        for (const n of nums) {
          const v = parseFloat(n);
          if (v > maxYears && v <= 40) maxYears = v;
        }
      }
    }
  }
  // date-range heuristic: count "2019 - 2023" style ranges
  const rangeRe = /(19|20)\d{2}\s*[-–—to]+\s*((19|20)\d{2}|present|current|now)/gi;
  let totalRangeYears = 0;
  let rm: RegExpExecArray | null;
  const nowYear = new Date().getFullYear();
  while ((rm = rangeRe.exec(text)) !== null) {
    const startY = parseInt(rm[0].slice(0, 4), 10);
    const endPart = rm[2].toLowerCase();
    const endY = /present|current|now/.test(endPart) ? nowYear : parseInt(endPart.slice(0, 4), 10);
    if (!isNaN(startY) && !isNaN(endY) && endY >= startY && endY - startY <= 30) {
      totalRangeYears += endY - startY;
    }
  }
  if (totalRangeYears > maxYears) maxYears = Math.min(totalRangeYears, 30);
  return Math.round(maxYears * 10) / 10;
}

function detectEducation(text: string): { level: string; score: number } {
  const t = text.toLowerCase();
  if (/(ph\.?\s*d|doctorate)/.test(t)) return { level: "Ph.D / Doctorate", score: 100 };
  if (/\bm\.?\s*tech\b|\bm\.?\s*e\b|mba|m\.?sc|mca|master'?s|post.?graduate|pgdm/.test(t)) return { level: "Postgraduate (M.Tech / MBA / M.Sc / MCA)", score: 88 };
  if (/\bb\.?\s*tech\b|\bb\.?\s*e\b|bca|b\.?sc|b\.?com|bba|bachelor|graduate|b\.?pharm|mbbs/.test(t)) return { level: "Graduate (B.E / B.Tech / B.Sc / B.Com)", score: 75 };
  if (/diploma|iti|polytechnic|12th|hsc|intermediate/.test(t)) return { level: "Diploma / Higher Secondary", score: 55 };
  return { level: "Not clearly stated", score: 35 };
}

function gradeFor(score: number): string {
  if (score >= 90) return "A+";
  if (score >= 80) return "A";
  if (score >= 70) return "B+";
  if (score >= 60) return "B";
  if (score >= 50) return "C";
  if (score >= 40) return "D";
  return "F";
}

function verdictFor(score: number): { verdict: string; color: string } {
  if (score >= 85) return { verdict: "Highly Suitable — Industry Ready", color: "#15803d" };
  if (score >= 70) return { verdict: "Suitable — Minor Upskilling Needed", color: "#2563eb" };
  if (score >= 55) return { verdict: "Partially Suitable — Targeted Training Required", color: "#b45309" };
  if (score >= 40) return { verdict: "Needs Significant Improvement", color: "#c2410c" };
  return { verdict: "Not Yet Suitable — Structured Reskilling Required", color: "#b91c1c" };
}

function statusFor(score: number): DimensionScore["status"] {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Average";
  return "Weak";
}

export function evaluateResume(input: {
  resumeText: string;
  industryId: string;
  roleLevel: string;
  roleTitle?: string;
  jobDescription?: string;
  candidateName?: string;
}): EvaluationResult {
  const resumeText = (input.resumeText || "").slice(0, 30000);
  const jdText = (input.jobDescription || "").slice(0, 15000);
  const industry: Industry = getIndustry(input.industryId);
  const levelMeta = (ROLE_LEVELS as readonly { id: string; label: string }[]).find((r) => r.id === input.roleLevel);
  const roleLevelLabel = levelMeta ? levelMeta.label : input.roleLevel;

  const lower = resumeText.toLowerCase();
  const words = resumeText.trim().split(/\s+/).filter(Boolean);
  const wordCount = resumeText.trim() ? words.length : 0;

  // ---- skills matching ----
  const matchedSkills: SkillResult[] = [];
  const missingSkills: SkillResult[] = [];
  let matchedWeight = 0;
  let totalWeight = 0;

  for (const skill of industry.requiredSkills) {
    totalWeight += skill.weight;
    let foundAlias = "";
    for (const alias of skill.aliases) {
      if (containsSkill(lower, alias)) {
        foundAlias = alias;
        break;
      }
    }
    // also try skill name itself
    if (!foundAlias && containsSkill(lower, skill.name.split("/")[0].trim())) {
      foundAlias = skill.name.split("/")[0].trim();
    }
    if (foundAlias) {
      matchedWeight += skill.weight;
      matchedSkills.push({
        name: skill.name,
        category: skill.category,
        weight: skill.weight,
        demand: skill.demand,
        found: true,
        evidence: findEvidence(resumeText, foundAlias),
        course: skill.course,
      });
    } else {
      missingSkills.push({
        name: skill.name,
        category: skill.category,
        weight: skill.weight,
        demand: skill.demand,
        found: false,
        evidence: "",
        course: skill.course,
      });
    }
  }
  missingSkills.sort((a, b) => b.weight - a.weight);
  matchedSkills.sort((a, b) => b.weight - a.weight);

  const skillCoverage = totalWeight ? Math.round((matchedWeight / totalWeight) * 100) : 0;

  // ---- contact / sections ----
  const contact = extractContact(resumeText);
  const hasSummary = /(summary|objective|profile|about me)/i.test(resumeText);
  const hasExperience = /(experience|employment|work history|internship)/i.test(resumeText);
  const hasEducation = /(education|qualification|academic|university|college|school|degree|b\.?tech|mba|bca)/i.test(resumeText);
  const hasSkillsSection = /(skills|technical skills|competencies|tech stack|expertise)/i.test(resumeText);
  const hasProjects = /(project|portfolio|case study)/i.test(resumeText);
  const hasCerts = /(certification|certified|course|training|license)/i.test(resumeText);

  // action verbs
  let verbHits = 0;
  const verbsFound: string[] = [];
  for (const v of ACTION_VERBS) {
    const re = new RegExp(`(?<!\\w)${escapeRegExp(v)}(?!\\w)`, "i");
    if (re.test(lower)) {
      verbHits++;
      if (verbsFound.length < 12) verbsFound.push(v);
    }
  }

  // quantified achievements
  const metricMatches = resumeText.match(/(\d+\s*%|\$\s?[\d,]+|₹\s?[\d,]+|[\d,]+\s*(users|clients|projects|members|crore|lakh|million|k\+|\+))/gi) || [];
  const numberCount = (resumeText.match(/\d+/g) || []).length;
  const bulletCount = (resumeText.match(/[•▪‣-]\s|\n\s*[-*]\s/g) || []).length;

  // ---- ATS checks ----
  const atsChecks: AtsCheck[] = [
    {
      label: "Contact email present",
      passed: !!contact.email,
      detail: contact.email ? `Found: ${contact.email}` : "No valid email detected — recruiters cannot reach you",
      points: contact.email ? 12 : 0,
      max: 12,
    },
    {
      label: "Phone number present",
      passed: !!contact.phone,
      detail: contact.phone ? `Found: ${contact.phone}` : "No phone number detected",
      points: contact.phone ? 8 : 0,
      max: 8,
    },
    {
      label: "LinkedIn / portfolio link",
      passed: contact.linkedin || contact.portfolio,
      detail: contact.linkedin ? "LinkedIn profile linked — good" : contact.portfolio ? "Portfolio/website linked" : "Add LinkedIn + portfolio links",
      points: contact.linkedin ? 10 : contact.portfolio ? 7 : 0,
      max: 10,
    },
    {
      label: "Core sections (Experience, Education, Skills)",
      passed: hasExperience && hasEducation && hasSkillsSection,
      detail: `Experience:${hasExperience ? "✓" : "✗"} Education:${hasEducation ? "✓" : "✗"} Skills:${hasSkillsSection ? "✓" : "✗"}`,
      points: (hasExperience ? 6 : 0) + (hasEducation ? 6 : 0) + (hasSkillsSection ? 8 : 0),
      max: 20,
    },
    {
      label: "Professional summary / objective",
      passed: hasSummary,
      detail: hasSummary ? "Summary present" : "Add a 3–4 line tailored summary",
      points: hasSummary ? 8 : 0,
      max: 8,
    },
    {
      label: "Action verbs & impact language",
      passed: verbHits >= 6,
      detail: `${verbHits} strong action verbs found${verbsFound.length ? ` (${verbsFound.slice(0, 6).join(", ")})` : ""}`,
      points: Math.min(12, Math.round((verbHits / 8) * 12)),
      max: 12,
    },
    {
      label: "Quantified achievements",
      passed: metricMatches.length >= 2 && numberCount >= 5,
      detail: metricMatches.length ? `${metricMatches.length} quantified impact statements found` : "No quantified results (%, ₹, users, growth) — add numbers",
      points: Math.min(15, metricMatches.length * 5 + Math.min(5, Math.floor(numberCount / 3))),
      max: 15,
    },
    {
      label: "Ideal length (350–1200 words)",
      passed: wordCount >= 350 && wordCount <= 1200,
      detail: `${wordCount} words — ${wordCount < 350 ? "too short, add depth" : wordCount > 1200 ? "too long, trim to 2 pages" : "ideal length"}`,
      points: wordCount >= 350 && wordCount <= 1200 ? 10 : wordCount >= 200 ? 5 : 2,
      max: 10,
    },
    {
      label: "Projects / Certifications evidence",
      passed: hasProjects || hasCerts,
      detail: `Projects:${hasProjects ? "✓" : "✗"} Certifications:${hasCerts ? "✓" : "✗"}`,
      points: (hasProjects ? 3 : 0) + (hasCerts ? 2 : 0),
      max: 5,
    },
  ];
  const atsScore = Math.min(100, atsChecks.reduce((s, c) => s + c.points, 0));

  // ---- experience ----
  const experienceYears = extractExperienceYears(resumeText);
  const expectedByLevel: Record<string, number> = { fresher: 0.5, junior: 2, mid: 4.5, senior: 8, lead: 12 };
  const expected = expectedByLevel[input.roleLevel] ?? 3;
  let expScore = 0;
  let expExplanation = "";
  if (input.roleLevel === "fresher") {
    // for freshers, projects/internships matter more than years
    const internshipBonus = /intern(ship)?|trainee|apprentice|freelance/.test(lower) ? 20 : 0;
    const projectBonus = hasProjects ? 20 : 0;
    expScore = Math.min(100, 55 + internshipBonus + projectBonus + Math.min(15, experienceYears * 10));
    expExplanation = `Fresher track: ${experienceYears} yr(s) stated. Internships/projects weight heavily.`;
  } else {
    if (experienceYears === 0 && !/(experience|worked|intern)/.test(lower)) {
      expScore = 30;
      expExplanation = "No explicit experience duration found — state tenure clearly (e.g., '2 years').";
    } else {
      const ratio = expected === 0 ? 1 : experienceYears / expected;
      if (ratio >= 1.2) expScore = 95;
      else if (ratio >= 1.0) expScore = 88;
      else if (ratio >= 0.7) expScore = 72;
      else if (ratio >= 0.4) expScore = 55;
      else expScore = 40;
      expExplanation = `${experienceYears} yr(s) detected vs ~${expected} yrs expected for ${roleLevelLabel}.`;
    }
  }
  // industry keyword density boost
  const industryKeywordHits = industry.atsKeywords.filter((k) => containsSkill(lower, k)).length;
  expScore = Math.min(100, Math.round(expScore + Math.min(10, industryKeywordHits * 2)));
  expExplanation += ` ${industryKeywordHits}/${industry.atsKeywords.length} industry context keywords present.`;

  // ---- education ----
  const edu = detectEducation(resumeText);
  const eduRelevant = industry.education.some((e) => {
    const key = e.split(" ")[0].toLowerCase();
    return lower.includes(key) || lower.includes("b.tech") || lower.includes("bachelor") || lower.includes("master") || lower.includes("mba");
  });
  const eduScore = Math.min(100, Math.round(edu.score * (eduRelevant || edu.score < 50 ? 1 : 0.9)));

  // ---- impact score ----
  let impactScore = 0;
  impactScore += Math.min(30, verbHits * 4);
  impactScore += Math.min(30, metricMatches.length * 8 + Math.min(10, numberCount));
  impactScore += hasProjects ? 15 : 0;
  impactScore += hasCerts ? 10 : 0;
  impactScore += /lead|managed|mentored|headed|team of \d+/i.test(resumeText) ? 10 : 0;
  impactScore += /award|achievement|recognition|rank|hackathon|publication|patent/i.test(resumeText) ? 5 : 0;
  impactScore = Math.min(100, Math.round(impactScore));
  const impactExplanation = `${verbHits} action verbs, ${metricMatches.length} quantified results, ${numberCount} numeric facts.`;

  // ---- skill dimension refines ----
  const skillExplanation = `${matchedSkills.length}/${industry.requiredSkills.length} core skills matched (${skillCoverage}% weighted coverage).`;

  // ---- JD gap analysis ----
  let jdGaps: string[] = [];
  let jdBoost = 0;
  if (jdText.trim().length > 40) {
    const jdLower = jdText.toLowerCase();
    const jdTokens = Array.from(new Set(jdLower.match(/[a-z][a-z+#./-]{2,}/g) || [])).filter(
      (t) => t.length > 3 && !["with", "will", "have", "that", "this", "from", "role", "team", "work", "looking", "candidate", "experience", "years", "year", "ability", "strong", "plus"].includes(t)
    );
    const stop = new Set(["and", "the", "for", "are", "you", "our", "all", "job", "required", "requirements", "responsibilities", "qualifications"]);
    const meaningful = jdTokens.filter((t) => !stop.has(t)).slice(0, 120);
    const missing: string[] = [];
    for (const tok of meaningful) {
      if (!containsSkill(lower, tok) && tok.length >= 4) {
        // only keep if it looks like a skill-ish token (check against industry aliases or tech-ish)
        missing.push(tok);
      }
    }
    // prioritize missing tokens that match industry skills
    const industryAliasSet = new Set(industry.requiredSkills.flatMap((s) => s.aliases.map((a) => a.toLowerCase())));
    jdGaps = missing.filter((m) => industryAliasSet.has(m) || m.includes(".") || m.length > 5).slice(0, 10);
    if (jdGaps.length === 0) jdGaps = missing.slice(0, 8);
    const jdSkillHits = industry.requiredSkills.filter((s) => jdLower.includes(s.name.toLowerCase().split(" ")[0]) || s.aliases.some((a) => jdLower.includes(a))).length;
    jdBoost = jdSkillHits > 0 ? Math.min(5, Math.round((matchedSkills.length / Math.max(1, jdSkillHits)) * 5)) : 0;
  }

  // ---- overall ----
  let overall = Math.round(skillCoverage * 0.4 + expScore * 0.2 + eduScore * 0.1 + atsScore * 0.15 + impactScore * 0.15 + jdBoost * 0.0);
  // word-count penalty for extremely thin resumes (only for fragments, not real CVs)
  if (wordCount < 80) overall = Math.min(overall, 45);
  else if (wordCount < 150) overall = Math.min(overall, overall - 4);
  else if (wordCount < 250) overall = Math.min(overall, overall - 2);
  overall = Math.max(5, Math.min(98, overall));

  const grade = gradeFor(overall);
  const { verdict, color } = verdictFor(overall);

  const dimensionScores: DimensionScore[] = [
    { key: "skills", label: "Industrial Skill Match", score: skillCoverage, weight: 40, max: 100, explanation: skillExplanation, status: statusFor(skillCoverage) },
    { key: "experience", label: "Experience Relevance", score: expScore, weight: 20, max: 100, explanation: expExplanation, status: statusFor(expScore) },
    { key: "education", label: "Education & Credentials", score: eduScore, weight: 10, max: 100, explanation: `${edu.level}${eduRelevant ? " — relevant to " + industry.name : ""}.`, status: statusFor(eduScore) },
    { key: "ats", label: "ATS & Professional Format", score: atsScore, weight: 15, max: 100, explanation: `${atsChecks.filter((c) => c.passed).length}/${atsChecks.length} ATS checks passed.`, status: statusFor(atsScore) },
    { key: "impact", label: "Impact & Achievements", score: impactScore, weight: 15, max: 100, explanation: impactExplanation, status: statusFor(impactScore) },
  ];

  // ---- strengths ----
  const strengths: string[] = [];
  for (const s of matchedSkills.slice(0, 5)) {
    strengths.push(`Strong signal in ${s.name} (${s.category}) — ${s.demand} demand skill verified in resume text.`);
  }
  if (metricMatches.length >= 2) strengths.push(`Quantified impact with ${metricMatches.length} measurable outcomes — highly valued by hiring panels.`);
  if (verbHits >= 8) strengths.push(`Confident executive language — ${verbHits} industry-grade action verbs.`);
  if (hasProjects) strengths.push("Project evidence present — demonstrates applied capability beyond theory.");
  if (hasCerts) strengths.push("Certifications / structured training cited — boosts trust score.");
  if (contact.linkedin) strengths.push("Professional networking presence (LinkedIn) linked.");
  if (strengths.length === 0) strengths.push("Resume provides a base profile — focused upskilling will rapidly lift the score.");

  // ---- gaps ----
  const gaps: string[] = [];
  for (const m of missingSkills.slice(0, 4)) {
    gaps.push(`Missing critical skill: ${m.name} (${m.category}, ${m.demand} demand, weight ${m.weight}/10).`);
  }
  if (!contact.email) gaps.push("Missing professional email — critical ATS failure.");
  if (!hasSummary) gaps.push("No tailored professional summary for the target role.");
  if (metricMatches.length < 2) gaps.push("Weak quantification — achievements lack numbers (%, revenue, scale, timelines).");
  if (wordCount < 350) gaps.push(`Resume is thin (${wordCount} words) — expand to 400–800 words with projects and outcomes.`);
  if (wordCount > 1200) gaps.push(`Resume is overlong (${wordCount} words) — condense to 2 pages, prioritize relevance.`);
  if (jdGaps.length > 0) gaps.push(`Job-description gaps: ${jdGaps.slice(0, 5).join(", ")} not evidenced.`);
  if (gaps.length === 0) gaps.push("No major gaps — maintain currency with emerging tools.");

  // ---- recommendations ----
  const recommendations: EvaluationResult["recommendations"] = [];
  for (const m of missingSkills.slice(0, 5)) {
    recommendations.push({
      title: `Acquire: ${m.name}`,
      detail: `${m.category} skill with ${m.demand} market demand. ${m.weight >= 8 ? "This is a hiring filter — roles are auto-rejected without it." : "Strengthens shortlisting odds materially."}`,
      priority: m.weight >= 8 ? "High" : m.weight >= 6 ? "Medium" : "Low",
      action: `Enroll: ${m.course} → build 1 portfolio project → add to resume with metrics.`,
    });
  }
  if (metricMatches.length < 2) {
    recommendations.push({
      title: "Rewrite bullets with STAR + metrics",
      detail: "Every bullet should follow Situation–Task–Action–Result with at least one number.",
      priority: "High",
      action: "Convert e.g. 'Worked on API' → 'Engineered Node.js REST API serving 40k req/day, cutting latency 32%'.",
    });
  }
  if (!hasSummary || atsScore < 70) {
    recommendations.push({
      title: "Fix ATS structure",
      detail: "Use standard headings (Summary, Skills, Experience, Education, Projects, Certifications), single-column layout, no tables/images.",
      priority: "High",
      action: "Add keyword-rich summary naming target role + top 3 skills + years + one headline achievement.",
    });
  }
  if (jdGaps.length > 0) {
    recommendations.push({
      title: "Mirror job-description language",
      detail: `Recruiter ATS scans for: ${jdGaps.slice(0, 6).join(", ")}.`,
      priority: "Medium",
      action: "Naturally weave exact JD keywords into Skills + Experience bullets where truthful.",
    });
  }
  recommendations.push({
    title: "Add proof-of-work links",
    detail: "GitHub, live demos, Kaggle, Behance, case studies or deployment URLs double shortlist rates.",
    priority: "Medium",
    action: "Add 2–3 hyperlinked projects with tech stack + outcome + your role.",
  });

  // ---- roadmap ----
  const topMissing = missingSkills.slice(0, 3).map((m) => m.name);
  const roadmap: EvaluationResult["roadmap"] = [
    {
      phase: "Next 30 days — Fix & Fill",
      items: [
        `Complete foundation module for ${topMissing[0] ?? industry.requiredSkills[0].name} (1 hr/day).`,
        "Rewrite all bullets with metrics; add summary + skills matrix.",
        "Fix ATS: single column, standard fonts, parseable PDF.",
        "Publish 1 mini-project demonstrating the top missing skill.",
      ],
    },
    {
      phase: "30–60 days — Prove",
      items: [
        `Build an end-to-end project using ${topMissing.slice(0, 2).join(" + ") || "core stack"}.`,
        `Earn 1 certification: ${industry.certifications[0]}.`,
        "Get 2 peer/manager reviews on the project; document outcomes.",
        "Contribute to open-source / Kaggle / freelance task for live proof.",
      ],
    },
    {
      phase: "60–90 days — Position",
      items: [
        `Master ${topMissing[1] ?? topMissing[0] ?? "advanced workflows"} + deploy to cloud/live URL.`,
        "Tailor resume per application with JD keyword mirroring.",
        "Prepare 5 STAR stories mapped to industry competencies.",
        `Target roles: ${industry.roles.slice(0, 3).join(", ")}.`,
      ],
    },
  ];

  const foundKeywords = [...matchedSkills.map((s) => s.name), ...industry.atsKeywords.filter((k) => containsSkill(lower, k))].slice(0, 20);
  const missingKeywords = [...missingSkills.map((s) => s.name), ...industry.atsKeywords.filter((k) => !containsSkill(lower, k))].slice(0, 20);

  const now = new Date();
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  const evaluationId = `NISC-${now.getFullYear()}-${rand}`;

  return {
    evaluationId,
    industryId: industry.id,
    industryName: industry.name,
    roleLevel: input.roleLevel,
    roleLevelLabel,
    roleTitle: input.roleTitle || industry.roles[0],
    overallScore: overall,
    grade,
    verdict,
    verdictColor: color,
    wordCount,
    dimensionScores,
    matchedSkills,
    missingSkills,
    skillCoverage,
    atsChecks,
    atsScore,
    strengths,
    gaps,
    recommendations: recommendations.slice(0, 7),
    roadmap,
    keywords: { found: foundKeywords, missing: missingKeywords, jdGaps },
    contactInfo: contact,
    experienceYears,
    educationLevel: edu.level,
  };
}
