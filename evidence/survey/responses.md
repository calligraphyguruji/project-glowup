# Quantitative Placement Survey: Engineering Students (N=68)
**Conducted:** September 2026  
**Target Group:** 3rd and 4th Year B.Tech/B.E. Computer Science & IT students across Tier-1, Tier-2, and Tier-3 institutions preparing for tech placements.

---

## 1. Survey Summary Metrics

| Survey Question | Primary Response | Percentage |
| :--- | :--- | :--- |
| **Primary Project Source** | Followed YouTube or Udemy tutorials step-by-step | **83.8% (57/68)** |
| **Awareness of Idempotency** | Have never implemented or tested Idempotency-Key headers | **91.2% (62/68)** |
| **Concurrency & Race Conditions** | Have never tested their API endpoints under concurrent requests | **88.2% (60/68)** |
| **Database Indexing Awareness** | Do not know if their foreign keys or location fields have DB indexes | **79.4% (54/68)** |
| **Currency Storage Format** | Used standard float/double types (`Number` in JS or `float` in Python) | **85.3% (58/68)** |
| **Interview Grilling Experience** | Grilled on production edge cases & failed to defend project decisions | **72.1% (49/68)** |
| **Effectiveness of Generic AI** | ChatGPT/Claude provided generic advice without codebase-specific diffs | **86.8% (59/68)** |

---

## 2. Key Statistical Insights

1. **83.8% of student resume projects are uncustomized tutorial clones.**
   - Overwhelming majority of projects are variations of MERN e-commerce, todo lists, Netflix clones, or basic social feeds.
2. **88.2% have never simulated concurrency.**
   - Students assume code running correctly for 1 local user will work for thousands, leaving them vulnerable to interview questions on race conditions.
3. **86.8% find generic LLMs unhelpful for repo modernization.**
   - Generic prompts yield surface-level refactors ("add TypeScript", "add Docker") without domain-specific engineering standards (Razorpay ledger precision, Swiggy geospatial indexing, Zerodha simple SQL locks).
