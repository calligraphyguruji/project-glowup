"use client";

import React, { useState } from "react";
import { AlertCircle, Terminal, Cpu, ShieldCheck } from "lucide-react";
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

  const handleAudit = async (params: {
    repoUrl: string;
    companyId?: CompanyId;
    customCompany?: import("@/types/audit").CompanyProfile;
    roleId?: string;
    customRole?: import("@/types/audit").TargetRole;
  }) => {
    setIsLoading(true);
    setErrorMessage(null);
    setAuditData(null); // Prevent stale state leakage between consecutive repository audits

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
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
    }
  };

  return (
    <div className="min-h-screen bg-surface text-slate-100 flex flex-col font-sans">
      {/* Stitch Fixed Header / Telemetry Bar */}
      <header className="sticky top-0 w-full z-50 bg-surface-container-lowest/90 backdrop-blur-xl border-b border-white/5 shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-surface-container-high border border-white/10 flex items-center justify-center font-mono font-bold text-primary-container text-xs shadow-inner">
              PG
            </div>
            <div className="flex flex-col">
              <span className="font-mono font-bold text-sm text-primary tracking-tight leading-none">
                ProjectGlowUp AI
              </span>
              <span className="font-mono text-[10px] text-slate-400 mt-0.5">
                AST ENGINE v4.8 // TELEMETRY: LIVE
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="w-2 h-2 rounded-full bg-tertiary-container animate-pulse"></span>
            <span className="text-tertiary-container uppercase font-semibold">
              SYSTEM: OPERATIONAL
            </span>
          </div>
        </div>
      </header>

      {/* Main Workbench Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 space-y-7">
        {/* Editorial Hero Banner */}
        <section className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 self-start px-2.5 py-1 rounded-full bg-surface-container-high/80 border border-white/5 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary-container animate-ping"></span>
            <span className="font-mono text-[10px] text-slate-300 uppercase tracking-wider font-semibold">
              PS-4: Open Innovation // System Evaluation Engine
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mt-1">
            <h1 className="font-sans text-3xl sm:text-4xl font-extrabold tracking-tight text-primary">
              PROJECTGLOWUP <span className="text-primary-container text-2xl font-mono">AI</span>
            </h1>
            <span className="font-mono text-xs text-slate-400 uppercase">
              Target Tech: Razorpay · Swiggy · Zerodha · Amazon
            </span>
          </div>

          <p className="font-sans text-sm text-slate-400 max-w-3xl leading-relaxed">
            Evaluating candidate codebases against production engineering invariants. Identifies tutorial-clone anti-patterns, models Before/After system topologies, and generates runnable concurrency stress harnesses.
          </p>
        </section>

        {/* Command Deck: Ingestion Chassis & Invariant Matrix */}
        <AuditForm onAudit={handleAudit} isLoading={isLoading} />

        {/* Live Terminal In-Flight State */}
        <ProgressTerminal isLoading={isLoading} />

        {/* Error Banner */}
        {errorMessage && (
          <div className="p-1 rounded-xl bg-error/20 border border-error/40 font-mono text-xs">
            <div className="p-3 rounded-lg bg-surface-container-lowest flex items-start gap-2.5 text-error">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block uppercase tracking-wider">Ingestion Error</span>
                <p className="mt-0.5 text-slate-300">{errorMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Audit Report View */}
        {auditData && !isLoading && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Top Overview Strip */}
            <div className="p-1.5 rounded-xl bg-surface-container-low border border-white/5 shadow-sm">
              <div className="p-4 rounded-lg bg-surface-container-lowest flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-mono text-lg font-bold text-slate-100">
                      {auditData.repoSummary.owner}/{auditData.repoSummary.repo}
                    </h2>
                    <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-primary-container/20 text-primary-container border border-primary-container/30 uppercase font-semibold">
                      {auditData.companyProfile.name}
                    </span>
                    {auditData.targetRole && (
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-secondary-container/20 text-secondary-container border border-secondary-container/30 uppercase font-semibold">
                        {auditData.targetRole.title} ({auditData.targetRole.experienceLevel})
                      </span>
                    )}
                  </div>
                  <p className="font-sans text-xs text-slate-400 mt-1">
                    Audited {auditData.repoSummary.filesIngested} key architectural files against {auditData.companyProfile.domain} invariants
                    {auditData.targetRole ? ` calibrated for ${auditData.targetRole.title}` : ""}.
                  </p>
                </div>

                <div className="font-mono text-right shrink-0">
                  <span className="text-[10px] text-slate-500 uppercase block tracking-wider">Production Score</span>
                  <span className={`text-2xl font-black ${auditData.overallScore >= 70 ? "text-tertiary-container" : "text-error"}`}>
                    {auditData.overallScore} / 100
                  </span>
                </div>
              </div>
            </div>

            {/* High-Density Telemetry Bar */}
            <MetricsOverview audit={auditData} />

            {/* Architecture Diff */}
            <MermaidViewer
              currentMermaid={auditData.architectureComparison.currentMermaid}
              targetMermaid={auditData.architectureComparison.targetMermaid}
              currentSummary={auditData.architectureComparison.currentSummary}
              targetSummary={auditData.architectureComparison.targetSummary}
            />

            {/* Vulnerability Dossier */}
            <FindingsView key={auditData.generatedAt} findings={auditData.findings} />

            {/* Concurrency Test Harness */}
            <TestScriptSandbox script={auditData.stressTestScript} />

            {/* Senior Interview Defense Chamber */}
            <InterviewDefense
              items={auditData.interviewDefense}
              companyName={auditData.companyProfile.name}
            />
          </div>
        )}
      </main>
    </div>
  );
}
