"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  GitBranch,
  Zap,
  TrendingUp,
  XCircle,
  CheckCircle,
  GitMerge,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { IntuitionCycle, ThoughtNode, ThoughtPath } from "@/lib/types";

interface IntuitionCycleProps {
  cycle: IntuitionCycle;
  question: string;
}

export function IntuitionCycleVisualization({ cycle, question }: IntuitionCycleProps) {
  const [selectedCycle, setSelectedCycle] = useState(0);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const currentCycle = cycle.cycles[selectedCycle];

  if (!currentCycle) return null;

  const getNodeColor = (type: ThoughtNode["type"]) => {
    switch (type) {
      case "hypothesis":
        return "bg-purple-50 border-purple-200 text-purple-700";
      case "analysis":
        return "bg-blue-50 border-blue-200 text-blue-700";
      case "evidence":
        return "bg-emerald-50 border-emerald-200 text-emerald-700";
      case "conclusion":
        return "bg-amber-50 border-amber-200 text-amber-700";
      case "contradiction":
        return "bg-red-50 border-red-200 text-red-700";
      default:
        return "bg-slate-50 border-slate-200 text-slate-700";
    }
  };

  const getPathBadgeColor = (outcome: ThoughtPath["outcome"]) => {
    switch (outcome) {
      case "accepted":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "rejected":
        return "bg-red-100 text-red-700 border-red-200";
      case "merged":
        return "bg-amber-100 text-amber-700 border-amber-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getOutcomeIcon = (outcome: ThoughtPath["outcome"]) => {
    switch (outcome) {
      case "accepted":
        return <CheckCircle className="h-3.5 w-3.5" />;
      case "rejected":
        return <XCircle className="h-3.5 w-3.5" />;
      case "merged":
        return <GitMerge className="h-3.5 w-3.5" />;
    }
  };

  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader className="border-b border-slate-200 bg-slate-50/50 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100">
              <Brain className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Intuition Cycle</h3>
              <p className="text-xs text-slate-500">Chain-of-Thought Analysis</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Clock className="h-3.5 w-3.5" />
              <span>{currentCycle.timeline}ms</span>
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="rounded-md p-1 hover:bg-slate-100 transition-colors"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-slate-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-500" />
              )}
            </button>
          </div>
        </div>

        {/* Cycle Selector (if multiple cycles) */}
        {cycle.cycles.length > 1 && (
          <div className="mt-3 flex gap-2">
            {cycle.cycles.map((_, index) => (
              <button
                key={index}
                onClick={() => setSelectedCycle(index)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  selectedCycle === index
                    ? "bg-purple-100 text-purple-700"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Cycle {index + 1}
              </button>
            ))}
          </div>
        )}
      </CardHeader>

      {isExpanded && (
        <CardContent className="p-6">
          {/* Thought Paths Overview */}
          <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {currentCycle.paths.map((path) => (
              <button
                key={path.id}
                onClick={() => setSelectedPath(selectedPath === path.id ? null : path.id)}
                className={`group relative overflow-hidden rounded-lg border-2 p-4 text-left transition-all ${
                  selectedPath === path.id
                    ? "border-purple-300 bg-purple-50/50 shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <GitBranch className="h-4 w-4 text-purple-500 flex-shrink-0" />
                    <span className="font-semibold text-sm text-slate-900">{path.name}</span>
                  </div>
                  <Badge
                    className={`border ${getPathBadgeColor(path.outcome)} flex items-center gap-1 px-2 py-0.5`}
                  >
                    {getOutcomeIcon(path.outcome)}
                    <span className="capitalize text-xs">{path.outcome}</span>
                  </Badge>
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Zap className="h-3 w-3" />
                    <span>{Math.round(path.confidenceScore * 100)}%</span>
                  </div>
                  <div className="text-slate-500">{path.nodes.length} steps</div>
                </div>
              </button>
            ))}
          </div>

          {/* Thought Nodes Display */}
          <div className="space-y-4">
            {currentCycle.paths
              .filter((path) => !selectedPath || path.id === selectedPath)
              .map((path) => (
                <div key={path.id} className="rounded-lg border border-slate-200 bg-slate-50/30 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <GitBranch className="h-4 w-4 text-slate-500" />
                    <span className="text-sm font-medium text-slate-700">{path.name}</span>
                    <Badge
                      className={`ml-auto border ${getPathBadgeColor(path.outcome)} flex items-center gap-1`}
                    >
                      {getOutcomeIcon(path.outcome)}
                      <span className="capitalize">{path.outcome}</span>
                    </Badge>
                  </div>

                  <div className="space-y-2.5">
                    {path.nodes.map((node, idx) => (
                      <div
                        key={node.id}
                        className={`group relative rounded-md border p-3 transition-all hover:shadow-sm ${getNodeColor(
                          node.type
                        )}`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wide opacity-70">
                            {node.type}
                          </span>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={`border-current text-[10px] px-1.5 py-0 ${
                                node.impact === "high"
                                  ? "bg-red-50"
                                  : node.impact === "medium"
                                  ? "bg-amber-50"
                                  : "bg-blue-50"
                              }`}
                            >
                              <TrendingUp className="mr-1 h-2.5 w-2.5" />
                              {node.impact}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-xs leading-relaxed mb-2">{node.content}</p>
                        <div className="flex items-center justify-between text-[10px] opacity-60">
                          <span>Step {idx + 1}</span>
                          <span>Confidence: {Math.round(node.confidence * 100)}%</span>
                        </div>

                        {/* Connection line to next node */}
                        {idx < path.nodes.length - 1 && (
                          <div className="absolute left-1/2 bottom-0 h-2.5 w-px bg-current opacity-20 translate-y-full" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>

          {/* Synthesis */}
          <div className="mt-6 rounded-lg border-2 border-purple-200 bg-purple-50/50 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-purple-700">
              <GitMerge className="h-4 w-4" />
              Synthesis
            </div>
            <p className="text-sm leading-relaxed text-slate-700">{currentCycle.synthesis}</p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
