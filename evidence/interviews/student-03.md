# Student Interview: #03 (Vikram P.)
- **Date:** 2026-09-28
- **Education:** B.Tech CS, Tier-2 University, Final Year
- **Target Role/Domain:** High-Throughput Backend / Core Systems
- **Target Companies:** Zerodha, Groww, AngelOne
- **Current Resume Projects:** Mock Stock Trading Simulator (Python + FastAPI + PostgreSQL), Portfolio Tracker

### Key Discussion Questions & Responses
1. **What technical projects do you currently feature on your resume?**
   - *"A stock trading simulator that receives mock stock tick feeds and allows users to buy/sell equities with simulated virtual balance."*
2. **How did you choose the tech stack and architectural decisions for those projects?**
   - *"I used FastAPI and PostgreSQL because Zerodha uses Python and Postgres heavily. But I used standard ORM (SQLAlchemy) calls for everything."*
3. **In past technical rounds or resume screenings, what feedback did you receive about your projects?**
   - *"During a technical interview, the interviewer asked me: 'Suppose 10,000 market orders hit your order matching book concurrently. How does your PostgreSQL table prevent negative balance and duplicate execution?' I explained that my code checks `if balance >= cost:` then updates balance. He smiled and said: 'That's a textbook TOCTOU race condition.' "*
4. **Have interviewers grilled you on production concerns (e.g., concurrency, transactions, caching, idempotency)?**
   - *"Yes. He asked: 'Why are you doing ORM object reads instead of raw atomic UPDATEs with WHERE balance >= cost?' and 'Why are there no row-level locks (`SELECT ... FOR UPDATE`)?' He also noted I didn't have single-statement debit/credit accounting."*
5. **How do you currently figure out what engineering teams at your dream company actually look for?**
   - *"Kailash Nadh's blog (Zerodha CTO) talks about simplicity and avoiding speculative bloat, but there's no tool that looks at my repo and says: 'Hey, you have a race condition on line 42 of order_service.py.' "*
6. **When using ChatGPT or Claude, what answers do you get, and why are they insufficient?**
   - *"ChatGPT usually suggests over-engineering everything: 'Add Kafka, install Redis, deploy RabbitMQ microservices.' Kailash Nadh preaches the exact opposite: write clean, fast SQL and single binary services. ChatGPT didn't catch the PostgreSQL concurrency flaw."*

### Direct Student Quotes
- *"Checking account balance in Python before executing a DB write is the biggest beginner mistake, and nobody warned me about it."*
- *"I had no way to stress-test my code locally to actually see the race condition happen with 50 parallel requests."*

### Core Pain Points Identified
1. **TOCTOU (Time-of-Check to Time-of-Use) Race Conditions:** Naive balance verification prone to negative balance exploitation.
2. **Lack of Runnable Concurrency Tests:** Inability to generate localized stress-test scripts to prove thread/transaction safety.
3. **Over-Engineering Advice from Generic AI:** AI advising bloated message queues instead of simple, atomic DB primitives.
