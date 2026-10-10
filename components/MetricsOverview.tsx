import React from "react";
import { ShieldAlert, Layers, Server, Activity } from "lucide-react";
import { AuditResponse } from "@/types/audit";

interface MetricsOverviewProps {
  audit: AuditResponse;
}

export function MetricsOverview({ audit }: MetricsOverviewProps) {
  const criticalCount = audit.findings.filter((f) => f.severity === "critical").length;
  const warningCount = audit.findings.filter((f) => f.severity === "warning").length;
  const optimizationCount = audit.findings.filter((f) => f.severity === "optimization").length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
      {/* Metric 1: Readiness Score */}
      <div className="p-3 rounded-xl bg-surface-container-low border border-white/5 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider">SCORE INDEX</span>
          <span className={`w-2 h-2 rounded-full ${audit.overallScore >= 70 ? "bg-tertiary-container shadow-[0_0_6px_rgba(55,248,170,0.8)]" : "bg-error shadow-[0_0_6px_rgba(255,59,48,0.8)]"}`}></span>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className={`font-mono text-3xl font-bold ${audit.overallScore >= 70 ? "text-tertiary-container" : "text-error"}`}>
            {audit.overallScore}
          </span>
          <span className="font-mono text-xs text-slate-500">/ 100</span>
        </div>
        <span className={`font-mono text-[10px] font-semibold truncate uppercase mt-1 ${audit.overallScore >= 70 ? "text-tertiary-container" : "text-error"}`}>
          {audit.overallScore >= 70 ? "PRODUCTION VIABLE" : "CRITICAL DEFECT RISKS"}
        </span>
      </div>

      {/* Metric 2: Defect Triage */}
      <div className="p-3 rounded-xl bg-surface-container-low border border-white/5 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider">DEFECT MATRIX</span>
          <ShieldAlert className="w-3.5 h-3.5 text-error" />
        </div>
        <div className="flex items-center gap-1.5 mt-2">
          <span className="px-1.5 py-0.5 rounded bg-error/20 text-error font-mono text-[11px] font-bold">
            {criticalCount} CRIT
          </span>
          <span className="px-1.5 py-0.5 rounded bg-secondary/20 text-secondary font-mono text-[11px]">
            {warningCount} WARN
          </span>
          <span className="px-1.5 py-0.5 rounded bg-surface-container-high text-slate-400 font-mono text-[11px]">
            {optimizationCount} INF
          </span>
        </div>
        <span className="font-mono text-[10px] text-slate-400 mt-1 uppercase tracking-wider">
          {audit.findings.length} TOTAL VECTORS
        </span>
      </div>

      {/* Metric 3: AST Footprint */}
      <div className="p-3 rounded-xl bg-surface-container-low border border-white/5 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider">AST SCOPE</span>
          <Layers className="w-3.5 h-3.5 text-primary-container" />
        </div>
        <div className="mt-2">
          <span className="font-mono text-2xl font-bold text-slate-100">
            {audit.repoSummary.filesIngested} FILES
          </span>
        </div>
        <span className="font-mono text-[10px] text-slate-400 truncate mt-1">
          Branch: {audit.repoSummary.defaultBranch}
        </span>
      </div>

      {/* Metric 4: Benchmark Target */}
      <div className="p-3 rounded-xl bg-surface-container-low border border-white/5 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider">SPEC RUBRIC</span>
          <Server className="w-3.5 h-3.5 text-tertiary-container" />
        </div>
        <div className="mt-2">
          <span className="font-mono text-base font-bold text-primary-container truncate block">
            {audit.companyProfile.name}
          </span>
          {audit.targetRole && (
            <span className="font-mono text-[10px] text-secondary-container truncate block mt-0.5">
              {audit.targetRole.title}
            </span>
          )}
        </div>
        <span className="font-mono text-[10px] text-slate-400 truncate mt-1">
          {audit.companyProfile.domain}
        </span>
      </div>
    </div>
  );
}
