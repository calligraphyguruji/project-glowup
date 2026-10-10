"use client";

import React, { useState } from "react";
import { Sparkles, AlertCircle } from "lucide-react";
import { AuditForm } from "@/components/AuditForm";
import { FindingsView } from "@/components/FindingsView";
import { MetricsOverview } from "@/components/MetricsOverview";
import { MermaidViewer } from "@/components/MermaidViewer";
import { TestScriptSandbox } from "@/components/TestScriptSandbox";
import { InterviewDefense } from "@/components/InterviewDefense";
import { ProgressTerminal } from "@/components/ProgressTerminal";
import { AuditResponse, CompanyId } from "@/types/audit";

export default function Home() {
  const [auditData, setAuditData] = useState<AuditResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState<string>("");

  const handleAudit = async (repoUrl: string, companyId: CompanyId) => {
    setIsLoading(true);
    setErrorMessage(null);
    setLoadingStep("Connecting to repository & inspecting file tree...");

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl, companyId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error?.message || "Failed to audit repository.");
      }

      setAuditData(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
      setLoadingStep("");
    }
  };

  return (
    <main className="min-h-screen px-4 py-10 max-w-6xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-950/20 text-cyan-400 text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Hackathon Track: Problem Statement 4 — Open Innovation</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
          ProjectGlowUp <span className="text-cyan-400">AI</span>
        </h1>

        <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          Transform generic student tutorial clones into production-grade systems demanded by top tech companies. Real code evidence, interactive architecture diffs, and runnable concurrency tests.
        </p>
      </div>

      {/* Input Form */}
      <AuditForm onAudit={handleAudit} isLoading={isLoading} />

      {/* Terminal Progress State */}
      <ProgressTerminal isLoading={isLoading} />

      {/* Error Banner */}
      {errorMessage && (
        <div className="rounded-xl border border-red-900/50 bg-red-950/20 p-5 flex items-start gap-3 text-red-300 font-mono text-xs">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-sm mb-1">Audit Failed</span>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Audit Report View */}
      {auditData && !isLoading && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Overview Strip */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-sm">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-100 font-mono">
                  {auditData.repoSummary.owner}/{auditData.repoSummary.repo}
                </h2>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800/40">
                  {auditData.companyProfile.name}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Audited {auditData.repoSummary.filesIngested} key architectural files against {auditData.companyProfile.domain} standards.
              </p>
            </div>

            <div className="flex items-center gap-6 self-start sm:self-auto font-mono">
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Production Readiness</span>
                <span className={`text-2xl font-black ${auditData.overallScore >= 70 ? "text-emerald-400" : "text-amber-400"}`}>
                  {auditData.overallScore}/100
                </span>
              </div>
            </div>
          </div>

          {/* High-Density Metrics Overview */}
          <MetricsOverview audit={auditData} />

          {/* Core Findings */}
          <FindingsView findings={auditData.findings} />

          {/* Architecture Diff */}
          <MermaidViewer
            currentMermaid={auditData.architectureComparison.currentMermaid}
            targetMermaid={auditData.architectureComparison.targetMermaid}
            currentSummary={auditData.architectureComparison.currentSummary}
            targetSummary={auditData.architectureComparison.targetSummary}
          />

          {/* Concurrency Test Harness */}
          <TestScriptSandbox script={auditData.stressTestScript} />

          {/* Interview Defense */}
          <InterviewDefense
            items={auditData.interviewDefense}
            companyName={auditData.companyProfile.name}
          />
        </div>
      )}
    </main>
  );
}
