import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { evaluations } from "@/db/schema";
import { eq, or } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const rows = await db
      .select()
      .from(evaluations)
      .where(or(eq(evaluations.id, id as never), eq(evaluations.evaluationId, id)))
      .limit(1);
    if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ evaluation: rows[0] });
  } catch (err) {
    console.error("get evaluation error", err);
    return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    await db.delete(evaluations).where(eq(evaluations.id, id as never));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("delete evaluation error", err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
