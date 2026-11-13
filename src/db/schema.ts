import { pgTable, uuid, text, integer, jsonb, timestamp } from "drizzle-orm/pg-core";

export const evaluations = pgTable("evaluations", {
  id: uuid("id").primaryKey().defaultRandom(),
  evaluationId: text("evaluation_id").notNull().unique(),
  candidateName: text("candidate_name").notNull(),
  email: text("email").notNull().default(""),
  phone: text("phone").notNull().default(""),
  industryId: text("industry_id").notNull(),
  industryName: text("industry_name").notNull(),
  roleLevel: text("role_level").notNull(),
  roleTitle: text("role_title").notNull().default(""),
  resumeText: text("resume_text").notNull(),
  jobDescription: text("job_description").notNull().default(""),
  wordCount: integer("word_count").notNull().default(0),
  overallScore: integer("overall_score").notNull(),
  grade: text("grade").notNull(),
  verdict: text("verdict").notNull(),
  verdictColor: text("verdict_color").notNull().default(""),
  dimensionScores: jsonb("dimension_scores").notNull(),
  matchedSkills: jsonb("matched_skills").notNull(),
  missingSkills: jsonb("missing_skills").notNull(),
  atsChecks: jsonb("ats_checks").notNull(),
  strengths: jsonb("strengths").notNull(),
  gaps: jsonb("gaps").notNull(),
  recommendations: jsonb("recommendations").notNull(),
  roadmap: jsonb("roadmap").notNull(),
  keywords: jsonb("keywords").notNull(),
  contactInfo: jsonb("contact_info").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type EvaluationRow = typeof evaluations.$inferSelect;
export type NewEvaluationRow = typeof evaluations.$inferInsert;
