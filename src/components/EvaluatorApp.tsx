"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { INDUSTRIES, ROLE_LEVELS, getIndustry } from "@/lib/industries";
import type { EvaluationResult } from "@/lib/evaluator";

/* ---------------------------------- samples ---------------------------------- */

const SAMPLE_SOFTWARE = `Aarav Sharma
Senior Full-Stack Developer | aarav.sharma.dev@gmail.com | +91 98765 43210
LinkedIn: linkedin.com/in/aaravsharma | GitHub: github.com/aaravsharma | Portfolio: aaravsharma.dev

PROFESSIONAL SUMMARY
Full-Stack Developer with 4.5 years of experience building scalable SaaS platforms with React, Next.js, Node.js and PostgreSQL. Deployed microservices on AWS serving 200k+ users. Improved API latency by 42% and led a team of 4 engineers in Agile sprints.

TECHNICAL SKILLS
Languages: JavaScript, TypeScript, Python, SQL
Frontend: React, Next.js, Redux, HTML5, CSS3
Backend: Node.js, Express, REST API, GraphQL
Databases: PostgreSQL, MongoDB, Prisma, Drizzle ORM
DevOps: Git, GitHub Actions, Docker, AWS (EC2, S3, Lambda), CI/CD
Practices: Data Structures & Algorithms, System Design, Microservices, Agile Scrum, Testing with Jest & Cypress, Jira

PROFESSIONAL EXPERIENCE
Senior Software Engineer — TechNova Solutions, Bengaluru (2022 – Present)
- Architected and deployed scalable Next.js + Node.js SaaS platform serving 200,000 users with 99.9% uptime
- Engineered REST API and GraphQL layer handling 40k requests/day; reduced latency by 42% through caching and query optimization
- Led migration of monolith to microservices on AWS with Docker and CI/CD via GitHub Actions, cutting deploy time 65%
- Mentored team of 4 engineers; instituted code reviews and Jest unit testing raising coverage from 35% to 82%
- Implemented PostgreSQL partitioning and indexing; decreased reporting query time from 9s to 1.2s

Software Developer — PixelKraft, Pune (2020 – 2022)
- Developed React dashboards for 30+ enterprise clients; increased user engagement 28%
- Built Node.js automation scripts saving 15 hrs/week of manual reporting
- Collaborated in Agile sprints using Jira; shipped 12 major releases on schedule

PROJECTS
E-Shop Microservices — React, Node.js, Docker, AWS | github.com/aaravsharma/eshop
- Full e-commerce system with payments, search and admin analytics; 12k GitHub views
TaskFlow SaaS — Next.js, PostgreSQL, Prisma
- Team productivity app with real-time collaboration; 5,000+ active users

EDUCATION
B.E Computer Science — Savitribai Phule Pune University (2016 – 2020), CGPA 8.4/10

CERTIFICATIONS
AWS Certified Solutions Architect – Associate (2023) | Meta Front-End Professional (2022)

ACHIEVEMENTS
- Hackathon winner (Smart India Hackathon 2019) among 2,000 teams
- Published article on system design read by 25,000 developers`;

const SAMPLE_DATA_FRESHER = `Priya Verma
priya.verma22@gmail.com | +91 91234 56780
LinkedIn: linkedin.com/in/priyaverma

OBJECTIVE
Motivated B.Sc Statistics graduate seeking entry-level Data Analyst role. Familiar with Excel and basic Python. Eager to learn and contribute.

EDUCATION
B.Sc Statistics — Mumbai University (2021 – 2024), 72%
HSC — 78%, SSC — 85%

SKILLS
MS Excel, MS Word, PowerPoint, Basic Python, Communication, Hardworking, Team player

PROJECT
College Survey Project (2023)
- Collected survey responses from 60 students and prepared Excel sheet with charts

INTERNSHIP
Data Entry Intern — Local NGO (2 months, 2023)
- Entered data in Excel and helped prepare monthly reports

HOBBIES
Reading, Music, Travelling`;

const SAMPLE_MECH = `Rajesh Kumar
Mechanical Design Engineer | rajesh.k.mech@gmail.com | +91 99870 12345 | linkedin.com/in/rajeshkmech

SUMMARY
Mechanical Engineer with 6 years of experience in product design, manufacturing and quality. Proficient in AutoCAD, SolidWorks, GD&T, CNC programming and Six Sigma. Reduced rejection rate from 4.2% to 1.1% and downtime by 25% across 3 production lines.

SKILLS
Design: AutoCAD, SolidWorks, CATIA, GD&T, Engineering Drawing, Blueprint reading
Manufacturing: CNC, Lathe, Milling, Welding, Casting, Machining
Quality: Six Sigma Green Belt, SPC, ISO 9001, FMEA, PPAP, 5S, Kaizen
Analysis: Ansys FEA, CFD, Simulation
Automation: PLC, SCADA, Siemens
Operations: Lean Manufacturing, Supply Chain, Inventory, SAP MM, Logistics

EXPERIENCE
Senior Design Engineer — AutoFab Industries, Chennai (2021 – Present)
- Designed 15+ sheet-metal and machined components in SolidWorks with GD&T per ASME Y14.5; reduced material cost 12% (₹45 lakh/yr saving)
- Led Ansys FEA validation cutting prototype iterations from 4 to 2 per product
- Implemented SPC and FMEA on 3 lines; reduced rejection 4.2% → 1.1%, saving ₹30 lakh annually
- Commissioned Siemens PLC automation for material handling; reduced downtime 25%

Production Engineer — Shree Motors, Coimbatore (2018 – 2021)
- Supervised production of 2,000 units/month; improved OEE from 68% to 81%
- Executed preventive maintenance schedules; maintained 98% machine availability
- Coordinated with suppliers and managed inventory in SAP MM

EDUCATION
B.E Mechanical Engineering — Anna University (2014 – 2018), 7.9 CGPA

CERTIFICATIONS
Six Sigma Green Belt (2022) | CSWP – SolidWorks Professional | ISO 9001 Lead Auditor`;

type TabId = "evaluate" | "report" | "history" | "standards";

