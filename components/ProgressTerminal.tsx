"use client";

import React, { useEffect, useState } from "react";
import { Terminal, CheckCircle2, Loader2 } from "lucide-react";

interface ProgressTerminalProps {
  isLoading: boolean;
}

const AUDIT_STAGES = [
  { label: "[01/08] SSRF boundary & traversal verification...", tag: "[VALID]", error: false },
  { label: "[02/08] Tree ingestor scoring schemas & API models...", tag: "[10 FILES]", error: false },
  { label: "[03/08] AST static scan: float currency, locks...", tag: "[DETECTING]", error: false },
  { label: "[04/08] Security & secret exposure analysis...", tag: "[SCANNED]", error: false },
  { label: "[05/08] Google Gemini Flash synthesizing domain rubric...", tag: "[ONLINE]", error: false },
  { label: "[06/08] Generating Before/After Mermaid.js topology...", tag: "[GRAPH TD]", error: false },
  { label: "[07/08] Assembling runnable concurrency exploit harness...", tag: "[GEN]", error: false },
  { label: "[08/08] Finalizing technical interview defense drill...", tag: "[READY]", error: false },
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
    }, 1600);

    return () => clearInterval(interval);
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className="rounded-xl bg-surface-container-lowest p-1 shadow-2xl border border-white/5 font-mono">
      {/* Monospace Terminal Header */}
      <div className="px-3 py-2 flex items-center justify-between bg-surface-container-high rounded-t-lg border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-error"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-secondary-fixed"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-tertiary-container"></span>
          <span className="text-xs text-slate-300 font-semibold ml-1">AST_SYNTHESIZER_V4.LOG</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-ping"></span>
          <span className="text-[10px] text-primary-container uppercase tracking-wider font-bold">
            EXEC: RUNNING
          </span>
        </div>
      </div>

      {/* Console Body */}
      <div className="p-3 text-xs flex flex-col gap-2 bg-surface-container-lowest text-slate-400">
        {AUDIT_STAGES.slice(0, currentStageIdx + 1).map((stage, idx) => {
          const isCurrent = idx === currentStageIdx;
          return (
            <div
              key={idx}
              className={`flex items-center justify-between transition-opacity ${
                isCurrent ? "text-primary-container font-semibold" : "text-slate-300"
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                {isCurrent ? (
                  <Loader2 className="w-3.5 h-3.5 text-primary-container animate-spin shrink-0" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-tertiary-container shrink-0" />
                )}
                <span className="truncate">{stage.label}</span>
              </div>
              <span className={`text-[11px] font-mono shrink-0 ml-2 ${isCurrent ? "text-primary-container" : "text-tertiary-container"}`}>
                {stage.tag}
              </span>
            </div>
          );
        })}

        <div className="flex items-center gap-1 text-primary-container pt-1 text-[11px]">
          <span>&gt; awaiting AST mutation harness synthesis</span>
          <span className="inline-block w-1.5 h-3.5 bg-primary-container animate-pulse"></span>
        </div>
      </div>
    </div>
  );
}
