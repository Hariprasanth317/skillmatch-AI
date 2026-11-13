import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "NISC — AI-Assisted Resume Evaluation | Industrial Skill Assessment",
  description:
    "Official AI-assisted resume evaluation system aligned with industrial skill requirements, NSQF standards and ATS benchmarks.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#eef1f6] text-slate-900 antialiased">{children}</body>
    </html>
  );
}
