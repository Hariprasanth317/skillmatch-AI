import { NextResponse } from "next/server";
import { db } from "@/db";
import { evaluations } from "@/db/schema";
import { desc, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = (url.searchParams.get("q") || "").trim();
    const industry = (url.searchParams.get("industry") || "").trim();
    const limit = Math.min(100, parseInt(url.searchParams.get("limit") || "50", 10) || 50);

    const conditions: string[] = [];
    const params: unknown[] = [];
    // Build with drizzle sql safely using ilike via sql template
    let query = db.select().from(evaluations).orderBy(desc(evaluations.createdAt)).limit(limit);

    const rows = await query;

    let filtered = rows;
    if (q) {
      const lq = q.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.candidateName.toLowerCase().includes(lq) ||
          r.evaluationId.toLowerCase().includes(lq) ||
          r.roleTitle.toLowerCase().includes(lq) ||
          r.industryName.toLowerCase().includes(lq)
      );
    }
    if (industry && industry !== "all") {
      filtered = filtered.filter((r) => r.industryId === industry);
    }

    const stats = {
      total: rows.length,
      avgScore: rows.length ? Math.round(rows.reduce((s, r) => s + r.overallScore, 0) / rows.length) : 0,
      highlySuitable: rows.filter((r) => r.overallScore >= 85).length,
      suitable: rows.filter((r) => r.overallScore >= 70 && r.overallScore < 85).length,
      needsWork: rows.filter((r) => r.overallScore < 55).length,
    };

    // strip heavy text fields for list view
    const list = filtered.map((r) => ({
      id: r.id,
      evaluationId: r.evaluationId,
      candidateName: r.candidateName,
      email: r.email,
      industryId: r.industryId,
      industryName: r.industryName,
      roleLevel: r.roleLevel,
      roleTitle: r.roleTitle,
      overallScore: r.overallScore,
      grade: r.grade,
      verdict: r.verdict,
      verdictColor: r.verdictColor,
      wordCount: r.wordCount,
      createdAt: r.createdAt,
    }));

    return NextResponse.json({ evaluations: list, stats });
  } catch (err) {
    console.error("list evaluations error", err);
    return NextResponse.json({ error: "Failed to load evaluations" }, { status: 500 });
  }
}
