"use client";

import React, { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { GitCompare, CheckCircle2, AlertTriangle } from "lucide-react";

interface MermaidViewerProps {
  currentMermaid: string;
  targetMermaid: string;
  currentSummary?: string;
  targetSummary?: string;
}

export function MermaidViewer({
  currentMermaid,
  targetMermaid,
  currentSummary,
  targetSummary,
}: MermaidViewerProps) {
  const currentContainerRef = useRef<HTMLDivElement>(null);
  const targetContainerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<"diff" | "target" | "current">("diff");
  const [renderError, setRenderError] = useState<string | null>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: "dark",
      themeVariables: {
        darkMode: true,
        background: "#090E19",
        primaryColor: "#171B27",
        primaryTextColor: "#DEE2F2",
        primaryBorderColor: "#00F2FE",
        lineColor: "#00F2FE",
        secondaryColor: "#1B1F2B",
        tertiaryColor: "#090E19",
      },
      securityLevel: "strict",
    });

    const renderDiagrams = async () => {
      try {
        setRenderError(null);
        if (currentContainerRef.current) {
          const id = `mermaid-current-${Date.now()}`;
          const { svg } = await mermaid.render(id, currentMermaid);
          currentContainerRef.current.innerHTML = svg;
        }
        if (targetContainerRef.current) {
          const id = `mermaid-target-${Date.now()}`;
          const { svg } = await mermaid.render(id, targetMermaid);
          targetContainerRef.current.innerHTML = svg;
        }
      } catch (err: unknown) {
        console.warn("Mermaid render warning:", err);
        setRenderError("Rendering simplified diagram topology.");
      }
    };

    renderDiagrams();
  }, [currentMermaid, targetMermaid]);

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitCompare className="w-4 h-4 text-primary-container" />
          <h3 className="font-mono text-sm font-semibold text-slate-100 uppercase tracking-wider">
            Architecture Diff Visualizer
          </h3>
        </div>

        <div className="p-0.5 rounded-lg bg-surface-container-high border border-white/5 flex items-center font-mono text-[11px]">
          <button
            onClick={() => setActiveTab("diff")}
            className={`px-2.5 py-1 rounded transition-colors ${
              activeTab === "diff"
                ? "bg-primary-container text-slate-950 font-bold shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            SPLIT DIFF
          </button>
          <button
            onClick={() => setActiveTab("target")}
            className={`px-2.5 py-1 rounded transition-colors ${
              activeTab === "target"
                ? "bg-primary-container text-slate-950 font-bold shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            TARGET ONLY
          </button>
          <button
            onClick={() => setActiveTab("current")}
            className={`px-2.5 py-1 rounded transition-colors ${
              activeTab === "current"
                ? "bg-primary-container text-slate-950 font-bold shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            OBSERVED ONLY
          </button>
        </div>
      </div>

      {renderError && (
        <div className="px-3 py-1.5 text-xs rounded bg-surface-container-high text-amber-300 font-mono">
          {renderError}
        </div>
      )}

      {/* Dual Physical Chambers */}
      <div className={`grid gap-3 ${activeTab === "diff" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>
        {/* Observed Flawed Substrate */}
        <div
          className={`p-1.5 rounded-xl bg-surface-container-low border border-white/5 shadow-sm ${
            activeTab === "target" ? "hidden" : "block"
          }`}
        >
          <div className="p-3 rounded-lg bg-surface-container-lowest flex flex-col gap-2 h-full">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-error"></span>
                <span className="font-mono text-[10px] text-error uppercase font-bold tracking-wider">
                  OBSERVED IN SUBMISSION
                </span>
              </div>
              <span className="font-mono text-[10px] text-error/80 uppercase">Fragile Direct Coupling</span>
            </div>
            {currentSummary && (
              <p className="font-sans text-xs text-slate-400 leading-relaxed">{currentSummary}</p>
            )}
            <div
              ref={currentContainerRef}
              className="overflow-x-auto min-h-[160px] flex items-center justify-center text-center p-2 rounded bg-surface-container-low/50 [&_svg]:max-w-full"
            />
          </div>
        </div>

        {/* Target Hardened Production Substrate */}
        <div
          className={`p-1.5 rounded-xl bg-surface-container-low border border-white/5 shadow-sm ${
            activeTab === "current" ? "hidden" : "block"
          }`}
        >
          <div className="p-3 rounded-lg bg-surface-container-lowest flex flex-col gap-2 h-full">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-tertiary-container shadow-[0_0_6px_rgba(55,248,170,0.6)]"></span>
                <span className="font-mono text-[10px] text-tertiary-container uppercase font-bold tracking-wider">
                  TARGET PRODUCTION TOPOLOGY
                </span>
              </div>
              <span className="font-mono text-[10px] text-tertiary-container/80 uppercase">Idempotent Pipeline</span>
            </div>
            {targetSummary && (
              <p className="font-sans text-xs text-slate-400 leading-relaxed">{targetSummary}</p>
            )}
            <div
              ref={targetContainerRef}
              className="overflow-x-auto min-h-[160px] flex items-center justify-center text-center p-2 rounded bg-surface-container-low/50 [&_svg]:max-w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
