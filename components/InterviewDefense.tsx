import React from "react";
import { MessageSquareCode, Target, HelpCircle } from "lucide-react";
import { InterviewDefenseItem } from "@/types/audit";

interface InterviewDefenseProps {
  items: InterviewDefenseItem[];
  companyName: string;
}

export function InterviewDefense({ items, companyName }: InterviewDefenseProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
      <div className="pb-4 border-b border-slate-800">
        <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
          <MessageSquareCode className="w-4 h-4 text-cyan-400" />
          Technical Interview Defense Drill ({companyName})
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Exact questions senior engineering panels ask about your project and model defense talking points.
        </p>
      </div>

      <div className="mt-4 space-y-4">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="rounded-lg border border-slate-800/80 bg-slate-950/70 p-4 transition-all hover:border-slate-700"
          >
            <div className="flex items-start gap-2.5">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-cyan-950 border border-cyan-800/50 text-cyan-400 font-mono text-xs flex items-center justify-center font-bold">
                {idx + 1}
              </span>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-slate-200 leading-snug">
                  {item.question}
                </h4>

                <div className="mt-2 text-xs text-slate-400 flex items-center gap-1.5 font-mono">
                  <Target className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span className="text-slate-300 font-medium">Interviewer Intent:</span>
                  <span className="italic">{item.interviewerIntent}</span>
                </div>

                <div className="mt-3 pl-3 border-l-2 border-cyan-500/40 space-y-1.5">
                  <p className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                    Defense Talking Points:
                  </p>
                  {item.talkingPoints.map((point, pIdx) => (
                    <div key={pIdx} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                      <span className="text-cyan-400 mt-0.5 font-bold">•</span>
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
