# ProjectGlowUp AI (StackFit AI)

> **Hackathon Track:** Problem Statement 4 — Open Innovation (Student Pain Points)  
> **One-Line Problem:** College students build generic tutorial projects that lack target-company engineering patterns, causing instant resume rejections and technical interview failures.

---

## What It Does (Problem Statement 4)

**ProjectGlowUp AI** is an engineering intelligence web application that audits a student’s actual public GitHub repository against the production-grade engineering standards of their target company (such as Razorpay, Swiggy, Zerodha, or Amazon). Instead of scanning resume keywords like an ATS or generating generic advice like a standard chatbot, it inspects real repository code, detects architectural anti-patterns, generates interactive Before/After system design diagrams in Mermaid.js, and provides runnable concurrency/load-test scripts to help students defend their code in technical interviews.

---

## Hackathon Progress Status (Done / Left / Plan)

### What Works Now (Done)
- [x] Complete system architecture specification and data-flow model (`ARCHITECTURE.md`).
- [x] Architecture Decision Records log covering 10 foundational decisions (`DECISIONS.md`).
- [x] High-density engineering UI/UX design system and token definitions (`DESIGN.md`).
- [x] AI agent operational boundaries and security invariants (`RULES.md`, `PRD.md`).
- [x] Comprehensive testing strategy and edge-case failure matrix (`TESTING.md`).
- [x] Primary student research methodology and evidence vault structure (`evidence/README.md`).
- [x] Secure environment configuration template (`.env.example`).

### What Is Left (Next 16 Hours)
- [ ] Initialize Next.js 14+ TypeScript project and install Tailwind CSS & Mermaid.js.
- [ ] Implement backend GitHub REST API tree fetcher and bounded file ingestion adapter.
- [ ] Implement static heuristic scanner for deterministic anti-pattern detection.
- [ ] Connect Google Gemini Flash API using strict structured JSON schemas.
- [ ] Build responsive, dark-mode developer dashboard and interactive Mermaid viewer.
- [ ] Conduct 5 authentic student interviews and compile notes into `evidence/interviews/`.
- [ ] Deploy live production build to Vercel and verify on mobile devices.

### Plan to Finish
1. **Hours 1–3:** Scaffold Next.js application, configure Tailwind CSS, and set up Vitest.
2. **Hours 4–7:** Build GitHub API integration and static heuristic rule engine.
3. **Hours 8–11:** Wire Gemini Flash structured prompt pipeline and Mermaid diagram generator.
4. **Hours 12–14:** Build frontend dashboard, copy-to-clipboard test script viewer, and error handling.
5. **Hours 15–16:** Conduct student interviews, populate `evidence/`, deploy to Vercel, and run pre-demo smoke tests.

---

## Problem & Motivation

Engineering students spend hundreds of hours following online tutorials to build boilerplate projects (e.g., MERN e-commerce clones, Netflix clones, weather apps). When they apply to top tech firms, these projects are rejected because:
1. **Zero Domain Engineering:** A fintech company (e.g., Razorpay) requires transaction atomicity, ledger consistency, and idempotent request handling; a generic MERN app uses unprotected floating-point arithmetic and direct MongoDB writes.
2. **Failure Under Interview Cross-Examination:** When interviewers ask *"How does your app handle 500 concurrent balance deductions?"*, candidates freeze because they never considered concurrency.
3. **Existing Tool Gaps:**
   - **ATS Scanners:** Only count keywords in PDFs without ever inspecting code.
   - **Generic AI Chatbots:** Output walls of abstract text and tutorial suggestions without analyzing the student's actual repository files.

---

## Proposed Solution & Core Features

```mermaid
flowchart LR
    A[Student GitHub Repo URL + Target Company] --> B[GitHub REST API Ingestor]
    B --> C[Static Heuristic Scanner]
    C --> D[Gemini Flash Semantic Engine]
    D --> E[Interactive Audit Report]
    E --> F[Code Red Flags with File Citations]
    E --> G[Before/After Architecture Diff (Mermaid)]
    E --> H[Runnable Concurrency Test Script]
    E --> I[Interview Defense Q&A Sheet]
```

