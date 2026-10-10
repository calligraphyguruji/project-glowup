import React, { useState } from "react";
import { AlertCircle, AlertTriangle, Info, FileCode, ChevronDown, ChevronUp } from "lucide-react";
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
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
      {/* Header & Filter Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <FileCode className="w-4 h-4 text-cyan-400" />
            Codebase Audit Findings ({findings.length})
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Evidence-grounded code flaws and architectural risks detected in your repository.
          </p>
        </div>

        <div className="inline-flex rounded-lg border border-slate-800 bg-slate-950 p-1 text-xs font-mono">
          <button
            onClick={() => setFilter("all")}
            className={`px-2.5 py-1 rounded transition-colors ${
              filter === "all" ? "bg-slate-800 text-slate-100 font-semibold" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            All ({findings.length})
          </button>
          <button
            onClick={() => setFilter("critical")}
            className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
              filter === "critical" ? "bg-red-950/80 text-red-400 font-semibold border border-red-800/40" : "text-red-400/70 hover:text-red-400"
            }`}
          >
            Critical ({countBySeverity.critical})
          </button>
          <button
            onClick={() => setFilter("warning")}
            className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
              filter === "warning" ? "bg-amber-950/80 text-amber-400 font-semibold border border-amber-800/40" : "text-amber-400/70 hover:text-amber-400"
            }`}
          >
            Warning ({countBySeverity.warning})
          </button>
          <button
            onClick={() => setFilter("optimization")}
            className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
              filter === "optimization" ? "bg-blue-950/80 text-blue-400 font-semibold border border-blue-800/40" : "text-blue-400/70 hover:text-blue-400"
            }`}
          >
            Info ({countBySeverity.optimization})
          </button>
        </div>
      </div>

      {/* Findings List */}
      <div className="mt-4 space-y-3">
        {filtered.map((finding) => {
          const isExpanded = expandedId === finding.id;
          const isCritical = finding.severity === "critical";
          const isWarning = finding.severity === "warning";

          return (
            <div
              key={finding.id}
              className={`rounded-lg border transition-all ${
                isCritical
                  ? "border-red-950/70 bg-red-950/10 hover:border-red-800/50"
                  : isWarning
                  ? "border-amber-950/70 bg-amber-950/10 hover:border-amber-800/50"
                  : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
              }`}
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : finding.id)}
                className="w-full text-left p-3.5 flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-2.5">
                  {isCritical ? (
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  ) : isWarning ? (
                    <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  )}

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ${
                          isCritical
                            ? "bg-red-950 border border-red-800/50 text-red-400"
                            : isWarning
                            ? "bg-amber-950 border border-amber-800/50 text-amber-400"
                            : "bg-blue-950 border border-blue-800/50 text-blue-400"
                        }`}
                      >
                        {finding.severity}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {finding.category}
                      </span>
                      <span className="text-[11px] font-mono text-cyan-400/80 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        {finding.fileCitation}
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-slate-100 mt-1.5 leading-snug">
                      {finding.title}
                    </h4>
                  </div>
                </div>

                <span className="text-slate-500 mt-1">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </span>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 pt-1 border-t border-slate-800/60 text-xs space-y-3">
                  <div>
                    <span className="text-slate-400 font-semibold block mb-1">Observed Impact:</span>
                    <p className="text-slate-300 leading-relaxed">{finding.explanation}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                    <span className="text-cyan-400 font-semibold block mb-1 font-mono uppercase text-[11px]">
                      Recommended Remediation:
                    </span>
                    <p className="text-slate-200 leading-relaxed">{finding.remediation}</p>
                  </div>

                  {finding.codeSnippet && (
                    <div>
                      <span className="text-slate-400 font-semibold block mb-1 font-mono text-[11px]">
                        Code Evidence / Patch:
                      </span>
                      <pre className="p-3 bg-slate-950 rounded border border-slate-800 font-mono text-cyan-300 overflow-x-auto text-[11px]">
                        <code>{finding.codeSnippet}</code>
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
