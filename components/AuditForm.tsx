"use client";

import React, { useState } from "react";
import { AlertCircle, ArrowRight, ShieldCheck, Terminal, Cpu } from "lucide-react";
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
      setUrlError("Please specify a GitHub repository URI.");
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
    <div className="flex flex-col gap-4">
      {/* Double-Bezel Physical Ingest Chassis */}
      <div className="p-1.5 rounded-xl bg-surface-variant/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] ring-1 ring-white/5">
        <form onSubmit={handleSubmit} className="rounded-lg bg-surface-container-lowest p-3 sm:p-4 flex flex-col gap-3 shadow-inner">
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-secondary-container font-bold">STACKFIT&gt;</span>
              <span className="text-slate-400 uppercase tracking-wider text-[11px]">TARGET REPOSITORY URI</span>
            </div>
            <span className="text-[11px] text-slate-400 bg-surface-container-high px-2 py-0.5 rounded border border-white/5 font-mono">
              ⌘K / ENTER
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="text"
              value={repoUrl}
              onChange={(e) => {
                setRepoUrl(e.target.value);
                if (urlError) setUrlError(null);
              }}
              placeholder="https://github.com/username/service-repository"
              className="flex-1 bg-surface-container-low px-3 py-2.5 rounded text-sm text-primary placeholder-slate-500 font-mono focus:outline-none focus:ring-1 focus:ring-primary-container border border-white/5 transition-all"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="shrink-0 flex items-center justify-center gap-2 px-5 py-2.5 rounded bg-primary-container hover:bg-[#3bf5ff] text-slate-950 font-sans font-semibold text-xs shadow-md active:scale-[0.98] disabled:bg-surface-container-high disabled:text-slate-500 transition-all uppercase tracking-wider"
            >
              <Cpu className="w-4 h-4" />
              <span>{isLoading ? "Ingesting..." : "Ingest AST →"}</span>
            </button>
          </div>

          {urlError && (
            <p className="text-xs text-error flex items-center gap-1.5 font-mono">
              <AlertCircle className="w-3.5 h-3.5" />
              {urlError}
            </p>
          )}

          {/* Quick Presets Strip */}
          <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-0.5 text-xs font-mono">
            <span className="text-slate-500 text-[11px] shrink-0 uppercase tracking-wider">Presets:</span>
            <button
              type="button"
              onClick={() => loadPreset("https://github.com/expressjs/express", "razorpay")}
              className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container-low hover:bg-surface-container text-slate-300 text-[11px] border border-white/5 transition-colors"
            >
              <span className="text-tertiary-container">⚡</span> Express.js → Razorpay (Ledger)
            </button>
            <button
              type="button"
              onClick={() => loadPreset("https://github.com/fastify/fastify", "swiggy")}
              className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container-low hover:bg-surface-container text-slate-300 text-[11px] border border-white/5 transition-colors"
            >
              <span className="text-secondary">⚡</span> Fastify → Swiggy (Spatial)
            </button>
            <button
              type="button"
              onClick={() => loadPreset("https://github.com/tiangolo/fastapi", "zerodha")}
              className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container-low hover:bg-surface-container text-slate-300 text-[11px] border border-white/5 transition-colors"
            >
              <span className="text-primary-container">⚡</span> FastAPI → Zerodha (Locks)
            </button>
            <button
              type="button"
              onClick={() => loadPreset("https://github.com/facebook/react", "amazon")}
              className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container-low hover:bg-surface-container text-slate-300 text-[11px] border border-white/5 transition-colors"
            >
              <span className="text-tertiary">⚡</span> React → AWS (Partitioning)
            </button>
          </div>
        </form>
      </div>

      {/* Target Rubric Matrix (4 Selectable Tiles) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
            SELECT TARGET INVARIANT MATRIX
          </span>
          <span className="text-[10px] font-mono text-slate-500 uppercase">CALIBRATED TO PRODUCTION RFCs</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          {(Object.keys(COMPANY_PROFILES) as CompanyId[]).map((cId, idx) => {
            const comp = COMPANY_PROFILES[cId];
            const isSelected = companyId === cId;
            return (
              <button
                key={cId}
                type="button"
                onClick={() => setCompanyId(cId)}
                disabled={isLoading}
                className={`p-1 rounded-xl transition-all text-left ${
                  isSelected
                    ? "bg-primary-container/20 ring-1 ring-primary-container/60 shadow-[0_0_12px_rgba(0,242,254,0.15)]"
                    : "bg-surface-variant/20 hover:bg-surface-variant/40 border border-white/5"
                }`}
              >
                <div className="rounded-lg bg-surface-container-low p-3 flex flex-col justify-between h-full gap-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isSelected
                          ? "bg-primary-container shadow-[0_0_6px_rgba(0,242,254,0.8)]"
                          : "bg-slate-600"
                      }`}
                    ></span>
                    <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest">
                      INVARIANT_0{idx + 1}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-mono text-sm font-semibold text-slate-100 truncate">
                      {comp.name}
                    </h3>
                    <p className="font-sans text-[11px] text-slate-400 line-clamp-1 mt-0.5 leading-snug">
                      {comp.domain}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
