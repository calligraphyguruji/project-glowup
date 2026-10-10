import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimiter";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface InspectCompanyResult {
  domain: string;
  tagline: string;
  keyConcerns: string[];
  website?: string;
}

export async function POST(req: NextRequest) {
  try {
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    const rateCheck = checkRateLimit(clientIp);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Rate limit reached. Please retry in a few seconds." },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null);
    const companyName = typeof body?.companyName === "string" ? body.companyName.trim() : "";
    const website = typeof body?.website === "string" ? body.website.trim() : "";

    if (!companyName) {
      return NextResponse.json(
        { error: "Missing required 'companyName' parameter." },
        { status: 400 }
      );
    }

    let fetchedWebText = "";
    let webSourceCitation = "";

    // 1. Direct Web Inspection: If website URL provided, fetch and extract public text
    if (website && (website.startsWith("http://") || website.startsWith("https://"))) {
      try {
        const parsed = new URL(website);
        if (parsed.hostname !== "localhost" && parsed.hostname !== "127.0.0.1") {
          const res = await fetch(parsed.href, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              "Accept": "text/html,application/xhtml+xml,text/plain",
            },
            signal: AbortSignal.timeout(6000),
            cache: "no-store",
          });

          if (res.ok) {
            const html = await res.text();
            const cleanText = html
              .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
              .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
              .replace(/<[^>]+>/g, " ")
              .replace(/\s+/g, " ")
              .trim();
            fetchedWebText = cleanText.slice(0, 3000);
            webSourceCitation = parsed.hostname;
          }
        }
      } catch (e) {
        console.warn("Website crawl skipped or failed:", e);
      }
    }

    // 2. Browser Search: If no website or need domain context, query public web knowledge
    if (!fetchedWebText) {
      try {
        const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(companyName + " software company")}&format=json`;
        const searchRes = await fetch(searchUrl, {
          headers: { "User-Agent": "ProjectGlowUp-CompanyInspector/1.0" },
          signal: AbortSignal.timeout(5000),
          cache: "no-store",
        });

        if (searchRes.ok) {
          const searchData = await searchRes.json();
          const firstResult = searchData?.query?.search?.[0];
          if (firstResult?.title) {
            const extractUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=1&explaintext=1&titles=${encodeURIComponent(firstResult.title)}&format=json`;
            const extractRes = await fetch(extractUrl, {
              headers: { "User-Agent": "ProjectGlowUp-CompanyInspector/1.0" },
              signal: AbortSignal.timeout(5000),
              cache: "no-store",
            });
            if (extractRes.ok) {
              const extractData = await extractRes.json();
              const pages = extractData?.query?.pages || {};
              const pageKey = Object.keys(pages)[0];
              if (pageKey && pages[pageKey]?.extract) {
                fetchedWebText = pages[pageKey].extract.slice(0, 3000);
                webSourceCitation = `Wikipedia: ${firstResult.title}`;
              }
            }
          }
        }
      } catch (e) {
        console.warn("Web search query failed:", e);
      }
    }

    // 2. Query Gemini if API key is active
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "your_gemini_api_key_here") {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2,
          },
        });

        const prompt = `
You are a Principal Systems Architect. Inspect the engineering requirements, architectural standards, tech stack expectations, and production concerns for company "${companyName}".
${website ? `Official Website: ${website}` : ""}
${fetchedWebText ? `Website Page Content Excerpt: ${fetchedWebText}` : ""}

Extract and return JSON with:
{
  "domain": string (e.g. "Distributed Fintech / Payment Infrastructure", "Autonomous Robotics", "Cloud Infrastructure"),
  "tagline": string (e.g. "High-throughput real-time payment gateway"),
  "keyConcerns": [string] (4-5 critical engineering invariants, e.g. ["Idempotency guards on payment endpoints", "Strict ACID balance deductions", "Sub-10ms P99 latency", "Zero packet loss"])
}
`;
        const aiRes = await model.generateContent(prompt);
        const parsed: InspectCompanyResult = JSON.parse(aiRes.response.text());
        return NextResponse.json({
          domain: parsed.domain || "Technology / Platform",
          tagline: parsed.tagline || "High Performance Architecture",
          keyConcerns: Array.isArray(parsed.keyConcerns) && parsed.keyConcerns.length > 0
            ? parsed.keyConcerns
            : ["Concurrency safety", "High availability", "Zero data loss", "Strict idempotency"],
          website: website || undefined,
        });
      } catch (err) {
        console.warn("Gemini inspect failed, using heuristic analysis:", err);
      }
    }

    // 3. Fallback Heuristic Inspection Engine (Domain-Aware Rulebase)
    const lower = companyName.toLowerCase();
    let domain = "Technology / Platform";
    let tagline = "High Availability & Distributed Architecture";
    let keyConcerns = [
      "Concurrency & race condition prevention",
      "Stateless horizontal scaling",
      "Robust exception handling & structured telemetry",
      "Zero unhandled promise rejections"
    ];

    if (lower.includes("pay") || lower.includes("fintech") || lower.includes("stripe") || lower.includes("bank") || lower.includes("wallet")) {
      domain = "Distributed Fintech / Payment Gateway";
      tagline = "Double-entry bookkeeping & zero floating-point ledger accuracy";
      keyConcerns = [
        "Strict idempotency keys on payment intents",
        "Atomic ACID ledger balance mutations",
        "Integer cents / monetary decimal precision",
        "Sub-15ms P99 transaction latency"
      ];
    } else if (lower.includes("uber") || lower.includes("swiggy") || lower.includes("zomato") || lower.includes("delivery") || lower.includes("logistics")) {
      domain = "Hyperlocal Dispatch & Geo-Distributed Routing";
      tagline = "Sub-second geospatial matchmaking & real-time telemetry streaming";
      keyConcerns = [
        "2D spatial indexing (H3 / S2 / PostGIS) on GPS coordinates",
        "Dead-letter retry queues on order state machine transitions",
        "High-throughput WebSocket order status streaming",
        "Idempotent driver assignment locks"
      ];
    } else if (lower.includes("zerodha") || lower.includes("robinhood") || lower.includes("crypto") || lower.includes("trade") || lower.includes("exchange")) {
      domain = "Ultra-Low Latency Brokerage & Order Matching Engine";
      tagline = "Deterministic state machine execution & lock-free order books";
      keyConcerns = [
        "Single-threaded ring buffers (LMAX Disruptor pattern) for sub-ms matching",
        "Lock-free memory structures with zero garbage collection pauses",
        "WebSocket market tick broadcast backpressure controls",
        "Strict non-blocking socket I/O"
      ];
    } else if (lower.includes("ai") || lower.includes("openai") || lower.includes("anthropic") || lower.includes("deepmind") || lower.includes("llm")) {
      domain = "AI Systems & Large Language Model Infrastructure";
      tagline = "High-throughput token streaming & GPU inference orchestration";
      keyConcerns = [
        "SSE streaming backpressure & memory buffer bounding",
        "Dynamic rate limiting & token bucket tiering",
        "Vector embedding semantic cache deduplication",
        "Fault-tolerant multi-provider fallback circuit breakers"
      ];
    } else if (lower.includes("cloud") || lower.includes("devops") || lower.includes("infra") || lower.includes("docker") || lower.includes("kube")) {
      domain = "Cloud Platform & Distributed Systems Infrastructure";
      tagline = "Resilient multi-region clustering & declarative reconciliation";
      keyConcerns = [
        "Declarative reconciliation loop stability",
        "Zero-downtime rolling deployment health probes",
        "Distributed consensus (Raft/etcd) leader election guards",
        "Strict mTLS service mesh authentication"
      ];
    }

    return NextResponse.json({
      domain,
      tagline,
      keyConcerns,
      website: website || undefined,
      sourceCitation: webSourceCitation || "Domain Intelligence Engine",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Inspection failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
