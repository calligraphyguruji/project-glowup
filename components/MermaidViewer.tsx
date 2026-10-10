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
        background: "#101114",
        primaryColor: "#17181D",
        primaryTextColor: "#F5F5F6",
        primaryBorderColor: "#FF666B",
        lineColor: "#FF666B",
        secondaryColor: "#202127",
        tertiaryColor: "#08090B",
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

        <div className="p-0.5 rounded-lg bg-[#17181D] border border-[#292A31] flex items-center font-mono text-[11px]">
          <button
            onClick={() => setActiveTab("diff")}
            className={`px-3 py-1 rounded-md transition-all ${
              activeTab === "diff"
                ? "bg-[#202127] text-[#F5F5F6] font-bold border border-[#292A31] shadow-sm"
                : "text-[#A3A4AD] hover:text-[#F5F5F6]"
            }`}
          >
            SPLIT DIFF
          </button>
          <button
            onClick={() => setActiveTab("target")}
            className={`px-3 py-1 rounded-md transition-all ${
              activeTab === "target"
                ? "bg-[#202127] text-[#F5F5F6] font-bold border border-[#292A31] shadow-sm"
                : "text-[#A3A4AD] hover:text-[#F5F5F6]"
            }`}
          >
            TARGET ONLY
          </button>
          <button
            onClick={() => setActiveTab("current")}
            className={`px-3 py-1 rounded-md transition-all ${
              activeTab === "current"
                ? "bg-[#202127] text-[#F5F5F6] font-bold border border-[#292A31] shadow-sm"
                : "text-[#A3A4AD] hover:text-[#F5F5F6]"
            }`}
          >
            OBSERVED ONLY
          </button>
        </div>
      </div>

      {renderError && (
        <div className="px-3 py-1.5 text-xs rounded bg-[#17181D] text-[#F5BD50] font-mono border border-[#292A31]">
          {renderError}
        </div>
      )}

      {/* Dual Physical Chambers */}
      <div className={`grid gap-3 ${activeTab === "diff" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>
        {/* Observed Flawed Substrate */}
        <div
          className={`rounded-xl bg-[#101114] border border-[#292A31] shadow-sm overflow-hidden ${
            activeTab === "target" ? "hidden" : "block"
          }`}
        >
          <div className="p-3.5 flex flex-col gap-2 h-full">
            <div className="flex items-center justify-between pb-2 border-b border-[#1F2026]">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#FF666B]"></span>
                <span className="font-mono text-[10px] text-[#FF666B] uppercase font-bold tracking-wider">
                  OBSERVED IN SUBMISSION
                </span>
              </div>
              <span className="font-mono text-[10px] text-[#A3A4AD] uppercase">Fragile Direct Coupling</span>
            </div>
            {currentSummary && (
              <p className="font-sans text-xs text-[#A3A4AD] leading-relaxed">{currentSummary}</p>
            )}
            <div
              ref={currentContainerRef}
              className="overflow-x-auto min-h-[160px] flex items-center justify-center text-center p-3 rounded-lg bg-[#0C0D10] border border-[#1F2026] [&_svg]:max-w-full"
            />
          </div>
        </div>

        {/* Target Hardened Production Substrate */}
        <div
          className={`rounded-xl bg-[#101114] border border-[#292A31] shadow-sm overflow-hidden ${
            activeTab === "current" ? "hidden" : "block"
          }`}
        >
          <div className="p-3.5 flex flex-col gap-2 h-full">
            <div className="flex items-center justify-between pb-2 border-b border-[#1F2026]">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#45D6A0]"></span>
                <span className="font-mono text-[10px] text-[#45D6A0] uppercase font-bold tracking-wider">
                  TARGET PRODUCTION TOPOLOGY
                </span>
              </div>
              <span className="font-mono text-[10px] text-[#A3A4AD] uppercase">Idempotent Pipeline</span>
            </div>
            {targetSummary && (
              <p className="font-sans text-xs text-[#A3A4AD] leading-relaxed">{targetSummary}</p>
            )}
            <div
              ref={targetContainerRef}
              className="overflow-x-auto min-h-[160px] flex items-center justify-center text-center p-3 rounded-lg bg-[#0C0D10] border border-[#1F2026] [&_svg]:max-w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
