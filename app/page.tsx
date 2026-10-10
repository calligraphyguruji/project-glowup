import React from "react";
import { Terminal, ShieldCheck, Sparkles, GitBranch } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen px-4 py-12 max-w-5xl mx-auto flex flex-col justify-center items-center text-center">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-950/20 text-cyan-400 text-xs font-mono mb-6">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Problem Statement 4: Open Innovation</span>
      </div>

      <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white mb-4">
        ProjectGlowUp <span className="text-cyan-400">AI</span>
      </h1>
      
      <p className="text-slate-400 max-w-2xl text-lg mb-8">
        Audit student GitHub repositories against real production engineering standards for Razorpay, Swiggy, Zerodha, and Amazon.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl text-left font-mono text-xs">
        <div className="p-4 rounded-lg border border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold mb-2">
            <Terminal className="w-4 h-4" />
            <span>01 Ingestion</span>
          </div>
          <p className="text-slate-400">Bounded GitHub tree & schema parser with campus CDN fallback.</p>
        </div>

        <div className="p-4 rounded-lg border border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2 text-amber-400 font-semibold mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>02 Heuristics</span>
          </div>
          <p className="text-slate-400">Static rule engine + Gemini Flash structured JSON audit.</p>
        </div>

        <div className="p-4 rounded-lg border border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-2">
            <GitBranch className="w-4 h-4" />
            <span>03 Architecture</span>
          </div>
          <p className="text-slate-400">Mermaid.js Before/After diagrams + runnable test scripts.</p>
        </div>
      </div>
    </main>
  );
}
