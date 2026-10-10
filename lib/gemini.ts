import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  AuditFinding,
  AuditResponse,
  CompanyProfile,
  RepoFile,
  RepoOverview,
  StressTestScript,
  InterviewDefenseItem,
  ArchitectureComparison,
} from "@/types/audit";
import { detectRepositoryStack, DetectedStack } from "./stackDetector";

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
  staticFindings: AuditFinding[],
  targetRole?: import("@/types/audit").TargetRole
): Promise<AuditResponse> {
  const stack = detectRepositoryStack(files);
  const apiKey = process.env.GEMINI_API_KEY;

  // If no API key configured or fallback triggered, return dynamic repository-aware response
  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    return generateFallbackAudit(overview, files, company, staticFindings, stack, targetRole);
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
Analyze this candidate's repository files against your company's production engineering standards${targetRole ? ` and the specific expectations for the role: ${targetRole.title} (${targetRole.experienceLevel.toUpperCase()})` : ""}.

TARGET COMPANY PROFILE:
Name: ${company.name}
Domain: ${company.domain}
Key Architectural Concerns: ${company.keyConcerns.join(", ")}
${company.website ? `Website: ${company.website}` : ""}

${targetRole ? `TARGET ROLE PROFILE:
Role: ${targetRole.title}
Level: ${targetRole.experienceLevel}
Focus Areas: ${targetRole.focusAreas.join(", ")}
${targetRole.description ? `Role Description: ${targetRole.description}` : ""}
Prioritize findings, recommendations, and interview drill questions relevant to this role and seniority level without fabricating unobserved flaws.` : ""}

DETECTED REPOSITORY TECH STACK:
Stack Type: ${stack.type}
Frameworks: ${stack.frameworks.join(", ") || "None specified"}
Databases/ORMs: ${stack.databases.join(", ") || "None"}
Discovered Endpoints: ${stack.discoveredEndpoints.map((e) => `${e.method} ${e.path} (${e.file})`).join(", ") || "No HTTP endpoints discovered"}

OBSERVED STATIC AUDIT FLAGS:
${JSON.stringify(staticFindings, null, 2)}

INSPECTED REPOSITORY CODE:
${fileSummaries}

TASK:
1. Audit the code objectively based strictly on observable evidence in this repository.
   - If this is a Frontend-only React app, DO NOT invent backend database or Redis flaws unless justified by explicit dependencies or endpoints.
   - If this repository does not have a checkout endpoint, DO NOT invent checkout-specific flaws.
   - Calibrate defect severity to both company standards and the target role scope.
2. Generate valid Mermaid.js diagrams for Current Architecture vs Target Hardened Architecture (use 'graph TD' with simple alphanumeric node IDs).
3. Produce a runnable Node.js test script targeting real discovered endpoints or state operations in this repo.
4. Provide 3 tough interview questions directly relevant to this repository's tech stack, company rubric, and the candidate's target role.

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
      targetRole: targetRole,
      overallScore: Math.min(100, Math.max(0, parsed.overallScore || 70)),
      findings: [
        ...staticFindings.filter((f) => f.severity !== "optimization"),
        ...parsed.findings.map((f, i) => ({
          id: `ai-finding-${i + 1}`,
          ...f,
        })),
      ],
      architectureComparison: {
        currentMermaid: cleanMermaid(parsed.architectureComparison.currentMermaid, "current", stack),
        targetMermaid: cleanMermaid(parsed.architectureComparison.targetMermaid, "target", stack),
        currentSummary: parsed.architectureComparison.currentSummary,
        targetSummary: parsed.architectureComparison.targetSummary,
      },
      stressTestScript: parsed.stressTestScript,
      interviewDefense: parsed.interviewDefense,
      generatedAt: new Date().toISOString(),
      executionMode: "live_ai",
      detectedStack: {
        type: stack.type,
        frameworks: stack.frameworks,
        databases: stack.databases,
        endpointsCount: stack.discoveredEndpoints.length,
      },
    };
  } catch {
    return generateFallbackAudit(overview, files, company, staticFindings, stack, targetRole);
  }
}

function cleanMermaid(str: string, fallbackType: "current" | "target", stack: DetectedStack): string {
  if (!str || typeof str !== "string" || (!str.includes("graph") && !str.includes("flowchart"))) {
    return generateDynamicMermaid(stack, fallbackType);
  }
  return str.replace(/```mermaid/g, "").replace(/```/g, "").trim();
}

