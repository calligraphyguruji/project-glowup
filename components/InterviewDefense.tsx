import React from "react";
import { ShieldCheck, HelpCircle, Target } from "lucide-react";
import { InterviewDefenseItem } from "@/types/audit";

interface InterviewDefenseProps {
  items: InterviewDefenseItem[];
  companyName: string;
}

export function InterviewDefense({ items, companyName }: InterviewDefenseProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#FF666B]" />
          <h3 className="font-sans text-sm font-bold text-[#F5F5F6] tracking-tight">
            Staff Defense Chamber ({companyName})
          </h3>
        </div>
        <span className="font-mono text-[10px] text-[#A3A4AD] uppercase font-semibold">
          INTERVIEW DRILL
        </span>
      </div>

      <div className="space-y-3">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="rounded-xl bg-[#101114] border border-[#292A31] shadow-sm overflow-hidden"
          >
            <div className="p-4 flex flex-col gap-3">
              {/* Question */}
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[10px] text-[#747680] uppercase tracking-widest">
                  DRILL SCENARIO 0{idx + 1}
                </span>
                <h4 className="font-sans text-sm font-semibold text-[#F5F5F6] leading-snug">
                  “{item.question}”
                </h4>
              </div>

              {/* Intent Tag */}
              <div className="px-3 py-2 rounded-lg bg-[#17181D] border border-[#292A31] flex items-start gap-2.5">
                <Target className="w-3.5 h-3.5 text-[#F5BD50] shrink-0 mt-0.5" />
                <p className="font-sans text-xs text-[#A3A4AD] leading-snug">
                  <strong className="text-[#F5F5F6]">Interviewer Intent:</strong>{" "}
                  {item.interviewerIntent}
                </p>
              </div>

              {/* Talking Points */}
              <div className="flex flex-col gap-2 pt-0.5 font-sans text-xs">
                <span className="font-mono text-[10px] text-[#45D6A0] uppercase font-semibold tracking-wider">
                  BATTLE-TESTED DEFENSE POINTS:
                </span>
                {item.talkingPoints.map((point, pIdx) => (
                  <div key={pIdx} className="flex items-start gap-2.5 text-[#A3A4AD] leading-relaxed">
                    <span className="font-mono text-[#FF666B] font-bold text-[11px] shrink-0 mt-0.5">
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
