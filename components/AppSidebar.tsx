"use client";

import React from "react";
import {
  LayoutDashboard,
  GitBranch,
  ShieldAlert,
  Layers,
  Terminal,
  HelpCircle,
  Settings,
  Flame,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

export type NavTabId = "overview" | "analysis" | "vulnerabilities" | "architecture" | "concurrency" | "interview";

interface AppSidebarProps {
  activeTab: NavTabId;
  onTabChange: (tab: NavTabId) => void;
  findingsCount?: number;
  criticalCount?: number;
  repoContext?: {
    owner: string;
    repo: string;
  } | null;
}

export function AppSidebar({
  activeTab,
  onTabChange,
  findingsCount = 0,
  criticalCount = 0,
  repoContext,
}: AppSidebarProps) {
  return (
    <aside className="w-64 shrink-0 hidden lg:flex flex-col bg-[#101114] border-r border-[#292A31] h-screen sticky top-0 z-40 select-none">
      {/* Brand Header */}
      <div className="p-4 flex items-center justify-between border-b border-[#222730]">
        <div className="flex items-center gap-2.5">
          {/* Scrolltide Lime Glow Icon Logo */}
          <div className="w-8 h-8 rounded-full bg-[#13171D] border border-[#A3E635]/40 flex items-center justify-center relative shadow-[0_0_15px_rgba(163,230,53,0.3)]">
            <div className="w-3.5 h-3.5 rounded-full border-2 border-[#A3E635] flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-[#A3E635]" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-sans font-bold text-sm tracking-tight text-[#F5F5F6] flex items-center gap-1.5">
              ProjectGlowUp
              <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-[#A3E635]/15 text-[#A3E635] font-semibold border border-[#A3E635]/30">
                AI
              </span>
            </span>
            <span className="font-mono text-[10px] text-[#747680] tracking-wider uppercase">
              Dev Intelligence
            </span>
          </div>
        </div>
      </div>

      {/* Active Workspace / Repo Scope */}
      <div className="px-3.5 py-3 border-b border-[#292A31] bg-[#0C0D10]">
        <div className="flex items-center justify-between text-[11px] font-mono text-[#747680] uppercase tracking-wider mb-1.5">
          <span>Active Context</span>
          <span className="w-2 h-2 rounded-full bg-[#45D6A0] inline-block animate-pulse" />
        </div>
        <div className="flex items-center justify-between p-2 rounded-lg bg-[#17181D] border border-[#292A31] text-xs">
          <div className="flex items-center gap-2 truncate">
            <GitBranch className="w-3.5 h-3.5 text-[#FF666B] shrink-0" />
            <span className="font-mono text-xs text-[#F5F5F6] truncate font-medium">
              {repoContext ? `${repoContext.owner}/${repoContext.repo}` : "No repository attached"}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4 font-sans text-xs">
        {/* Core Workspace Group */}
        <div className="space-y-1">
          <span className="px-2.5 text-[10px] font-mono uppercase tracking-wider text-[#747680] font-semibold">
            Workspace
          </span>

          <button
            onClick={() => onTabChange("overview")}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition-colors text-left ${
              activeTab === "overview"
                ? "bg-[#1C222B] text-[#F5F5F6] font-semibold border border-[#222730] shadow-sm"
                : "text-[#A3A4AD] hover:text-[#F5F5F6] hover:bg-[#13171D]"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <LayoutDashboard className={`w-4 h-4 ${activeTab === "overview" ? "text-[#A3E635]" : "text-[#747680]"}`} />
              <span>Overview</span>
            </div>
          </button>

          <button
            onClick={() => onTabChange("analysis")}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition-colors text-left ${
              activeTab === "analysis"
                ? "bg-[#1C222B] text-[#F5F5F6] font-semibold border border-[#222730] shadow-sm"
                : "text-[#A3A4AD] hover:text-[#F5F5F6] hover:bg-[#13171D]"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <GitBranch className={`w-4 h-4 ${activeTab === "analysis" ? "text-[#A3E635]" : "text-[#747680]"}`} />
              <span>Repository Analysis</span>
            </div>
          </button>
        </div>

        {/* Intelligence & Audit Group */}
        <div className="space-y-1 pt-1">
          <span className="px-2.5 text-[10px] font-mono uppercase tracking-wider text-[#747680] font-semibold">
            Code Intelligence
          </span>

          <button
            onClick={() => onTabChange("vulnerabilities")}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition-colors text-left ${
              activeTab === "vulnerabilities"
                ? "bg-[#1C222B] text-[#F5F5F6] font-semibold border border-[#222730] shadow-sm"
                : "text-[#A3A4AD] hover:text-[#F5F5F6] hover:bg-[#13171D]"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShieldAlert className={`w-4 h-4 ${activeTab === "vulnerabilities" ? "text-[#FF666B]" : "text-[#747680]"}`} />
              <span>Vulnerabilities</span>
            </div>
            {findingsCount > 0 && (
              <span
                className={`font-mono text-[10px] px-1.5 py-0.2 rounded font-bold ${
                  criticalCount > 0
                    ? "bg-[#FF666B]/20 text-[#FF666B] border border-[#FF666B]/30"
                    : "bg-[#222730] text-[#A3A4AD]"
                }`}
              >
                {findingsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onTabChange("architecture")}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition-colors text-left ${
              activeTab === "architecture"
                ? "bg-[#1C222B] text-[#F5F5F6] font-semibold border border-[#222730] shadow-sm"
                : "text-[#A3A4AD] hover:text-[#F5F5F6] hover:bg-[#13171D]"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Layers className={`w-4 h-4 ${activeTab === "architecture" ? "text-[#A3E635]" : "text-[#747680]"}`} />
              <span>Architecture</span>
            </div>
          </button>

          <button
            onClick={() => onTabChange("concurrency")}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition-colors text-left ${
              activeTab === "concurrency"
                ? "bg-[#1C222B] text-[#F5F5F6] font-semibold border border-[#222730] shadow-sm"
                : "text-[#A3A4AD] hover:text-[#F5F5F6] hover:bg-[#13171D]"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Terminal className={`w-4 h-4 ${activeTab === "concurrency" ? "text-[#A3E635]" : "text-[#747680]"}`} />
              <span>Load &amp; Concurrency</span>
            </div>
          </button>

          <button
            onClick={() => onTabChange("interview")}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition-colors text-left ${
              activeTab === "interview"
                ? "bg-[#1C222B] text-[#F5F5F6] font-semibold border border-[#222730] shadow-sm"
                : "text-[#A3A4AD] hover:text-[#F5F5F6] hover:bg-[#13171D]"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <HelpCircle className={`w-4 h-4 ${activeTab === "interview" ? "text-[#A3E635]" : "text-[#747680]"}`} />
              <span>Interview Defense</span>
            </div>
          </button>
        </div>
      </div>

      {/* Footer / System Status */}
      <div className="p-3 border-t border-[#292A31] bg-[#0C0D10] text-[11px] font-mono text-[#747680] flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#45D6A0]" />
          <span>v4.9 AST ENGINE</span>
        </div>
        <span className="text-[#FF666B] font-semibold">SECURE</span>
      </div>
    </aside>
  );
}
