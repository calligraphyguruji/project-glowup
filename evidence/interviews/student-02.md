# Student Interview: #02 (Sneha R.)
- **Date:** 2026-09-22
- **Education:** B.E. Information Technology, Tier-3 Engineering College, 4th Year
- **Target Role/Domain:** Systems / Platform Engineering
- **Target Companies:** Swiggy, Zomato, Zepto
- **Current Resume Projects:** Food Delivery App Clone (Next.js + Node.js + MongoDB), Real-Time Chat App (Socket.io)

### Key Discussion Questions & Responses
1. **What technical projects do you currently feature on your resume?**
   - *"A full-stack food delivery application where customers can browse restaurant menus, place orders, and see dummy delivery rider coordinates."*
2. **How did you choose the tech stack and architectural decisions for those projects?**
   - *"I picked Next.js frontend with Express backend and Mongo. Stored restaurant locations as basic latitude and longitude float fields inside the documents."*
3. **In past technical rounds or resume screenings, what feedback did you receive about your projects?**
   - *"In a pre-placement interview, an engineer from Swiggy looked at my restaurant search query: `db.restaurants.find({ city: req.query.city })`. He asked: 'If you have 50,000 restaurants and 2 million active hungry users within a 5 km radius, how does this query perform?' I realized my query was doing an unindexed full collection scan."*
4. **Have interviewers grilled you on production concerns (e.g., concurrency, transactions, caching, idempotency)?**
   - *"Yes. They asked how Swiggy does spatial radius queries. I didn't know about PostGIS GIST indexes or MongoDB 2dsphere indexes. They also asked what happens when 5 delivery partners are assigned the same high-demand order at the same moment."*
5. **How do you currently figure out what engineering teams at your dream company actually look for?**
   - *"I try reading Swiggy Bytes blog posts, but translating a high-level blog post into my personal repository's code diff feels impossible."*
6. **When using ChatGPT or Claude, what answers do you get, and why are they insufficient?**
   - *"Generic LLMs give textbook geospatial formulas (`haversine distance formula in JS`), which actually makes the DB query slower because it calculates distances in Node.js instead of leveraging database spatial indexing!"*

### Direct Student Quotes
- *"I built a food delivery clone without understanding how real food delivery systems filter locations."*
- *"Interviewers don't care about your UI buttons. They look at your database indexes and query latency."*

### Core Pain Points Identified
1. **Geospatial Query Inefficiency:** Calculating distance in application memory instead of spatial database indexes (`ST_DWithin` / `2dsphere`).
2. **Order Assignment Race Conditions:** Lack of distributed locks or database row-level locking during high-concurrency order dispatch.
3. **High-Level Blog Disconnect:** Difficulty translating engineering blogs into practical repository refactors.
