# Root-Cause Analysis: Hardcoded & Generic Repository Output Defect

**Date:** 2026-10-10  
**Project:** ProjectGlowup AI  
**Author:** Principal Full-Stack & AI Systems Lead  
**Defect Summary:** Submitting distinct repositories (e.g. React frontend vs Express backend vs Python FastAPI) produced identical findings, fixed architecture diffs, generic checkout race condition tests, and Swiggy interview drills.

---

## 1. Verified Root Causes

### Root Cause 1: Hardcoded Fallback Engine (`lib/gemini.ts`)
- **Location:** [`lib/gemini.ts`](file:///Users/calligraphyguruji/Azisly%20Hackathon/lib/gemini.ts#L173-L267) `generateFallbackAudit()`
- **Mechanism:** When `GEMINI_API_KEY` is unset or fails, `generateFallbackAudit` returns:
  1. A fixed race-condition finding: `"Missing atomic concurrency guards for..."`
  2. A hardcoded Before/After Mermaid flowchart showing `Server --> DB[(Database)]` regardless of whether the repository is a frontend React client, CLI tool, or backend.
  3. A hardcoded checkout script testing `http://localhost:3000/api/checkout` even if the repository is a React library (`facebook/react`) or has no checkout endpoint.
  4. Static interview defense questions hardcoded to financial ledger double-debiting.
- **Impact:** Any user running without a paid/configured Gemini key saw identical outputs across all repositories.

### Root Cause 2: Static Heuristic Scanner Ignored Stack Identity (`lib/staticRules.ts`)
- **Location:** [`lib/staticRules.ts`](file:///Users/calligraphyguruji/Azisly%20Hackathon/lib/staticRules.ts)
- **Mechanism:** The static scanner lacked tech-stack detection (e.g. Client-side React / Vue vs Node Express / Python FastAPI). If no static rules matched, it emitted `static-pass-clean` which was then overshadowed by the hardcoded findings in `generateFallbackAudit`.
- **Impact:** Frontend-only repositories received backend database advice.

### Root Cause 3: Concurrency Test Generator Was Not Grounded in Discovered Endpoints
- **Location:** Fallback script generator was not inspecting the ingested `files` array for actual HTTP endpoints (`app.get`, `app.post`, `@app.get`, `router.post`).
- **Mechanism:** It always generated a `test-idem-` script targeted at `/api/checkout`.

---

## 2. Corrective Architecture Plan

1. **Stack Classifier (`lib/stackDetector.ts`):**
   - Automatically analyze dependencies in `package.json`, `requirements.txt`, `pyproject.toml`, and source paths.
   - Detect: `frontend_spa`, `node_backend`, `python_backend`, `fullstack`, `library_tool`.
2. **Dynamic Heuristic Generator (`lib/gemini.ts` & `lib/repoAnalyzer.ts`):**
   - **Dynamic Architecture Generator:** Construct Mermaid flowcharts from actual dependencies and file structure (e.g., React Component Tree & State vs API Gateway, Database, Message Queues).
   - **Dynamic Concurrency Harness:** Extract actual routes from source files (`/api/items`, `/users`, `/predict`). If no HTTP endpoints exist (e.g., React UI), generate a client-side stress/render test rather than a fabricated backend checkout exploit.
   - **Dynamic Interview Defense:** Generate questions based on detected technologies (React Virtual DOM / bundle size vs PostgreSQL ACID locking).
3. **Structured Verification Contract:**
   - Update `types/audit.ts` to include `stackType`, `detectedEndpoints`, and `evidenceSources`.
