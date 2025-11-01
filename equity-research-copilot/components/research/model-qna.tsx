"use client";

import { QnaPair, IntuitionCycle } from "@/lib/types";
import { MessageSquare } from "lucide-react";
import { IntuitionCycleVisualization } from "./intuition-cycle";
import { useMemo } from "react";

interface ModelQnaProps {
  qnaPairs?: QnaPair[];
}

export function ModelQna({ qnaPairs }: ModelQnaProps) {
  if (!qnaPairs || qnaPairs.length === 0) {
    return null;
  }

  // Combine all intuition cycles into one
  const combinedIntuitionCycle = useMemo(() => {
    const pairsWithCycles = qnaPairs.filter(pair => pair.intuitionCycle);
    if (pairsWithCycles.length === 0) return null;

    // Merge all cycles from all Q&A pairs
    const allCycles = pairsWithCycles.flatMap(pair =>
      pair.intuitionCycle!.cycles.map(cycle => ({
        ...cycle,
        question: pair.question // Attach the original question
      }))
    );

    return {
      cycles: allCycles
    } as IntuitionCycle;
  }, [qnaPairs]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <MessageSquare className="h-5 w-5 text-slate-600" />
        <h2 className="text-lg font-semibold text-slate-900">
          Model Analysis Q&A
        </h2>
        <span className="ml-auto text-xs text-slate-500">
          {qnaPairs.length} {qnaPairs.length === 1 ? "question" : "questions"}
        </span>
      </div>

      {/* Q&A Pairs */}
      <div className="space-y-4">
        {qnaPairs.map((pair, index) => (
          <div
            key={index}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="mb-4">
              <div className="mb-2 flex items-start gap-2">
                <span className="mt-0.5 flex-shrink-0 rounded bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                  Q{index + 1}
                </span>
                <p className="font-semibold text-slate-900 leading-relaxed">
                  {pair.question}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="mt-0.5 flex-shrink-0 rounded bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                A{index + 1}
              </span>
              <div className="flex-1 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {pair.answer}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Combined Intuition Cycle Visualization at the end */}
      {combinedIntuitionCycle && (
        <div className="mt-8">
          <IntuitionCycleVisualization
            cycle={combinedIntuitionCycle}
            question="Combined Chain-of-Thought Analysis"
          />
        </div>
      )}
    </div>
  );
}
