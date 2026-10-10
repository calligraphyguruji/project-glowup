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

  // 5. Dynamic Repository Intelligence & Stack Differentiation
  console.log("\n[5/6] Testing Dynamic Stack Differentiation (React vs Backend)...");
  const reactFiles: RepoFile[] = [
    {
      path: "package.json",
      content: JSON.stringify({ dependencies: { react: "^18.2.0", "react-dom": "^18.2.0" } }),
      size: 100,
      score: 95,
    },
    {
      path: "src/App.tsx",
      content: "export function App() { return <div>Hello World</div>; }",
      size: 60,
      score: 90,
    },
  ];
  const reactAudit = generateFallbackAudit(
    { owner: "facebook", repo: "react-app", defaultBranch: "main", totalFilesDiscovered: 2, filesIngested: 2 },
    reactFiles,
    COMPANY_PROFILES.amazon,
    []
  );
  assert(reactAudit.detectedStack?.type === "frontend_react", "Detects React frontend stack");
  assert(reactAudit.architectureComparison.currentMermaid.includes("React Application"), "Generates React Component Architecture (not generic backend DB)");
  assert(!reactAudit.stressTestScript.code.includes("/api/checkout"), "Does NOT fabricate /api/checkout for React frontend repository");
  assert(reactAudit.interviewDefense[0].question.includes("React"), "Generates React-specific interview questions");

  // Backend with actual discovered route
  const backendFiles: RepoFile[] = [
    {
      path: "package.json",
      content: JSON.stringify({ dependencies: { express: "^4.18.0", pg: "^8.0.0" } }),
      size: 100,
      score: 95,
    },
    {
      path: "server.js",
      content: "const express = require('express'); const app = express(); app.post('/api/orders', (req, res) => res.json({ id: 1 }));",
      size: 120,
      score: 90,
    },
  ];
  const backendAudit = generateFallbackAudit(
    { owner: "student", repo: "order-service", defaultBranch: "main", totalFilesDiscovered: 2, filesIngested: 2 },
    backendFiles,
    COMPANY_PROFILES.razorpay,
    []
  );
  // 6. Custom Company & Target Role Personalization Tests
  console.log("\n[6/6] Testing Custom Company & Target Role Personalization...");
  const customCompany: import("../types/audit").CompanyProfile = {
    id: "custom_stripe",
    name: "Stripe",
    domain: "Global Financial Infrastructure",
    tagline: "Payments API for internet businesses",
    keyConcerns: ["Idempotency-Key validation", "Webhook retry exponential backoff", "Zero double-charge"],
    sampleAntiPatterns: [],
    isCustom: true,
  };

  const qaRole: import("../types/audit").TargetRole = {
    id: "qa_automation",
    title: "QA Automation Engineer",
    experienceLevel: "entry_level",
    focusAreas: ["Automated regression test harnesses", "Deterministic mock boundaries"],
  };

  const customAudit = generateFallbackAudit(
    { owner: "fintech", repo: "stripe-service", defaultBranch: "main", totalFilesDiscovered: 2, filesIngested: 2 },
    backendFiles,
    customCompany,
    [],
    undefined,
    qaRole
  );

  assert(customAudit.companyProfile.name === "Stripe", "Evaluates audit against custom company profile");
  assert(customAudit.companyProfile.isCustom === true, "Marks custom company profile accurately");
  assert(customAudit.targetRole?.id === "qa_automation", "Attaches target role to audit output");
  assert(
    customAudit.interviewDefense.some((d) => d.question.includes("automated regression harness")),
    "Tailors interview defense questions to target QA Automation role"
  );

  // 7. Multi-Repository Differentiation & Transparent Scoring Regression
  console.log("\n[7/7] Testing Two-Repository Regression & Transparent Scoring...");

  // Repository A: Python FastAPI Microservice with multiple endpoints
  const repoAFiles: RepoFile[] = [
    {
      path: "pyproject.toml",
      content: "[tool.poetry.dependencies]\npython = '^3.10'\nfastapi = '^0.100.0'\nuvicorn = '^0.22.0'",
      size: 80,
      score: 95,
    },
    {
      path: "main.py",
      content: "from fastapi import FastAPI\napp = FastAPI()\n@app.get('/health')\ndef health():\n    return {'status': 'ok'}\n@app.post('/items')\ndef create_item():\n    return {'id': 1}",
      size: 150,
      score: 92,
    },
    {
      path: "tests/test_main.py",
      content: "def test_health():\n    assert True",
      size: 40,
      score: 50,
    },
  ];

  // Repository B: Insecure Fintech Node.js Service with hardcoded secret and float currency
  const repoBFiles: RepoFile[] = [
    {
      path: "package.json",
      content: JSON.stringify({ name: "insecure-wallet", dependencies: { express: "^4.18.2", pg: "^8.11.0" } }),
      size: 90,
      score: 95,
    },
    {
      path: "prisma/schema.prisma",
      content: "model Wallet { id String @id, balance Float, userId String }",
      size: 65,
      score: 100,
    },
    {
      path: "src/server.js",
      content: "const express = require('express');\nconst app = express();\nconst apiKey = 'sk_live_1234567890abcdef';\napp.post('/transfer', (req, res) => res.json({ success: true }));",
      size: 160,
      score: 90,
    },
  ];

  const staticAuditA = runStaticAudit(repoAFiles, "amazon");
  const auditA = generateFallbackAudit(
    { owner: "fastapi-dev", repo: "microservice-a", defaultBranch: "main", totalFilesDiscovered: 3, filesIngested: 3 },
    repoAFiles,
    COMPANY_PROFILES.amazon,
    staticAuditA
  );

  const staticAuditB = runStaticAudit(repoBFiles, "razorpay");
  const auditB = generateFallbackAudit(
    { owner: "fintech-dev", repo: "wallet-service-b", defaultBranch: "main", totalFilesDiscovered: 3, filesIngested: 3 },
    repoBFiles,
    COMPANY_PROFILES.razorpay,
    staticAuditB
  );

  // Assertion 1: Repositories have different scores based on evidence
  assert(auditA.overallScore !== auditB.overallScore, `Differentiates scores based on evidence (Repo A: ${auditA.overallScore}, Repo B: ${auditB.overallScore})`);
  assert(auditA.overallScore > auditB.overallScore, "Clean tested FastAPI repo scores higher than vulnerable wallet repo");
  assert(auditB.scoreBreakdown?.grade === "F" || auditB.scoreBreakdown?.grade === "D", "Insecure wallet repo assigned appropriate critical penalty grade");

  // Assertion 2: File citations strictly match their respective repos
  const repoAFilesSet = new Set(repoAFiles.map((f) => f.path));
  const repoBFilesSet = new Set(repoBFiles.map((f) => f.path));
  assert(
    auditA.findings.every((f) => repoAFilesSet.has(f.fileCitation)),
    "Repo A findings strictly cite files existing in Repo A"
  );
  assert(
    auditB.findings.every((f) => repoBFilesSet.has(f.fileCitation)),
    "Repo B findings strictly cite files existing in Repo B"
  );

  // Assertion 3: Concurrency scripts target real discovered endpoints from respective repos
  assert(
    auditA.stressTestScript.code.includes("/health") || auditA.stressTestScript.code.includes("/items"),
    "Repo A stress test targets real discovered FastAPI endpoints"
  );
  assert(
    auditB.stressTestScript.code.includes("/transfer"),
    "Repo B stress test targets real discovered Express /transfer route"
  );

  // Assertion 4: Evidence line references and excerpts exist in findings
  const criticalFindingB = auditB.findings.find((f) => f.severity === "critical");
  assert(
    criticalFindingB !== undefined &&
    criticalFindingB.evidence !== undefined &&
    criticalFindingB.evidence.length > 0 &&
    typeof criticalFindingB.startLine === "number",
    "Repo B critical finding includes exact line number and evidence excerpt"
  );

  // 8. Multi-Vulnerability Full Spectrum Security Audit Test
  console.log("\n[8/8] Testing Comprehensive Multi-Vulnerability Audit (>10 distinct issues)...");
  const vulnerableRepoFiles: RepoFile[] = [
    {
      path: "src/api/auth.js",
      content: `
        const crypto = require('crypto');
        const jwtSecret = 'super_secret_jwt_key_123456789';
        function hashPassword(password) {
          return crypto.createHash('md5').update(password).digest('hex');
        }
        function setCookie(res, token) {
          res.cookie('token', token, { httpOnly: false });
        }
      `,
      size: 300,
      score: 95,
    },
    {
      path: "src/api/admin.js",
      content: `
        const { exec } = require('child_process');
        const fs = require('fs');
        app.post('/api/admin/run', (req, res) => {
          exec('systemctl restart ' + req.body.service);
        });
        app.get('/api/admin/download', (req, res) => {
          fs.readFile(req.query.file, (err, data) => res.send(data));
        });
      `,
      size: 320,
      score: 95,
    },
    {
      path: "src/api/users.js",
      content: `
        const axios = require('axios');
        app.post('/api/users/avatar', async (req, res) => {
          const resp = await axios.get(req.query.avatarUrl);
          res.send(resp.data);
        });
        app.get('/api/users/search', async (req, res) => {
          const results = await db.query('SELECT * FROM users WHERE name = ' + req.query.name);
          res.json(results);
        });
      `,
      size: 350,
      score: 90,
    },
    {
      path: "src/views/profile.jsx",
      content: `
        export function ProfileCard({ userBio }) {
          return <div dangerouslySetInnerHTML={{ __html: userBio }} />;
        }
      `,
      size: 200,
      score: 85,
    },
    {
      path: "src/server.js",
      content: `
        const express = require('express');
        const cors = require('cors');
        const app = express();
        app.use(cors({ origin: '*' }));
        app.post('/api/checkout', (req, res) => {
          console.log("processing order");
          console.log("debiting account");
          console.log("done");
          res.json({ ok: true });
        });
      `,
      size: 300,
      score: 90,
    },
    {
      path: "prisma/schema.prisma",
      content: `
        model Order {
          id String @id
          total Float
          customerId String
        }
      `,
      size: 150,
      score: 90,
    },
  ];

  const fullAuditFindings = runStaticAudit(vulnerableRepoFiles, "custom_company");
  const fullAuditReport = generateFallbackAudit(
    { owner: "vulnerable-corp", repo: "audit-target", defaultBranch: "main", totalFilesDiscovered: 6, filesIngested: 6 },
    vulnerableRepoFiles,
    {
      id: "custom_azisly",
      name: "Azisly",
      domain: "Scale Infrastructure",
      tagline: "High-scale engineering",
      keyConcerns: ["System integrity", "Boundary security"],
      sampleAntiPatterns: [],
    },
    fullAuditFindings
  );

  assert(fullAuditReport.findings.length >= 10, `Discovers >= 10 distinct vulnerabilities (Discovered: ${fullAuditReport.findings.length})`);
  assert(!fullAuditReport.findings.every(f => f.category === fullAuditReport.findings[0].category), "Findings span multiple distinct vulnerability categories");
  
  const distinctCategories = new Set(fullAuditReport.findings.map(f => f.category));
  assert(distinctCategories.size >= 5, `Covers at least 5 distinct vulnerability categories (Found: ${distinctCategories.size})`);

  console.log(`\n=== TEST RESULTS: ${passed} PASSED, ${failed} FAILED ===\n`);
  if (failed > 0) process.exit(1);
  process.exit(0);
}

runUnitTests();

