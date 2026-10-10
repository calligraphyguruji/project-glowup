import React from "react";
import { ShieldAlert, ShieldCheck, Activity, Layers, Server, Code2 } from "lucide-react";
import { AuditResponse } from "@/types/audit";

interface MetricsOverviewProps {
  audit: AuditResponse;
}

export function MetricsOverview({ audit }: MetricsOverviewProps) {
  const criticalCount = audit.findings.filter((f) => f.severity === "critical").length;
  const warningCount = audit.findings.filter((f) => f.severity === "warning").length;
  const optimizationCount = audit.findings.filter((f) => f.severity === "optimization").length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {/* Metric 1: Readiness Score */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 font-mono">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span>Readiness Score</span>
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span
            className={`text-2xl font-black ${
              audit.overallScore >= 70 ? "text-emerald-400" : "text-amber-400"
            }`}
          >
            {audit.overallScore}
          </span>
          <span className="text-xs text-slate-500">/ 100</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          {audit.overallScore >= 70 ? "Production Viable" : "Tutorial Clone Risks"}
        </p>
      </div>

      {/* Metric 2: Vulnerabilities */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 font-mono">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span>Critical Risks</span>
          <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span
            className={`text-2xl font-black ${
              criticalCount > 0 ? "text-red-400" : "text-emerald-400"
            }`}
          >
            {criticalCount}
          </span>
          <span className="text-xs text-slate-500">flags</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          {warningCount} warnings, {optimizationCount} optimizations
        </p>
      </div>

      {/* Metric 3: Architectural Breadth */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 font-mono">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span>Files Evaluated</span>
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-slate-100">
            {audit.repoSummary.filesIngested}
          </span>
          <span className="text-xs text-slate-500">core files</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1 truncate">
          Branch: {audit.repoSummary.defaultBranch}
        </p>
      </div>

      {/* Metric 4: Target Rubric */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 font-mono">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span>Target Rubric</span>
          <Server className="w-3.5 h-3.5 text-cyan-400" />
        </div>
        <div className="text-sm font-bold text-cyan-300 truncate mt-0.5">
          {audit.companyProfile.name}
        </div>
        <p className="text-[11px] text-slate-400 mt-1 truncate">
          {audit.companyProfile.domain}
        </p>
      </div>
    </div>
  );
}
