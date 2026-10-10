"use client";

import React, { useState } from "react";
import { Search, Sparkles, Building2, AlertCircle, ArrowRight } from "lucide-react";
import { CompanyId } from "@/types/audit";
import { COMPANY_PROFILES } from "@/lib/companies";

interface AuditFormProps {
  onAudit: (repoUrl: string, companyId: CompanyId) => void;
  isLoading: boolean;
}

export function AuditForm({ onAudit, isLoading }: AuditFormProps) {
  const [repoUrl, setRepoUrl] = useState("");
  const [companyId, setCompanyId] = useState<CompanyId>("razorpay");
  const [urlError, setUrlError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = repoUrl.trim();
    if (!trimmed) {
      setUrlError("Please enter a GitHub repository URL.");
      return;
    }
    if (!trimmed.startsWith("https://github.com/")) {
      setUrlError("Must be a public GitHub URL (e.g. https://github.com/owner/repo)");
      return;
    }
    setUrlError(null);
    onAudit(trimmed, companyId);
  };

  const loadPreset = (presetUrl: string, presetCompany: CompanyId) => {
    setRepoUrl(presetUrl);
    setCompanyId(presetCompany);
    setUrlError(null);
    onAudit(presetUrl, presetCompany);
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm shadow-xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Repo Input */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold mb-2">
            Target GitHub Repository
          </label>
          <div className="relative">
            <input
              type="text"
              value={repoUrl}
              onChange={(e) => {
                setRepoUrl(e.target.value);
                if (urlError) setUrlError(null);
              }}
              placeholder="https://github.com/username/project-repo"
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 font-mono text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="absolute right-2 top-2 bottom-2 px-4 rounded-md bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 text-slate-950 disabled:text-slate-500 font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md"
            >
              {isLoading ? (
                <span>Auditing...</span>
              ) : (
                <>
                  <span>Audit Codebase</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

          {urlError && (
            <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1 font-mono">
              <AlertCircle className="w-3.5 h-3.5" />
              {urlError}
            </p>
          )}

          {/* 1-Click Live Demo Presets */}
          <div className="mt-3 flex items-center gap-2 flex-wrap text-xs">
            <span className="text-slate-400 text-[11px] font-mono">Demo Presets:</span>
            <button
              type="button"
              onClick={() => loadPreset("https://github.com/expressjs/express", "razorpay")}
              className="px-2.5 py-1 rounded border border-cyan-800/40 bg-cyan-950/30 text-cyan-400 hover:bg-cyan-900/40 text-[11px] font-mono transition-colors"
            >
              ⚡ Express → Razorpay
            </button>
            <button
              type="button"
              onClick={() => loadPreset("https://github.com/fastify/fastify", "swiggy")}
              className="px-2.5 py-1 rounded border border-amber-800/40 bg-amber-950/30 text-amber-400 hover:bg-amber-900/40 text-[11px] font-mono transition-colors"
            >
              ⚡ Fastify → Swiggy
            </button>
            <button
              type="button"
              onClick={() => loadPreset("https://github.com/tiangolo/fastapi", "zerodha")}
              className="px-2.5 py-1 rounded border border-emerald-800/40 bg-emerald-950/30 text-emerald-400 hover:bg-emerald-900/40 text-[11px] font-mono transition-colors"
            >
              ⚡ FastAPI → Zerodha
            </button>
            <button
              type="button"
              onClick={() => loadPreset("https://github.com/facebook/react", "amazon")}
              className="px-2.5 py-1 rounded border border-blue-800/40 bg-blue-950/30 text-blue-400 hover:bg-blue-900/40 text-[11px] font-mono transition-colors"
            >
              ⚡ React → Amazon Cloud
            </button>
          </div>
        </div>

        {/* Target Company Selector */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold mb-2">
            Select Target Company Rubric
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(Object.keys(COMPANY_PROFILES) as CompanyId[]).map((cId) => {
              const comp = COMPANY_PROFILES[cId];
              const isSelected = companyId === cId;
              return (
                <button
                  key={cId}
                  type="button"
                  onClick={() => setCompanyId(cId)}
                  disabled={isLoading}
                  className={`p-3.5 rounded-lg border text-left transition-all ${
                    isSelected
                      ? "border-cyan-500 bg-cyan-950/30 ring-1 ring-cyan-500/50"
                      : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-slate-100">{comp.name}</span>
                    <Building2 className={`w-3.5 h-3.5 ${isSelected ? "text-cyan-400" : "text-slate-500"}`} />
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{comp.domain}</p>
                </button>
              );
            })}
          </div>
        </div>
      </form>
    </div>
  );
}
