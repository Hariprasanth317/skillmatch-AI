import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { evaluations } from "@/db/schema";
import { evaluateResume } from "@/lib/evaluator";
import { getIndustry } from "@/lib/industries";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { candidateName, email, industryId, roleLevel, roleTitle, resumeText, jobDescription } = body ?? {};

    if (!resumeText || typeof resumeText !== "string" || resumeText.trim().length < 80) {
      return NextResponse.json(
        { error: "Resume text is too short. Paste at least 80 characters or upload a complete resume." },
        { status: 400 }
      );
    }
    if (!candidateName || typeof candidateName !== "string" || !candidateName.trim()) {
      return NextResponse.json({ error: "Candidate name is required." }, { status: 400 });
    }
    if (!industryId) {
      return NextResponse.json({ error: "Target industry is required." }, { status: 400 });
    }

    const industry = getIndustry(industryId);
    const result = evaluateResume({
      resumeText: resumeText.trim(),
      industryId: industry.id,
      roleLevel: roleLevel || "mid",
      roleTitle: roleTitle || industry.roles[0],
      jobDescription: jobDescription || "",
      candidateName: candidateName.trim(),
    });

    const contactEmail = (email && String(email).trim()) || result.contactInfo.email || "";
    const [saved] = await db
      .insert(evaluations)
      .values({
        evaluationId: result.evaluationId,
        candidateName: candidateName.trim().slice(0, 120),
        email: contactEmail.slice(0, 160),
        phone: result.contactInfo.phone.slice(0, 40),
        industryId: result.industryId,
        industryName: result.industryName,
        roleLevel: result.roleLevel,
        roleTitle: (roleTitle || result.roleTitle || "").slice(0, 160),
        resumeText: resumeText.trim().slice(0, 20000),
        jobDescription: (jobDescription || "").slice(0, 10000),
        wordCount: result.wordCount,
        overallScore: result.overallScore,
        grade: result.grade,
        verdict: result.verdict,
        verdictColor: result.verdictColor,
        dimensionScores: result.dimensionScores,
        matchedSkills: result.matchedSkills,
        missingSkills: result.missingSkills,
        atsChecks: result.atsChecks,
        strengths: result.strengths,
        gaps: result.gaps,
        recommendations: result.recommendations,
        roadmap: result.roadmap,
        keywords: result.keywords,
        contactInfo: { ...result.contactInfo, experienceYears: result.experienceYears, educationLevel: result.educationLevel, skillCoverage: result.skillCoverage, atsScore: result.atsScore },
      })
      .returning();

    return NextResponse.json({ result, recordId: saved.id });
  } catch (err) {
    console.error("evaluate error", err);
    return NextResponse.json({ error: "Evaluation failed. Please try again." }, { status: 500 });
  }
}
