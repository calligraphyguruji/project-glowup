"use client";

import React from "react";
import { GitBranch, ShieldCheck, Zap, ArrowRight, Play, Terminal, CheckCircle2, AlertTriangle, Layers } from "lucide-react";

interface LandingHeroProps {
  onAnalyzeClick: () => void;
  onExploreDemo: () => void;
}

export function LandingHero({ onAnalyzeClick, onExploreDemo }: LandingHeroProps) {
  return (
    <section className="relative overflow-hidden pt-4 pb-8 border-b border-[#292A31]">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Editorial Headline & Actions */}
        <div className="lg:col-span-7 flex flex-col gap-4 text-left">
          {/* Category Chip */}
          <div className="inline-flex items-center gap-2 self-start px-2.5 py-1 rounded-full bg-[#17181D] border border-[#292A31] text-[11px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF666B]" />
            <span className="text-[#A3A4AD]">PROBLEM STATEMENT 4 // OPEN INNOVATION</span>
          </div>

          {/* Large Two-line Headline with Coral Accent */}
          <h1 className="font-sans text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#F5F5F6] leading-[1.08]">
            Push to GitHub. <br />
            <span className="text-[#FF666B]">Audit for Scale.</span>
          </h1>

          {/* Supporting Pitch */}
          <p className="font-sans text-sm sm:text-base text-[#A3A4AD] max-w-xl leading-relaxed">
            A developer platform evaluating public repositories against production invariants of
            tier-one tech firms (Razorpay, Swiggy, Zerodha, Amazon). Discovers race conditions, models
            Before/After architecture diffs, and synthesizes runnable load scripts.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={onAnalyzeClick}
              className="px-5 py-2.5 rounded-lg bg-[#FF666B] hover:bg-[#FF8588] text-[#08090B] font-sans font-bold text-sm shadow-[0_0_20px_rgba(255,102,107,0.35)] transition-all flex items-center gap-2 active:scale-95"
            >
              <span>Analyze a Repository</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onExploreDemo}
              className="px-4 py-2.5 rounded-lg bg-[#17181D] hover:bg-[#202127] text-[#F5F5F6] font-sans text-sm font-medium border border-[#292A31] transition-colors flex items-center gap-2"
            >
              <Play className="w-3.5 h-3.5 text-[#FF666B]" />
              <span>Load Preset Demo</span>
            </button>
          </div>

          {/* Compact Feature Chips (Reference Inspired) */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <div className="px-2.5 py-1 rounded-md bg-[#101114] border border-[#292A31] text-[11px] font-mono text-[#A3A4AD] flex items-center gap-1.5">
              <span className="text-[#FF666B]">⚡</span>
              <span>17+ Security Vectors</span>
            </div>
            <div className="px-2.5 py-1 rounded-md bg-[#101114] border border-[#292A31] text-[11px] font-mono text-[#A3A4AD] flex items-center gap-1.5">
              <span className="text-[#45D6A0]">✓</span>
              <span>Mermaid Architecture Diff</span>
            </div>
            <div className="px-2.5 py-1 rounded-md bg-[#101114] border border-[#292A31] text-[11px] font-mono text-[#A3A4AD] flex items-center gap-1.5">
              <span className="text-[#F5BD50]">⛑</span>
              <span>Runnable Stress Harness</span>
            </div>
          </div>
        </div>

        {/* Right Column: Reference-Inspired Live Interactive Mockup Card */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-full max-w-md rounded-2xl bg-[#101114] border border-[#292A31] p-3 shadow-2xl relative overflow-hidden">
            {/* Subtle Coral Ambient Glow */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-[#FF666B]/10 rounded-full blur-2xl pointer-events-none" />

            {/* Mock Header */}
            <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[#292A31] text-xs font-mono">
              <div className="flex items-center gap-2 text-[#F5F5F6]">
                <div className="w-2 h-2 rounded-full bg-[#FF666B]" />
                <span className="font-bold">razorpay / checkout-service</span>
              </div>
              <span className="px-1.5 py-0.5 rounded bg-[#45D6A0]/15 text-[#45D6A0] text-[10px] font-bold">
                AUDIT READY
              </span>
            </div>

            {/* Mini Histogram/Bar Visualization (Echoing Redmonk Weekly Deployments) */}
            <div className="p-3 rounded-xl bg-[#17181D] border border-[#292A31] mb-2.5">
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="text-[#A3A4AD]">Vulnerability Distribution</span>
                <span className="text-[#FF666B] font-bold">8 Vectors</span>
              </div>
              <div className="flex items-end gap-1.5 h-16 pt-2">
                {[20, 45, 85, 30, 60, 40, 95, 25, 50, 70].map((val, idx) => (
                  <div
                    key={idx}
                    className="flex-1 rounded-t flex flex-col justify-end transition-all"
                    style={{ height: `${val}%` }}
                  >
                    <div
                      className={`w-full h-full rounded-t ${
                        idx === 6
                          ? "bg-[#FF666B] shadow-[0_0_8px_rgba(255,102,107,0.6)]"
                          : "bg-[#292A31] hover:bg-[#3E404B]"
                      }`}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[9px] font-mono text-[#747680] mt-1.5">
                <span>W01</span>
                <span>W05</span>
                <span className="text-[#FF666B] font-bold">CRIT</span>
                <span>W10</span>
              </div>
            </div>

            {/* Mock Terminal Snippet */}
            <div className="p-2.5 rounded-lg bg-[#0C0D10] border border-[#292A31] font-mono text-[11px] text-[#A3A4AD] space-y-1">
              <div className="flex items-center justify-between text-[10px] text-[#747680] pb-1 border-b border-[#1F2026]">
                <span>terminal // live ingestion</span>
                <span className="text-[#45D6A0]">100% verified</span>
              </div>
              <div className="text-slate-300">
                <span className="text-[#FF666B]">$</span> pg-audit --target expressjs/express
              </div>
              <div className="text-[#45D6A0] flex items-center gap-1">
                <span>✓ Ingested 15 AST source files</span>
              </div>
              <div className="text-[#F5BD50]">
                <span>! Discovered concurrency race guard flaw</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
