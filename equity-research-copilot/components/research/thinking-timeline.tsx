"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Clock3,
  ChevronDown,
  ChevronRight,
  RefreshCcw,
  Sparkles,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LogEvent, StageStatus, SubAgentStatus } from "@/lib/types";

interface ThinkingTimelineProps {
  stages: StageStatus[];
  logs?: LogEvent[];
  onAgentClick?: (agentId: string) => void;
  onRetryAgent?: (agentId: string) => void;
}

const STAGE_META: Record<string, { label: string; description: string }> = {
  decompose: {
    label: "Decompose Question",
    description: "Interpreting intent, mapping outputs, staging the pipeline",
  },
  retrieve: {
    label: "Retrieve Evidence",
    description: "Running six specialised agents across liquidity, sentiment, macro…",
  },
  analyze: {
    label: "Analyze",
    description: "Normalising data, scoring signals, building factor stacks",
  },
  synthesize: {
    label: "Synthesize",
    description: "Cross-checking narratives, reconciling upstream signals",
  },
  draft: {
    label: "Draft Report",
    description: "Generating institutional deliverables, citations, reproducibility notes",
  },
};

const statusTone: Record<string, string> = {
  queued: "text-muted-foreground",
  running: "text-blue-600",
  fetching: "text-blue-600",
  parsed: "text-indigo-600",
  scored: "text-emerald-600",
  done: "text-emerald-600",
  error: "text-red-600",
};

function StageStatusIcon({ status }: { status: string }) {
  if (status === "done" || status === "scored") {
    return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
  }
  if (status === "error") {
    return <AlertTriangle className="h-4 w-4 text-red-500" />;
  }
  if (status === "running" || status === "fetching" || status === "parsed") {
    return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
  }
  return <Clock3 className="h-4 w-4 text-slate-400" />;
}

