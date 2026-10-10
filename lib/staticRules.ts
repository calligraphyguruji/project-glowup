import { AuditFinding, CompanyId, RepoFile } from "@/types/audit";

function findLineNumber(content: string, substring: string): number | undefined {
  const index = content.indexOf(substring);
  if (index === -1) return undefined;
  return content.slice(0, index).split("\n").length;
}

export function runStaticAudit(files: RepoFile[], companyId: CompanyId): AuditFinding[] {
  const findings: AuditFinding[] = [];

  for (const file of files) {
    const content = file.content;
    const lowerPath = file.path.toLowerCase();

    // 1. Fintech Float Vulnerability (Razorpay / Zerodha / Stripe / Payments)
    if (
      companyId === "razorpay" ||
      companyId === "zerodha" ||
      companyId.includes("payment") ||
      companyId.includes("fintech") ||
      companyId.includes("stripe")
    ) {
      const floatRegex = /(amount|balance|price|fee|total|cost)\s*(?::\s*|\s+)(Float|Number|float|double)/i;
      const match = content.match(floatRegex);
      if (match) {
        const line = findLineNumber(content, match[0]);
        findings.push({
          id: `static-float-${file.path}`,
          severity: "critical",
          category: "Financial Data Integrity",
          title: `Floating-point data type used for monetary property "${match[1]}"`,
          fileCitation: file.path,
          startLine: line,
          endLine: line,
          evidence: [
            {
              path: file.path,
              startLine: line,
              endLine: line,
              excerpt: match[0],
            },
          ],
          reasoning: "Floating-point arithmetic suffers from IEEE 754 precision drift (0.1 + 0.2 !== 0.3), causing financial reconciliation discrepancies.",
          explanation: `Floating-point arithmetic produces precision drift. Production payment systems mandate integer cents/paise or fixed-precision Decimal.`,
          remediation: `Change "${match[0]}" to store integer paise (e.g. "amount: Int") or use Decimal with fixed precision.`,
          codeSnippet: `// Vulnerable:\n${match[0]}\n\n// Hardened:\n${match[1]}: Int // in paise`,
        });
      }
    }

    // 2. Missing Idempotency Key in Payments/Orders (Razorpay / Swiggy / Payments)
    if (
      companyId === "razorpay" ||
      companyId === "swiggy" ||
      companyId.includes("payment") ||
      companyId.includes("order")
    ) {
      if (
        lowerPath.includes("route") ||
        lowerPath.includes("controller") ||
        lowerPath.includes("api") ||
        lowerPath.includes("server") ||
        lowerPath.includes("app")
      ) {
        const hasPaymentEndpoint = /payment|order|checkout|charge|transfer/i.test(content);
        const hasIdempotency = /idempotency-key|idempotencykey|x-idempotency/i.test(content);
        if (hasPaymentEndpoint && !hasIdempotency) {
          const matchedLine = content.match(/app\.(post|put)\([^)]+\)|router\.(post|put)\([^)]+\)/i);
          const line = matchedLine ? findLineNumber(content, matchedLine[0]) : 1;
          findings.push({
            id: `static-idempotency-${file.path}`,
            severity: "critical",
            category: "Concurrency & Race Safety",
            title: `Transaction endpoint processes requests without Idempotency-Key validation`,
            fileCitation: file.path,
            startLine: line,
            endLine: line,
            evidence: [
              {
                path: file.path,
                startLine: line,
                endLine: line,
                excerpt: matchedLine ? matchedLine[0] : "Transaction route definition",
              },
            ],
            reasoning: "Unbounded transaction re-execution without an idempotency guard leads to duplicate state modifications and double-charges.",
            explanation: `Network timeouts cause clients or webhook dispatchers to retry. Without idempotency guards, retried requests double-charge customers or duplicate orders.`,
            remediation: `Require "Idempotency-Key" header, cache in Redis with TTL, and return cached response on duplicate attempts.`,
            codeSnippet: `const idempotencyKey = req.headers['idempotency-key'];\nif (!idempotencyKey) return res.status(400).json({ error: 'Missing Idempotency-Key' });`,
          });
        }
      }
    }

    // 3. Swiggy Geospatial Unindexed Scan
    if (companyId === "swiggy" || companyId.includes("delivery") || companyId.includes("logistics")) {
      if (lowerPath.includes("schema") || lowerPath.includes("model") || lowerPath.includes("migration")) {
        const hasGeo = /latitude|longitude|lat|lng|coordinates/i.test(content);
        const hasSpatialIndex = /gist|spatial|2dsphere|geospatial/i.test(content);
        if (hasGeo && !hasSpatialIndex) {
          const geoMatch = content.match(/latitude|longitude|coordinates/i);
          const line = geoMatch ? findLineNumber(content, geoMatch[0]) : 1;
          findings.push({
            id: `static-geo-index-${file.path}`,
            severity: "critical",
            category: "Geospatial Performance",
            title: `Coordinates stored without spatial index (PostGIS GIST or MongoDB 2dsphere)`,
            fileCitation: file.path,
            startLine: line,
            endLine: line,
            evidence: [
              {
                path: file.path,
                startLine: line,
                endLine: line,
                excerpt: geoMatch ? geoMatch[0] : "Coordinate schema definition",
              },
            ],
            reasoning: "Geospatial radius queries without R-Tree or GIST indexes trigger full table scans O(N), blocking high-throughput assignment loops.",
            explanation: `Order-delivery assignment performs millions of radius queries. Without spatial indexing, location lookups trigger full table scans causing severe latency spikes.`,
            remediation: `Add a GIST index in PostgreSQL or 2dsphere index in MongoDB on coordinate columns.`,
            codeSnippet: `// PostgreSQL:\nCREATE INDEX idx_restaurants_location ON restaurants USING GIST (geom);`,
          });
        }
      }
    }

    // 4. Missing Database Index on High-Frequency Foreign Keys (All Companies)
    if (lowerPath.includes("schema") || lowerPath.includes("model")) {
      const foreignKeyRegex = /(userId|customerId|orderId|accountId)\s*:\s*(String|Int|ObjectId)/i;
      const match = content.match(foreignKeyRegex);
      const hasIndex = /@@index|@index|\.index\(/i.test(content);
      if (match && !hasIndex) {
        const line = findLineNumber(content, match[0]);
        findings.push({
          id: `static-fk-index-${file.path}`,
          severity: "warning",
          category: "Database Indexing & Scalability",
          title: `Foreign key "${match[1]}" missing lookup index`,
          fileCitation: file.path,
          startLine: line,
          endLine: line,
          evidence: [
            {
              path: file.path,
              startLine: line,
              endLine: line,
              excerpt: match[0],
            },
          ],
          reasoning: "Foreign keys queried in high-frequency JOINs trigger sequential table scans without B-Tree indexing.",
          explanation: `Queries filtering on "${match[1]}" trigger full sequential scans as table size scales, degrading API response times under high concurrency.`,
          remediation: `Add an index on "${match[1]}" in the schema definition.`,
          codeSnippet: `// Prisma:\n@@index([${match[1]}])`,
        });
      }
    }

    // 5. Hardcoded API Keys & Secrets Check
    const secretRegex = /(const|let|var)\s*(?:apiKey|api_key|secret|password|stripe_key|razorpay_key)\s*=\s*['"][a-zA-Z0-9_\-]{8,}['"]/i;
    const secretMatch = content.match(secretRegex);
    if (secretMatch) {
      const line = findLineNumber(content, secretMatch[0]);
      findings.push({
        id: `static-secret-${file.path}`,
        severity: "critical",
        category: "Security & Credential Isolation",
        title: `Hardcoded API secret or credential detected in source file`,
        fileCitation: file.path,
        startLine: line,
        endLine: line,
        evidence: [
          {
            path: file.path,
            startLine: line,
            endLine: line,
            excerpt: secretMatch[0].replace(/(['"])[^'"]{4,}(['"])/, "$1********$2"),
          },
        ],
        reasoning: "Static credentials checked into source code are accessible to anyone with repository access and get bundled into deployments.",
        explanation: `Hardcoded credentials in repository files leak into version control and client bundles, exposing services to unauthorized access.`,
        remediation: `Move secret to environment variables accessed via process.env.`,
        codeSnippet: `// Secure pattern:\nconst apiKey = process.env.SERVICE_API_KEY;`,
      });
    }

    // 6. Raw Console.log in Production (Amazon / Zerodha)
    if (companyId === "amazon" || companyId === "zerodha") {
      const consoleMatches = content.match(/console\.(log|error|warn)\(/g) || [];
      if (consoleMatches.length > 3) {
        const line = findLineNumber(content, "console.log(") || findLineNumber(content, "console.error(") || 1;
        findings.push({
          id: `static-logging-${file.path}`,
          severity: "warning",
          category: "Observability & Telemetry",
          title: `Unstructured console.log detected (${consoleMatches.length} occurrences)`,
          fileCitation: file.path,
          startLine: line,
          endLine: line,
          evidence: [
            {
              path: file.path,
              startLine: line,
              endLine: line,
              excerpt: `console.log(...) [${consoleMatches.length} occurrences]`,
            },
          ],
          reasoning: "Synchronous console I/O blocks the single-threaded Node.js event loop and outputs unstructured text that cannot be indexed by CloudWatch or ELK.",
          explanation: `High-scale distributed systems require structured JSON logging with correlation IDs. Raw console.log blocks the Node.js event loop and cannot be ingested by central log aggregators.`,
          remediation: `Replace raw console calls with structured loggers (Pino, Winston) attaching correlation IDs.`,
        });
      }
    }

    // 7. Missing Error Boundary / Raw Uncaught Exceptions
    if (lowerPath.includes("route") || lowerPath.includes("controller")) {
      const asyncWithoutTry = /async\s+(?:function|\([^)]*\)\s*=>)[^{]*\{(?![^}]*try\s*\{)/g.test(content);
      if (asyncWithoutTry) {
        const line = findLineNumber(content, "async") || 1;
        findings.push({
          id: `static-trycatch-${file.path}`,
          severity: "warning",
          category: "Resilience & Fault Tolerance",
          title: `Async handler missing structured try-catch or error-wrapping boundary`,
          fileCitation: file.path,
          startLine: line,
          endLine: line,
          evidence: [
            {
              path: file.path,
              startLine: line,
              endLine: line,
              excerpt: "async handler without enclosing try/catch",
            },
          ],
          reasoning: "Unhandled promise rejections crash the Node.js process or leave HTTP sockets hanging open indefinitely.",
          explanation: `Unhandled promise rejections in async route handlers cause server process termination or hung HTTP sockets.`,
          remediation: `Enclose async operations in try-catch blocks or use an async-handler wrapper middleware.`,
        });
      }
    }
  }

  // Fallback Optimization finding if clean
  if (findings.length === 0) {
    findings.push({
      id: "static-pass-clean",
      severity: "optimization",
      category: "Code Health",
      title: "No static syntactic anti-patterns detected in inspected files",
      fileCitation: files[0]?.path || "package.json",
      explanation: "Base syntax adheres to fundamental hygiene standards. Architectural domain alignment verified by semantic analysis.",
      remediation: "Continue adhering to clean domain design patterns.",
    });
  }

  return findings;
}
