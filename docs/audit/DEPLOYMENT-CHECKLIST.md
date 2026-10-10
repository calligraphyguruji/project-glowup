# Vercel Deployment Checklist: ProjectGlowup AI

**Application:** ProjectGlowup AI  
**Deployment Target:** Vercel (Next.js 14.2 App Router)  
**Free-Tier Compatibility:** 100% Free Tier Compliant (Stateless, 0 external database requirements)  

---

## 1. Pre-Deployment Readiness Verification

- [x] **Zero TypeScript Errors:** Verified via `npm run type-check` (`tsc --noEmit`).
- [x] **Zero ESLint Warnings/Errors:** Verified via `npm run lint` (`next lint`).
- [x] **Automated Test Suite:** 19/19 unit and integration tests passing (`npm run test`).
- [x] **GitHub Ingestion Test:** Passed with CDN fallback resilience (`npm run test:ingestion`).
- [x] **Production Build Clean:** Verified via `npm run build` (`next build`).
- [x] **Serverless Route Boundary:** Single dynamic route `/api/audit` (0 B first load JS overhead).
- [x] **Sensitive Secret Exclusion:** `.env*`, `.planning/`, internal design files strictly untracked.

---

## 2. Environment Variables Configuration for Vercel Dashboard

When deploying to Vercel, navigate to **Project Settings → Environment Variables** and add:

| Variable Name | Required | Default / Recommended Value | Purpose |
| :--- | :---: | :--- | :--- |
| `GEMINI_API_KEY` | **Optional** | *Google AI Studio API Key* | Semantic audit synthesis & dynamic Mermaid diffs. *(Heuristic fallback active if omitted)* |
| `GEMINI_MODEL` | **Optional** | `gemini-2.0-flash` | Flash tier LLM model identifier. |
| `GITHUB_TOKEN` | **Optional** | *Personal Access Token (public_repo)* | Raises unauthenticated rate limit from 60 to 5,000 req/hr. |
| `MAX_FILES_PER_AUDIT` | **Optional** | `10` | Bounded file ingestion cap to prevent serverless timeout. |
| `MAX_FILE_SIZE_BYTES` | **Optional** | `51200` | 50 KB per file boundary to prevent memory blowups. |
| `REQUESTS_PER_MINUTE_LIMIT` | **Optional** | `15` | In-memory token bucket sliding window per client IP. |

---

## 3. Vercel CLI / Git Push Deployment Steps

### Option A: Automatic Git Deployment (Recommended)
1. Ensure latest commits are pushed to `main`:
   ```bash
   git push origin main
   ```
2. In the Vercel Dashboard, click **Add New Project** → Import `calligraphyguruji/project-glowup`.
3. Framework Preset: **Next.js** (auto-detected).
4. Root Directory: `./` (default).
5. Add `GEMINI_API_KEY` under Environment Variables.
6. Click **Deploy**.

### Option B: Vercel CLI
```bash
# Link repository
npx vercel

# Deploy preview
npx vercel --prod
```

---

## 4. Live Smoke Test Checklist Post-Deployment

1. Load `https://your-app.vercel.app/`.
2. Click Demo Preset **⚡ Express → Razorpay**. Verify simulated terminal progress and report generation.
3. Switch Mermaid Viewer tabs: **Split Diff**, **Target Only**, **Observed Only**.
4. Test Concurrency Script: Click **Copy Script** and **Download .js**.
5. Inspect Technical Interview Defense accordion cards.
