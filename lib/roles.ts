import { TargetRole } from "@/types/audit";

export const PREDEFINED_ROLES: TargetRole[] = [
  {
    id: "sde_intern",
    title: "Software Engineer Intern",
    experienceLevel: "internship",
    focusAreas: [
      "Readable, maintainable code structure",
      "Correct algorithmic complexity & data structures",
      "Basic unit testing and input validation",
      "Clean Git hygiene and documentation"
    ],
    description: "Evaluates fundamental software craftsmanship, code organization, and avoidance of tutorial anti-patterns."
  },
  {
    id: "backend_swe",
    title: "Backend Software Engineer",
    experienceLevel: "entry_level",
    focusAreas: [
      "API correctness and robust schema validation",
      "Database transactions & concurrency safety (ACID)",
      "Idempotency guards & error boundaries",
      "Connection pooling and telemetry"
    ],
    description: "Emphasizes resilient backend architecture, race condition prevention, and distributed transaction integrity."
  },
  {
    id: "frontend_swe",
    title: "Frontend Software Engineer",
    experienceLevel: "entry_level",
    focusAreas: [
      "Component modularity and state predictability",
      "Virtual DOM re-render minimization & code-splitting",
      "Web Vitals (FCP, CLS, FID) and bundle size budgets",
      "Client-side security and accessibility standards"
    ],
    description: "Focuses on client performance, bundle hygiene, accessibility, and resilient state architecture."
  },
  {
    id: "fullstack_swe",
    title: "Full-Stack Software Engineer",
    experienceLevel: "junior",
    focusAreas: [
      "End-to-end type safety between client and server",
      "API contracts and network error boundaries",
      "Authentication/authorization flow hygiene",
      "Database schema indexing and client state caching"
    ],
    description: "Audits full-stack coherence, secure data flow between tiers, and efficient full-lifecycle workflows."
  },
  {
    id: "devops_platform",
    title: "DevOps & Platform Engineer",
    experienceLevel: "mid_level",
    focusAreas: [
      "Containerization & Dockerfile optimization",
      "CI/CD pipeline workflow definitions",
      "Secret isolation (no hardcoded keys)",
      "Observability, metrics, and healthcheck endpoints"
    ],
    description: "Evaluates infrastructure-as-code, secure configuration, build reproducibility, and failure domain isolation."
  },
  {
    id: "qa_automation",
    title: "QA Automation Engineer",
    experienceLevel: "entry_level",
    focusAreas: [
      "Automated test coverage for critical paths",
      "Concurrency and stress-test test harnesses",
      "Edge-case negative test fixtures",
      "Mocking strategies for external third-party dependencies"
    ],
    description: "Audits test suite breadth, race-condition harnesses, and failure resilience verification."
  }
];
