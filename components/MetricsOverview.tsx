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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {/* Metric 1: Readiness Score */}
      <div className="p-3.5 rounded-xl bg-[#101114] border border-[#292A31] flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] text-[#A3A4AD] uppercase tracking-wider font-semibold">PRODUCTION SCORE</span>
          {audit.scoreBreakdown ? (
            <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-[#17181D] text-[#F5F5F6] border border-[#292A31]">
              GRADE {audit.scoreBreakdown.grade}
            </span>
          ) : (
            <span className={`w-2 h-2 rounded-full ${audit.overallScore >= 70 ? "bg-[#45D6A0]" : "bg-[#FF666B]"}`} />
          )}
        </div>
        <div className="mt-2.5 flex items-baseline gap-1.5">
          <span className={`font-mono text-3xl font-extrabold ${audit.overallScore >= 70 ? "text-[#45D6A0]" : "text-[#FF666B]"}`}>
            {audit.overallScore}
          </span>
          <span className="font-mono text-xs text-[#747680]">/ 100</span>
        </div>
        <span className={`font-mono text-[10px] font-semibold truncate uppercase mt-1.5 ${audit.overallScore >= 70 ? "text-[#45D6A0]" : "text-[#FF666B]"}`}>
          {audit.overallScore >= 70 ? "PRODUCTION VIABLE" : "CRITICAL REMEDIATION REQUIRED"}
        </span>
      </div>

      {/* Metric 2: Defect Triage */}
      <div className="p-3.5 rounded-xl bg-[#101114] border border-[#292A31] flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] text-[#A3A4AD] uppercase tracking-wider font-semibold">VULNERABILITY MATRIX</span>
          <ShieldAlert className="w-4 h-4 text-[#FF666B]" />
        </div>
        <div className="flex items-center gap-1.5 mt-2.5">
          <span className="px-2 py-0.5 rounded bg-[#FF666B]/15 text-[#FF666B] font-mono text-xs font-bold border border-[#FF666B]/30">
            {criticalCount} CRIT
          </span>
          <span className="px-2 py-0.5 rounded bg-[#F5BD50]/15 text-[#F5BD50] font-mono text-xs border border-[#F5BD50]/30">
            {warningCount} WARN
          </span>
          <span className="px-2 py-0.5 rounded bg-[#202127] text-[#A3A4AD] font-mono text-xs border border-[#292A31]">
            {optimizationCount} INF
          </span>
        </div>
        <span className="font-mono text-[10px] text-[#747680] mt-1.5 uppercase tracking-wider">
          {audit.findings.length} TOTAL VECTORS AUDITED
        </span>
      </div>

      {/* Metric 3: AST Footprint */}
      <div className="p-3.5 rounded-xl bg-[#101114] border border-[#292A31] flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] text-[#A3A4AD] uppercase tracking-wider font-semibold">SOURCE FOOTPRINT</span>
          <Layers className="w-4 h-4 text-[#A3A4AD]" />
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

      {/* Metric 4: Benchmark Target */}
      <div className="p-3.5 rounded-xl bg-[#101114] border border-[#292A31] flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] text-[#A3A4AD] uppercase tracking-wider font-semibold">DOMAIN SPEC</span>
          <Server className="w-4 h-4 text-[#FF666B]" />
        </div>
        <div className="mt-2.5">
          <span className="font-mono text-xl font-bold text-[#FF666B] truncate block">
            {audit.companyProfile.name}
          </span>
        </div>
        <span className="font-mono text-[10px] text-[#747680] truncate mt-1.5">
          {audit.companyProfile.domain}
        </span>
      </div>
    </div>
  );
}
