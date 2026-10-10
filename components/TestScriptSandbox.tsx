"use client";

import React, { useState } from "react";
import { Copy, Check, Terminal, Play } from "lucide-react";
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

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            {script.title}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">{script.targetScenario}</p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => {
              const blob = new Blob([script.code], { type: "text/javascript" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `concurrency-test.${script.language === "python" ? "py" : "js"}`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-xs font-mono text-slate-300 transition-colors"
          >
            <span>Download .js</span>
          </button>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cyan-800/50 bg-cyan-950/40 hover:bg-cyan-900/40 text-xs font-mono text-cyan-300 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-cyan-400" />
                <span>Copy Script</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between bg-slate-950 px-4 py-2 rounded-t-lg border border-b-0 border-slate-800 text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5">
            <Play className="w-3 h-3 text-cyan-400" />
            Execution Command: <code className="text-cyan-300 ml-1">{script.runInstructions}</code>
          </span>
          <span className="text-[11px] text-slate-500 uppercase">{script.language}</span>
        </div>

        <pre className="p-4 bg-slate-950 rounded-b-lg border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed max-h-[360px]">
          <code>{script.code}</code>
        </pre>
      </div>
    </div>
  );
}
