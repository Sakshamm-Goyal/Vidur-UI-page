"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Download,
  ExternalLink,
  Copy,
  RefreshCcw,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToastStore } from "@/lib/stores/toast-store";
import type { RunHistoryEntry } from "@/lib/types";

type RunHistoryItem = RunHistoryEntry;

export default function HistoryPage() {
  const router = useRouter();
  const { addToast } = useToastStore();

  const [runs, setRuns] = useState<RunHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<RunHistoryItem["status"] | "all">("all");

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/research/history");
        if (res.ok) {
          const data = (await res.json()) as { runs: RunHistoryItem[] };
          setRuns(data.runs);
        }
      } catch (error) {
        console.error("Failed to load history", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const filteredRuns = useMemo(() => {
    return runs.filter((run) => {
      const matchesSearch =
        run.query.toLowerCase().includes(search.toLowerCase()) ||
        run.ticker.toLowerCase().includes(search.toLowerCase()) ||
        run.runId.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || run.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [runs, search, statusFilter]);

  const handleExportCsv = () => {
    if (!runs.length) return;
    const headers = ["Run ID", "Query", "Ticker", "Status", "Confidence", "Duration (ms)", "Warnings", "Exported"];
    const rows = runs.map((run) => [
      run.runId,
      `"${run.query}"`,
      run.ticker,
      run.status,
      run.confidence ? (run.confidence * 100).toFixed(0) : "",
      run.durationMs ?? "",
      run.warningCount ?? 0,
      run.exported ? "Yes" : "No",
    ]);
    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "aime_run_history.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = (value: string, label: string) => {
    navigator.clipboard.writeText(value);
    addToast({
      title: "Copied",
      description: `${label} copied to clipboard.`,
      variant: "default",
    });
  };

  const handleRetry = async (runId: string) => {
    try {
      const res = await fetch(`/api/research/run/${runId}/retry`, { method: "POST" });
      if (!res.ok) throw new Error("Retry failed");
      addToast({
        title: "Re-run queued",
        description: "Pipeline restarted with identical parameters.",
        variant: "default",
      });
    } catch (error) {
      console.error("Retry error", error);
      addToast({
        title: "Unable to retry",
        description: "Retry request could not be completed. Please try again.",
        variant: "error",
      });
    }
  };

  const statusBadge = (status: RunHistoryItem["status"]) => {
    switch (status) {
      case "ready":
        return <Badge variant="success">Ready</Badge>;
      case "running":
        return <Badge variant="outline">Running</Badge>;
      case "queued":
        return <Badge variant="outline">Queued</Badge>;
      case "error":
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            Error
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Research History</h1>
          <p className="text-sm text-muted-foreground">
            Audit, reproduce, and export any institutional research run.
          </p>
        </div>
        <Button variant="outline" className="gap-2" onClick={handleExportCsv} disabled={!runs.length}>
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by query, ticker, or run ID…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            {["all", "ready", "running", "queued", "error"].map((status) => (
              <Button
                key={status}
                size="sm"
                variant={statusFilter === status ? "default" : "outline"}
                onClick={() => setStatusFilter(status as RunHistoryItem["status"] | "all")}
              >
                {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="mb-3 text-xs text-muted-foreground">
        Showing {filteredRuns.length} of {runs.length} runs
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="p-3 text-left">Run</th>
                  <th className="p-3 text-left">Query</th>
                  <th className="p-3 text-left">Created</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Confidence</th>
                  <th className="p-3 text-left">Duration</th>
                  <th className="p-3 text-left">Warnings</th>
                  <th className="p-3 text-left">Exports</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRuns.map((run) => (
                  <tr key={run.runId} className="border-b border-border/60 text-sm hover:bg-muted/40">
                    <td className="p-3 align-top">
                      <div className="flex items-center gap-2">
                        <code className="rounded bg-muted px-2 py-1 font-mono text-[11px]">
                          {run.runId}
                        </code>
                        <button
                          onClick={() => handleCopy(run.runId, "Run ID")}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                      {run.deep && (
                        <Badge variant="outline" className="mt-2 text-[10px]">
                          Deep Research
                        </Badge>
                      )}
                    </td>
                    <td className="p-3 max-w-md align-top">
                      <p className="font-medium">{run.query}</p>
                      <p className="text-xs text-muted-foreground">{run.ticker}</p>
                    </td>
                    <td className="p-3 align-top text-xs text-muted-foreground">
                      {new Date(run.createdAt).toLocaleString()}
                    </td>
                    <td className="p-3 align-top">{statusBadge(run.status)}</td>
                    <td className="p-3 align-top font-mono text-xs">
                      {run.confidence !== undefined ? `${Math.round(run.confidence * 100)}%` : "—"}
                    </td>
                    <td className="p-3 align-top text-xs text-muted-foreground">
                      {run.durationMs ? `${(run.durationMs / 1000).toFixed(1)}s` : "—"}
                    </td>
                    <td className="p-3 align-top text-xs text-muted-foreground">
                      {run.warningCount ?? 0}
                    </td>
                    <td className="p-3 align-top text-xs text-muted-foreground">
                      {run.exported ? "PDF/DOCX" : "—"}
                    </td>
                    <td className="p-3 align-top">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const url = new URL(`/research/${run.runId}`, window.location.origin);
                            url.searchParams.set("q", run.query);
                            url.searchParams.set("ticker", run.ticker);
                            url.searchParams.set("deep", run.deep ? "1" : "0");
                            router.push(url.pathname + url.search);
                          }}
                          className="gap-1 h-8 text-xs"
                        >
                          <ExternalLink className="h-3 w-3" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleCopy(`${window.location.origin}/research/${run.runId}`, "Share link")
                          }
                          className="gap-1 h-8 text-xs"
                        >
                          <Copy className="h-3 w-3" />
                          Share
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 h-8 text-xs"
                          onClick={() => handleRetry(run.runId)}
                        >
                          <RefreshCcw className="h-3 w-3" />
                          Reproduce
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!filteredRuns.length && !loading && (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No runs found matching your filters.
            </div>
          )}
          {loading && (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Loading history…
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
