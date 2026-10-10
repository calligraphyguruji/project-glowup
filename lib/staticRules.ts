import { AuditFinding, CompanyId, RepoFile } from "@/types/audit";

export function runStaticAudit(files: RepoFile[], companyId: CompanyId): AuditFinding[] {
  const findings: AuditFinding[] = [];

  for (const file of files) {
    const content = file.content;
    const lowerPath = file.path.toLowerCase();

    // 1. Fintech Float Vulnerability (Razorpay / Zerodha)
    if (companyId === "razorpay" || companyId === "zerodha") {
      // Supports Prisma ("amount Float"), TypeScript ("amount: number"), and SQL ("amount float")
      const floatRegex = /(amount|balance|price|fee|total|cost)\s*(?::\s*|\s+)(Float|Number|float|double)/i;
      const match = content.match(floatRegex);
      if (match) {
        findings.push({
          id: `static-float-${file.path}`,
          severity: "critical",
          category: "Financial Data Integrity",
          title: `Floating-point data type used for monetary property "${match[1]}"`,
          fileCitation: `${file.path}`,
          explanation: `Floating-point numbers in IEEE 754 precision produce binary rounding errors (e.g. 0.1 + 0.2 != 0.3). ${companyId === "razorpay" ? "Razorpay" : "Zerodha"} requires integers representing smallest currency units (paise/cents) or Decimal with exact precision.`,
          remediation: `Change "${match[0]}" to store integer paise (e.g. "amount: Int") or use Decimal with fixed precision.`,
          codeSnippet: `// Vulnerable:\n${match[0]}\n\n// Hardened:\n${match[1]}: Int // in paise`,
        });
      }
    }

    // 2. Missing Idempotency Key in Payments/Orders (Razorpay / Swiggy)
    if (companyId === "razorpay" || companyId === "swiggy") {
      if (lowerPath.includes("route") || lowerPath.includes("controller") || lowerPath.includes("api")) {
        const hasPaymentEndpoint = /payment|order|checkout|charge/i.test(content);
        const hasIdempotency = /idempotency-key|idempotencykey|x-idempotency/i.test(content);
        if (hasPaymentEndpoint && !hasIdempotency) {
          findings.push({
            id: `static-idempotency-${file.path}`,
            severity: "critical",
            category: "Concurrency & Race Safety",
            title: `Endpoint processes transactions without Idempotency-Key validation`,
            fileCitation: `${file.path}`,
            explanation: `Network timeouts cause clients or webhook dispatchers to retry. Without idempotency guards, retried requests double-charge customers or duplicate orders.`,
            remediation: `Require "Idempotency-Key" header, cache in Redis with TTL, and return cached response on duplicate attempts.`,
            codeSnippet: `const idempotencyKey = req.headers['idempotency-key'];\nif (!idempotencyKey) return res.status(400).json({ error: 'Missing Idempotency-Key' });`,
          });
        }
      }
    }

    // 3. Raw Console.log in Production (Amazon / Zerodha)
    if (companyId === "amazon" || companyId === "zerodha") {
      const consoleCount = (content.match(/console\.(log|error|warn)\(/g) || []).length;
      if (consoleCount > 3) {
        findings.push({
          id: `static-logging-${file.path}`,
          severity: "warning",
          category: "Observability & Telemetry",
          title: `Unstructured console.log detected (${consoleCount} occurrences)`,
          fileCitation: `${file.path}`,
          explanation: `High-scale distributed systems require structured JSON logging with correlation IDs and log levels. Raw console.log causes synchronous event-loop blocking and cannot be indexed effectively.`,
          remediation: `Replace raw console statements with a structured logger (e.g., Pino, Winston) attaching request context and trace IDs.`,
        });
      }
    }

    // 4. Missing Error Boundary / Raw Uncaught Exceptions
    if (lowerPath.includes("route") || lowerPath.includes("controller")) {
      const asyncWithoutTry = /async\s+(?:function|\([^)]*\)\s*=>)[^{]*\{(?![^}]*try\s*\{)/g.test(content);
      if (asyncWithoutTry) {
        findings.push({
          id: `static-trycatch-${file.path}`,
          severity: "warning",
          category: "Resilience & Fault Tolerance",
          title: `Async handler missing structured try-catch or error-wrapping boundary`,
          fileCitation: `${file.path}`,
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
