"use client";

import React from "react";
import { ArrowRight, Play, CheckCircle2, TrendingUp, Sparkles, Activity, PieChart } from "lucide-react";

interface LandingHeroProps {
  onAnalyzeClick: () => void;
  onExploreDemo: () => void;
}

export function LandingHero({ onAnalyzeClick, onExploreDemo }: LandingHeroProps) {
  return (
    <section className="relative overflow-hidden pt-4 pb-12 border-b border-[#222730]">
      <div className="max-w-6xl mx-auto px-4 flex flex-col items-center text-center">
        {/* Top Category Badge Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#13171D] border border-[#222730] text-xs font-mono text-[#A3A4AD] mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#A3E635] shadow-[0_0_8px_#A3E635]" />
          <span>Personal &amp; client use</span>
        </div>

        {/* Editorial Scrolltide Headline */}
        <h1 className="font-sans text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#F5F5F6] leading-[1.08] max-w-4xl">
          Smarter <span className="text-[#A3E635]">Systems</span>, <br />
          Backed by <span className="text-[#A3E635]">Real Numbers</span>
        </h1>

        {/* Supporting Subtitle */}
        <p className="mt-5 font-sans text-base sm:text-lg text-[#A3A4AD] max-w-2xl leading-relaxed">
          Production audit intelligence for student &amp; portfolio repositories. Discover race conditions,
          compare architecture diffs, and generate live load scripts before tier-one interviews.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-7">
          <button
            onClick={onAnalyzeClick}
            className="px-6 py-3 rounded-full bg-[#A3E635] hover:bg-[#bef264] text-[#07080A] font-sans font-bold text-sm shadow-[0_0_25px_rgba(163,230,53,0.35)] transition-all flex items-center gap-2 active:scale-95"
          >
            <span>Analyze a Repository</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>

          <button
            onClick={onExploreDemo}
            className="px-5 py-3 rounded-full bg-[#13171D] hover:bg-[#1C222B] text-[#F5F5F6] font-sans text-sm font-medium border border-[#222730] transition-colors flex items-center gap-2"
          >
            <Play className="w-3.5 h-3.5 text-[#A3E635] fill-[#A3E635]" />
            <span>Load Preset Demo</span>
          </button>
        </div>

        {/* The 3 Scrolltide Bento Metric Cards (Matching Screenshot) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-5xl mt-12 text-left">
          
          {/* Card 1: Vibrant Lime Hero Card */}
          <div className="rounded-3xl bg-gradient-to-b from-[#A3E635] to-[#84CC16] p-6 text-[#07080A] flex flex-col justify-between shadow-[0_10px_35px_rgba(163,230,53,0.2)] min-h-[300px]">
            <div>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#07080A]/70">
                Key Performance
              </span>
              <div className="text-4xl sm:text-5xl font-black tracking-tight mt-2 text-[#07080A]">
                100%
              </div>
              <p className="text-xs font-medium text-[#07080A]/80 mt-1 leading-snug">
                Verified repository AST inspection without mock data or fabricated metrics.
              </p>
            </div>

            {/* Stylized Dark Bar Chart on Lime Background */}
            <div className="pt-6">
              <div className="flex items-end gap-2 h-24">
                {[35, 55, 40, 75, 90, 60, 100].map((height, i) => (
                  <div key={i} className="flex-1 flex flex-col justify-end h-full">
                    <div
                      className={`w-full rounded-t-md transition-all ${
                        i === 6
                          ? "bg-[#07080A]"
                          : i === 4
                          ? "bg-[#07080A]/80"
                          : "bg-[#07080A]/40"
                      }`}
                      style={{ height: `${height}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-mono text-[10px] text-[#07080A]/70 mt-2 font-semibold">
                <span>Mon</span>
                <span>Wed</span>
                <span>Sun</span>
              </div>
            </div>
          </div>

          {/* Card 2: Dark Metric Card with Donut / Breakdown Chart */}
          <div className="rounded-3xl bg-[#0E1116] border border-[#222730] p-6 flex flex-col justify-between shadow-xl min-h-[300px]">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#A3A4AD]">
                  Production Invariants
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#13171D] text-[#A3E635] border border-[#A3E635]/30">
                  Tier-1
                </span>
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-2 text-[#F5F5F6]">
                17+ <span className="text-lg font-medium text-[#747680]">Vectors</span>
              </div>
              <p className="text-xs text-[#747680] mt-1 leading-snug">
                Concurrency idempotency, spatial GIS indexing, distributed locks &amp; atomic guards.
              </p>
            </div>

            {/* Donut Chart Visual Representation */}
            <div className="pt-4 flex items-center justify-between">
              {/* SVG Donut */}
              <div className="relative w-24 h-24 shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  {/* Background Track */}
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke="#1C222B"
                    strokeWidth="3.5"
                  />
                  {/* Active Lime Progress Arc */}
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke="#A3E635"
                    strokeWidth="3.5"
                    strokeDasharray="88, 100"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center font-mono text-[10px]">
                  <span className="text-[#A3E635] font-bold">88%</span>
                </div>
              </div>

              {/* Donut Legend */}
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#A3E635]" />
                  <span className="text-[#F5F5F6] font-semibold">Live Pass</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#1C222B]" />
                  <span className="text-[#747680]">In Audit</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Dark Metric Card with Stepped Line Visual */}
          <div className="rounded-3xl bg-[#0E1116] border border-[#222730] p-6 flex flex-col justify-between shadow-xl min-h-[300px]">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#A3A4AD]">
                  Concurrency Benchmark
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#13171D] text-[#A3A4AD] border border-[#222730]">
                  autocannon
                </span>
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-2 text-[#F5F5F6]">
                5,000 <span className="text-lg font-medium text-[#747680]">req/sec</span>
              </div>
              <p className="text-xs text-[#747680] mt-1 leading-snug">
                Simulated spike loads with idempotency keys and race condition detection.
              </p>
            </div>

            {/* Stepped / Sparkline Line Chart Visual */}
            <div className="pt-4">
              <div className="h-20 w-full flex items-end">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 200 60" fill="none">
                  <defs>
                    <linearGradient id="limeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#A3E635" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#A3E635" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {/* Area fill */}
                  <path
                    d="M 0 50 L 30 45 L 60 48 L 90 30 L 120 32 L 150 15 L 180 18 L 200 5 L 200 60 L 0 60 Z"
                    fill="url(#limeGradient)"
                  />
                  {/* Stepped stroke */}
                  <path
                    d="M 0 50 L 30 45 L 60 48 L 90 30 L 120 32 L 150 15 L 180 18 L 200 5"
                    stroke="#A3E635"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Data dot on peak */}
                  <circle cx="200" cy="5" r="3.5" fill="#A3E635" className="animate-ping opacity-75" />
                  <circle cx="200" cy="5" r="3" fill="#A3E635" />
                </svg>
              </div>
              <div className="flex justify-between font-mono text-[10px] text-[#747680] mt-2">
                <span>0 rps</span>
                <span>2,500 rps</span>
                <span className="text-[#A3E635] font-semibold">5,000 rps</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
