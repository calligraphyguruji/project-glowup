import React from "react";
import { ShieldCheck, HelpCircle, Target } from "lucide-react";
import { InterviewDefenseItem } from "@/types/audit";

interface InterviewDefenseProps {
  items: InterviewDefenseItem[];
  companyName: string;
}

export function InterviewDefense({ items, companyName }: InterviewDefenseProps) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary-container" />
          <h3 className="font-mono text-sm font-semibold text-slate-100 uppercase tracking-wider">
            Staff Defense Chamber ({companyName})
          </h3>
        </div>
        <span className="font-mono text-[10px] text-primary-container uppercase font-semibold">
          INTERVIEW DRILL
        </span>
      </div>

      <div className="space-y-3">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="p-1 rounded-xl bg-surface-container-low border border-white/5 shadow-sm"
          >
            <div className="p-3.5 rounded-lg bg-surface-container-lowest flex flex-col gap-3">
              {/* Question */}
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">
                  DRILL SCENARIO 0{idx + 1}
                </span>
                <h4 className="font-sans text-sm font-semibold text-primary leading-snug">
                  “{item.question}”
                </h4>
              </div>

              {/* Intent Tag */}
              <div className="px-2.5 py-1.5 rounded bg-surface-container-high border border-white/5 flex items-start gap-2">
                <Target className="w-3.5 h-3.5 text-secondary shrink-0 mt-0.5" />
                <p className="font-sans text-xs text-slate-300 leading-snug">
                  <strong className="text-slate-100">Interviewer Intent:</strong>{" "}
                  {item.interviewerIntent}
                </p>
              </div>

              {/* Talking Points */}
              <div className="flex flex-col gap-2 pt-0.5 font-sans text-xs">
                <span className="font-mono text-[10px] text-tertiary-container uppercase font-semibold tracking-wider">
                  BATTLE-TESTED DEFENSE POINTS:
                </span>
                {item.talkingPoints.map((point, pIdx) => (
                  <div key={pIdx} className="flex items-start gap-2 text-slate-300 leading-relaxed">
                    <span className="font-mono text-primary-container font-bold text-[11px] shrink-0 mt-0.5">
                      0{pIdx + 1}
                    </span>
                    <p>{point}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
