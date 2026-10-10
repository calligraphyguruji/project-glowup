import { CompanyId, CompanyProfile } from "@/types/audit";

export const COMPANY_PROFILES: Record<CompanyId, CompanyProfile> = {
  razorpay: {
    id: "razorpay",
    name: "Razorpay",
    domain: "Fintech & Payments Infrastructure",
    tagline: "High-reliability payment processing and financial ledgers.",
    keyConcerns: [
      "Monetary precision (integer cents/paise or Decimal, never Float)",
      "API idempotency guards (Idempotency-Key headers and cache)",
      "Database transaction atomicity (ACID balance updates)",
      "Webhook delivery resilience (signature verification, retries)"
    ],
    sampleAntiPatterns: [
      "Using JavaScript Number/Float for financial calculations",
      "Updating account balances without database transactions or locks",
      "Payment endpoints lacking idempotency keys",
      "Unverified webhook callbacks"
    ]
  },
  swiggy: {
    id: "swiggy",
    name: "Swiggy",
    domain: "Foodtech & Hyperlocal Logistics",
    tagline: "Ultra-low latency ordering, driver tracking, and spatial queries.",
    keyConcerns: [
      "High concurrent order placement without overselling",
      "Geospatial indexing (PostGIS / Redis Geo) for delivery radius",
      "Asynchronous order dispatch via background worker queues",
      "Cache invalidation and degradation fallbacks during flash surges"
    ],
    sampleAntiPatterns: [
      "Unindexed geospatial queries scanning whole tables",
      "Synchronous order routing blocking the main HTTP event loop",
      "Missing rate limiters on promo code or order surge endpoints",
      "Direct DB writes on high-frequency driver ping locations"
    ]
  },
  zerodha: {
    id: "zerodha",
    name: "Zerodha",
    domain: "High-Throughput Financial Trading",
    tagline: "Minimalist, zero-bloat architecture with raw database efficiency.",
    keyConcerns: [
      "Zero speculative dependencies (strict stdlib and native drivers)",
      "Strict connection pooling to prevent DB exhaustion",
      "Low garbage collection pressure and memory predictability",
      "Immutable audit trails and double-entry record keeping"
    ],
    sampleAntiPatterns: [
      "Installing heavy ORMs and bloated helper utility libraries",
      "Unbounded database connection pools crashing under spike loads",
      "In-memory mutations without permanent ledger audit logs",
      "Blocking synchronous HTTP calls inside ticker or order loops"
    ]
  },
  amazon: {
    id: "amazon",
    name: "Amazon",
    domain: "Cloud & Distributed Systems",
    tagline: "Massive scale fault-tolerance, circuit breakers, and telemetry.",
    keyConcerns: [
      "Structured contextual logging (correlation IDs, trace IDs)",
      "Circuit breakers and timeouts on downstream network dependencies",
      "Least-privilege authorization and zero hardcoded secrets",
      "Stateless horizontally-scalable service tiers"
    ],
    sampleAntiPatterns: [
      "Using raw console.log without request tracing context",
      "Unbounded HTTP client requests without timeout configurations",
      "Coupled in-memory session states preventing horizontal scaling",
      "Missing retry backoff on upstream service dependencies"
    ]
  }
};
