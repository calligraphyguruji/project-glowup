"use client";

import React, { useState, useRef } from "react";
import { AlertCircle, Terminal, Cpu, ShieldCheck, Bell, Search, Activity, GitBranch, ArrowUpRight } from "lucide-react";
import { AppSidebar, NavTabId } from "@/components/AppSidebar";
import { LandingHero } from "@/components/LandingHero";
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
  const [activeTab, setActiveTab] = useState<NavTabId>("overview");

  const auditSectionRef = useRef<HTMLDivElement>(null);

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
      // Auto-switch to overview when audit finishes
      setActiveTab("overview");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToAudit = () => {
    if (auditSectionRef.current) {
      auditSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const criticalFindingsCount =
    auditData?.findings?.filter((f) => f.severity === "critical").length || 0;
  const totalFindingsCount = auditData?.findings?.length || 0;

  const repoContext = auditData?.repoSummary
    ? {
        owner: auditData.repoSummary.owner,
        repo: auditData.repoSummary.repo,
      }
    : null;

  return (
    <div className="min-h-screen bg-[#07080A] text-[#F5F5F6] flex font-sans antialiased selection:bg-[#A3E635]/20 selection:text-[#A3E635]">
      {/* Persistent App Sidebar */}
      <AppSidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === "overview") {
            const targetEl = document.getElementById("section-overview");
            if (targetEl) {
              targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
            } else {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          } else if (tab === "analysis") {
            const targetEl = document.getElementById("section-analysis");
            if (targetEl) {
              targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
            }
          } else if (auditData) {
            const targetEl = document.getElementById(`section-${tab}`);
            if (targetEl) {
              targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
            }
          }
        }}
        findingsCount={totalFindingsCount}
        criticalCount={criticalFindingsCount}
        repoContext={repoContext}
      />

      {/* Main Workbench Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Developer Bar (Matching Scrolltide Reference) */}
        <header className="sticky top-0 z-30 h-14 bg-[#0E1116]/90 backdrop-blur-md border-b border-[#222730] px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-[#A3A4AD]">WORKSPACE</span>
              <span className="text-[#747680]">/</span>
              <span className="text-[#F5F5F6] font-semibold">
                {repoContext ? `${repoContext.owner}/${repoContext.repo}` : "ENGINEERING AUDITOR"}
              </span>
            </div>

            {auditData && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-[#13171D] border border-[#222730] text-[#A3A4AD]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#A3E635]" />
                {auditData.companyProfile.name} Invariants
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#13171D] border border-[#222730] font-mono text-[11px] text-[#A3A4AD]">
              <span className="w-2 h-2 rounded-full bg-[#A3E635] shadow-[0_0_8px_#A3E635]" />
              <span className="hidden sm:inline">AST ENGINE:</span>
              <span className="text-[#A3E635] font-semibold">OPERATIONAL</span>
            </div>

            <a
              href="https://github.com/calligraphyguruji/project-glowup"
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg bg-[#13171D] hover:bg-[#1C222B] text-[#A3A4AD] hover:text-[#F5F5F6] border border-[#222730] transition-colors flex items-center gap-1 text-xs font-mono"
            >
              <GitBranch className="w-3.5 h-3.5 text-[#A3E635]" />
              <span className="hidden md:inline">v4.9</span>
            </a>
          </div>
        </header>

        {/* Scrollable Main Workbench Content */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-8 space-y-8 max-w-7xl w-full mx-auto">
          {/* Landing Editorial Hero (Shown on initial state or when no audit loaded) */}
          {!auditData && !isLoading && (
            <LandingHero
              onAnalyzeClick={scrollToAudit}
              onExploreDemo={() => {
                scrollToAudit();
              }}
            />
          )}

          {/* Repository Ingestion Chassis & Calibration Deck */}
          <div ref={auditSectionRef} id="section-analysis">
            <AuditForm onAudit={handleAudit} isLoading={isLoading} />
          </div>

          {/* In-Flight Terminal Scanner */}
          <ProgressTerminal isLoading={isLoading} />

          {/* Ingestion Error Alert */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-[#17181D] border border-[#FF666B]/40 font-mono text-xs animate-in fade-in">
              <div className="flex items-start gap-3 text-[#FF666B]">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold uppercase tracking-wider block">Ingestion Fault</span>
                  <p className="mt-1 text-[#A3A4AD] leading-relaxed">{errorMessage}</p>
                </div>
              </div>
            </div>
          )}

          {/* Completed Audit Intelligence Suite */}
          {auditData && !isLoading && (
            <div className="space-y-8 animate-in fade-in duration-300">
              {/* Telemetry Header Strip */}
              <div id="section-overview" className="bg-[#0E1116] border border-[#222730] rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h2 className="font-mono text-lg font-bold text-[#F5F5F6]">
                      {auditData.repoSummary.owner}/{auditData.repoSummary.repo}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-[#13171D] text-[#A3E635] border border-[#A3E635]/30 font-semibold uppercase">
                      {auditData.companyProfile.name}
                    </span>
                    {auditData.targetRole && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-[#13171D] text-[#A3E635] border border-[#A3E635]/30 font-semibold uppercase">
                        {auditData.targetRole.title} ({auditData.targetRole.experienceLevel})
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#A3A4AD] font-sans">
                    Audited {auditData.repoSummary.filesIngested} key architectural files against{" "}
                    {auditData.companyProfile.domain} invariants
                    {auditData.targetRole ? ` calibrated for ${auditData.targetRole.title}` : ""}.
                  </p>
                </div>

                <div className="font-mono text-left md:text-right shrink-0 bg-[#13171D] border border-[#222730] rounded-xl px-5 py-2.5">
                  <span className="text-[10px] text-[#747680] uppercase tracking-wider block font-semibold">Production Score</span>
                  <span
                    className={`text-2xl font-black ${
                      auditData.overallScore >= 70 ? "text-[#A3E635]" : "text-[#FF666B]"
                    }`}
                  >
                    {auditData.overallScore}{" "}
                    <span className="text-xs text-[#747680] font-normal">/ 100</span>
                  </span>
                </div>
              </div>

              {/* Redmonk Telemetry Metrics Bar */}
              <div>
                <MetricsOverview audit={auditData} />
              </div>

              {/* Architecture Diff Chamber */}
              <div id="section-architecture">
                <MermaidViewer
                  currentMermaid={auditData.architectureComparison.currentMermaid}
                  targetMermaid={auditData.architectureComparison.targetMermaid}
                  currentSummary={auditData.architectureComparison.currentSummary}
                  targetSummary={auditData.architectureComparison.targetSummary}
                />
              </div>

              {/* Redmonk Vulnerability Dossier */}
              <div id="section-vulnerabilities">
                <FindingsView key={auditData.generatedAt} findings={auditData.findings} />
              </div>

              {/* Concurrency Stress Sandbox */}
              <div id="section-concurrency">
                <TestScriptSandbox script={auditData.stressTestScript} />
              </div>

              {/* Senior Interview Defense Chamber */}
              <div id="section-interview">
                <InterviewDefense
                  items={auditData.interviewDefense}
                  companyName={auditData.companyProfile.name}
                />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
