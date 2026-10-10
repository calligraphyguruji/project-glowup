import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  AuditFinding,
  AuditResponse,
  CompanyProfile,
  RepoFile,
  RepoOverview,
} from "@/types/audit";

interface GeminiAuditPayload {
  overallScore: number;
  findings: Array<{
    severity: "critical" | "warning" | "optimization";
    category: string;
    title: string;
    fileCitation: string;
    explanation: string;
    remediation: string;
    codeSnippet?: string;
  }>;
  architectureComparison: {
    currentMermaid: string;
    targetMermaid: string;
    currentSummary: string;
    targetSummary: string;
  };
  stressTestScript: {
    language: "javascript";
    title: string;
    targetScenario: string;
    code: string;
    runInstructions: string;
  };
  interviewDefense: Array<{
    question: string;
    interviewerIntent: string;
    talkingPoints: string[];
  }>;
}

export async function runGeminiAudit(
  overview: RepoOverview,
  files: RepoFile[],
  company: CompanyProfile,
  staticFindings: AuditFinding[]
): Promise<AuditResponse> {
  const apiKey = process.env.GEMINI_API_KEY;

  // If no API key configured or fallback triggered, return heuristic response
  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    return generateFallbackAudit(overview, company, staticFindings);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const sanitizeCode = (content: string) =>
      content.replaceAll("</untrusted_source_code>", "<\\/untrusted_source_code>");

    const fileSummaries = files
      .map(
        (f) =>
          `FILE: ${f.path}\n<untrusted_source_code>\n${sanitizeCode(f.content.slice(0, 4000))}\n</untrusted_source_code>`
      )
      .join("\n\n");

    const prompt = `
You are a Staff Software Engineer and Technical Interviewer at ${company.name} (${company.domain}).
Analyze this student candidate's repository files against your company's production engineering standards.

TARGET COMPANY PROFILE:
Name: ${company.name}
Domain: ${company.domain}
Key Architectural Concerns: ${company.keyConcerns.join(", ")}

OBSERVED STATIC AUDIT FLAGS:
${JSON.stringify(staticFindings, null, 2)}

INSPECTED REPOSITORY CODE:
${fileSummaries}

TASK:
1. Audit the code objectively based solely on observable evidence.
2. Generate valid Mermaid.js diagrams for Current Architecture vs Target Hardened Architecture (use 'graph TD' with simple alphanumeric node IDs).
3. Produce a runnable 20-30 line Node.js concurrency stress-test script that tests edge cases for ${company.name}.
4. Provide 3 tough interview questions with model defense talking points.

Return strictly JSON matching this structure:
{
  "overallScore": number (0-100),
  "findings": [
    {
      "severity": "critical" | "warning" | "optimization",
      "category": string,
      "title": string,
      "fileCitation": string,
      "explanation": string,
      "remediation": string,
      "codeSnippet": string (optional)
    }
  ],
  "architectureComparison": {
    "currentMermaid": string (valid graph TD Mermaid string),
    "targetMermaid": string (valid graph TD Mermaid string),
    "currentSummary": string,
    "targetSummary": string
  },
  "stressTestScript": {
    "language": "javascript",
    "title": string,
    "targetScenario": string,
    "code": string,
    "runInstructions": string
  },
  "interviewDefense": [
    {
      "question": string,
      "interviewerIntent": string,
      "talkingPoints": [string]
    }
  ]
}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed: GeminiAuditPayload = JSON.parse(text);

    return {
      repoSummary: overview,
      companyProfile: company,
      overallScore: Math.min(100, Math.max(0, parsed.overallScore || 70)),
      findings: [
        ...staticFindings.filter((f) => f.severity !== "optimization"),
        ...parsed.findings.map((f, i) => ({
          id: `ai-finding-${i + 1}`,
          ...f,
        })),
      ],
      architectureComparison: {
        currentMermaid: cleanMermaid(parsed.architectureComparison.currentMermaid, "current"),
        targetMermaid: cleanMermaid(parsed.architectureComparison.targetMermaid, "target"),
        currentSummary: parsed.architectureComparison.currentSummary,
        targetSummary: parsed.architectureComparison.targetSummary,
      },
      stressTestScript: parsed.stressTestScript,
      interviewDefense: parsed.interviewDefense,
      generatedAt: new Date().toISOString(),
      executionMode: "live_ai",
    };
  } catch {
    return generateFallbackAudit(overview, company, staticFindings);
  }
}

function cleanMermaid(str: string, fallbackType: "current" | "target"): string {
  if (!str || typeof str !== "string" || (!str.includes("graph") && !str.includes("flowchart"))) {
    if (fallbackType === "current") {
      return "graph TD\n  Client[Web Client] -->|Direct HTTP| Server[Node API Server]\n  Server --> DB[(Database)]";
    }
    return "graph TD\n  Client[Web Client] -->|Idempotency-Key| Gateway[API Gateway]\n  Gateway --> Cache{Redis Cache}\n  Cache -->|Miss| Lock[DB Transaction Lock]\n  Lock --> DB[(Database)]";
  }
  return str.replace(/```mermaid/g, "").replace(/```/g, "").trim();
}

export function generateFallbackAudit(
  overview: RepoOverview,
  company: CompanyProfile,
  staticFindings: AuditFinding[]
): AuditResponse {
  const isFintech = company.id === "razorpay" || company.id === "zerodha";

  return {
    repoSummary: overview,
    companyProfile: company,
    overallScore: staticFindings.some((f) => f.severity === "critical") ? 58 : 78,
    findings: [
      ...staticFindings,
      {
        id: "fallback-finding-concurrency",
        severity: "critical",
        category: "Concurrency & Race Conditions",
        title: `Missing atomic concurrency guards for ${company.name} scale`,
        fileCitation: overview.primaryLanguage === "TypeScript" ? "server.ts" : "package.json",
        explanation: `Under burst loads (${isFintech ? "simultaneous wallet debits" : "surge ordering"}), direct database reads followed by writes cause race condition double-execution.`,
        remediation: `Implement optimistic locking with version columns or Redis distributed locks with exponential retry backoff.`,
        codeSnippet: `// Example Redis Lock:\nconst acquired = await redis.set(lockKey, token, 'NX', 'PX', 2000);`,
      },
      {
        id: "fallback-finding-observability",
        severity: "warning",
        category: "System Observability",
        title: "Missing correlation ID context across asynchronous request flows",
        fileCitation: "server.ts",
        explanation: `${company.name} engineering requires tracking requests with unique x-request-id headers across service boundaries.`,
        remediation: `Add AsyncLocalStorage or express-request-id middleware to tag logs with request IDs.`,
      },
    ],
    architectureComparison: {
      currentMermaid: `graph TD\n  Client[Web / Mobile Client] -->|Unbounded HTTP| Server[Node/Express Server]\n  Server -->|Direct Write| DB[(Database)]`,
      targetMermaid: `graph TD\n  Client[Web / Mobile Client] -->|Idempotency-Key| Gateway[API Gateway + Rate Limiter]\n  Gateway --> Cache{Redis Cache}\n  Cache -->|Cache Miss| Trans[ACID Transaction Lock]\n  Trans --> DB[(Database)]\n  Trans --> Queue[Worker Queue: Retries]`,
      currentSummary: "Direct client-to-database coupling without concurrency guards, idempotency layers, or retry queues.",
      targetSummary: `Production ${company.domain} architecture featuring idempotent request validation, distributed locking, and resilient asynchronous worker queues.`,
    },
    stressTestScript: {
      language: "javascript",
      title: `${company.name} Concurrency Race Condition Tester`,
      targetScenario: `Simulate 15 concurrent requests hitting the same resource within 10ms to verify race condition defense.`,
      code: `// stress-test.js
// Run: node stress-test.js http://localhost:3000/api/checkout
const targetUrl = process.argv[2] || 'http://localhost:3000/api/checkout';

async function fireBurst() {
  console.log('🚀 Firing 15 concurrent requests to ' + targetUrl);
  const idempotencyKey = 'test-idem-' + Date.now();
  
  const requests = Array.from({ length: 15 }).map(async (_, idx) => {
    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify({ amount: 1000, accountId: 'user_123' })
    }).catch(err => ({ status: 'error', error: err.message }));
    
    return { req: idx + 1, status: res.status };
  });

  const results = await Promise.all(requests);
  console.table(results);
}

fireBurst();`,
      runInstructions: "node stress-test.js <YOUR_LOCAL_ENDPOINT_URL>",
    },
    interviewDefense: [
      {
        question: `How does your project prevent double-debiting under simultaneous concurrent requests?`,
        interviewerIntent: `Tests if the candidate understands ACID transactions, database row locks (SELECT FOR UPDATE), or Redis idempotency keys.`,
        talkingPoints: [
          `Mention using an Idempotency-Key header stored in Redis with atomic SETNX.`,
          `Explain PostgreSQL row-level locks or atomic SQL operations ('UPDATE accounts SET balance = balance - 100 WHERE balance >= 100').`,
          `Discuss webhook signature validation and exponential retry backoff.`,
        ],
      },
      {
        question: `What happens if the external payment or delivery provider returns HTTP 504 Gateway Timeout?`,
        interviewerIntent: `Tests understanding of distributed states and avoiding duplicate side effects.`,
        talkingPoints: [
          `Do not immediately mark the transaction as failed or refund the user.`,
          `Trigger an inquiry reconciliation polling job to verify the external provider's ledger.`,
          `Use dead-letter queues to notify manual operations if reconciliation fails.`,
        ],
      },
    ],
    generatedAt: new Date().toISOString(),
    executionMode: "heuristic_fallback",
  };
}
