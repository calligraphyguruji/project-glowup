import { NextRequest, NextResponse } from "next/server";
import { validateGithubUrl, fetchRepositoryFiles, GitHubApiError } from "@/lib/github";
import { checkRateLimit } from "@/lib/rateLimiter";
import { COMPANY_PROFILES } from "@/lib/companies";
import { PREDEFINED_ROLES } from "@/lib/roles";
import { runStaticAudit } from "@/lib/staticRules";
import { runGeminiAudit } from "@/lib/gemini";
import { CompanyId, CompanyProfile, TargetRole } from "@/types/audit";

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

    // Resolve Company (Predefined or Custom)
    let company: CompanyProfile;
    let companyId: CompanyId = "razorpay";

    if (
      body.customCompany &&
      typeof body.customCompany.name === "string" &&
      body.customCompany.name.trim().length > 0
    ) {
      const sanitizedName = String(body.customCompany.name).slice(0, 50).trim();
      const sanitizedDomain = String(body.customCompany.domain || "Custom Domain").slice(0, 100).trim();
      const sanitizedTagline = String(body.customCompany.tagline || "").slice(0, 120).trim();
      const keyConcerns = Array.isArray(body.customCompany.keyConcerns)
        ? body.customCompany.keyConcerns.map((c: unknown) => String(c).slice(0, 100)).filter(Boolean)
        : ["Production reliability", "Concurrency safety"];

      company = {
        id: `custom_${sanitizedName.toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
        name: sanitizedName,
        domain: sanitizedDomain,
        tagline: sanitizedTagline,
        keyConcerns: keyConcerns.length > 0 ? keyConcerns : ["Production reliability"],
        sampleAntiPatterns: [],
        isCustom: true,
        website: typeof body.customCompany.website === "string" ? body.customCompany.website.slice(0, 100) : undefined,
      };
      companyId = company.id;
    } else if (
      typeof body.companyId === "string" &&
      Object.prototype.hasOwnProperty.call(COMPANY_PROFILES, body.companyId)
    ) {
      companyId = body.companyId as CompanyId;
      company = COMPANY_PROFILES[companyId];
    } else {
      company = COMPANY_PROFILES.razorpay;
    }

    // Resolve Target Role (Predefined or Custom)
    let targetRole: TargetRole = PREDEFINED_ROLES[0]; // Default: SDE Intern

    if (
      body.customRole &&
      typeof body.customRole.title === "string" &&
      body.customRole.title.trim().length > 0
    ) {
      const sanitizedTitle = String(body.customRole.title).slice(0, 50).trim();
      const focusAreas = Array.isArray(body.customRole.focusAreas)
        ? body.customRole.focusAreas.map((a: unknown) => String(a).slice(0, 100)).filter(Boolean)
        : ["Production quality"];

      targetRole = {
        id: `custom_role_${sanitizedTitle.toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
        title: sanitizedTitle,
        experienceLevel: typeof body.customRole.experienceLevel === "string" ? body.customRole.experienceLevel : "entry_level",
        focusAreas: focusAreas.length > 0 ? focusAreas : ["Production engineering standards"],
        description: typeof body.customRole.description === "string" ? body.customRole.description.slice(0, 200) : undefined,
        isCustom: true,
      };
    } else if (typeof body.roleId === "string") {
      const matched = PREDEFINED_ROLES.find((r) => r.id === body.roleId);
      if (matched) {
        targetRole = matched;
      }
    }

    // 3. Ingestion Pipeline (with campus network fallback & configurable file depth)
    const requestedMaxFiles = typeof body.maxFiles === "number" ? body.maxFiles : undefined;
    const { overview, files } = await fetchRepositoryFiles(repoInfo.owner, repoInfo.repo, requestedMaxFiles);

    // 4. Deterministic Static Rules Scan
    const staticFindings = runStaticAudit(files, companyId);

    // 5. Semantic AI Synthesis & Diagram Generation (parameterized with targetRole)
    const auditReport = await runGeminiAudit(overview, files, company, staticFindings, targetRole);

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
