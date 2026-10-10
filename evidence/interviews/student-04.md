# Student Interview: #04 (Divya M.)
- **Date:** 2026-10-02
- **Education:** B.Tech Computer Engineering, Tier-1 State University, 4th Year
- **Target Role/Domain:** Cloud & Distributed Systems (SDE-1)
- **Target Companies:** Amazon (AWS / Retail), Microsoft
- **Current Resume Projects:** Microservices Book Review API (Docker, Express, MongoDB), URL Shortener

### Key Discussion Questions & Responses
1. **What technical projects do you currently feature on your resume?**
   - *"A microservices book review application with 3 separate Express services and a Redis URL shortener."*
2. **How did you choose the tech stack and architectural decisions for those projects?**
   - *"I thought having 'microservices' on my resume would impress big tech recruiters, so I split user auth, books, and reviews into 3 docker containers."*
3. **In past technical rounds or resume screenings, what feedback did you receive about your projects?**
   - *"In an Amazon SDE-1 loop, the interviewer asked: 'What is your blast radius if Service B is returning 500 errors? What happens when network latency spikes between your services?' I had zero circuit breakers, no retry limits, no exponential backoff, and no dead-letter queues. One service failure crashed the entire chain."*
4. **Have interviewers grilled you on production concerns (e.g., concurrency, transactions, caching, idempotency)?**
   - *"They asked about observability and structured logging. My code was filled with `console.log('user logged in', user)`. The interviewer noted that unstructured logs with sensitive PII in production violate basic cloud security and make CloudWatch monitoring useless."*
5. **How do you currently figure out what engineering teams at your dream company actually look for?**
   - *"Amazon Leadership Principles and AWS Well-Architected Framework docs are hundreds of pages long. It's difficult to bridge theoretical concepts into concrete code review."*
6. **When using ChatGPT or Claude, what answers do you get, and why are they insufficient?**
   - *"ChatGPT gives high-level prose or says 'use Istio service mesh'. For a student college project, setting up Kubernetes and Istio is overkill. I needed simple in-code circuit breaker patterns and structured JSON logging."*

### Direct Student Quotes
- *"Splitting my app into microservices without circuit breakers actually made my system 10x more fragile."*
- *"Interviewers asked: 'Where are your error budgets and retry backoffs?' and I froze."*

### Core Pain Points Identified
1. **Cascading Failure Fragility:** Microservice architectures missing timeouts, circuit breakers, and exponential backoff.
2. **Unstructured PII Logging:** `console.log` statements leaking credentials or failing enterprise observability.
3. **Architectural Complexity Mismatch:** Implementing distributed systems without foundational resilience engineering.