interface HistoryItem {
  id: string;
  evaluationId: string;
  candidateName: string;
  email: string;
  industryId: string;
  industryName: string;
  roleLevel: string;
  roleTitle: string;
  overallScore: number;
  grade: string;
  verdict: string;
  verdictColor: string;
  wordCount: number;
  createdAt: string;
}

function Gauge({ score, color }: { score: number; color: string }) {
  const r = 64;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  return (
    <div className="relative h-48 w-48">
      <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
        <circle cx="80" cy="80" r={r} fill="none" strokeWidth="14" className="gauge-track" />
        <circle
          cx="80"
          cy="80"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="gauge-value"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-5xl font-black tracking-tight" style={{ color }}>
          {score}
        </div>
        <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">/ 100</div>
      </div>
    </div>
  );
}

function DimBar({ label, score, weight, explanation, status }: { label: string; score: number; weight: number; explanation: string; status: string }) {
  const col = score >= 80 ? "#15803d" : score >= 60 ? "#2563eb" : score >= 40 ? "#b45309" : "#b91c1c";
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-bold text-slate-800">{label}</p>
        <span className="rounded-full px-2.5 py-0.5 text-xs font-black" style={{ background: col + "18", color: col }}>
          {status} • {score}
        </span>
      </div>
      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${score}%`, background: col }} />
      </div>
      <p className="mt-2 text-xs leading-relaxed text-slate-500">
        Weight {weight}% • {explanation}
      </p>
    </div>
  );
}

export default function EvaluatorApp() {
  const [tab, setTab] = useState<TabId>("evaluate");
  const [candidateName, setCandidateName] = useState("");
  const [email, setEmail] = useState("");
  const [industryId, setIndustryId] = useState("software");
  const [roleLevel, setRoleLevel] = useState("mid");
  const [roleTitle, setRoleTitle] = useState("Full-Stack Developer");
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [fileName, setFileName] = useState("");
  const [parsing, setParsing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [stats, setStats] = useState({ total: 0, avgScore: 0, highlySuitable: 0, suitable: 0, needsWork: 0 });
  const [historyLoading, setHistoryLoading] = useState(false);
  const [hq, setHq] = useState("");
  const [hIndustry, setHIndustry] = useState("all");
  const [expandedIndustry, setExpandedIndustry] = useState<string | null>(null);
  const [viewingPast, setViewingPast] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const industry = useMemo(() => getIndustry(industryId), [industryId]);
  const wordCount = useMemo(() => (resumeText.trim() ? resumeText.trim().split(/\s+/).length : 0), [resumeText]);

  useEffect(() => {
    setRoleTitle(getIndustry(industryId).roles[0]);
  }, [industryId]);

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const params = new URLSearchParams({ q: hq, industry: hIndustry, limit: "100" });
      const res = await fetch(`/api/evaluations?${params.toString()}`);
      const data = await res.json();
      if (data.evaluations) {
        setHistory(data.evaluations);
        setStats(data.stats);
      }
    } catch {
      /* ignore */
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (tab === "history") loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const handleFile = async (f: File) => {
    setParsing(true);
    setError("");
    try {
      const ext = f.name.split(".").pop()?.toLowerCase() || "";
      setFileName(f.name);
      if (ext === "txt" || ext === "md" || ext === "rtf") {
        const t = await f.text();
        setResumeText(t.slice(0, 25000));
      } else if (ext === "docx") {
        const buf = await f.arrayBuffer();
        const mammoth = await import("mammoth");
        const out = await mammoth.extractRawText({ arrayBuffer: buf });
        if (!out.value.trim()) throw new Error("Could not extract text from DOCX.");
        setResumeText(out.value.slice(0, 25000));
      } else if (ext === "pdf") {
        const buf = await f.arrayBuffer();
        const pdfjs = await import("pdfjs-dist");
        (pdfjs.GlobalWorkerOptions as { workerSrc: string }).workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf.worker.min.mjs`;
        const loadingTask = pdfjs.getDocument({ data: new Uint8Array(buf) });
        const pdf = await loadingTask.promise;
        let full = "";
        const maxPages = Math.min(pdf.numPages, 8);
        for (let i = 1; i <= maxPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const strings = content.items.map((it) => ("str" in it ? (it as { str: string }).str : "")).join(" ");
          full += strings + "\n";
        }
        if (full.trim().length < 80) throw new Error("PDF appears scanned/image-only. Please paste resume text manually.");
        setResumeText(full.slice(0, 25000));
      } else {
        throw new Error("Unsupported file. Upload PDF, DOCX or TXT — or paste text directly.");
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "File parsing failed. Paste text instead.");
    } finally {
      setParsing(false);
    }
  };

  const handleEvaluate = async () => {
    setError("");
    if (!candidateName.trim()) return setError("Please enter the candidate's full name for the official certificate.");
    if (resumeText.trim().length < 80) return setError("Resume text is too short. Upload a file or paste a complete resume (min 80 characters).");
    setLoading(true);
    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateName, email, industryId, roleLevel, roleTitle, resumeText, jobDescription }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Evaluation failed");
      setResult(data.result);
      setViewingPast(false);
      setTab("report");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Evaluation failed");
    } finally {
      setLoading(false);
    }
  };

  const openHistoryReport = async (item: HistoryItem) => {
    try {
      const res = await fetch(`/api/evaluations/${item.id}`);
      const data = await res.json();
      if (!data.evaluation) throw new Error("Failed to load");
      const ev = data.evaluation;
      const contact = (ev.contactInfo as Record<string, unknown>) || {};
      const reconstructed: EvaluationResult = {
        evaluationId: ev.evaluationId,
        industryId: ev.industryId,
        industryName: ev.industryName,
        roleLevel: ev.roleLevel,
        roleLevelLabel: (ROLE_LEVELS as readonly { id: string; label: string }[]).find((r) => r.id === ev.roleLevel)?.label || ev.roleLevel,
        roleTitle: ev.roleTitle,
        overallScore: ev.overallScore,
        grade: ev.grade,
        verdict: ev.verdict,
        verdictColor: ev.verdictColor,
        wordCount: ev.wordCount,
        dimensionScores: ev.dimensionScores as EvaluationResult["dimensionScores"],
        matchedSkills: ev.matchedSkills as EvaluationResult["matchedSkills"],
        missingSkills: ev.missingSkills as EvaluationResult["missingSkills"],
        skillCoverage: Number((contact as Record<string, unknown>).skillCoverage ?? 0),
        atsChecks: ev.atsChecks as EvaluationResult["atsChecks"],
        atsScore: Number((contact as Record<string, unknown>).atsScore ?? 0),
        strengths: ev.strengths as string[],
        gaps: ev.gaps as string[],
        recommendations: ev.recommendations as EvaluationResult["recommendations"],
        roadmap: ev.roadmap as EvaluationResult["roadmap"],
        keywords: ev.keywords as EvaluationResult["keywords"],
        contactInfo: {
          email: String((contact as Record<string, unknown>).email ?? ev.email ?? ""),
          phone: String((contact as Record<string, unknown>).phone ?? ""),
          linkedin: Boolean((contact as Record<string, unknown>).linkedin),
          github: Boolean((contact as Record<string, unknown>).github),
          portfolio: Boolean((contact as Record<string, unknown>).portfolio),
        },
        experienceYears: Number((contact as Record<string, unknown>).experienceYears ?? 0),
        educationLevel: String((contact as Record<string, unknown>).educationLevel ?? ""),
      };
      setCandidateName(ev.candidateName);
      setEmail(ev.email);
      setResult(reconstructed);
      setViewingPast(true);
      setTab("report");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("Could not open evaluation record.");
    }
  };

  const deleteRecord = async (id: string) => {
    if (!confirm("Delete this evaluation record permanently?")) return;
    await fetch(`/api/evaluations/${id}`, { method: "DELETE" });
    loadHistory();
  };

  const handlePrint = () => window.print();

  const tabs: { id: TabId; label: string; icon: string }[] = [
    { id: "evaluate", label: "New Evaluation", icon: "📝" },
    { id: "report", label: "Official Report", icon: "🏛️" },
    { id: "history", label: "Registry & History", icon: "📚" },
    { id: "standards", label: "Industry Standards", icon: "🏭" },
  ];

  return (
    <div className="min-h-screen">
      {/* tricolor strip */}
      <div className="flex h-1.5">
        <div className="flex-1 bg-[#ff9933]" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-[#138808]" />
      </div>

      {/* official header */}
      <header className="official-pattern text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white text-3xl shadow-lg">🏛️</div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-amber-300">Government Recognised Framework • NSQF Aligned</p>
              <h1 className="mt-1 text-xl font-black leading-tight sm:text-2xl">NATIONAL INDUSTRIAL SKILL COUNCIL</h1>
              <p className="text-sm text-slate-200">AI-Assisted Resume Evaluation System • Industrial Skill Requirement Mapping • v3.2</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
            <span className="rounded-full border border-white/30 bg-white/10 px-3 py-1.5">✓ ISO 9001:2015</span>
            <span className="rounded-full border border-white/30 bg-white/10 px-3 py-1.5">✓ ATS Benchmarked</span>
            <span className="rounded-full bg-amber-400 px-3 py-1.5 text-[#0f2a52]">● SYSTEM ONLINE</span>
          </div>
        </div>
        {/* nav */}
        <div className="border-t border-white/15 bg-black/20">
          <div className="no-print mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3 sm:px-6">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                  tab === t.id ? "bg-amber-400 text-[#0f2a52] shadow" : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                <span>{t.icon}</span> {t.label}
                {t.id === "report" && result && <span className="rounded-full bg-[#0f2a52] px-2 py-0.5 text-[10px] text-amber-300">{result.overallScore}</span>}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* hero strip (evaluate tab only) */}
      {tab === "evaluate" && (
        <div className="border-b border-slate-200 bg-white">
          <div className="mx-auto grid max-w-7xl gap-4 px-4 py-6 sm:px-6 lg:grid-cols-4">
            {[
              { n: "10", l: "Industry verticals mapped", i: "🏭" },
              { n: "92+", l: "Weighted skills benchmarked", i: "🎯" },
              { n: "5-D", l: "Official scoring dimensions", i: "📊" },
              { n: "100%", l: "Auditable + printable report", i: "📜" },
            ].map((s) => (
              <div key={s.l} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <span className="text-2xl">{s.i}</span>
                <div>
                  <p className="text-xl font-black text-[#0f2a52]">{s.n}</p>
                  <p className="text-xs font-semibold text-slate-500">{s.l}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {error && (
          <div className="fade-up mb-4 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
            <span>⚠️</span>
            <span>{error}</span>
            <button onClick={() => setError("")} className="no-print ml-auto font-black">✕</button>
          </div>
        )}

        {/* ------------------------------ EVALUATE ------------------------------ */}
        {tab === "evaluate" && (
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            {/* form */}
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-[#0f2a52]">① Candidate & Target Role</h2>
                  <p className="text-xs font-semibold text-slate-500">All fields appear on the official evaluation certificate</p>
                </div>
                <span className="rounded-full bg-[#0f2a52] px-3 py-1 text-[11px] font-black text-amber-300">FORM NISC-AI/03</span>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-slate-600">Candidate full name *</label>
                  <input value={candidateName} onChange={(e) => setCandidateName(e.target.value)} placeholder="e.g. Aarav Sharma" className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-semibold outline-none focus:border-[#0f2a52] focus:ring-2 focus:ring-[#0f2a52]/15" />
                </div>
                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-slate-600">Email (for registry)</label>
                  <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="candidate@email.com" className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-semibold outline-none focus:border-[#0f2a52] focus:ring-2 focus:ring-[#0f2a52]/15" />
                </div>
              </div>

              <div className="mt-5">
                <label className="text-xs font-black uppercase tracking-wider text-slate-600">Target industry vertical *</label>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {INDUSTRIES.map((ind) => (
                    <button
                      key={ind.id}
                      onClick={() => setIndustryId(ind.id)}
                      className={`rounded-2xl border-2 px-3 py-2.5 text-left transition ${
                        industryId === ind.id ? "border-[#0f2a52] bg-[#0f2a52] text-white shadow" : "border-slate-200 bg-slate-50 hover:border-slate-400"
                      }`}
                    >
                      <span className="text-lg">{ind.icon}</span>
                      <p className={`mt-1 text-xs font-black leading-tight ${industryId === ind.id ? "text-white" : "text-slate-800"}`}>{ind.name}</p>
                      <p className={`text-[10px] font-bold ${industryId === ind.id ? "text-amber-300" : "text-slate-400"}`}>{ind.code}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-slate-600">Experience level</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {ROLE_LEVELS.map((r) => (
                      <button key={r.id} onClick={() => setRoleLevel(r.id)} className={`rounded-full px-3.5 py-1.5 text-xs font-black transition ${roleLevel === r.id ? "bg-amber-400 text-[#0f2a52]" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-slate-600">Target role title</label>
                  <select value={roleTitle} onChange={(e) => setRoleTitle(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-semibold outline-none focus:border-[#0f2a52]">
                    {industry.roles.map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                  <p className="mt-1 text-[11px] font-semibold text-slate-400">Benchmark: {industry.experienceExpectation[roleLevel as keyof typeof industry.experienceExpectation]?.years} • {industry.experienceExpectation[roleLevel as keyof typeof industry.experienceExpectation]?.focus}</p>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-lg font-black text-[#0f2a52]">② Resume input</h2>
                  <div className="no-print flex flex-wrap gap-2">
                    <button onClick={() => { setResumeText(SAMPLE_SOFTWARE); setCandidateName("Aarav Sharma"); setIndustryId("software"); setRoleLevel("mid"); }} className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-black text-emerald-800 hover:bg-emerald-200">Try strong sample</button>
                    <button onClick={() => { setResumeText(SAMPLE_DATA_FRESHER); setCandidateName("Priya Verma"); setIndustryId("data-ai"); setRoleLevel("fresher"); }} className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-black text-amber-800 hover:bg-amber-200">Try weak sample</button>
                    <button onClick={() => { setResumeText(SAMPLE_MECH); setCandidateName("Rajesh Kumar"); setIndustryId("mechanical"); setRoleLevel("senior"); }} className="rounded-full bg-sky-100 px-3 py-1.5 text-xs font-black text-sky-800 hover:bg-sky-200">Try mech. sample</button>
                  </div>
                </div>
                <div className="no-print mt-3 flex flex-col gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-4 sm:flex-row sm:items-center">
                  <input ref={fileRef} type="file" accept=".pdf,.docx,.txt,.md" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                  <button onClick={() => fileRef.current?.click()} disabled={parsing} className="rounded-xl bg-[#0f2a52] px-4 py-2.5 text-sm font-black text-white hover:bg-[#1a3f7a] disabled:opacity-60">
                    {parsing ? "⏳ Extracting text…" : "📎 Upload PDF / DOCX / TXT"}
                  </button>
                  <p className="text-xs font-semibold text-slate-500">{fileName ? `Attached: ${fileName}` : "…or paste resume text below. PDFs are parsed on-device; scanned images need manual paste."}</p>
                  <span className="ml-auto rounded-full bg-white px-3 py-1 text-xs font-black text-slate-600 shadow-sm">{wordCount} words</span>
                </div>
                <textarea value={resumeText} onChange={(e) => setResumeText(e.target.value)} rows={14} placeholder="Paste full resume text here — include summary, skills, experience with dates, projects, education, certifications…" className="custom-scroll mt-3 w-full rounded-2xl border border-slate-300 p-4 font-mono text-[13px] leading-relaxed outline-none focus:border-[#0f2a52] focus:ring-2 focus:ring-[#0f2a52]/15" />
              </div>

              <div className="mt-4">
                <label className="text-xs font-black uppercase tracking-wider text-slate-600">Job description <span className="font-semibold normal-case text-slate-400">(optional — enables JD-gap analysis)</span></label>
                <textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} rows={5} placeholder="Paste the target job posting here to detect missing JD keywords…" className="custom-scroll mt-1.5 w-full rounded-2xl border border-slate-300 p-4 text-[13px] leading-relaxed outline-none focus:border-[#0f2a52] focus:ring-2 focus:ring-[#0f2a52]/15" />
              </div>

              <button onClick={handleEvaluate} disabled={loading} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0f2a52] to-[#1d4fa3] px-6 py-4 text-base font-black text-white shadow-lg transition hover:brightness-110 disabled:opacity-60">
                {loading ? <><span className="pulse-soft">⚙️</span> AI evaluating against {industry.code} benchmarks…</> : <>🤖 Run Official AI Evaluation →</>}
              </button>
              <p className="mt-2 text-center text-[11px] font-semibold text-slate-400">Evaluation is rule-audited, deterministic and stored in the official registry with a verifiable ID.</p>
            </section>

            {/* side panel */}
            <aside className="flex flex-col gap-4">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl text-2xl" style={{ background: industry.color + "18" }}>{industry.icon}</span>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">{industry.code} • {industry.growth}</p>
                    <h3 className="font-black text-[#0f2a52]">{industry.name}</h3>
                  </div>
                </div>
                <p className="mt-3 text-[13px] leading-relaxed text-slate-600">{industry.description}</p>
                <div className="mt-3 rounded-2xl bg-slate-50 p-3 text-xs font-bold text-slate-600">💰 {industry.salaryRange}</div>
                <h4 className="mt-4 text-xs font-black uppercase tracking-wider text-slate-500">Required skills & weights (live benchmark)</h4>
                <div className="custom-scroll mt-2 max-h-72 space-y-2 overflow-y-auto pr-1">
                  {industry.requiredSkills.map((s) => (
                    <div key={s.name} className="rounded-xl border border-slate-100 bg-white p-2.5 shadow-sm">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-black text-slate-800">{s.name}</p>
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black ${s.demand === "Critical" ? "bg-red-100 text-red-700" : s.demand === "Emerging" ? "bg-violet-100 text-violet-700" : s.demand === "High" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"}`}>{s.demand} • {s.weight}/10</span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full" style={{ width: `${s.weight * 10}%`, background: industry.color }} />
                      </div>
                      <p className="mt-1 text-[10px] font-semibold text-slate-400">{s.category}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl bg-[#0f2a52] p-5 text-white shadow-sm">
                <h4 className="text-sm font-black text-amber-300">⚖️ HOW OFFICIAL SCORING WORKS</h4>
                <ul className="mt-3 space-y-2.5 text-[13px] font-semibold text-slate-200">
                  <li className="flex gap-2"><span>🎯</span> Industrial Skill Match — 40% (weighted coverage of {industry.requiredSkills.length} benchmarked skills)</li>
                  <li className="flex gap-2"><span>💼</span> Experience Relevance — 20% (tenure vs {roleLevel} expectations + context keywords)</li>
                  <li className="flex gap-2"><span>🎓</span> Education & Credentials — 10% (NSQF-mapped qualification depth)</li>
                  <li className="flex gap-2"><span>🤖</span> ATS & Format — 15% (9 machine-parseability checks)</li>
                  <li className="flex gap-2"><span>🚀</span> Impact & Achievements — 15% (verbs, metrics, leadership, awards)</li>
                </ul>
                <div className="mt-4 rounded-2xl bg-white/10 p-3 text-xs leading-relaxed text-slate-200">
                  Grades A+ to F • Verdicts from “Highly Suitable” to “Reskilling Required”. Every report carries a verifiable evaluation ID and audit trail.
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">Certifications employers expect</h4>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {industry.certifications.map((c) => (
                    <span key={c} className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700">🎖️ {c}</span>
                  ))}
                </div>
                <h4 className="mt-4 text-xs font-black uppercase tracking-wider text-slate-500">Tools in scope</h4>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {industry.tools.map((t) => (
                    <span key={t} className="rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-600">🛠️ {t}</span>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* ------------------------------- REPORT ------------------------------- */}
        {tab === "report" && (
          <div>
            {!result ? (
              <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                <div className="text-6xl">📜</div>
                <h2 className="mt-4 text-xl font-black text-[#0f2a52]">No evaluation issued yet</h2>
                <p className="mt-2 text-sm text-slate-500">Run a new evaluation or open a record from the registry to generate the official certificate.</p>
                <div className="no-print mt-5 flex justify-center gap-2">
                  <button onClick={() => setTab("evaluate")} className="rounded-xl bg-[#0f2a52] px-5 py-2.5 text-sm font-black text-white">＋ New evaluation</button>
                  <button onClick={() => setTab("history")} className="rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-black text-slate-700">Open registry</button>
                </div>
              </div>
            ) : (
              <div className="fade-up">
                <div className="no-print mb-4 flex flex-wrap items-center gap-2">
                  <button onClick={() => setTab("evaluate")} className="rounded-xl bg-white px-4 py-2 text-sm font-black text-[#0f2a52] shadow-sm">← New evaluation</button>
                  <button onClick={handlePrint} className="rounded-xl bg-[#0f2a52] px-4 py-2 text-sm font-black text-white shadow-sm">🖨️ Print / Save PDF</button>
                  {viewingPast && <span className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-black text-amber-800">📚 Archived record from registry</span>}
                  <span className="ml-auto text-xs font-bold text-slate-400">Tip: printing produces the stamped certificate layout</span>
                </div>

                <article id="official-report" className="report-paper overflow-hidden rounded-3xl border border-slate-200">
                  {/* letterhead */}
                  <div className="official-pattern px-6 py-6 text-white sm:px-10">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-3xl">🏛️</div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-300">Official Skill Assessment Document</p>
                          <h2 className="text-lg font-black sm:text-xl">AI-ASSISTED RESUME EVALUATION CERTIFICATE</h2>
                          <p className="text-xs text-slate-300">National Industrial Skill Council • Industrial Skill Requirement Division • Ref: {result.evaluationId}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl border border-amber-300/50 bg-white/10 px-4 py-2 text-center">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-300">Grade</p>
                          <p className="text-3xl font-black text-white">{result.grade}</p>
                        </div>
                        <div className="seal-ring rounded-full p-1">
                          <div className="flex h-20 w-20 flex-col items-center justify-center rounded-full bg-[#0f2a52] text-center">
                            <span className="text-lg">✓</span>
                            <span className="px-2 text-[8px] font-black leading-tight text-amber-300">VERIFIED NISC • AI AUDITED</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-2 rounded-2xl bg-white/10 p-4 text-xs font-semibold sm:grid-cols-4">
                      <div><p className="uppercase tracking-widest text-amber-300/80">Evaluation ID</p><p className="font-black text-white">{result.evaluationId}</p></div>
                      <div><p className="uppercase tracking-widest text-amber-300/80">Date of issue</p><p className="font-black text-white">{new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}</p></div>
                      <div><p className="uppercase tracking-widest text-amber-300/80">Framework</p><p className="font-black text-white">NSQF • {getIndustry(result.industryId).code}</p></div>
                      <div><p className="uppercase tracking-widest text-amber-300/80">Validity</p><p className="font-black text-white">6 months / 1 role cycle</p></div>
                    </div>
                  </div>

                  <div className="px-6 py-6 sm:px-10">
                    {/* candidate + score hero */}
                    <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400">Certified candidate</p>
                        <h3 className="mt-1 text-3xl font-black text-[#0f2a52]">{candidateName || "Candidate"}</h3>
                        <p className="mt-1 text-sm font-bold text-slate-500">{result.roleTitle} • {result.roleLevelLabel} • {result.industryName}</p>
                        <div className="mt-3 inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-black text-white" style={{ background: result.verdictColor }}>
                          <span>{result.overallScore >= 70 ? "✅" : result.overallScore >= 55 ? "⚠️" : "🔴"}</span> {result.verdict}
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-bold text-slate-600 sm:grid-cols-4">
                          <div className="rounded-xl bg-slate-50 p-3"><p className="text-slate-400">EXPERIENCE</p><p className="text-base font-black text-slate-800">{result.experienceYears} yrs</p></div>
                          <div className="rounded-xl bg-slate-50 p-3"><p className="text-slate-400">EDUCATION</p><p className="text-[11px] font-black text-slate-800">{result.educationLevel}</p></div>
                          <div className="rounded-xl bg-slate-50 p-3"><p className="text-slate-400">RESUME DEPTH</p><p className="text-base font-black text-slate-800">{result.wordCount} words</p></div>
                          <div className="rounded-xl bg-slate-50 p-3"><p className="text-slate-400">SKILL COVERAGE</p><p className="text-base font-black text-slate-800">{result.skillCoverage}%</p></div>
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-2 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                        <Gauge score={result.overallScore} color={result.verdictColor} />
                        <p className="text-xs font-black uppercase tracking-widest text-slate-500">Composite employability score</p>
                      </div>
                    </div>

                    {/* dimensions */}
                    <h4 className="mt-8 border-l-4 border-amber-400 pl-3 text-base font-black text-[#0f2a52]">A. DIMENSION-WISE BREAKDOWN (5-D MODEL)</h4>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      {result.dimensionScores.map((d) => (
                        <DimBar key={d.key} label={d.label} score={d.score} weight={d.weight} explanation={d.explanation} status={d.status} />
                      ))}
                    </div>

                    {/* skills */}
                    <h4 className="mt-8 border-l-4 border-emerald-500 pl-3 text-base font-black text-[#0f2a52]">B. INDUSTRIAL SKILL MAPPING — {result.industryName.toUpperCase()}</h4>
                    <div className="mt-3 grid gap-4 lg:grid-cols-2">
                      <div className="overflow-hidden rounded-2xl border border-emerald-200">
                        <div className="bg-emerald-600 px-4 py-2.5 text-sm font-black text-white">✅ Matched skills ({result.matchedSkills.length})</div>
                        <div className="custom-scroll max-h-80 overflow-y-auto">
                          {result.matchedSkills.length === 0 && <p className="p-4 text-sm text-slate-500">No benchmarked skills detected.</p>}
                          {result.matchedSkills.map((s) => (
                            <div key={s.name} className="border-b border-slate-100 px-4 py-2.5">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-[13px] font-black text-slate-800">{s.name}</p>
                                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-700">{s.category} • {s.weight}/10</span>
                              </div>
                              {s.evidence && <p className="mt-1 font-mono text-[11px] leading-relaxed text-slate-500">{s.evidence}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="overflow-hidden rounded-2xl border border-red-200">
                        <div className="bg-red-600 px-4 py-2.5 text-sm font-black text-white">❌ Missing / gap skills ({result.missingSkills.length})</div>
                        <div className="custom-scroll max-h-80 overflow-y-auto">
                          {result.missingSkills.length === 0 && <p className="p-4 text-sm text-slate-500">Full coverage — exemplary profile.</p>}
                          {result.missingSkills.map((s) => (
                            <div key={s.name} className="border-b border-slate-100 px-4 py-2.5">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-[13px] font-black text-slate-800">{s.name}</p>
                                <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-black text-red-700">{s.demand} • {s.weight}/10</span>
                              </div>
                              <p className="mt-1 text-[11px] font-semibold text-slate-500">↳ Learn: {s.course}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* ATS */}
                    <h4 className="mt-8 border-l-4 border-sky-500 pl-3 text-base font-black text-[#0f2a52]">C. ATS & FORMAT AUDIT — SCORE {result.atsScore}/100</h4>
                    <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200">
                      {result.atsChecks.map((c, i) => (
                        <div key={c.label} className={`flex items-start gap-3 px-4 py-2.5 text-[13px] ${i % 2 ? "bg-slate-50" : "bg-white"}`}>
                          <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-black ${c.passed ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>{c.passed ? "✓" : "✕"}</span>
                          <div className="flex-1">
                            <p className="font-black text-slate-800">{c.label} <span className="font-bold text-slate-400">({c.points}/{c.max})</span></p>
                            <p className="text-xs text-slate-500">{c.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* strengths / gaps */}
                    <div className="mt-8 grid gap-4 lg:grid-cols-2">
                      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5">
                        <h4 className="text-sm font-black text-emerald-800">💪 CERTIFIED STRENGTHS</h4>
                        <ul className="mt-3 space-y-2">
                          {result.strengths.map((s, i) => (
                            <li key={i} className="flex gap-2 text-[13px] font-semibold leading-relaxed text-slate-700"><span className="text-emerald-600">✔</span> {s}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5">
                        <h4 className="text-sm font-black text-amber-800">🔍 OFFICIAL GAPS & OBSERVATIONS</h4>
                        <ul className="mt-3 space-y-2">
                          {result.gaps.map((g, i) => (
                            <li key={i} className="flex gap-2 text-[13px] font-semibold leading-relaxed text-slate-700"><span className="text-amber-600">●</span> {g}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* recommendations */}
                    <h4 className="mt-8 border-l-4 border-violet-500 pl-3 text-base font-black text-[#0f2a52]">D. PRESCRIBED CORRECTIVE ACTIONS</h4>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      {result.recommendations.map((r, i) => (
                        <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-[13px] font-black text-slate-800">{i + 1}. {r.title}</p>
                            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black ${r.priority === "High" ? "bg-red-100 text-red-700" : r.priority === "Medium" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"}`}>{r.priority}</span>
                          </div>
                          <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{r.detail}</p>
                          <p className="mt-2 rounded-xl bg-[#0f2a52]/5 p-2.5 text-xs font-bold text-[#0f2a52]">👉 {r.action}</p>
                        </div>
                      ))}
                    </div>

                    {/* roadmap */}
                    <h4 className="mt-8 border-l-4 border-[#0f2a52] pl-3 text-base font-black text-[#0f2a52]">E. 90-DAY INDUSTRY READINESS ROADMAP</h4>
                    <div className="mt-3 grid gap-3 lg:grid-cols-3">
                      {result.roadmap.map((ph, i) => (
                        <div key={i} className="rounded-2xl bg-[#0f2a52] p-4 text-white">
                          <p className="text-[13px] font-black text-amber-300">{ph.phase}</p>
                          <ul className="mt-2 space-y-1.5">
                            {ph.items.map((it, j) => (
                              <li key={j} className="flex gap-2 text-xs font-semibold leading-relaxed text-slate-200"><span className="text-amber-300">▸</span> {it}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>

                    {/* keywords */}
                    <h4 className="mt-8 border-l-4 border-slate-400 pl-3 text-base font-black text-[#0f2a52]">F. KEYWORD FORENSICS</h4>
                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                      <div className="rounded-2xl border border-slate-200 p-4">
                        <p className="text-xs font-black text-emerald-700">FOUND ({result.keywords.found.length})</p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {result.keywords.found.map((k) => (<span key={k} className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">{k}</span>))}
                        </div>
                      </div>
                      <div className="rounded-2xl border border-slate-200 p-4">
                        <p className="text-xs font-black text-red-700">MISSING ({result.keywords.missing.length})</p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {result.keywords.missing.slice(0, 14).map((k) => (<span key={k} className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-bold text-red-800">{k}</span>))}
                        </div>
                      </div>
                      <div className="rounded-2xl border border-slate-200 p-4">
                        <p className="text-xs font-black text-violet-700">JD GAPS ({result.keywords.jdGaps.length})</p>
                        {result.keywords.jdGaps.length === 0 ? <p className="mt-2 text-xs text-slate-500">No JD supplied — paste a job description for gap analysis.</p> : (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {result.keywords.jdGaps.map((k) => (<span key={k} className="rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-bold text-violet-800">{k}</span>))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* contact forensics */}
                    <div className="mt-6 grid gap-2 rounded-2xl bg-slate-50 p-4 text-xs font-bold text-slate-600 sm:grid-cols-5">
                      <div>📧 {result.contactInfo.email || "No email"}</div>
                      <div>📞 {result.contactInfo.phone || "No phone"}</div>
                      <div>{result.contactInfo.linkedin ? "✅ LinkedIn" : "❌ LinkedIn"}</div>
                      <div>{result.contactInfo.github ? "✅ GitHub" : "❌ GitHub"}</div>
                      <div>{result.contactInfo.portfolio ? "✅ Portfolio" : "❌ Portfolio"}</div>
                    </div>

                    {/* footer */}
                    <div className="mt-8 flex flex-col gap-4 border-t-2 border-dashed border-slate-200 pt-5 sm:flex-row sm:items-end sm:justify-between">
                      <div className="text-xs leading-relaxed text-slate-500">
                        <p className="font-black text-slate-700">DECLARATION & METHODOLOGY</p>
                        <p className="mt-1 max-w-2xl">This evaluation was generated by deterministic AI-assisted analysis against {getIndustry(result.industryId).code} industrial benchmarks ({result.matchedSkills.length + result.missingSkills.length} weighted skills, 9 ATS checks, 5 scoring dimensions). It is advisory for employability improvement and does not constitute employment guarantee. Verify this certificate with Evaluation ID {result.evaluationId} in the NISC registry.</p>
                      </div>
                      <div className="flex shrink-0 items-end gap-4">
                        <div className="text-center">
                          <p className="font-serif text-2xl italic text-[#0f2a52]">A. Nair</p>
                          <div className="h-px w-40 bg-slate-400" />
                          <p className="mt-1 text-[11px] font-black text-slate-700">Authorised Signatory</p>
                          <p className="text-[10px] font-semibold text-slate-400">Director, Skill Assessment Board</p>
                        </div>
                        <div className="seal-ring rounded-full p-1">
                          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-center text-[8px] font-black leading-tight text-[#0f2a52]">NISC<br />OFFICIAL<br />SEAL</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------- HISTORY ------------------------------- */}
        {tab === "history" && (
          <div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {[
                { l: "Total evaluations", v: stats.total, c: "#0f2a52", i: "📁" },
                { l: "Average score", v: stats.avgScore, c: "#2563eb", i: "📊" },
                { l: "Highly suitable (85+)", v: stats.highlySuitable, c: "#15803d", i: "🌟" },
                { l: "Suitable (70+)", v: stats.suitable, c: "#b45309", i: "✅" },
                { l: "Needs work (<55)", v: stats.needsWork, c: "#b91c1c", i: "🔧" },
              ].map((s) => (
                <div key={s.l} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between"><span className="text-xl">{s.i}</span><span className="text-2xl font-black" style={{ color: s.c }}>{s.v}</span></div>
                  <p className="mt-1 text-xs font-bold text-slate-500">{s.l}</p>
                </div>
              ))}
            </div>

            <div className="no-print mt-4 flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
              <input value={hq} onChange={(e) => setHq(e.target.value)} onKeyDown={(e) => e.key === "Enter" && loadHistory()} placeholder="🔍 Search name, ID, role, industry…" className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold outline-none focus:border-[#0f2a52]" />
              <select value={hIndustry} onChange={(e) => setHIndustry(e.target.value)} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold">
                <option value="all">All industries</option>
                {INDUSTRIES.map((i) => (<option key={i.id} value={i.id}>{i.name}</option>))}
              </select>
              <button onClick={loadHistory} className="rounded-xl bg-[#0f2a52] px-5 py-2.5 text-sm font-black text-white">Search registry</button>
            </div>

            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="bg-[#0f2a52] px-5 py-3 text-sm font-black text-white">📚 OFFICIAL EVALUATION REGISTRY {historyLoading ? "— loading…" : `— ${history.length} record(s)`}</div>
              {history.length === 0 && !historyLoading ? (
                <p className="p-8 text-center text-sm font-semibold text-slate-400">No records found. Issue your first evaluation to populate the registry.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[820px] text-left text-[13px]">
                    <thead>
                      <tr className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
                        <th className="px-4 py-3">Eval ID</th>
                        <th className="px-4 py-3">Candidate</th>
                        <th className="px-4 py-3">Industry / Role</th>
                        <th className="px-4 py-3">Score</th>
                        <th className="px-4 py-3">Verdict</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="no-print px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((h) => (
                        <tr key={h.id} className="border-t border-slate-100 hover:bg-slate-50">
                          <td className="px-4 py-3 font-mono text-xs font-black text-[#0f2a52]">{h.evaluationId}</td>
                          <td className="px-4 py-3"><p className="font-black text-slate-800">{h.candidateName}</p><p className="text-xs text-slate-400">{h.email}</p></td>
                          <td className="px-4 py-3"><p className="font-bold text-slate-700">{h.industryName}</p><p className="text-xs text-slate-400">{h.roleTitle}</p></td>
                          <td className="px-4 py-3"><span className="rounded-full px-2.5 py-1 text-xs font-black text-white" style={{ background: h.verdictColor }}>{h.overallScore} • {h.grade}</span></td>
                          <td className="max-w-[220px] truncate px-4 py-3 text-xs font-semibold text-slate-600">{h.verdict}</td>
                          <td className="px-4 py-3 text-xs text-slate-500">{new Date(h.createdAt).toLocaleDateString("en-IN")}</td>
                          <td className="no-print px-4 py-3">
                            <div className="flex gap-1.5">
                              <button onClick={() => openHistoryReport(h)} className="rounded-lg bg-[#0f2a52] px-3 py-1.5 text-xs font-black text-white">View</button>
                              <button onClick={() => deleteRecord(h.id)} className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-black text-red-700">Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ------------------------------ STANDARDS ------------------------------ */}
        {tab === "standards" && (
          <div>
            <div className="rounded-3xl bg-[#0f2a52] p-6 text-white sm:p-8">
              <h2 className="text-xl font-black">🏭 Industrial Skill Requirement Standards</h2>
              <p className="mt-1 max-w-3xl text-sm text-slate-300">Authoritative benchmark matrix used by the AI engine — {INDUSTRIES.length} verticals, {INDUSTRIES.reduce((s, i) => s + i.requiredSkills.length, 0)} weighted skills, mapped to NSQF levels, tools, certifications and salary bands. Click any vertical for the full audit sheet.</p>
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {INDUSTRIES.map((ind) => {
                const open = expandedIndustry === ind.id;
                return (
                  <div key={ind.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <button onClick={() => setExpandedIndustry(open ? null : ind.id)} className="flex w-full items-center gap-3 p-5 text-left">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl" style={{ background: ind.color + "18" }}>{ind.icon}</span>
                      <span className="flex-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{ind.code} • {ind.growth}</span>
                        <span className="block font-black text-[#0f2a52]">{ind.name}</span>
                        <span className="block text-xs font-semibold text-slate-500">{ind.requiredSkills.length} benchmarked skills • {ind.roles.length} roles</span>
                      </span>
                      <span className="text-xl">{open ? "▾" : "▸"}</span>
                    </button>
                    {open && (
                      <div className="fade-up border-t border-slate-100 p-5">
                        <p className="text-[13px] leading-relaxed text-slate-600">{ind.description}</p>
                        <div className="mt-3 rounded-2xl bg-slate-50 p-3 text-xs font-bold text-slate-600">💰 {ind.salaryRange}</div>
                        <h5 className="mt-4 text-xs font-black uppercase tracking-wider text-slate-500">Skill benchmark sheet</h5>
                        <div className="mt-2 overflow-hidden rounded-xl border border-slate-200">
                          <table className="w-full text-left text-xs">
                            <thead><tr className="bg-slate-100 text-[10px] uppercase tracking-wider text-slate-500"><th className="px-3 py-2">Skill</th><th className="px-3 py-2">Category</th><th className="px-3 py-2">Demand</th><th className="px-3 py-2">Wt.</th></tr></thead>
                            <tbody>
                              {ind.requiredSkills.map((s) => (
                                <tr key={s.name} className="border-t border-slate-100">
                                  <td className="px-3 py-2 font-black text-slate-700">{s.name}</td>
                                  <td className="px-3 py-2 text-slate-500">{s.category}</td>
                                  <td className="px-3 py-2"><span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${s.demand === "Critical" ? "bg-red-100 text-red-700" : s.demand === "Emerging" ? "bg-violet-100 text-violet-700" : "bg-amber-100 text-amber-800"}`}>{s.demand}</span></td>
                                  <td className="px-3 py-2 font-black">{s.weight}/10</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                          <div className="rounded-xl bg-slate-50 p-3"><p className="font-black text-slate-700">Roles in scope</p><p className="mt-1 font-semibold text-slate-500">{ind.roles.join(" • ")}</p></div>
                          <div className="rounded-xl bg-slate-50 p-3"><p className="font-black text-slate-700">Education pathways</p><p className="mt-1 font-semibold text-slate-500">{ind.education.join(" • ")}</p></div>
                          <div className="rounded-xl bg-slate-50 p-3"><p className="font-black text-slate-700">Expected certifications</p><p className="mt-1 font-semibold text-slate-500">{ind.certifications.join(" • ")}</p></div>
                          <div className="rounded-xl bg-slate-50 p-3"><p className="font-black text-slate-700">ATS keyword set</p><p className="mt-1 font-semibold text-slate-500">{ind.atsKeywords.join(", ")}</p></div>
                        </div>
                        <button onClick={() => { setIndustryId(ind.id); setTab("evaluate"); window.scrollTo({ top: 0 }); }} className="no-print mt-4 w-full rounded-xl px-4 py-2.5 text-sm font-black text-white" style={{ background: ind.color }}>Evaluate against this standard →</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <footer className="mt-8 border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs font-semibold text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>🏛️ National Industrial Skill Council • AI-Assisted Resume Evaluation System • Framework NSQF • ISO 9001:2015 • For employability guidance only</p>
          <p className="font-mono">Ref: NISC-AI/03 • Build 3.2 • Registry-backed • Auditable scoring</p>
        </div>
        <div className="flex h-1.5"><div className="flex-1 bg-[#ff9933]" /><div className="flex-1 bg-white" /><div className="flex-1 bg-[#138808]" /></div>
      </footer>
    </div>
  );
}
