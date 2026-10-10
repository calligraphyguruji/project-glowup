# Student Interview: #05 (Rohan S.)
- **Date:** 2026-10-05
- **Education:** B.E. Computer Science, Tier-3 College, Final Year
- **Target Role/Domain:** Full Stack Engineering / Early Stage Startups
- **Target Companies:** Razorpay, Swiggy, Dunzo
- **Current Resume Projects:** Real-Time Collaborative Whiteboard, Video Streaming Platform Clone

### Key Discussion Questions & Responses
1. **What technical projects do you currently feature on your resume?**
   - *"A clone of YouTube with video uploading, comments, and views counters built with Node.js and MongoDB."*
2. **How did you choose the tech stack and architectural decisions for those projects?**
   - *"Followed a Udemy tutorial course step-by-step."*
3. **In past technical rounds or resume screenings, what feedback did you receive about your projects?**
   - *"The interviewer looked at how I counted video views: every GET request did `await Video.findByIdAndUpdate(id, { $inc: { views: 1 } })`. He explained that under 50,000 views per minute, direct unbuffered database writes crush the database connection pool."*
4. **Have interviewers grilled you on production concerns (e.g., concurrency, transactions, caching, idempotency)?**
   - *"Yes. He asked: 'How would you defend this design in an interview if asked about write buffering?' I had never considered buffering writes in memory or Redis and flushing asynchronously."*
5. **How do you currently figure out what engineering teams at your dream company actually look for?**
   - *"You only find out when you fail an interview. Recruiters don't give written technical feedback, so you leave the call not knowing which line of code disqualified you."*
6. **When using ChatGPT or Claude, what answers do you get, and why are they insufficient?**
   - *"You don't know what questions to ask ChatGPT. If you don't already know what write-amplification or DB connection saturation is, you won't know to ask about it."*

### Direct Student Quotes
- *"The biggest problem is you don't know what you don't know. Tutorial projects teach you happy path syntax, not production failure modes."*
- *"If a tool showed me: 'Here is your current architecture vs how Razorpay/Swiggy engineers build it', that would change the entire placement preparation game."*

### Core Pain Points Identified
1. **Unbuffered Write Amplification:** Direct DB mutations on high-frequency read/view events.
2. **Knowledge Blindspots:** Students don't know the right questions to ask generic AI tools.
3. **Lack of Before/After Architecture Visualization:** Absence of visual diffs comparing tutorial architecture against production topology.
