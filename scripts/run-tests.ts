import { validateGithubUrl } from "../lib/github";
import { checkRateLimit } from "../lib/rateLimiter";
import { runStaticAudit } from "../lib/staticRules";
import { COMPANY_PROFILES } from "../lib/companies";
import { generateFallbackAudit } from "../lib/gemini";
import { RepoFile } from "../types/audit";

function runUnitTests() {
  console.log("=== RUNNING TEST SUITE: PROJECTGLOWUP AI ===");
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✓ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ [FAIL] ${testName}`);
      failed++;
    }
  }

  // 1. URL Validation & SSRF Guard
  console.log("\n[1/4] Testing URL Validation & SSRF Guard...");
  const valid = validateGithubUrl("https://github.com/calligraphyguruji/project-glowup");
  assert(valid !== null && valid.owner === "calligraphyguruji" && valid.repo === "project-glowup", "Parses valid GitHub URL");

  const trailingSlash = validateGithubUrl("https://github.com/owner/repo/");
  assert(trailingSlash !== null && trailingSlash.repo === "repo", "Handles trailing slashes");

  const ssrfLocal = validateGithubUrl("http://127.0.0.1:3000/repo");
  assert(ssrfLocal === null, "Rejects SSRF loopback address");

  const ssrfCloud = validateGithubUrl("http://169.254.169.254/latest/meta-data");
  assert(ssrfCloud === null, "Rejects SSRF cloud metadata endpoint");

  const pathTraversal = validateGithubUrl("https://github.com/../..");
  assert(pathTraversal === null, "Rejects path traversal dot URLs");

  const invalidHost = validateGithubUrl("https://gitlab.com/owner/repo");
  assert(invalidHost === null, "Rejects non-GitHub host");

  // 2. In-Memory Rate Limiter
  console.log("\n[2/4] Testing In-Memory Rate Limiter...");
  const ip = "10.0.0.42";
  const r1 = checkRateLimit(ip);
  assert(r1.allowed === true && r1.remaining >= 0, "Initial request allowed under token bucket");

  // 3. Static Anti-Pattern Rules Engine
  console.log("\n[3/4] Testing Static Rules (Fintech & Concurrency)...");
  const testFiles: RepoFile[] = [
    {
      path: "prisma/schema.prisma",
      content: "model Transaction { id String @id, amount Float, createdAt DateTime }",
      size: 70,
      score: 100,
    },
    {
      path: "routes/payment.js",
      content: "app.post('/api/checkout', async (req, res) => { const payment = await processPayment(req.body); res.json(payment); });",
      size: 110,
      score: 90,
    },
  ];

  const razorpayFindings = runStaticAudit(testFiles, "razorpay");
  const hasFloatFinding = razorpayFindings.some((f) => f.title.includes("Floating-point"));
  assert(hasFloatFinding, "Detects floating-point currency in schema for Razorpay");

  const hasIdempotencyFinding = razorpayFindings.some((f) => f.title.includes("Idempotency-Key"));
  assert(hasIdempotencyFinding, "Detects missing idempotency key on checkout endpoint");

  // Geospatial Indexing Test (Swiggy)
  const swiggyFiles: RepoFile[] = [
    {
      path: "models/restaurant.js",
      content: "const RestaurantSchema = new Schema({ name: String, latitude: Number, longitude: Number });",
      size: 90,
      score: 95,
    },
  ];
  const swiggyFindings = runStaticAudit(swiggyFiles, "swiggy");
  assert(swiggyFindings.some((f) => f.category === "Geospatial Performance"), "Detects unindexed geospatial coordinates for Swiggy");

  // Secret Detection Test
  const secretFiles: RepoFile[] = [
    {
      path: "config/keys.js",
      content: "const stripe_key = 'sk_live_abcdef1234567890';",
      size: 45,
      score: 60,
    },
  ];
  const secretFindings = runStaticAudit(secretFiles, "amazon");
  assert(secretFindings.some((f) => f.category.includes("Security")), "Detects hardcoded API secrets in source files");

  // 4. Company Profiles & Clean Rules Fallback
  console.log("\n[4/5] Testing Company Profiles & Fallback Safety...");
  assert(Object.keys(COMPANY_PROFILES).length === 4, "Configures 4 domain profiles (Razorpay, Swiggy, Zerodha, Amazon)");

  const cleanFiles: RepoFile[] = [
    {
      path: "package.json",
      content: JSON.stringify({ name: "clean-app", version: "1.0.0" }),
      size: 50,
      score: 95,
    },
  ];
  const cleanFindings = runStaticAudit(cleanFiles, "amazon");
  assert(cleanFindings.length > 0 && cleanFindings[0].severity === "optimization", "Returns optimization note when no violations exist");

  // 5. Gemini Heuristic Fallback & Structured Schema Verification
  console.log("\n[5/5] Testing AI Synthesis & Structured Fallback Safety...");
  const mockOverview = {
    owner: "student",
    repo: "fintech-app",
    defaultBranch: "main",
    totalFilesDiscovered: 12,
    filesIngested: 2,
    primaryLanguage: "TypeScript",
  };
  const fallbackAudit = generateFallbackAudit(mockOverview, COMPANY_PROFILES.razorpay, razorpayFindings);

  assert(fallbackAudit.overallScore > 0 && fallbackAudit.overallScore <= 100, "Calculates valid bounded overall score");
  assert(fallbackAudit.findings.length >= 2, "Includes static flags and domain concurrency findings");
  assert(fallbackAudit.architectureComparison.currentMermaid.includes("graph TD"), "Generates valid Before Mermaid graph");
  assert(fallbackAudit.architectureComparison.targetMermaid.includes("graph TD"), "Generates valid Target Mermaid graph");
  assert(fallbackAudit.stressTestScript.code.includes("fetch"), "Provides runnable HTTP concurrency script");
  assert(fallbackAudit.interviewDefense.length >= 2, "Provides company-tailored interview drill items");

  console.log(`\n=== TEST RESULTS: ${passed} PASSED, ${failed} FAILED ===\n`);
  if (failed > 0) process.exit(1);
  process.exit(0);
}

runUnitTests();
