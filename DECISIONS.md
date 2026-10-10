# Architecture Decision Records (ADR) Log

This document records the architectural and technology decisions for **RepoDoctor AI (StackFit AI)**.

---

## Status Legend
- **Proposed:** Documented and reviewed, pending implementation.
- **Accepted:** Approved and guiding current implementation.
- **Implemented:** Code changes completed and verified.
- **Superseded:** Replaced by a subsequent ADR.

---

## ADR Index

| ADR ID | Title | Status | Date |
|---|---|---|---|
| [ADR-001](#adr-001-adoption-of-nextjs-app-router-and-typescript) | Adoption of Next.js App Router and TypeScript | Accepted | 2026-10-10 |
| [ADR-002](#adr-002-selection-of-google-gemini-flash-via-google-ai-studio) | Selection of Google Gemini Flash via Google AI Studio | Accepted | 2026-10-10 |
| [ADR-003](#adr-003-use-of-github-rest-api-for-source-ingestion) | Use of GitHub REST API for Source Ingestion | Accepted | 2026-10-10 |
| [ADR-004](#adr-004-client-side-rendering-of-architecture-diagrams-via-mermaidjs) | Client-Side Rendering of Architecture Diagrams via Mermaid.js | Accepted | 2026-10-10 |
| [ADR-005](#adr-005-stateless-mvp-architecture-no-database-or-persistent-storage) | Stateless MVP Architecture (No Database or Persistent Storage) | Accepted | 2026-10-10 |
| [ADR-006](#adr-006-hybrid-analysis-deterministic-rules-paired-with-semantic-llm) | Hybrid Analysis: Deterministic Rules Paired with Semantic LLM | Accepted | 2026-10-10 |
| [ADR-007](#adr-007-representation-of-target-company-engineering-rubrics) | Representation of Target-Company Engineering Rubrics | Accepted | 2026-10-10 |
| [ADR-008](#adr-008-execution-safety-and-validation-of-generated-test-scripts) | Execution Safety and Validation of Generated Test Scripts | Accepted | 2026-10-10 |
| [ADR-009](#adr-009-free-tier-quota-management-and-in-memory-rate-limiting) | Free-Tier Quota Management and In-Memory Rate Limiting | Accepted | 2026-10-10 |
| [ADR-010](#adr-010-secret-management-and-ssrf-mitigation-policy) | Secret Management and SSRF Mitigation Policy | Accepted | 2026-10-10 |

---

### ADR-001: Adoption of Next.js App Router and TypeScript

- **Status:** Accepted
- **Context:**
  The project is a hackathon web application requiring responsive frontend UI, server-side API proxying to protect API keys, and rapid deployment under strict time constraints.
- **Decision:**
  Adopt Next.js (latest stable version with App Router) and TypeScript across frontend and backend route handlers.
- **Alternatives Considered:**
  1. *Separate React (Vite) frontend + Express/FastAPI backend:* Requires maintaining two codebases, dual deployment infrastructure, and CORS configurations.
  2. *Single-page vanilla HTML/JS:* Insufficient structure for managing complex UI state, TypeScript interfaces, and secret isolation.
- **Consequences:**
  - Single unified codebase and deployment target on Vercel.
  - Type-safe contract sharing between `/api/audit` and client components.
- **Security & Cost Implications:**
  Server-side secrets remain hidden from client bundles. Zero cost on Vercel free tier.

---

### ADR-002: Selection of Google Gemini Flash via Google AI Studio

- **Status:** Accepted
- **Context:**
  The audit pipeline requires semantic code reasoning, fast response times during live judging demos, and zero hosting costs.
- **Decision:**
  Use Google Gemini 2.0 / 1.5 Flash via Google AI Studio (`@google/genai` or `@google/generative-ai` SDK) utilizing strict JSON response formatting (`responseSchema`).
- **Alternatives Considered:**
  1. *OpenAI GPT-4o-mini:* Requires paid credits or credit card upfront.
  2. *Self-hosted local models (e.g. Ollama):* Cannot be deployed to serverless public URLs (mandatory for final round).
  3. *Groq Llama 3.3:* Excellent speed, but Gemini offers larger free-tier context window (1M tokens) allowing safe ingestion of multiple code files.
- **Consequences:**
  - 15 RPM and 1,500 RPD free tier without requiring credit card.
  - Sub-2-second generation latency during live judging demonstrations.
- **Security & Cost Implications:**
  $0 cost. System prompt enforces strict safety boundaries to prevent prompt leakage.

---

### ADR-003: Use of GitHub REST API for Source Ingestion

- **Status:** Accepted
- **Context:**
  To evaluate candidate projects, the application must inspect real repository files rather than user-pasted text snippets.
- **Decision:**
  Fetch the public repository file tree using GitHub's Git Trees API (`GET /repos/{owner}/{repo}/git/trees/{branch}?recursive=1`) and selectively retrieve up to 10 prioritized files via raw content URLs or the Contents API.
- **Alternatives Considered:**
  1. *Cloning repositories using `simple-git` or shell:* Ephemeral serverless containers on Vercel have limited disk space, no persistent git daemon, and high latency.
  2. *GraphQL API:* Requires complex queries and mandatory personal access tokens for all calls.
- **Consequences:**
  - Ingestion completes in a single recursive tree lookup + bounded parallel file fetches.
  - Clean error handling when repositories are private, non-existent, or empty.
- **Security & Cost Implications:**
  Unauthenticated rate limit is 60 req/hr per IP; optional `GITHUB_TOKEN` expands this to 5,000 req/hr. Server never executes repository files.

---

### ADR-004: Client-Side Rendering of Architecture Diagrams via Mermaid.js

- **Status:** Accepted
- **Context:**
  The system must communicate architectural gaps visually through Before/After diagrams rather than raw text descriptions.
- **Decision:**
  Generate standardized Mermaid.js graph syntax (`graph TD` or `flowchart TD`) from the audit pipeline and render it dynamically on the client browser using the `mermaid` npm package.
- **Alternatives Considered:**
  1. *Server-side rendering to SVG/PNG via Puppeteer:* Heavy dependency, slow render times, risk of Vercel serverless timeout.
  2. *Static image generation:* Inflexible, slow, and prone to visual artifacts.
- **Consequences:**
  - Zero server compute overhead for diagram rendering.
  - Interactive SVG rendering directly in the browser with zoom and pan support.
- **Security & Cost Implications:**
  SVG rendered with Mermaid security level set to `strict` to prevent XSS. Zero cost.

---

### ADR-005: Stateless MVP Architecture (No Database or Persistent Storage)

- **Status:** Accepted
- **Context:**
  Hackathon constraints require rapid delivery, minimal points of failure, and zero paid infrastructure. The core value proposition is instant live auditing of a submitted repository.
- **Decision:**
  Implement a completely stateless architecture for the MVP. Do not provision PostgreSQL, MongoDB, Redis, or cloud storage.
- **Alternatives Considered:**
  1. *Supabase / Neon PostgreSQL:* Adds schema migration overhead, connection pooling, and credential configuration without benefiting the live demo flow.
  2. *Upstash Redis:* Adds external network dependency and key eviction logic.
- **Consequences:**
  - No database maintenance or connection timeouts during judging.
  - Client stores recent audit reports in browser `sessionStorage` for instant re-viewing.
- **Security & Cost Implications:**
  Zero student data retained on server; zero risk of data leakage; 100% free operation.

---

### ADR-006: Hybrid Analysis: Deterministic Rules Paired with Semantic LLM

- **Status:** Accepted
- **Context:**
  Relying solely on LLMs leads to hallucinations (inventing file lines, false positive vulnerabilities). Relying solely on regex misses architectural semantics.
- **Decision:**
  Implement a two-tier analysis engine:
  - **Tier 1 (Static Analyzer):** Scans AST / regex for concrete anti-patterns (floating-point money, unindexed foreign keys, missing error boundaries).
  - **Tier 2 (Gemini Semantic Analyzer):** Takes the static flags, file contents, and target-company rubric to assemble the architectural narrative, Mermaid diagrams, and interview defense questions.
- **Alternatives Considered:**
  1. *Pure LLM Analysis:* Vulnerable to hallucinating non-existent files and incorrect line numbers.
  2. *Pure Static Analysis (SonarQube/ESLint):* Lacks company-specific domain context and cannot synthesize visual architecture diagrams.
- **Consequences:**
  - High fidelity: Static findings act as hard evidence citations.
  - Gemini output is anchored in observable repository facts.
- **Security & Cost Implications:**
  Deterministic preprocessing filters out junk files, reducing token spend by ~60%.

---

### ADR-007: Representation of Target-Company Engineering Rubrics

- **Status:** Accepted
- **Context:**
  The system must audit code against company-specific engineering expectations (Razorpay, Swiggy, Zerodha, Amazon) without claiming access to proprietary internal documents.
- **Decision:**
  Structure company rubrics as TypeScript domain configuration profiles (`lib/companies/`) based on public engineering blogs, tech talks, and open-source contributions.
- **Alternatives Considered:**
  1. *Vector Database (RAG) with scraped blog articles:* Overengineered for hackathon scope; risks retrieval latency and cold starts.
  2. *Unstructured prompt injection:* Results in inconsistent evaluation criteria.
- **Consequences:**
  - Deterministic, version-controlled rubric definitions.
  - Clear legal and factual boundary: rubrics are public engineering paradigms, not proprietary insider data.
- **Security & Cost Implications:**
  Zero external RAG lookup costs.

---

### ADR-008: Execution Safety and Validation of Generated Test Scripts

- **Status:** Accepted
- **Context:**
  The system generates runnable load-test and concurrency scripts to demonstrate edge cases.
- **Decision:**
  Generated test scripts are treated strictly as inspection artifacts. The server **never** executes them. The UI displays the code with syntax highlighting, explanatory comments, and copy buttons for students to run locally.
- **Alternatives Considered:**
  1. *Running tests in cloud sandbox (e.g., E2B, Docker):* High complexity, cost, security risk, and latency.
- **Consequences:**
  - Zero execution vulnerability on the server.
  - Students learn how to run and explain the test on their own development machine.
- **Security & Cost Implications:**
  Eliminates remote code execution (RCE) attack surface completely.

---

### ADR-009: Free-Tier Quota Management and In-Memory Rate Limiting

- **Status:** Accepted
- **Context:**
  Google Gemini free tier allows 15 RPM; unauthenticated GitHub API allows 60 req/hr per IP. Malicious or repetitive requests could exhaust hackathon quotas.
- **Decision:**
  Implement an in-memory token-bucket rate limiter in Next.js middleware / route handlers limiting client IPs to 2 audits per minute, paired with strict payload size caps.
- **Alternatives Considered:**
  1. *Distributed Redis Rate Limiter:* Unnecessary operational complexity for single-region Vercel deployment.
- **Consequences:**
  - Prevents rapid quota exhaustion during live presentations.
- **Security & Cost Implications:**
  Protects API quotas at zero cost.

---

### ADR-010: Secret Management and SSRF Mitigation Policy

- **Status:** Accepted
- **Context:**
  Accepting user-supplied URLs presents Server-Side Request Forgery (SSRF) risks. Exposing API keys in client bundles causes immediate quota theft.
- **Decision:**
  Enforce strict URL regex validation restricting requests exclusively to `https://github.com/`. Ban IP literals, private networks, and non-HTTPS protocols. Store all API keys in environment variables accessible only to serverless functions.
- **Alternatives Considered:**
  1. *Generic HTTP fetcher:* Extreme SSRF vulnerability allowing attackers to probe internal cloud metadata (`169.254.169.254`).
- **Consequences:**
  - Complete protection against internal network probing.
  - Clean separation of public client variables (`NEXT_PUBLIC_`) and private secrets.
- **Security & Cost Implications:**
  Ensures compliance with hackathon security standards and protects free-tier credentials.
