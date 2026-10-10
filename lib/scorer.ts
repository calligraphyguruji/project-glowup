import { AuditFinding, RepoOverview, RepoFile } from "@/types/audit";
import { DetectedStack } from "./stackDetector";

export interface ScoreBreakdown {
  score: number;
  grade: "A" | "B" | "C" | "D" | "F";
  criticalDeductions: number;
  warningDeductions: number;
  coverageAdjustment: number;
  factors: string[];
}

/**
 * Deterministic, transparent, explainable scoring engine.
 *
 * Baseline: 100 points
 * Deductions:
 *   - Critical finding: -18 pts each
 *   - Warning finding: -7 pts each
 *   - Optimization / Info: 0 pts
 *
 * Coverage factor:
 *   - Based on files ingested vs files discovered, with ceiling penalties if too few files could be inspected.
 *   - If fewer than 2 files inspected or repo is completely empty, score reflects low confidence.
 */
export function calculateAuditScore(
  findings: AuditFinding[],
  overview: RepoOverview,
  files: RepoFile[],
  stack?: DetectedStack
): ScoreBreakdown {
  if (overview.totalFilesDiscovered === 0 || files.length === 0) {
    return {
      score: 50,
      grade: "F",
      criticalDeductions: 0,
      warningDeductions: 0,
      coverageAdjustment: -50,
      factors: ["No source code files discovered or ingested for analysis"],
    };
  }

  let base = 100;
  const factors: string[] = [];

  const criticals = findings.filter((f) => f.severity === "critical");
  const warnings = findings.filter((f) => f.severity === "warning");

  const criticalDeductions = criticals.length * 18;
  const warningDeductions = warnings.length * 7;

  base -= criticalDeductions;
  base -= warningDeductions;

  if (criticals.length > 0) {
    factors.push(`-${criticalDeductions} pts: ${criticals.length} critical architectural vulnerability(ies)`);
  }
  if (warnings.length > 0) {
    factors.push(`-${warningDeductions} pts: ${warnings.length} warning-level defect(s)`);
  }

  // Coverage bonus/penalty:
  // If repo has >15 files discovered but only <3 could be ingested, apply a coverage uncertainty penalty (-5 pts)
  let coverageAdjustment = 0;
  if (overview.totalFilesDiscovered > 15 && files.length < 3) {
    coverageAdjustment = -5;
    base -= 5;
    factors.push(`-5 pts: Partial inspection coverage (${files.length} of ${overview.totalFilesDiscovered} files)`);
  } else if (files.length >= 8) {
    factors.push(`Inspection breadth confirmed across ${files.length} key architecture files`);
  }

  // Bonus for presence of test suite files
  const hasTests = files.some((f) =>
    f.path.toLowerCase().includes("test") ||
    f.path.toLowerCase().includes("spec") ||
    f.path.toLowerCase().startsWith("__tests__")
  );
  if (hasTests && criticals.length === 0) {
    base = Math.min(100, base + 3);
    factors.push("+3 pts: Automated test suite files verified in repository tree");
  }

  // Clamp score between 10 and 100
  const finalScore = Math.max(15, Math.min(100, base));

  let grade: "A" | "B" | "C" | "D" | "F" = "F";
  if (finalScore >= 90) grade = "A";
  else if (finalScore >= 80) grade = "B";
  else if (finalScore >= 70) grade = "C";
  else if (finalScore >= 55) grade = "D";

  return {
    score: finalScore,
    grade,
    criticalDeductions,
    warningDeductions,
    coverageAdjustment,
    factors,
  };
}
