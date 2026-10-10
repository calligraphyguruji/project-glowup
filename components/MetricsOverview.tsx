import React from "react";
import { ShieldAlert, Layers, Server, Activity, CheckCircle2 } from "lucide-react";
import { AuditResponse } from "@/types/audit";

interface MetricsOverviewProps {
  audit: AuditResponse;
}

export function MetricsOverview({ audit }: MetricsOverviewProps) {
  const criticalCount = audit.findings.filter((f) => f.severity === "critical").length;
  const warningCount = audit.findings.filter((f) => f.severity === "warning").length;
  const optimizationCount = audit.findings.filter((f) => f.severity === "optimization").length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Metric 1: Readiness Score */}
      <div className="p-4 rounded-2xl bg-[#0E1116] border border-[#222730] flex flex-col justify-between shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] text-[#A3A4AD] uppercase tracking-wider font-semibold">PRODUCTION SCORE</span>
          {audit.scoreBreakdown ? (
            <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-[#13171D] text-[#A3E635] border border-[#A3E635]/30">
              GRADE {audit.scoreBreakdown.grade}
            </span>
          ) : (
            <span className={`w-2 h-2 rounded-full ${audit.overallScore >= 70 ? "bg-[#A3E635] shadow-[0_0_8px_#A3E635]" : "bg-[#FF666B]"}`} />
          )}
        </div>
        <div className="mt-2.5 flex items-baseline gap-1.5">
          <span className={`font-mono text-3xl font-extrabold ${audit.overallScore >= 70 ? "text-[#A3E635]" : "text-[#FF666B]"}`}>
            {audit.overallScore}
          </span>
          <span className="font-mono text-xs text-[#747680]">/ 100</span>
        </div>
        <span className={`font-mono text-[10px] font-semibold truncate uppercase mt-1.5 ${audit.overallScore >= 70 ? "text-[#A3E635]" : "text-[#FF666B]"}`}>
          {audit.overallScore >= 70 ? "PRODUCTION VIABLE" : "CRITICAL REMEDIATION REQUIRED"}
        </span>
      </div>

      {/* Metric 2: Defect Triage */}
      <div className="p-4 rounded-2xl bg-[#0E1116] border border-[#222730] flex flex-col justify-between shadow-md">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] text-[#A3A4AD] uppercase tracking-wider font-semibold">VULNERABILITY MATRIX</span>
          <ShieldAlert className="w-4 h-4 text-[#FF666B]" />
        </div>
        <div className="flex items-center gap-1.5 mt-2.5">
          <span className="px-2 py-0.5 rounded-md bg-[#FF666B]/15 text-[#FF666B] font-mono text-xs font-bold border border-[#FF666B]/30">
            {criticalCount} CRIT
          </span>
          <span className="px-2 py-0.5 rounded-md bg-[#F5BD50]/15 text-[#F5BD50] font-mono text-xs border border-[#F5BD50]/30">
            {warningCount} WARN
          </span>
          <span className="px-2 py-0.5 rounded-md bg-[#1C222B] text-[#A3A4AD] font-mono text-xs border border-[#222730]">
            {optimizationCount} INF
          </span>
        </div>
        <span className="font-mono text-[10px] text-[#747680] mt-1.5 uppercase tracking-wider">
          {audit.findings.length} TOTAL VECTORS AUDITED
        </span>
      </div>

      {/* Metric 3: AST Footprint */}
      <div className="p-4 rounded-2xl bg-[#0E1116] border border-[#222730] flex flex-col justify-between shadow-md">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] text-[#A3A4AD] uppercase tracking-wider font-semibold">SOURCE FOOTPRINT</span>
          <Layers className="w-4 h-4 text-[#A3E635]" />
        </div>
        <div className="mt-2.5 flex items-baseline gap-1.5">
          <span className="font-mono text-2xl font-bold text-[#F5F5F6]">
            {audit.repoSummary.filesIngested}
          </span>
          <span className="font-mono text-xs text-[#747680]">
            / {audit.repoSummary.totalFilesDiscovered} FILES
          </span>
        </div>
        <span className="font-mono text-[10px] text-[#747680] truncate mt-1.5">
          Priority Ingestion · {audit.repoSummary.defaultBranch}
        </span>
      </div>

      {/* Metric 4: Benchmark Target & AI Diagnostic Status */}
      <div className="p-4 rounded-2xl bg-[#0E1116] border border-[#222730] flex flex-col justify-between shadow-md">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] text-[#A3A4AD] uppercase tracking-wider font-semibold">AI INTELLIGENCE</span>
          {audit.executionMode === "live_ai" ? (
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#A3E635]/15 text-[#A3E635] border border-[#A3E635]/30">
              <span className="w-1.5 h-1.5 rounded-full bg-[#A3E635] animate-pulse" />
              {audit.aiDiagnostics?.provider === "groq" ? "LIVE GROQ" : "LIVE GEMINI"}
            </span>
          ) : (
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-mono font-medium bg-[#13171D] text-[#A3A4AD] border border-[#222730]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F5BD50]" />
              HEURISTIC ENGINE
            </span>
          )}
        </div>
        <div className="mt-2.5">
          <span className="font-mono text-xl font-bold text-[#A3E635] truncate block">
            {audit.companyProfile.name}
          </span>
        </div>
        <span className="font-mono text-[10px] text-[#747680] truncate mt-1.5" title={audit.aiDiagnostics?.details}>
          {audit.aiDiagnostics ? (
            audit.aiDiagnostics.status === "configured_and_succeeded"
              ? `Gemini ${audit.aiDiagnostics.model} verified`
              : audit.aiDiagnostics.status === "fallback_succeeded"
              ? `Groq ${audit.aiDiagnostics.model} fallback verified`
              : audit.aiDiagnostics.status === "key_missing"
              ? "AI keys not configured (heuristics active)"
              : audit.aiDiagnostics.status === "key_invalid"
              ? "Gemini key rejected (401)"
              : audit.aiDiagnostics.details?.slice(0, 40)
          ) : (
            audit.companyProfile.domain
          )}
        </span>
      </div>
    </div>
  );
}
