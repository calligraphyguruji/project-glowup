"use client";

import React, { useEffect, useState } from "react";
import { Terminal, CheckCircle2, Loader2 } from "lucide-react";

interface ProgressTerminalProps {
  isLoading: boolean;
}

const AUDIT_STAGES = [
  "Connecting to repository & validating SSRF bounds...",
  "Ingesting repository tree & scoring architectural core files...",
  "Scanning static rules: currency types, idempotency keys, geo-indexes...",
  "Running vulnerability & secret leakage detection...",
  "Synthesizing domain rubric via Google Gemini Flash...",
  "Generating Before/After Mermaid.js architecture topology...",
  "Assembling runnable concurrency race-condition test harness...",
  "Finalizing technical interview defense drill...",
];

export function ProgressTerminal({ isLoading }: ProgressTerminalProps) {
  const [currentStageIdx, setCurrentStageIdx] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setCurrentStageIdx(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStageIdx((prev) => (prev < AUDIT_STAGES.length - 1 ? prev + 1 : prev));
    }, 1800);

    return () => clearInterval(interval);
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className="rounded-xl border border-cyan-900/60 bg-slate-950/90 p-5 font-mono shadow-2xl backdrop-blur-md">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-slate-200">PROJECTGLOWUP PIPELINE TERMINAL</span>
        </div>
        <span className="text-[11px] text-cyan-400/80 animate-pulse">PROCESSING LIVE</span>
      </div>

      <div className="mt-4 space-y-2 text-xs">
        {AUDIT_STAGES.slice(0, currentStageIdx + 1).map((stage, idx) => {
          const isCurrent = idx === currentStageIdx;
          return (
            <div
              key={idx}
              className={`flex items-start gap-2.5 transition-opacity ${
                isCurrent ? "text-cyan-300 font-semibold" : "text-slate-400"
              }`}
            >
              {isCurrent ? (
                <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin mt-0.5 flex-shrink-0" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
              )}
              <span className="font-mono">{stage}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
