"use client";

import React, { useState } from "react";
import { Copy, Check, Terminal, Download, Play } from "lucide-react";
import { StressTestScript } from "@/types/audit";

interface TestScriptSandboxProps {
  script: StressTestScript;
}

export function TestScriptSandbox({ script }: TestScriptSandboxProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(script.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleDownload = () => {
    const blob = new Blob([script.code], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `concurrency-exploit.${script.language === "python" ? "py" : "js"}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#FF666B]" />
          <h3 className="font-sans text-sm font-bold text-[#F5F5F6] tracking-tight">
            Concurrency Test Harness
          </h3>
        </div>
        <span className="font-mono text-[10px] text-[#A3A4AD] uppercase font-semibold">
          RACE_CONDITION.JS
        </span>
      </div>

      <div className="rounded-xl bg-[#101114] border border-[#292A31] shadow-sm overflow-hidden">
        <div className="p-3.5 flex flex-col gap-3">
          {/* Action Row */}
          <div className="flex items-center justify-between flex-wrap gap-2 pb-2.5 border-b border-[#1F2026]">
            <div className="flex items-center gap-2 font-mono text-xs text-[#A3A4AD] truncate">
              <Play className="w-3.5 h-3.5 text-[#FF666B]" />
              <span className="text-[#F5F5F6] font-semibold">{script.runInstructions}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 rounded-md bg-[#17181D] hover:bg-[#202127] border border-[#292A31] text-xs font-mono text-[#F5F5F6] flex items-center gap-1.5 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#45D6A0]" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#A3A4AD]" />
                    <span>Copy</span>
                  </>
                )}
              </button>
              <button
                onClick={handleDownload}
                className="px-2.5 py-1 rounded-md bg-[#17181D] hover:bg-[#202127] border border-[#292A31] text-xs font-mono text-[#F5F5F6] flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-[#A3A4AD]" />
                <span>.js</span>
              </button>
            </div>
          </div>

          <p className="font-sans text-xs text-[#A3A4AD]">{script.targetScenario}</p>

          <pre className="p-3 rounded-lg bg-[#0C0D10] border border-[#1F2026] text-[#F5F5F6] font-mono text-xs overflow-x-auto leading-relaxed max-h-[340px]">
            <code>{script.code}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