function AgentRow({
  agent,
  onAgentClick,
  onRetryAgent,
}: {
  agent: SubAgentStatus;
  onAgentClick?: (agentId: string) => void;
  onRetryAgent?: (agentId: string) => void;
}) {
  const isError = agent.status === "error";

  return (
    <div
      className={cn(
        "group rounded-lg border border-slate-200 bg-slate-50 px-4 py-4 transition hover:bg-slate-100",
        isError && "border-destructive/40 bg-red-50"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <button
          onClick={() => onAgentClick?.(agent.id)}
          className="flex items-start gap-3 text-left flex-1 min-w-0"
        >
          <div className="flex-shrink-0 mt-0.5">
            <StageStatusIcon status={agent.status} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold mb-2">{agent.name}</p>
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
              <span className="whitespace-nowrap">{Math.round(agent.coverage * 100)}% coverage</span>
              <span>•</span>
              <span className="whitespace-nowrap">{Math.round(agent.confidence * 100)}% confidence</span>
              <span>•</span>
              <span className="whitespace-nowrap">{agent.latencyMs} ms</span>
            </div>
          </div>
        </button>
        <div className="flex-shrink-0">
          {isError ? (
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1 text-xs text-destructive border-destructive/40 hover:bg-destructive/10"
              onClick={() => onRetryAgent?.(agent.id)}
            >
              <RefreshCcw className="h-3 w-3" />
              Retry
            </Button>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => onAgentClick?.(agent.id)}
            >
              Details
              <ChevronRight className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
      {agent.badges && agent.badges.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
          {agent.badges.map((badge, idx) => (
            <span
              key={idx}
              className={cn(
                "inline-flex items-center gap-1 rounded-full bg-background/70 px-2 py-1 font-medium shadow-sm",
                badge.tone === "positive" && "text-emerald-600",
                badge.tone === "negative" && "text-red-600",
                (!badge.tone || badge.tone === "neutral") && "text-muted-foreground"
              )}
            >
              <span className="uppercase tracking-wide">{badge.label}</span>
              <span>{badge.value}</span>
            </span>
          ))}
        </div>
      )}
      {agent.issues && agent.issues.length > 0 && (
        <div className="mt-2 space-y-1 rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-1.5 text-xs text-destructive">
          {agent.issues.map((issue, idx) => (
            <p key={idx}>• {issue}</p>
          ))}
        </div>
      )}
    </div>
  );
}

export function ThinkingTimeline({
  stages,
  logs = [],
  onAgentClick,
  onRetryAgent,
}: ThinkingTimelineProps) {
  const [expandedStageId, setExpandedStageId] = useState<string>("retrieve");

  const stageOrder = useMemo(
    () => stages.sort((a, b) => Object.keys(STAGE_META).indexOf(a.id) - Object.keys(STAGE_META).indexOf(b.id)),
    [stages]
  );

  const recentLogs = useMemo(() => logs.slice(-12).reverse(), [logs]);

  return (
    <Card className="flex h-full flex-col overflow-hidden rounded-2xl border-2 border-slate-200 bg-white shadow-xl shadow-slate-900/10">
      <div className="border-b border-slate-200 bg-gradient-to-r from-blue-500/15 via-white to-transparent px-5 py-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-5 w-5 text-blue-600" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
            Model Thinking Timeline
          </h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Multi-agent orchestration with live status, coverage, and confidence signals.
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-5 px-5 py-5">
          {stageOrder.map((stage) => {
            const meta = STAGE_META[stage.id] ?? { label: stage.id, description: "" };
            const isExpanded = expandedStageId === stage.id;
            const tone = statusTone[stage.status] ?? "text-muted-foreground";
            const logForStage = logs.filter((log) => log.agent === meta.label || log.agent === meta.label.split(" ")[0]);

            return (
              <div
                key={stage.id}
                className={cn(
                  "relative overflow-hidden rounded-xl border-2 border-slate-200 bg-white shadow-md transition",
                  stage.status === "done" && "ring-2 ring-emerald-400/40",
                  stage.status === "error" && "ring-2 ring-red-400/40"
                )}
              >
                <button
                  onClick={() => setExpandedStageId(isExpanded ? "" : stage.id)}
                  className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left transition hover:bg-muted/40"
                >
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-muted/60 shadow-sm">
                      <StageStatusIcon status={stage.status} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={cn("text-base font-bold block mb-3", tone)}>{meta.label}</span>
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <Badge variant="outline" className="text-xs font-mono whitespace-nowrap px-3 py-1">
                          {Math.round(stage.coverage * 100)}% coverage
                        </Badge>
                        <Badge variant="outline" className="text-xs font-mono whitespace-nowrap px-3 py-1">
                          {Math.round(stage.confidence * 100)}% confidence
                        </Badge>
                        {stage.latencyMs > 0 && (
                          <Badge variant="outline" className="text-xs font-mono whitespace-nowrap px-3 py-1">
                            {stage.latencyMs} ms
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{meta.description}</p>
                    </div>
                  </div>
                  <div className="flex-shrink-0 mt-1">
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="space-y-4 border-t border-slate-200 bg-white px-5 py-5">
                    {stage.id === "retrieve" && stage.agents ? (
                      <div className="space-y-3">
                        {stage.agents.map((agent) => (
                          <AgentRow
                            key={agent.id}
                            agent={agent}
                            onAgentClick={onAgentClick}
                            onRetryAgent={onRetryAgent}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
                        {stage.status === "done"
                          ? `${meta.label} completed in ${stage.latencyMs} ms`
                          : "Awaiting handoff from upstream agents."}
                      </div>
                    )}
                    {logForStage.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Stage Notes
                        </p>
                        <ul className="space-y-2">
                          {logForStage.slice(-4).map((event, idx) => (
                            <li key={`${event.agent}-${idx}`} className="flex items-start gap-3 text-xs">
                              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500" />
                              <div>
                                <p className="font-medium text-muted-foreground/80">
                                  {new Date(event.time).toLocaleTimeString()} • {event.agent}
                                </p>
                                <p className="text-muted-foreground">{event.message}</p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {recentLogs.length > 0 && (
        <div className="border-t-2 border-slate-200 bg-slate-50 px-5 py-5 flex flex-col min-h-96">
          <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900 flex-shrink-0">
            <Sparkles className="h-4 w-4" />
            Latest Signals
          </div>
          <div className="space-y-3 text-sm overflow-y-auto flex-1">
            {recentLogs.map((event, idx) => (
              <div key={`${event.time}-${idx}`} className="flex items-start justify-between gap-4 py-1">
                <div className="flex-1 text-muted-foreground leading-relaxed">
                  <span className="font-bold text-foreground">{event.agent}</span> — {event.message}
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                  {new Date(event.time).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
