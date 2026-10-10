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
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-secondary" />
          <h3 className="font-mono text-sm font-semibold text-slate-100 uppercase tracking-wider">
            Concurrency Test Harness
          </h3>
        </div>
        <span className="font-mono text-[10px] text-secondary uppercase font-semibold">
          RACE_CONDITION.JS
        </span>
      </div>

      <div className="p-1.5 rounded-xl bg-surface-container-low border border-white/5 shadow-sm">
        <div className="p-3 rounded-lg bg-surface-container-lowest flex flex-col gap-2.5">
          {/* Action Row */}
          <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-white/5">
            <div className="flex items-center gap-1.5 font-mono text-xs text-secondary truncate">
              <Play className="w-3.5 h-3.5 text-primary-container" />
              <span>{script.runInstructions}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 rounded bg-surface-container-high text-slate-200 font-mono text-xs flex items-center gap-1.5 active:scale-95 transition-all border border-white/5"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-tertiary-container" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-slate-400" />
                    <span>Copy</span>
                  </>
                )}
              </button>
              <button
                onClick={handleDownload}
                className="px-2.5 py-1 rounded bg-surface-container-high text-slate-200 font-mono text-xs flex items-center gap-1.5 active:scale-95 transition-all border border-white/5"
              >
                <Download className="w-3 h-3 text-slate-400" />
                <span>.js</span>
              </button>
            </div>
          </div>

          <p className="font-sans text-xs text-slate-400">{script.targetScenario}</p>

          <pre className="p-3 rounded bg-surface-container-high/90 text-slate-300 font-mono text-xs overflow-x-auto leading-relaxed max-h-[340px]">
            <code>{script.code}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