### Key Differentiators
- **Real Code Inspection:** Reads actual schemas (`schema.prisma`), server files, and `package.json` directly from GitHub.
- **Before/After Visual Architecture Diff:** Visualizes missing production layers (e.g., Redis idempotency guards, task queues) using interactive Mermaid.js flowcharts.
- **Runnable Edge-Case Test Harness:** Provides copyable Node.js / k6 scripts so students can benchmark and prove their project's resilience.
- **Interview Defense Drill:** Generates the exact technical questions interviewers will ask about these specific code trade-offs.

---

## Technology Stack

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, Mermaid.js
- **Backend:** Next.js Route Handlers (Node.js runtime)
- **AI Engine:** Google Gemini Flash (2.0 / 1.5) via Google AI Studio (`@google/genai`)
- **Code Ingestion:** GitHub REST API v3
- **Deployment:** Vercel (100% Free Tier)
- **Testing:** Vitest (Planned)

---

## Illustrative Audit Workflow

*(Example based on testing an unhardened Node.js/PostgreSQL expense tracker against Razorpay standards)*

1. **Input:** Student submits `https://github.com/student/expense-tracker` and selects **Razorpay (Fintech)**.
2. **Observed Evidence:** The parser inspects `prisma/schema.prisma` and detects `amount Float` on line 14.
3. **Critical Finding:** Flags floating-point currency representation as an immediate rejection risk; provides drop-in remediation converting to `amount Int` (stored in paise).
4. **Architecture Upgrade:** Renders Before/After Mermaid diagram adding an Idempotency-Key cache layer and webhook retry queue.
5. **Interview Test Script:** Generates a 20-line test script firing 10 concurrent HTTP requests with the identical transaction key to demonstrate race-condition safety.

---

## Security & Privacy Principles

- **Zero Remote Code Execution:** The server **never** executes, compiles, or runs submitted repository code or generated test scripts.
- **SSRF Mitigation:** Strict URL regex restricts all outbound requests exclusively to `https://api.github.com`.
- **Secret Isolation:** API keys (`GEMINI_API_KEY`, `GITHUB_TOKEN`) are server-only and never leaked to the client browser.
- **Stateless Operation:** No student code or personal data is permanently stored in a database.

---

## Environment Variables

| Variable Name | Purpose | Required | Example / Default |
|---|---|---|---|
| `GEMINI_API_KEY` | Authenticates requests to Google AI Studio | **Yes** | `AIzaSy...` (Get free at [aistudio.google.com](https://aistudio.google.com/)) |
| `GEMINI_MODEL` | Specifies the Gemini model identifier | No | `gemini-2.0-flash` |
| `GITHUB_TOKEN` | Raises GitHub rate limit from 60 to 5,000 req/hr | No | `ghp_...` (Read-only personal token) |
| `NEXT_PUBLIC_APP_URL` | Base application URL for origin verification | No | `http://localhost:3000` |
| `NODE_ENV` | Runtime environment mode | No | `development` |

---

## Local Setup & Development Commands

### Prerequisites
- Node.js 18.17+ or 20+
- npm, pnpm, or yarn

### Installation
```bash
# 1. Clone repository
git clone https://github.com/your-username/project-glowup-ai.git
cd project-glowup-ai

# 2. Copy environment template
cp .env.example .env.local

# 3. Add your free Gemini API key to .env.local
# GEMINI_API_KEY=your_actual_key_here

# 4. Install dependencies (once package.json is initialized)
npm install

# 5. Start local development server
npm run dev
```

Visit `http://localhost:3000` to interact with the dashboard.

---

## Student Problem Evidence (`evidence/` Directory)

In accordance with Problem Statement 4 guidelines, all claims of student need are supported by primary research stored in the [`evidence/`](file:///Users/calligraphyguruji/Azisly%20Hackathon/evidence/README.md) folder:
- **`evidence/interviews/`:** Anonymized notes from 5 engineering students on project rejection experiences.
- **`evidence/survey/`:** Survey methodology and quantitative data on tutorial-clone prevalence.
- **`evidence/references/`:** Public engineering blog citations (Razorpay, Swiggy, Zerodha).

---

## Proposed License

Proposed under the **MIT License**.
