# Student Problem Evidence Vault

This directory stores authentic research evidence documenting student placement challenges, project rejection patterns, and tool deficiencies for **Problem Statement 4: Open Innovation (Student Pain Points)**.

> **Hackathon Requirement Compliance:**
> As specified in the hackathon brief, claims of student need must be backed by authentic primary research (minimum 5 student interviews or a targeted survey). Do not fabricate survey numbers or interview quotes.

---

## Directory Organization

```
evidence/
├── README.md               # This guide and research methodology
├── interviews/             # Anonymized student interview notes (minimum 5)
│   ├── student-01.md
│   ├── student-02.md
│   ├── student-03.md
│   ├── student-04.md
│   └── student-05.md
├── survey/                 # Quantitative placement survey data
│   ├── questionnaire.md    # Survey questions asked
│   └── responses.csv       # Anonymized raw results (or summary JSON)
└── references/             # Engineering blogs & recruiter hiring rubrics
    └── industry_citations.md
```

---

## 1. Student Interview Guide & Schema

When conducting interviews with 3rd- and 4th-year engineering students preparing for placements, record the findings using the template below:

### Interview Template (`interviews/student-XX.md`)

```markdown
# Student Interview: #01
- **Date:** YYYY-MM-DD
- **Target Role/Domain:** (e.g., Backend Engineer, Fintech, Frontend)
- **Target Companies:** (e.g., Razorpay, Swiggy, Cred)
- **Current Resume Projects:** (e.g., E-commerce clone in MERN, Todo app)

### Key Discussion Questions
1. What technical projects do you currently feature on your resume?
2. How did you choose the tech stack and architectural decisions for those projects?
3. In past technical rounds or resume screenings, what feedback did you receive about your projects?
4. Have interviewers grilled you on production concerns (e.g., concurrency, transactions, caching, idempotency)?
5. How do you currently figure out what engineering teams at your dream company actually look for?
6. When using ChatGPT or Claude, what answers do you get, and why are they insufficient?

### Direct Student Quotes
- *"..."*
- *"..."*

### Core Pain Points Identified
1. [Pain point 1]
2. [Pain point 2]
```

---

## 2. Quantitative Survey Methodology

* **Target Population:** Pre-final and final-year engineering students actively participating in campus placement drives or off-campus applications.
* **Core Hypotheses to Validate:**
  1. High prevalence of generic tutorial clone projects on resumes (e.g., MERN e-commerce, Netflix clones).
  2. Lack of production-grade architectural patterns (idempotency, transactions, message queues, rate-limiting).
  3. Rejection or freezing during technical interview deep-dives on system trade-offs.
  4. Ineffectiveness of general-purpose AI prompts for codebase-specific architectural improvements.

---

## 3. Public Industry References & Citations

Document public engineering blogs from target tech companies to ground architectural audit rules in observable engineering reality:

* **Razorpay Engineering Blog:** Payment idempotency, webhook delivery reliability, ledger consistency.
* **Swiggy Tech Bytes:** Geospatial indexing, distributed caching, order processing race conditions.
* **Zerodha Tech Blog:** Minimalist architecture, PostgreSQL concurrency, avoiding speculative complexity.
* **Netflix Technology Blog:** Chaos engineering, fault tolerance, circuit breaker patterns.
