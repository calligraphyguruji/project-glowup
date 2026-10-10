"use client";

import React, { useState } from "react";
import { AlertCircle, AlertTriangle, Info, ChevronDown, ChevronUp, FileCode, Search } from "lucide-react";
import { AuditFinding, FindingSeverity } from "@/types/audit";

interface FindingsViewProps {
  findings: AuditFinding[];
}

export function FindingsView({ findings }: FindingsViewProps) {
  const [filter, setFilter] = useState<"all" | FindingSeverity>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(findings[0]?.id || null);

  const categories = Array.from(new Set(findings.map((f) => f.category))).filter(Boolean);

  const filtered = findings.filter((f) => {
    if (filter !== "all" && f.severity !== filter) return false;
    if (selectedCategory !== "all" && f.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = `${f.title} ${f.category} ${f.fileCitation} ${f.explanation} ${f.remediation}`.toLowerCase();
      if (!matchText.includes(q)) return false;
    }
    return true;
  });

  const countBySeverity = {
    critical: findings.filter((f) => f.severity === "critical").length,
    warning: findings.filter((f) => f.severity === "warning").length,
    optimization: findings.filter((f) => f.severity === "optimization").length,
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Header & Filter Row */}
      <div className="flex flex-col gap-3 bg-[#101114] p-4 rounded-xl border border-[#292A31] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-[#FF666B]" />
            <h3 className="font-sans text-sm font-bold text-[#F5F5F6] tracking-tight">
              Security Findings ({findings.length})
            </h3>
            <span className="font-mono text-[10px] text-[#747680] uppercase">
              • LIVE AUDIT REPORT
            </span>
          </div>

          <div className="p-0.5 rounded-lg bg-[#17181D] border border-[#292A31] flex items-center font-mono text-[11px] self-start sm:self-auto">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 rounded-md transition-all ${
                filter === "all"
                  ? "bg-[#202127] text-[#F5F5F6] font-bold border border-[#292A31] shadow-sm"
                  : "text-[#A3A4AD] hover:text-[#F5F5F6]"
              }`}
            >
              All ({findings.length})
            </button>
            <button
              onClick={() => setFilter("critical")}
              className={`px-3 py-1 rounded-md transition-all ${
                filter === "critical"
                  ? "bg-[#FF666B]/20 text-[#FF666B] font-bold border border-[#FF666B]/30 shadow-sm"
                  : "text-[#FF666B]/70 hover:text-[#FF666B]"
              }`}
            >
              Critical ({countBySeverity.critical})
            </button>
            <button
              onClick={() => setFilter("warning")}
              className={`px-3 py-1 rounded-md transition-all ${
                filter === "warning"
                  ? "bg-[#F5BD50]/20 text-[#F5BD50] font-bold border border-[#F5BD50]/30 shadow-sm"
                  : "text-[#F5BD50]/70 hover:text-[#F5BD50]"
              }`}
            >
              Warning ({countBySeverity.warning})
            </button>
            <button
              onClick={() => setFilter("optimization")}
              className={`px-3 py-1 rounded-md transition-all ${
                filter === "optimization"
                  ? "bg-[#38BDF8]/20 text-[#38BDF8] font-bold border border-[#38BDF8]/30"
                  : "text-[#A3A4AD] hover:text-[#F5F5F6]"
              }`}
            >
              Info ({countBySeverity.optimization})
            </button>
          </div>
        </div>

        {/* Search & Category Filter Sub-bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 border-t border-[#1F2026]">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-[#747680] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search findings by file, title, category, or CVE/CWE keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#17181D] border border-[#292A31] text-xs text-[#F5F5F6] placeholder:text-[#747680] focus:outline-none focus:border-[#FF666B] font-sans transition-colors"
            />
          </div>

          {categories.length > 1 && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-[#17181D] border border-[#292A31] text-xs text-[#A3A4AD] font-mono focus:outline-none focus:border-[#FF666B] transition-colors"
            >
              <option value="all">All Categories ({categories.length})</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Findings List */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <div className="p-8 rounded-xl bg-[#101114] border border-[#292A31] text-center flex flex-col items-center justify-center gap-2 font-mono text-xs text-[#A3A4AD]">
            <Info className="w-5 h-5 text-[#747680]" />
            <span className="font-semibold text-[#F5F5F6]">No findings match current search query or filter.</span>
            <span className="text-[11px] text-[#747680]">Try clearing search terms or selecting &quot;All&quot;.</span>
          </div>
        ) : (
          filtered.map((finding) => {
            const isExpanded = expandedId === finding.id;
            const isCritical = finding.severity === "critical";
            const isWarning = finding.severity === "warning";

            return (
              <div
                key={finding.id}
                className="rounded-xl bg-[#101114] border border-[#292A31] hover:border-[#3E404B] transition-all overflow-hidden shadow-sm"
              >
                <div className="p-3.5 flex flex-col gap-2">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : finding.id)}
                    className="w-full text-left flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase tracking-wider shrink-0 mt-0.5 border ${
                          isCritical
                            ? "bg-[#FF666B]/15 text-[#FF666B] border-[#FF666B]/30"
                            : isWarning
                            ? "bg-[#F5BD50]/15 text-[#F5BD50] border-[#F5BD50]/30"
                            : "bg-[#202127] text-[#A3A4AD] border-[#292A31]"
                        }`}
                      >
                        {finding.severity}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-[#FF666B] font-semibold">
                            {finding.fileCitation}
                          </span>
                          <span className="font-mono text-[10px] text-[#747680] uppercase">
                            • {finding.category}
                          </span>
                        </div>
                        <h4 className="font-sans text-sm font-semibold text-[#F5F5F6] mt-0.5">
                          {finding.title}
                        </h4>
                      </div>
                    </div>

                    <div className="text-[#747680] hover:text-[#F5F5F6] shrink-0 mt-1">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="pt-3 border-t border-[#1F2026] flex flex-col gap-3 mt-1 font-sans text-xs">
                      {/* Evidence & Line Reference */}
                      {finding.evidence && finding.evidence.length > 0 && (
                        <div className="p-3 rounded-lg bg-[#17181D] font-mono text-[11px] flex flex-col gap-1.5 border border-[#292A31]">
                          <span className="text-[10px] text-[#FF666B] uppercase font-bold tracking-wider">
                            Inspected File Evidence {finding.startLine ? `(Line ${finding.startLine}${finding.endLine && finding.endLine !== finding.startLine ? `-${finding.endLine}` : ""})` : ""}
                          </span>
                          <div className="bg-[#0C0D10] p-2.5 rounded text-[#F5F5F6] overflow-x-auto border border-[#1F2026]">
                            <code>{finding.evidence[0].excerpt || finding.fileCitation}</code>
                          </div>
                        </div>
                      )}

                      {/* Architectural Reasoning */}
                      {finding.reasoning && (
                        <div className="p-3 rounded-lg bg-[#17181D] border border-[#292A31] flex flex-col gap-1">
                          <span className="font-mono text-[10px] text-[#F5BD50] uppercase font-bold tracking-wider">
                            Root Cause Reasoning
                          </span>
                          <p className="text-[#A3A4AD] leading-relaxed font-sans">{finding.reasoning}</p>
                        </div>
                      )}

                      {/* Disqualification Reason */}
                      <div className="p-3 rounded-lg bg-[#17181D] border border-[#292A31] flex flex-col gap-1">
                        <span className="font-mono text-[10px] text-[#FF666B] font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Top Tech Evaluation Disqualification Reason
                        </span>
                        <p className="text-[#A3A4AD] leading-relaxed font-sans">{finding.explanation}</p>
                      </div>

                      {/* Hardening Remediation */}
                      <div className="p-3 rounded-lg bg-[#17181D] border border-[#292A31] flex flex-col gap-1">
                        <span className="font-mono text-[10px] text-[#45D6A0] font-bold uppercase tracking-wider">
                          Production Hardening Remediation
                        </span>
                        <p className="text-[#A3A4AD] leading-relaxed font-sans">{finding.remediation}</p>
                      </div>

                      {/* AST Diff / Code snippet */}
                      {finding.codeSnippet && (
                        <div className="p-3 rounded-lg bg-[#17181D] border border-[#292A31] font-mono text-xs overflow-x-auto text-[#F5F5F6]">
                          <div className="text-[10px] text-[#747680] pb-1.5 mb-1.5 border-b border-[#292A31] uppercase font-bold">
                            Target Code Remediation
                          </div>
                          <pre className="leading-relaxed bg-[#0C0D10] p-2.5 rounded border border-[#1F2026]">
                            <code>{finding.codeSnippet}</code>
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