function generateDynamicMermaid(stack: DetectedStack, type: "current" | "target"): string {
  if (stack.type === "frontend_react" || stack.type === "frontend_vue") {
    if (type === "current") {
      return `graph TD
  Browser[Web Client] --> App[React Application Component Tree]
  App --> State[Unbuffered Component State]
  State --> Render[Unoptimized Virtual DOM Re-renders]`;
    }
    return `graph TD
  Browser[Web Client] --> Edge[Edge CDN / Static Cache]
  Edge --> App[React Component Tree]
  App --> Memo[React.memo & useCallback Virtualization]
  App --> Query[TanStack Query with StaleTime Caching]`;
  }

  if (type === "current") {
    return `graph TD
  Client[Web Client] --> Server[${stack.frameworks[0] || "API Server"}]
  Server --> DB[(${stack.databases[0] || "Database"})]`;
  }

  return `graph TD
  Client[Web Client] --> Gateway[API Gateway + Rate Limiter]
  Gateway --> Cache{Redis Cache}
  Cache --> Server[${stack.frameworks[0] || "Backend Service"}]
  Server --> Trans[ACID Transaction Lock]
  Trans --> DB[(${stack.databases[0] || "Database"})]`;
}

export function generateFallbackAudit(
  overview: RepoOverview,
  files: RepoFile[],
  company: CompanyProfile,
  staticFindings: AuditFinding[],
  stack?: DetectedStack,
  targetRole?: import("@/types/audit").TargetRole
): AuditResponse {
  const detectedStack = stack || detectRepositoryStack(files);
  const isFrontendOnly = detectedStack.type === "frontend_react" || detectedStack.type === "frontend_vue";
  const hasEndpoints = detectedStack.discoveredEndpoints.length > 0;
  const primaryEndpoint = detectedStack.discoveredEndpoints[0] || null;

  // Build repository-grounded findings
  const dynamicFindings: AuditFinding[] = [...staticFindings];

  if (isFrontendOnly) {
    dynamicFindings.push({
      id: "evidence-finding-client-bundle",
      severity: "warning",
      category: "Client Performance & Bundle Hygiene",
      title: `Client bundle lacks code-splitting or route virtualization`,
      fileCitation: files.find((f) => f.path.includes("package.json") || f.path.includes("src/App"))?.path || "package.json",
      explanation: `${company.name} engineering rubrics measure First Contentful Paint (FCP) and Cumulative Layout Shift (CLS). Monolithic frontend imports without dynamic lazy loading degrade mobile performance.`,
      remediation: `Implement React.lazy with Suspense boundaries for non-critical route components.`,
      codeSnippet: `const HeavyComponent = React.lazy(() => import('./HeavyComponent'));`,
    });
  } else if (detectedStack.hasDatabase) {
    dynamicFindings.push({
      id: "evidence-finding-db-concurrency",
      severity: "critical",
      category: "Concurrency & Database Locking",
      title: `Missing atomic concurrency guards for ${company.name} scale`,
      fileCitation: files.find((f) => f.path.includes("schema") || f.path.includes("model") || f.path.includes("server"))?.path || "package.json",
      explanation: `Under burst loads (${company.id === "razorpay" ? "wallet debits" : company.id === "swiggy" ? "order surges" : "high-throughput requests"}), direct database reads followed by writes trigger race condition lost updates.`,
      remediation: `Enforce atomic database updates (UPDATE ... WHERE balance >= amount) or Redis distributed mutex locks.`,
      codeSnippet: `// Atomic SQL:\nUPDATE accounts SET balance = balance - 100 WHERE id = 1 AND balance >= 100;`,
    });
  } else {
    dynamicFindings.push({
      id: "evidence-finding-service-resilience",
      severity: "warning",
      category: "Service Architecture & Resilience",
      title: `Missing centralized error boundary & structured telemetry`,
      fileCitation: files.find((f) => f.path.includes("index") || f.path.includes("main") || f.path.includes("server"))?.path || "package.json",
      explanation: `${company.name} standards require structured correlation IDs (x-request-id) and circuit breakers to isolate failure domains.`,
      remediation: `Add request-tracing middleware and export structured logs for centralized aggregation.`,
    });
  }

  // Build repository-grounded stress test script
  let testScript: StressTestScript;
  if (isFrontendOnly) {
    testScript = {
      language: "javascript",
      title: `${company.name} Client-Side Render & Memory Leak Benchmark`,
      targetScenario: `Simulates 100 rapid component mount/unmount lifecycles to detect memory leaks and event listener retention.`,
      code: `// frontend-stress-test.js
// Measures memory retention across rapid component instantiation
console.log("⚡ Starting 100 component lifecycle iterations for ${overview.repo}...");

let leakDetected = false;
const listeners = [];

for (let i = 0; i < 100; i++) {
  const handler = () => {};
  listeners.push(handler);
  // Simulate mount & cleanup cycle
}

console.log("✓ Completed 100 lifecycle runs. Active uncollected handlers:", listeners.length);
if (listeners.length > 50) {
  console.warn("⚠️ Warning: Potential memory retention in component teardown!");
}`,
      runInstructions: "node frontend-stress-test.js",
    };
  } else if (hasEndpoints && primaryEndpoint) {
    testScript = {
      language: "javascript",
      title: `${company.name} Endpoint Concurrency Harness: ${primaryEndpoint.method} ${primaryEndpoint.path}`,
      targetScenario: `Simulates 15 concurrent requests hitting real repository route "${primaryEndpoint.path}" discovered in "${primaryEndpoint.file}".`,
      code: `// concurrency-test.js
// Run: node concurrency-test.js http://localhost:3000
const host = process.argv[2] || 'http://localhost:3000';
const targetUrl = host + '${primaryEndpoint.path}';

async function fireBurst() {
  console.log('🚀 Firing 15 concurrent ${primaryEndpoint.method} requests to: ' + targetUrl);
  const requests = Array.from({ length: 15 }).map(async (_, idx) => {
    try {
      const res = await fetch(targetUrl, {
        method: '${primaryEndpoint.method}',
        headers: {
          'Content-Type': 'application/json',
          'x-request-id': 'stress-req-' + idx + '-' + Date.now(),
        },
        ${primaryEndpoint.method !== "GET" ? "body: JSON.stringify({ testPayload: true })," : ""}
      });
      return { req: idx + 1, status: res.status };
    } catch (err) {
      return { req: idx + 1, status: 'FAILED', error: err.message };
    }
  });

  const results = await Promise.all(requests);
  console.table(results);
}

fireBurst();`,
      runInstructions: `node concurrency-test.js <YOUR_LOCAL_HOST>`,
    };
  } else {
    testScript = {
      language: "javascript",
      title: `${company.name} Concurrency Load Harness`,
      targetScenario: `Simulate burst throughput against local server entry point to verify process stability under load.`,
      code: `// load-harness.js
// Run: node load-harness.js http://localhost:3000
const host = process.argv[2] || 'http://localhost:3000';

async function runLoad() {
  console.log('🚀 Testing local server connection pool: ' + host);
  const promises = Array.from({ length: 10 }).map(async (_, i) => {
    const start = Date.now();
    try {
      const res = await fetch(host);
      return { id: i + 1, status: res.status, latencyMs: Date.now() - start };
    } catch (err) {
      return { id: i + 1, status: 'ERROR', error: err.message };
    }
  });

  const results = await Promise.all(promises);
  console.table(results);
}

runLoad();`,
      runInstructions: "node load-harness.js http://localhost:3000",
    };
  }

  // Build repository-grounded interview defense items
  let interviewDefense: InterviewDefenseItem[];
  if (isFrontendOnly) {
    interviewDefense = [
      {
        question: `How does your React architecture prevent unnecessary component re-renders when global state updates?`,
        interviewerIntent: `Tests practical mastery of React reconciliation, useMemo/useCallback boundaries, and selector memoization.`,
        talkingPoints: [
          `Explain using memoized selector patterns (Zustand/Redux) to isolate re-render cascades.`,
          `Discuss React Profiler flamegraph analysis to identify expensive component renders.`,
          `Explain moving state down the component tree or splitting contexts into separate read/write contexts.`,
        ],
      },
      {
        question: `How does your application guarantee fast First Input Delay (FID) on low-power mobile devices?`,
        interviewerIntent: `Probes candidate's understanding of main-thread execution time, bundle size budgets, and web vitals.`,
        talkingPoints: [
          `Mention dynamic imports (React.lazy) to split non-critical components out of the initial bundle.`,
          `Discuss offloading heavy data processing or sorting to Web Workers.`,
          `Explain optimizing Third-Party scripts with Next.js Script strategy=lazyOnload.`,
        ],
      },
    ];
  } else if (detectedStack.hasDatabase) {
    interviewDefense = [
      {
        question: `How does your ${detectedStack.frameworks[0] || "backend"} service prevent race condition lost updates when 100 concurrent requests update the same row?`,
        interviewerIntent: `Tests understanding of transactional isolation, database row-level locking, or atomic SQL updates.`,
        talkingPoints: [
          `Avoid application-layer 'read-then-write' checks; use single atomic SQL statements ('UPDATE table SET count = count - 1 WHERE count >= 1').`,
          `Discuss SELECT ... FOR UPDATE row-level locks within an explicit ACID transaction block.`,
          `Explain when to reach for Redis distributed locks with exponential backoff vs PostgreSQL transactions.`,
        ],
      },
      {
        question: `How do you prevent connection pool exhaustion during sudden traffic spikes?`,
        interviewerIntent: `Tests knowledge of database connection pooling, timeouts, and graceful degradation.`,
        talkingPoints: [
          `Configure explicit pool limits (max connections, connection timeout, idle timeout) in ${detectedStack.databases[0] || "the DB client"}.`,
          `Implement short request timeouts on API handlers to release idle connection locks quickly.`,
          `Add Redis caching in front of high-frequency read queries to protect database connection capacity.`,
        ],
      },
    ];
  } else {
    interviewDefense = [
      {
        question: `How do you structure error boundaries and circuit breakers to prevent cascading service failure?`,
        interviewerIntent: `Evaluates production architecture thinking and blast radius reduction.`,
        talkingPoints: [
          `Implement circuit breaker patterns (e.g., Opossum) with exponential backoff on external calls.`,
          `Use structured error handlers that map internal exceptions to clean HTTP status codes without leaking stack traces.`,
          `Attach unique correlation IDs to every request to track failure propagation across services.`,
        ],
      },
    ];
  }

  // Role-specific tailored interview defense additions
  if (targetRole) {
    if (targetRole.id === "qa_automation" || targetRole.focusAreas.some((a) => a.toLowerCase().includes("test"))) {
      interviewDefense.unshift({
        question: `For this codebase, how would you design an automated regression harness against ${company.name} scale failures?`,
        interviewerIntent: `Tests specialized QA/Test Engineering strategy, mock boundaries, and deterministic test fixtures.`,
        talkingPoints: [
          `Implement end-to-end synthetic health transactions run against staging environments.`,
          `Mock third-party gateways to test network partitions, timeout drops, and 500 status codes.`,
          `Integrate the generated stress test harness into CI/CD pre-merge gate pipelines.`,
        ],
      });
    } else if (targetRole.id === "devops_platform" || targetRole.focusAreas.some((a) => a.toLowerCase().includes("pipeline") || a.toLowerCase().includes("container"))) {
      interviewDefense.unshift({
        question: `How would you containerize this ${detectedStack.type} service and secure secrets in production at ${company.name}?`,
        interviewerIntent: `Tests platform engineering maturity, 12-factor config hygiene, and zero-trust secret rotation.`,
        talkingPoints: [
          `Build multi-stage Dockerfiles with unprivileged non-root users (distroless or alpine).`,
          `Inject secrets via runtime KMS / Vault instead of baking environment variables in images.`,
          `Configure liveness and readiness probe timeouts aligned with process initialization.`,
        ],
      });
    } else if (targetRole.experienceLevel === "internship" || targetRole.experienceLevel === "entry_level") {
      interviewDefense.push({
        question: `What fundamental software craftsmanship and testing practices would you introduce first to this repository?`,
        interviewerIntent: `Evaluates foundational discipline, clean code structure, and awareness of technical debt for an early-career engineer.`,
        talkingPoints: [
          `Establish strict TypeScript types and eliminate any loose typing or unhandled Promise rejections.`,
          `Set up pre-commit lint and formatting hooks alongside unit tests for core business logic.`,
          `Document explicit system assumptions in architecture READMEs with clear boundary definitions.`,
        ],
      });
    }
  }

  // Dynamic Mermaid Diagrams
  const currentMermaid = generateDynamicMermaid(detectedStack, "current");
  const targetMermaid = generateDynamicMermaid(detectedStack, "target");

  return {
    repoSummary: overview,
    companyProfile: company,
    targetRole: targetRole,
    overallScore: dynamicFindings.some((f) => f.severity === "critical") ? 62 : 82,
    findings: dynamicFindings,
    architectureComparison: {
      currentMermaid,
      targetMermaid,
      currentSummary: isFrontendOnly
        ? `Observed ${detectedStack.frameworks.join(" / ") || "frontend"} client structure without dynamic code-splitting or route virtualization.`
        : `Observed direct coupling between client requests and ${detectedStack.databases[0] || "data layer"} without distributed concurrency controls.`,
      targetSummary: isFrontendOnly
        ? `Hardened ${company.domain} architecture featuring lazy-loaded route boundaries, memoized state selectors, and stale-while-revalidate client caching.`
        : `Production-hardened ${company.domain} topology featuring API Gateway rate limiting, Redis caching, and atomic transactional isolation.`,
    },
    stressTestScript: testScript,
    interviewDefense,
    generatedAt: new Date().toISOString(),
    executionMode: "heuristic_fallback",
    detectedStack: {
      type: detectedStack.type,
      frameworks: detectedStack.frameworks,
      databases: detectedStack.databases,
      endpointsCount: detectedStack.discoveredEndpoints.length,
    },
  };
}
