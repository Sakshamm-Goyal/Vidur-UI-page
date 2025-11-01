"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  Download,
  RefreshCcw,
  Share2,
  RefreshCw,
} from "lucide-react";
import { ThinkingTimeline } from "@/components/research/thinking-timeline";
import { InsightCanvas } from "@/components/research/insight-canvas";
import { TaskDrawer } from "@/components/research/task-drawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToastStore } from "@/lib/stores/toast-store";
import type {
  LogEvent,
  ResearchResults,
  ResearchRun,
  RunStatus,
  SubAgentTask,
} from "@/lib/types";

const STATUS_POLL_INTERVAL = 1400;
const LOGS_POLL_INTERVAL = 4000;
const TASKS_POLL_INTERVAL = 5000;

export default function ResearchRunPage() {
  const params = useParams();
  const runId = params.runId as string;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToastStore();

  const [run, setRun] = useState<ResearchRun | null>(null);
  const [status, setStatus] = useState<RunStatus | null>(null);
  const [results, setResults] = useState<ResearchResults | null>(null);
  const [logs, setLogs] = useState<LogEvent[]>([]);
  const [tasks, setTasks] = useState<SubAgentTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<SubAgentTask | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isRehydrating, setIsRehydrating] = useState(false);

  const seedQuery = searchParams.get("q") || undefined;
  const seedTicker = searchParams.get("ticker") || undefined;
  const seedDeep = searchParams.get("deep") === "1";

  const rehydrateRun = useCallback(async () => {
    if (!seedQuery || !seedTicker || isRehydrating) return;
    try {
      setIsRehydrating(true);
      const response = await fetch("/api/research/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: seedQuery, ticker: seedTicker, deep: seedDeep }),
      });
      if (!response.ok) {
        throw new Error("Failed to rehydrate run");
      }
      const newRun = (await response.json()) as ResearchRun;
      const url = new URL(`/research/${newRun.runId}`, window.location.origin);
      url.searchParams.set("q", seedQuery);
      url.searchParams.set("ticker", seedTicker);
      url.searchParams.set("deep", seedDeep ? "1" : "0");
      router.replace(url.pathname + url.search);
    } catch (error) {
      console.error("Error rehydrating run:", error);
    } finally {
      setIsRehydrating(false);
    }
  }, [seedQuery, seedTicker, seedDeep, isRehydrating, router]);

  const fetchRun = useCallback(async () => {
    if (!runId || isRehydrating) return;
    try {
      const res = await fetch(`/api/research/run/${runId}/details`);
      if (res.status === 404) {
        await rehydrateRun();
        return;
      }
      if (res.ok) {
        const data = (await res.json()) as ResearchRun;
        setRun(data);
      }
    } catch (error) {
      console.error("Error fetching run details:", error);
    }
  }, [runId, isRehydrating, rehydrateRun]);

  const fetchResults = useCallback(async () => {
    if (!runId) return;
    try {
      const res = await fetch(`/api/research/run/${runId}/results`);
      if (res.ok) {
        const data = (await res.json()) as ResearchResults;
        setResults(data);
      }
    } catch (error) {
      console.error("Error fetching run results:", error);
    }
  }, [runId]);

  const fetchStatus = useCallback(async () => {
    if (!runId || isRehydrating) return;
    try {
      const res = await fetch(`/api/research/run/${runId}/status`);
      if (res.status === 404) {
        await rehydrateRun();
        return;
      }
      if (res.ok) {
        const data = (await res.json()) as RunStatus;
        setStatus(data);
        if (data.overall === "ready" && !results) {
          fetchResults();
        }
      }
    } catch (error) {
      console.error("Error fetching run status:", error);
    }
  }, [runId, results, fetchResults, isRehydrating, rehydrateRun]);

  const fetchLogs = useCallback(async () => {
    if (!runId) return;
    try {
      const res = await fetch(`/api/research/run/${runId}/logs`);
      if (res.ok) {
        const data = (await res.json()) as { logs: LogEvent[] };
        setLogs(data.logs);
      }
    } catch (error) {
      console.error("Error fetching run logs:", error);
    }
  }, [runId]);

  const fetchTasks = useCallback(async () => {
    if (!runId) return;
    try {
      const res = await fetch(`/api/research/run/${runId}/tasks`);
      if (res.ok) {
        const data = (await res.json()) as { tasks: SubAgentTask[] };
        setTasks(data.tasks);
        if (selectedTask) {
          const updated = data.tasks.find((task) => task.agentId === selectedTask.agentId);
          if (updated) {
            setSelectedTask(updated);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching sub-agent tasks:", error);
    }
  }, [runId, selectedTask]);

  useEffect(() => {
    fetchRun();
    fetchStatus();
    fetchLogs();
    fetchTasks();
  }, [fetchRun, fetchStatus, fetchLogs, fetchTasks]);

  useEffect(() => {
    const statusInterval = setInterval(fetchStatus, STATUS_POLL_INTERVAL);
    const logsInterval = setInterval(fetchLogs, LOGS_POLL_INTERVAL);
    const tasksInterval = setInterval(fetchTasks, TASKS_POLL_INTERVAL);
    return () => {
      clearInterval(statusInterval);
      clearInterval(logsInterval);
      clearInterval(tasksInterval);
    };
  }, [fetchStatus, fetchLogs, fetchTasks]);

  const handleAgentClick = useCallback(
    (agentId: string) => {
      const task = tasks.find((item) => item.agentId === agentId);
      if (task) {
        setSelectedTask(task);
      }
    },
    [tasks, runId],
  );

  const handleRetry = useCallback(
    async (agentName?: string) => {
      if (!runId) return;
      try {
        setIsRetrying(true);
        const res = await fetch(`/api/research/run/${runId}/retry`, { method: "POST" });
        if (!res.ok) {
          throw new Error("Retry failed");
        }
        const data = (await res.json()) as RunStatus;
        setStatus(data);
        setResults(null);
        setSelectedTask(null);
        fetchLogs();
        fetchTasks();
        addToast({
          title: "Re-run initiated",
          description: agentName
            ? `${agentName} sub-agent is being reproduced with the same parameters.`
            : "Pipeline restarted. Refreshing status shortly.",
          variant: "default",
        });
      } catch (error) {
        console.error("Error retrying run:", error);
        addToast({
          title: "Retry failed",
          description: "Unable to reproduce the run. Please try again.",
          variant: "error",
        });
      } finally {
        setIsRetrying(false);
      }
    },
    [addToast, fetchLogs, fetchTasks, runId],
  );

  const handleReport = useCallback(() => {
    if (!runId) return;
    router.push(`/report-builder?runId=${runId}`);
  }, [runId, router]);

  const stageProgress = useMemo(() => {
    if (!status) return 0;
    return Math.round((status.progress || 0) * 100);
  }, [status]);

  const overallStatus = status?.overall ?? "queued";
  const isReady = overallStatus === "ready";
  const showError = overallStatus === "error";

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-10 grid gap-6 md:grid-cols-12">
        <Card className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-blue-500/15 via-purple-500/10 to-transparent shadow-xl shadow-blue-900/15 md:col-span-8">
          <div className="absolute inset-y-0 right-0 hidden w-44 bg-[radial-gradient(circle_at_top,rgba(79,70,229,0.18),transparent_70%)] md:block" />
          <CardContent className="relative space-y-5 p-8">
            <div className="flex items-center gap-3">
              <Badge
                variant={
                  overallStatus === "ready"
                    ? "success"
                    : overallStatus === "error"
                    ? "destructive"
                    : "outline"
                }
                className="capitalize text-sm px-3 py-1"
              >
                {overallStatus}
              </Badge>
              {run?.deep && <Badge variant="outline" className="border-primary/50 text-primary text-sm px-3 py-1">Deep Research</Badge>}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                  Research Run #{runId?.slice(-6)}
                </h1>
                <p className="text-base text-muted-foreground font-medium">
                  {run?.ticker} • {run?.createdAt ? new Date(run.createdAt).toLocaleString() : "Loading metadata…"}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="outline" size="sm" className="gap-2 rounded-full h-10 px-4">
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 rounded-full h-10 px-4"
                  onClick={() => handleRetry()}
                  disabled={isRetrying}
                  data-retry
                >
                  <RefreshCcw className="h-4 w-4" />
                  Re-run
                </Button>
                <Button variant="default" size="sm" className="gap-2 rounded-full h-10 px-4" onClick={handleReport} disabled={!isReady}>
                  <Download className="h-4 w-4" />
                  Generate Report
                </Button>
              </div>
            </div>
            <Card className="border border-slate-200 bg-white/80 backdrop-blur-sm p-0 shadow-md">
              <CardContent className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Research Question
                </p>
                <p className="text-base font-medium text-foreground leading-relaxed">
                  {run?.query || "Loading question context…"}
                </p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white shadow-xl shadow-blue-900/10 p-8 md:col-span-4">
          <div className="flex items-center justify-between text-sm font-semibold text-muted-foreground mb-5">
            <span className="text-base">Pipeline Progress</span>
            <span className="font-mono text-xl text-foreground font-bold">{stageProgress}%</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200 shadow-inner">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all shadow-sm"
              style={{ width: `${stageProgress}%` }}
            />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 text-xs text-muted-foreground">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium text-slate-600 shadow-sm">
              <span className="text-xs uppercase tracking-wide">ETA</span>
              <span className="mt-2 block text-xl font-bold text-slate-900">
                {run?.etaMs ? Math.round(run.etaMs / 1000) : 25} sec
              </span>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium text-slate-600 shadow-sm">
              <span className="text-xs uppercase tracking-wide">Warnings</span>
              <span className="mt-2 block text-xl font-bold text-slate-900">
                {tasks.reduce((count, task) => (task.status === "error" ? count + 1 : count), 0)}
              </span>
            </div>
          </div>
          <p className="mt-6 text-sm text-muted-foreground leading-relaxed">
            Sub-agents execute sequential checks with deterministic seeds. Soft-errors can be retried without losing traceability.
          </p>
        </Card>
      </div>

      {showError && (
        <Card className="mb-10 rounded-xl border-destructive/40 bg-destructive/5 p-6 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-destructive/10 p-2">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-destructive mb-2">Soft error captured</h3>
              <p className="text-sm text-destructive/80 leading-relaxed">
                One of the sub-agents hit a transient vendor issue. Re-run the agent or restart the pipeline.
              </p>
              <Button
                size="sm"
                className="mt-4 h-10 px-4"
                onClick={() => handleRetry(selectedTask?.agent)}
                disabled={isRetrying}
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                Retry pipeline
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-8 md:grid-cols-12">
        <div className="md:col-span-4 h-[calc(100vh-16rem)] md:sticky md:top-24">
          {status ? (
            <ThinkingTimeline
              stages={status.stages}
              logs={logs}
              onAgentClick={handleAgentClick}
              onRetryAgent={(agentId) => {
                const agent = tasks.find((task) => task.agentId === agentId);
                handleRetry(agent?.agent);
              }}
            />
          ) : (
            <div className="flex h-full items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 shadow-inner">
              <div className="text-center px-6">
                <RefreshCw className="mx-auto mb-4 h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-base font-medium text-muted-foreground">Fetching pipeline status…</p>
              </div>
            </div>
          )}
        </div>

        <div className="md:col-span-8">
          {isReady && results ? (
            <InsightCanvas
              results={results}
              ticker={results.ticker.symbol}
              query={run?.query || ""}
            />
          ) : (
            <Card className="min-h-[720px] overflow-hidden rounded-2xl border-2 border-slate-200 bg-white shadow-xl shadow-slate-900/10">
              <CardContent className="flex h-full flex-col p-8">
                <div className="space-y-5 flex-1">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 shadow-inner">
                      <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-1">
                        {run?.ticker ? `Analyzing ${run.ticker}…` : "Running analysis…"}
                      </h3>
                      <p className="text-sm text-muted-foreground font-medium">
                        Progress {stageProgress}% · orchestrating multi-agent checks
                      </p>
                    </div>
                  </div>

                  {/* Show progressive Q&A if available */}
                  {status?.progressiveQna && status.progressiveQna.length > 0 ? (
                    <div className="space-y-4 max-h-[520px] overflow-y-auto pr-2">
                      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 sticky top-0 bg-white z-10">
                        <h4 className="text-sm font-semibold text-slate-700">Model Analysis Q&A</h4>
                        <span className="text-xs text-slate-500">
                          {status.progressiveQna.filter(q => q.status === "complete").length} / {status.progressiveQna.length}
                        </span>
                      </div>
                      {status.progressiveQna.map((qna, idx) => (
                        <div key={idx} className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                          <div className="flex items-start gap-2">
                            <span className="mt-0.5 flex-shrink-0 rounded bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                              Q{idx + 1}
                            </span>
                            <p className="text-sm font-semibold text-slate-900 leading-relaxed">{qna.question}</p>
                          </div>
                          {qna.status === "thinking" && (
                            <div className="flex items-center gap-2 text-xs text-slate-500 ml-8">
                              <RefreshCw className="h-3 w-3 animate-spin" />
                              <span>Thinking...</span>
                            </div>
                          )}
                          {qna.status === "answering" && (
                            <div className="flex items-center gap-2 text-xs text-slate-500 ml-8">
                              <RefreshCw className="h-3 w-3 animate-spin" />
                              <span>Formulating answer...</span>
                            </div>
                          )}
                          {qna.status === "complete" && qna.answer && (
                            <div className="flex items-start gap-2">
                              <span className="mt-0.5 flex-shrink-0 rounded bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                                A{idx + 1}
                              </span>
                              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap flex-1">
                                {qna.answer}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-5 shadow-inner md:grid-cols-3">
                      {[1, 2, 3].map((idx) => (
                        <div key={idx} className="space-y-3">
                          <div className="h-3 w-28 animate-pulse rounded bg-muted" />
                          <div className="h-2.5 w-full animate-pulse rounded bg-muted/80" />
                          <div className="h-2.5 w-3/4 animate-pulse rounded bg-muted/70" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-3 text-sm text-muted-foreground mt-6 pt-6 border-t border-slate-200">
                  <p className="font-semibold uppercase tracking-wider text-muted-foreground/90 text-xs">
                    Live notes
                  </p>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-lg border border-border/60 bg-background/70 p-3 shadow-sm text-xs">
                      Liquidity agent sizing FII vs DII flow deltas (30D/90D).
                    </div>
                    <div className="rounded-lg border border-border/60 bg-background/70 p-3 shadow-sm text-xs">
                      Macro agent replaying INR sensitivity to Brent shocks.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <TaskDrawer
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onReproduce={async (task) => handleRetry(task.agent)}
      />
    </div>
  );
}
