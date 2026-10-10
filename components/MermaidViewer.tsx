"use client";

import React, { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

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
  const [activeTab, setActiveTab] = useState<"target" | "current" | "diff">("diff");
  const [renderError, setRenderError] = useState<string | null>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: "dark",
      themeVariables: {
        darkMode: true,
        background: "#0F172A",
        primaryColor: "#0E7490",
        primaryTextColor: "#F8FAFC",
        primaryBorderColor: "#06B6D4",
        lineColor: "#38BDF8",
        secondaryColor: "#1E293B",
        tertiaryColor: "#0F172A",
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
        setRenderError("Rendering simplified diagram view.");
      }
    };

    renderDiagrams();
  }, [currentMermaid, targetMermaid]);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            System Architecture Diff (Mermaid.js)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Comparing observed codebase structure against company-hardened production design.
          </p>
        </div>

        <div className="inline-flex rounded-lg border border-slate-800 bg-slate-950 p-1 text-xs font-mono">
          <button
            onClick={() => setActiveTab("diff")}
            className={`px-3 py-1 rounded-md transition-colors ${
              activeTab === "diff" ? "bg-cyan-950 text-cyan-400 font-semibold border border-cyan-800/40" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Split Diff
          </button>
          <button
            onClick={() => setActiveTab("target")}
            className={`px-3 py-1 rounded-md transition-colors ${
              activeTab === "target" ? "bg-cyan-950 text-cyan-400 font-semibold border border-cyan-800/40" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Target Only
          </button>
          <button
            onClick={() => setActiveTab("current")}
            className={`px-3 py-1 rounded-md transition-colors ${
              activeTab === "current" ? "bg-cyan-950 text-cyan-400 font-semibold border border-cyan-800/40" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Current Only
          </button>
        </div>
      </div>

      {renderError && (
        <div className="mt-3 px-3 py-2 text-xs rounded border border-amber-800/40 bg-amber-950/20 text-amber-300">
          {renderError}
        </div>
      )}

      <div className={`mt-5 grid gap-5 ${activeTab === "diff" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>
        <div className={`rounded-lg border border-red-950/40 bg-slate-950/80 p-4 ${activeTab === "target" ? "hidden" : "block"}`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <span className="text-xs font-mono uppercase tracking-wider text-red-400 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              Observed Architecture (Tutorial Clone)
            </span>
          </div>
          {currentSummary && (
            <p className="text-xs text-slate-400 mt-2 mb-3 leading-relaxed">{currentSummary}</p>
          )}
          <div
            ref={currentContainerRef}
            className="overflow-x-auto min-h-[180px] flex items-center justify-center text-center [&_svg]:max-w-full"
          />
        </div>

        <div className={`rounded-lg border border-emerald-950/40 bg-slate-950/80 p-4 ${activeTab === "current" ? "hidden" : "block"}`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Target Hardened Architecture (Production)
            </span>
          </div>
          {targetSummary && (
            <p className="text-xs text-slate-400 mt-2 mb-3 leading-relaxed">{targetSummary}</p>
          )}
          <div
            ref={targetContainerRef}
            className="overflow-x-auto min-h-[180px] flex items-center justify-center text-center [&_svg]:max-w-full"
          />
        </div>
      </div>
    </div>
  );
}
