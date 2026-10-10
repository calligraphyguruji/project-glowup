# Project Memory: ProjectGlowUp AI (StackFit AI)

**Last Updated:** 2026-10-10  
**Phase:** Pre-Implementation / Engineering Foundation Established

---

## 1. Project Purpose & Scope

ProjectGlowUp AI is an engineering audit platform for engineering students preparing for technical interviews and campus placements. It inspects public GitHub repositories using the GitHub REST API and evaluates codebases against target-company engineering paradigms (e.g., Razorpay, Swiggy, Zerodha, Amazon). It surfaces evidence-grounded anti-patterns, Before/After Mermaid.js architecture diagrams, and runnable edge-case test scripts.

---

## 2. Current Implementation Status

> **Verified Fact:** Application implementation has **NOT** started. The repository contains only foundational architecture and planning documentation.

- [x] Problem definition and hackathon track selection (Problem Statement 4)
- [x] Foundational architecture design (`ARCHITECTURE.md`)
- [x] Architecture Decision Records log (`DECISIONS.md`)
- [x] Product and UI design system specification (`DESIGN.md`)
- [x] Product requirements document & engineering standards (`PRD.md`)
- [x] Strict AI agent operating rules (`RULES.md`)
- [x] Comprehensive testing strategy (`TESTING.md`)
- [x] Recruiter and judge README (`README.md`)
- [x] Agent reference specification (`AGENTS.md`)
- [x] Student research evidence structure (`evidence/README.md`)
- [x] Environment variable template (`.env.example`)
- [ ] Application package initialization (`package.json`, TypeScript, Next.js)
- [ ] Backend GitHub ingestion adapter
- [ ] Static heuristic scanning engine
- [ ] Gemini Flash AI audit integration
- [ ] Frontend dashboard and Mermaid.js rendering
- [ ] Unit and integration test suite
- [ ] Vercel deployment

---

## 3. Confirmed Technology Stack

- **Framework:** Next.js (App Router, Node.js runtime)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Visualization:** Mermaid.js (client-side rendering)
- **AI Model:** Google Gemini 2.0 / 1.5 Flash via Google AI Studio (`@google/genai`)
- **Repository Data:** GitHub REST API v3
- **Target Deployment:** Vercel (Free tier, zero server infrastructure)

---

## 4. Key Architectural Decisions (Summary of ADRs)

1. **Stateless Backend (ADR-005):** Zero database or persistent storage for MVP. Ephemeral per-request analysis with client `sessionStorage` caching.
2. **Hybrid Analysis Pipeline (ADR-006):** Static deterministic checks act as ground truth, paired with Gemini semantic reasoning for architecture synthesis.
3. **Execution Safety (ADR-008):** Server **never** executes submitted or generated code. Test scripts are provided as copyable inspection artifacts.
4. **URL Whitelisting & SSRF Guard (ADR-010):** Strict regex limits input to `https://github.com/` URLs.
5. **Zero-Cost Operation:** Gemini Flash free tier + GitHub free tier + Vercel free tier.

---

## 5. Important File Locations & Planned Directory Map

```
/Users/calligraphyguruji/Azisly Hackathon/
├── ARCHITECTURE.md          # Complete system architecture specification
├── DECISIONS.md             # ADR log (ADR-001 through ADR-010)
├── DESIGN.md                # UI/UX design tokens, layouts, and states
├── MEMORY.md                # This document (project state memory)
├── PRD.md                   # Product requirements document & engineering standards
├── RULES.md                 # Strict constraints for AI coding agents
├── TESTING.md               # Testing pyramid and edge-case test matrix
├── README.md                # Hackathon and recruiter project overview
├── AGENTS.md                # Root instructions for autonomous coding agents
├── .env.example             # Safe environment variable template
├── evidence/
│   └── README.md            # Primary student research documentation guidelines
│
├── [PLANNED IMPLEMENTATION]
│   ├── app/
│   │   ├── page.tsx         # Dashboard landing & audit results view
│   │   ├── layout.tsx       # Root layout with dark theme
│   │   └── api/
│   │       └── audit/
│   │           └── route.ts # Core audit API route handler
│   ├── lib/
│   │   ├── github.ts        # GitHub REST API tree and file fetcher
│   │   ├── gemini.ts        # Gemini Flash structured JSON caller
│   │   ├── staticRules.ts   # Deterministic pattern scanner
│   │   ├── rateLimiter.ts   # In-memory IP rate limiter
│   │   └── companies/       # Target company rubric profiles
│   │       ├── razorpay.ts
│   │       ├── swiggy.ts
│   │       ├── zerodha.ts
│   │       └── amazon.ts
│   └── components/          # React UI components
│       ├── AuditForm.tsx
│       ├── FindingsView.tsx
│       ├── MermaidViewer.tsx
│       └── TestHarness.tsx
```

---

## 6. Environment Variables (Names Only)

- `GEMINI_API_KEY` (Required for server-side AI audit)
- `GEMINI_MODEL` (Optional, defaults to `gemini-2.0-flash`)
- `GITHUB_TOKEN` (Optional, raises GitHub rate limit to 5,000 req/hr)
- `NEXT_PUBLIC_APP_URL` (Required for base URL resolution)
- `NODE_ENV` (Environment mode)
- `MAX_FILES_PER_AUDIT` (Configurable cap on analyzed files)
- `MAX_FILE_SIZE_BYTES` (Configurable cap on file download size)
- `REQUESTS_PER_MINUTE_LIMIT` (IP rate limiting threshold)

---

## 7. Known Constraints & Limitations

- **Public Repositories Only:** The MVP does not support private repos (avoids OAuth credential management).
- **File Ingestion Budget:** Bounded to 10 files and 50 KB per file to stay well within serverless timeouts (10s on Vercel hobby tier).
- **Stateless History:** Audits are not saved to a shared database; closing the browser clears unexported results.
- **GitHub Unauthenticated Limit:** Without `GITHUB_TOKEN`, restricted to 60 calls/hour per IP.

---

## 8. Testing & Deployment Status

- **Testing Framework:** Not yet initialized (Vitest / Jest planned for Phase 2).
- **Test Coverage:** 0% (Implementation pending).
- **Deployment Status:** Undeployed (Local repository initialized).

---

## 9. Next Recommended Development Milestone

1. **Milestone 1:** Initialize Next.js project with TypeScript and Tailwind CSS (`create-next-app` or minimal custom configuration).
2. **Milestone 2:** Implement `lib/github.ts` and test file-tree retrieval and bounded downloading against sample public repos.
3. **Milestone 3:** Implement deterministic scanner (`lib/staticRules.ts`) for common student anti-patterns.
4. **Milestone 4:** Connect Gemini Flash structured JSON prompt in `/api/audit` and validate schema output.
5. **Milestone 5:** Build responsive UI with Mermaid.js diagram viewer.
6. **Milestone 6:** Populate `evidence/` with authentic student interview notes and deploy to Vercel.
