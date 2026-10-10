"use client";

import React, { useState } from "react";
import { AlertCircle, AlertTriangle, Info, ChevronDown, ChevronUp, FileCode } from "lucide-react";
import { AuditFinding, FindingSeverity } from "@/types/audit";

interface FindingsViewProps {
  findings: AuditFinding[];
}

export function FindingsView({ findings }: FindingsViewProps) {
  const [filter, setFilter] = useState<"all" | FindingSeverity>("all");
  const [expandedId, setExpandedId] = useState<string | null>(findings[0]?.id || null);

  const filtered = findings.filter((f) => (filter === "all" ? true : f.severity === filter));

  const countBySeverity = {
    critical: findings.filter((f) => f.severity === "critical").length,
    warning: findings.filter((f) => f.severity === "warning").length,
    optimization: findings.filter((f) => f.severity === "optimization").length,
  };

  return (
    <div className="flex flex-col gap-2.5">
      {/* Header & Filter Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-error" />
          <h3 className="font-mono text-sm font-semibold text-slate-100 uppercase tracking-wider">
            Vulnerability Dossier ({findings.length})
          </h3>
        </div>

        <div className="p-0.5 rounded-lg bg-surface-container-high border border-white/5 flex items-center font-mono text-[11px] self-start sm:self-auto">
          <button
            onClick={() => setFilter("all")}
            className={`px-2.5 py-1 rounded transition-colors ${
              filter === "all"
                ? "bg-primary-container text-slate-950 font-bold shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            All ({findings.length})
          </button>
          <button
            onClick={() => setFilter("critical")}
            className={`px-2.5 py-1 rounded transition-colors ${
              filter === "critical"
                ? "bg-error text-slate-950 font-bold shadow-sm"
                : "text-error/80 hover:text-error"
            }`}
          >
            Critical ({countBySeverity.critical})
          </button>
          <button
            onClick={() => setFilter("warning")}
            className={`px-2.5 py-1 rounded transition-colors ${
              filter === "warning"
                ? "bg-secondary text-slate-950 font-bold shadow-sm"
                : "text-secondary/80 hover:text-secondary"
            }`}
          >
            Warning ({countBySeverity.warning})
          </button>
          <button
            onClick={() => setFilter("optimization")}
            className={`px-2.5 py-1 rounded transition-colors ${
              filter === "optimization"
                ? "bg-surface-bright text-slate-200 font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Info ({countBySeverity.optimization})
          </button>
        </div>
      </div>

      {/* Findings List */}
      <div className="space-y-2.5">
        {filtered.map((finding) => {
          const isExpanded = expandedId === finding.id;
          const isCritical = finding.severity === "critical";
          const isWarning = finding.severity === "warning";

          return (
            <div
              key={finding.id}
              className="p-1 rounded-xl bg-surface-container-low border border-white/5 shadow-sm transition-all"
            >
              <div className="p-3 rounded-lg bg-surface-container-lowest flex flex-col gap-2">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : finding.id)}
                  className="w-full text-left flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-2.5">
                    <span
                      className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase tracking-wider shrink-0 mt-0.5 ${
                        isCritical
                          ? "bg-error text-slate-950"
                          : isWarning
                          ? "bg-secondary text-slate-950"
                          : "bg-surface-container-high text-slate-300"
                      }`}
                    >
                      {finding.severity}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-primary-container font-semibold">
                          {finding.fileCitation}
                        </span>
                        <span className="font-mono text-[10px] text-slate-500 uppercase">
                          {finding.category}
                        </span>
                      </div>
                      <h4 className="font-sans text-sm font-semibold text-slate-100 mt-0.5">
                        {finding.title}
                      </h4>
                    </div>
                  </div>

                  <div className="text-slate-400 hover:text-slate-200 shrink-0 mt-1">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="pt-2 border-t border-white/5 flex flex-col gap-2.5 mt-1 font-sans text-xs">
                    {/* Evidence & Line Reference */}
                    {finding.evidence && finding.evidence.length > 0 && (
                      <div className="p-2.5 rounded bg-surface-container-high font-mono text-[11px] flex flex-col gap-1 border border-white/5">
                        <span className="text-[10px] text-primary-container uppercase font-bold tracking-wider">
                          Inspected File Evidence {finding.startLine ? `(Line ${finding.startLine}${finding.endLine && finding.endLine !== finding.startLine ? `-${finding.endLine}` : ""})` : ""}
                        </span>
                        <div className="bg-surface-container-lowest p-2 rounded text-slate-300 overflow-x-auto">
                          <code>{finding.evidence[0].excerpt || finding.fileCitation}</code>
                        </div>
                      </div>
                    )}

                    {/* Architectural Reasoning */}
                    {finding.reasoning && (
                      <div className="p-2.5 rounded bg-surface-container-low flex flex-col gap-1">
                        <span className="font-mono text-[10px] text-secondary uppercase font-bold tracking-wider">
                          Root Cause Reasoning
                        </span>
                        <p className="text-slate-300 leading-relaxed font-sans">{finding.reasoning}</p>
                      </div>
                    )}

                    {/* Disqualification Reason */}
                    <div className="p-2.5 rounded bg-surface-container-low flex flex-col gap-1">
                      <span className="font-mono text-[10px] text-error font-bold uppercase tracking-wider flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Why Top Tech Engineering Panels Disqualify This
                      </span>
                      <p className="text-slate-300 leading-relaxed font-sans">{finding.explanation}</p>
                    </div>

                    {/* Hardening Remediation */}
                    <div className="p-2.5 rounded bg-surface-container-low flex flex-col gap-1">
                      <span className="font-mono text-[10px] text-tertiary-container font-bold uppercase tracking-wider">
                        Production Hardening Remediation
                      </span>
                      <p className="text-slate-300 leading-relaxed font-sans">{finding.remediation}</p>
                    </div>

                    {/* AST Diff / Code snippet */}
                    {finding.codeSnippet && (
                      <div className="p-2.5 rounded bg-surface-container-high font-mono text-xs overflow-x-auto text-slate-200">
                        <div className="text-[10px] text-slate-400 pb-1 mb-1 border-b border-white/5 uppercase">
                          Target Code Remediation
                        </div>
                        <pre className="leading-relaxed">
                          <code>{finding.codeSnippet}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
