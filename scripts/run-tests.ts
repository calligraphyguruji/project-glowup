import { validateGithubUrl } from "../lib/github";
import { checkRateLimit } from "../lib/rateLimiter";
import { runStaticAudit } from "../lib/staticRules";
import { COMPANY_PROFILES } from "../lib/companies";
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

  // 4. Company Profiles & Clean Rules Fallback
  console.log("\n[4/4] Testing Company Profiles & Fallback Safety...");
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

  console.log(`\n=== TEST RESULTS: ${passed} PASSED, ${failed} FAILED ===\n`);
  if (failed > 0) process.exit(1);
}

runUnitTests();
