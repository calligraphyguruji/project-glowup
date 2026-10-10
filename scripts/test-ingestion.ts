import { validateGithubUrl, fetchRepositoryFiles } from "../lib/github";
import { checkRateLimit } from "../lib/rateLimiter";

async function runVerification() {
  console.log("=== PHASE 1 VERIFICATION: INGESTION & BOUNDARY GUARDS ===");

  // Test 1: URL Validation
  console.log("\n[1/3] Testing URL Validation...");
  const valid = validateGithubUrl("https://github.com/expressjs/express");
  const validSlash = validateGithubUrl("https://github.com/expressjs/express/");
  const invalidHost = validateGithubUrl("https://gitlab.com/expressjs/express");
  const invalidIp = validateGithubUrl("http://127.0.0.1/express");

  if (!valid || valid.owner !== "expressjs" || valid.repo !== "express") {
    throw new Error("Failed valid URL test");
  }
  if (!validSlash || validSlash.owner !== "expressjs" || validSlash.repo !== "express") {
    throw new Error("Failed trailing slash URL test");
  }
  if (invalidHost !== null || invalidIp !== null) {
    throw new Error("Failed SSRF invalid host rejection test");
  }
  console.log("  ✓ URL validation and SSRF boundary guards passed.");

  // Test 2: In-Memory Rate Limiter
  console.log("\n[2/3] Testing In-Memory Rate Limiter...");
  const ip = "192.168.1.100";
  const r1 = checkRateLimit(ip);
  if (!r1.allowed || r1.remaining !== 14) {
    throw new Error(`Rate limit initial token failed: ${JSON.stringify(r1)}`);
  }
  console.log(`  ✓ Rate limiter working (remaining tokens: ${r1.remaining}).`);

  // Test 3: Public GitHub Repo Ingestion
  console.log("\n[3/3] Testing GitHub Tree & File Ingestion for 'expressjs/express'...");
  const { overview, files } = await fetchRepositoryFiles("expressjs", "express");

  console.log(`  ✓ Discovered ${overview.totalFilesDiscovered} total files.`);
  console.log(`  ✓ Prioritized and fetched ${files.length} candidate files.`);
  console.log(`  ✓ Default branch: ${overview.defaultBranch}, Language: ${overview.primaryLanguage}, Stars: ${overview.stars}`);

  console.log("\n  Ingested Files Manifest:");
  files.forEach((f, idx) => {
    console.log(`    [${idx + 1}] ${f.path.padEnd(35)} (score: ${f.score}, size: ${f.size} bytes, truncated: ${!!f.isTruncated})`);
  });

  if (files.length === 0) {
    throw new Error("Zero files ingested from expressjs/express");
  }

  console.log("\n=== PHASE 1 VERIFICATION COMPLETE: ALL CHECKS PASSED ===");
}

runVerification().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
