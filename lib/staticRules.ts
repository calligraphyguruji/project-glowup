import { AuditFinding, CompanyId, RepoFile } from "@/types/audit";

export function runStaticAudit(files: RepoFile[], companyId: CompanyId): AuditFinding[] {
  const findings: AuditFinding[] = [];

  for (const file of files) {
    const content = file.content;
    const lowerPath = file.path.toLowerCase();

    // 1. Fintech Float Vulnerability (Razorpay / Zerodha)
    if (companyId === "razorpay" || companyId === "zerodha") {
      const floatRegex = /(amount|balance|price|fee|total|cost)\s*(?::\s*|\s+)(Float|Number|float|double)/i;
      const match = content.match(floatRegex);
      if (match) {
        findings.push({
          id: `static-float-${file.path}`,
          severity: "critical",
          category: "Financial Data Integrity",
          title: `Floating-point data type used for monetary property "${match[1]}"`,
          fileCitation: file.path,
          explanation: `Floating-point arithmetic produces precision drift (e.g. 0.1 + 0.2 !== 0.3). ${companyId === "razorpay" ? "Razorpay" : "Zerodha"} mandates integer cents/paise or fixed-precision Decimal.`,
          remediation: `Change "${match[0]}" to store integer paise (e.g. "amount: Int") or use Decimal with fixed precision.`,
          codeSnippet: `// Vulnerable:\n${match[0]}\n\n// Hardened:\n${match[1]}: Int // in paise`,
        });
      }
    }

    // 2. Missing Idempotency Key in Payments/Orders (Razorpay / Swiggy)
    if (companyId === "razorpay" || companyId === "swiggy") {
      if (lowerPath.includes("route") || lowerPath.includes("controller") || lowerPath.includes("api") || lowerPath.includes("server") || lowerPath.includes("app")) {
        const hasPaymentEndpoint = /payment|order|checkout|charge|transfer/i.test(content);
        const hasIdempotency = /idempotency-key|idempotencykey|x-idempotency/i.test(content);
        if (hasPaymentEndpoint && !hasIdempotency) {
          findings.push({
            id: `static-idempotency-${file.path}`,
            severity: "critical",
            category: "Concurrency & Race Safety",
            title: `Transaction endpoint processes requests without Idempotency-Key validation`,
            fileCitation: file.path,
            explanation: `Network timeouts cause clients or webhook dispatchers to retry. Without idempotency guards, retried requests double-charge customers or duplicate orders.`,
            remediation: `Require "Idempotency-Key" header, cache in Redis with TTL, and return cached response on duplicate attempts.`,
            codeSnippet: `const idempotencyKey = req.headers['idempotency-key'];\nif (!idempotencyKey) return res.status(400).json({ error: 'Missing Idempotency-Key' });`,
          });
        }
      }
    }

    // 3. Swiggy Geospatial Unindexed Scan
    if (companyId === "swiggy") {
      if (lowerPath.includes("schema") || lowerPath.includes("model") || lowerPath.includes("migration")) {
        const hasGeo = /latitude|longitude|lat|lng|coordinates/i.test(content);
        const hasSpatialIndex = /gist|spatial|2dsphere|geospatial/i.test(content);
        if (hasGeo && !hasSpatialIndex) {
          findings.push({
            id: `static-geo-index-${file.path}`,
            severity: "critical",
            category: "Geospatial Performance",
            title: `Coordinates stored without spatial index (PostGIS GIST or MongoDB 2dsphere)`,
            fileCitation: file.path,
            explanation: `Swiggy order-delivery assignment performs millions of radius queries. Without spatial indexing, location lookups trigger full table scans causing severe latency spikes.`,
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
        findings.push({
          id: `static-fk-index-${file.path}`,
          severity: "warning",
          category: "Database Indexing & Scalability",
          title: `Foreign key "${match[1]}" missing lookup index`,
          fileCitation: file.path,
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
      findings.push({
        id: `static-secret-${file.path}`,
        severity: "critical",
        category: "Security & Credential Isolation",
        title: `Hardcoded API secret or credential detected in source file`,
        fileCitation: file.path,
        explanation: `Hardcoded credentials in repository files leak into version control and client bundles, exposing services to unauthorized access.`,
        remediation: `Move secret to environment variables accessed via process.env.`,
        codeSnippet: `// Secure pattern:\nconst apiKey = process.env.SERVICE_API_KEY;`,
      });
    }

    // 6. Raw Console.log in Production (Amazon / Zerodha)
    if (companyId === "amazon" || companyId === "zerodha") {
      const consoleCount = (content.match(/console\.(log|error|warn)\(/g) || []).length;
      if (consoleCount > 3) {
        findings.push({
          id: `static-logging-${file.path}`,
          severity: "warning",
          category: "Observability & Telemetry",
          title: `Unstructured console.log detected (${consoleCount} occurrences)`,
          fileCitation: file.path,
          explanation: `High-scale distributed systems require structured JSON logging with correlation IDs. Raw console.log blocks the Node.js event loop and cannot be ingested by central log aggregators.`,
          remediation: `Replace raw console calls with structured loggers (Pino, Winston) attaching correlation IDs.`,
        });
      }
    }

    // 7. Missing Error Boundary / Raw Uncaught Exceptions
    if (lowerPath.includes("route") || lowerPath.includes("controller")) {
      const asyncWithoutTry = /async\s+(?:function|\([^)]*\)\s*=>)[^{]*\{(?![^}]*try\s*\{)/g.test(content);
      if (asyncWithoutTry) {
        findings.push({
          id: `static-trycatch-${file.path}`,
          severity: "warning",
          category: "Resilience & Fault Tolerance",
          title: `Async handler missing structured try-catch or error-wrapping boundary`,
          fileCitation: file.path,
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
