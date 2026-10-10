# Student Interview: #01 (Arjun K.)
- **Date:** 2026-09-18
- **Education:** B.Tech Computer Science, Tier-2 University, Final Year
- **Target Role/Domain:** Backend Engineering / Fintech
- **Target Companies:** Razorpay, PhonePe, Cred
- **Current Resume Projects:** MERN Stack E-Commerce Platform, Expense Tracker

### Key Discussion Questions & Responses
1. **What technical projects do you currently feature on your resume?**
   - *"I have a MERN stack e-commerce store with user authentication, shopping cart, and mock Stripe checkout, plus a React expense tracker."*
2. **How did you choose the tech stack and architectural decisions for those projects?**
   - *"I followed a 12-hour YouTube tutorial series. It used MongoDB and Express because everyone online says MERN is easiest to get running quickly."*
3. **In past technical rounds or resume screenings, what feedback did you receive about your projects?**
   - *"The interviewer at a fintech startup immediately skipped my features and asked: 'What happens if two users buy the last item at the exact same millisecond?' I had no answer. My code just did `product.inventory -= 1; await product.save()` with no transactions or atomic locks."*
4. **Have interviewers grilled you on production concerns (e.g., concurrency, transactions, caching, idempotency)?**
   - *"Yes, they asked why my payment checkout route didn't have an Idempotency-Key. I didn't even know what idempotency was. Also, I stored product prices as JavaScript floats (`Number`), and the interviewer pointed out that float math causes rounding leaks in accounting."*
5. **How do you currently figure out what engineering teams at your dream company actually look for?**
   - *"I read random LinkedIn posts and Reddit r/developersIndia threads, but they are too vague. They say 'learn system design' without showing me what's wrong with my actual code."*
6. **When using ChatGPT or Claude, what answers do you get, and why are they insufficient?**
   - *"When I paste my code into ChatGPT and say 'make this production ready', it gives me 50 lines of generic generic advice like 'add Redis cache' or 'use TypeScript', but it doesn't give me the exact diff or explain how Razorpay specifically handles double payments."*

### Direct Student Quotes
- *"Interviewers see MERN e-commerce and immediately tune out because 500 other candidates have the exact same repository."*
- *"I knew how to make the UI look nice, but had zero clue about race conditions or financial ledger math."*

### Core Pain Points Identified
1. **Tutorial Clone Fatigue:** High rejection rate because recruiters immediately recognize generic YouTube tutorial clones.
2. **Fintech Anti-patterns:** Using floating-point currency and missing idempotency keys on payment endpoints.
3. **Concurrency Blindness:** Inability to defend against double-spending or inventory race conditions in technical deep dives.
