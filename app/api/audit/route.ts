import { NextRequest, NextResponse } from "next/server";
import { validateGithubUrl, fetchRepositoryFiles, GitHubApiError } from "@/lib/github";
import { checkRateLimit } from "@/lib/rateLimiter";
import { COMPANY_PROFILES } from "@/lib/companies";
import { runStaticAudit } from "@/lib/staticRules";
import { runGeminiAudit } from "@/lib/gemini";
import { CompanyId } from "@/types/audit";

export async function POST(req: NextRequest) {
  try {
    // 1. IP Rate Limiting Guard
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    const rateCheck = checkRateLimit(clientIp);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: `Rate limit reached. Please retry in ${rateCheck.resetSeconds} seconds.`,
            retryAfterSeconds: rateCheck.resetSeconds,
          },
        },
        { status: 429 }
      );
    }

    // 2. Parse & Validate Payload
    const body = await req.json().catch(() => null);
    if (!body || typeof body.repoUrl !== "string") {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_REQUEST",
            message: "Missing or invalid 'repoUrl' parameter.",
          },
        },
        { status: 400 }
      );
    }

    const repoInfo = validateGithubUrl(body.repoUrl);
    if (!repoInfo) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_GITHUB_URL",
            message: "Must be a valid public GitHub repository URL (e.g. https://github.com/owner/repo).",
          },
        },
        { status: 400 }
      );
    }

    const companyId: CompanyId =
      typeof body.companyId === "string" &&
      Object.prototype.hasOwnProperty.call(COMPANY_PROFILES, body.companyId)
        ? (body.companyId as CompanyId)
        : "razorpay";
    const company = COMPANY_PROFILES[companyId];

    // 3. Ingestion Pipeline (with campus network fallback)
    const { overview, files } = await fetchRepositoryFiles(repoInfo.owner, repoInfo.repo);

    // 4. Deterministic Static Rules Scan
    const staticFindings = runStaticAudit(files, companyId);

    // 5. Semantic AI Synthesis & Diagram Generation
    const auditReport = await runGeminiAudit(overview, files, company, staticFindings);

    return NextResponse.json(auditReport);
  } catch (error) {
    if (error instanceof GitHubApiError) {
      return NextResponse.json(
        {
          error: {
            code: error.statusCode === 404 ? "REPO_NOT_FOUND" : "GITHUB_API_ERROR",
            message: error.message,
            retryAfterSeconds: error.retryAfterSeconds,
          },
        },
        { status: error.statusCode }
      );
    }

    console.error("Unhandled audit error:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "An unexpected error occurred while auditing the repository.",
        },
      },
      { status: 500 }
    );
  }
}
