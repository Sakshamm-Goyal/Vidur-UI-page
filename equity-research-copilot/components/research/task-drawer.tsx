"use client";

import { useState } from "react";
import { X, RefreshCw, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import type { SubAgentTask } from "@/lib/types";

interface TaskDrawerProps {
  task: SubAgentTask | null;
  onClose: () => void;
  onReproduce?: (task: SubAgentTask) => Promise<void>;
}

export function TaskDrawer({ task, onClose, onReproduce }: TaskDrawerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!task) return null;

  const handleReproduce = async () => {
    if (!onReproduce) return;
    try {
      setIsSubmitting(true);
      await onReproduce(task);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />

      <div className="fixed right-0 top-0 bottom-0 z-50 flex w-[600px] flex-col border-l bg-background shadow-2xl">
        <div className="border-b p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Sub-Agent Deep Dive
              </p>
              <h2 className="text-xl font-bold">{task.agent}</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant={
                task.status === "error"
                  ? "destructive"
                  : task.status === "scored"
                  ? "success"
                  : "secondary"
              }
            >
              {task.status}
            </Badge>
            <Badge variant="outline">
              Coverage {Math.round(task.coverage * 100)}%
            </Badge>
            <Badge variant="outline">
              Confidence {Math.round(task.confidence * 100)}%
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3" />
              {task.latencyMs} ms
            </Badge>
          </div>
        </div>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">
            {task.errors && task.errors.length > 0 && (
              <Card className="border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
                <div className="mb-2 flex items-center gap-2 font-semibold">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Soft Error Captured</span>
                </div>
                <ul className="space-y-1">
                  {task.errors.map((err, idx) => (
                    <li key={idx}>• {err}</li>
                  ))}
                </ul>
              </Card>
            )}

            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Sub-questions executed
              </h3>
              <div className="space-y-2">
                {task.queries.map((query, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-sm"
                  >
                    {query}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Processing timeline
              </h3>
              <div className="space-y-3">
                {task.notes.map((note, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="flex h-full w-1 flex-shrink-0 rounded-full bg-primary" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">
                        {new Date(note.timestamp).toLocaleTimeString()}
                      </p>
                      <p className="text-sm">{note.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Primary sources
              </h3>
              <div className="space-y-2">
                {task.sources.map((source, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-border/60 px-3 py-2 text-sm"
                  >
                    <p className="font-medium">{source.title}</p>
                    <p className="text-xs text-muted-foreground">{source.domain}</p>
                  </div>
                ))}
              </div>
            </div>

            {task.whatsMissing && task.whatsMissing.length > 0 && (
              <Card className="border-yellow-200 bg-yellow-50/70 p-4 text-sm dark:border-yellow-800 dark:bg-yellow-950/40">
                <h3 className="mb-2 font-semibold text-yellow-900 dark:text-yellow-200">
                  What's Missing
                </h3>
                <ul className="space-y-1 text-yellow-900 dark:text-yellow-100">
                  {task.whatsMissing.map((item, idx) => (
                    <li key={idx}>• {item}</li>
                  ))}
                </ul>
              </Card>
            )}

            {task.nextActions && task.nextActions.length > 0 && (
              <Card className="border-blue-200 bg-blue-50/60 p-4 text-sm dark:border-blue-900 dark:bg-blue-950/30">
                <h3 className="mb-2 font-semibold text-blue-900 dark:text-blue-100">
                  Next Actions
                </h3>
                <ul className="space-y-1 text-blue-900 dark:text-blue-200">
                  {task.nextActions.map((item, idx) => (
                    <li key={idx}>• {item}</li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        </ScrollArea>

        <div className="border-t p-6">
          <Button
            className="w-full"
            variant={task.status === "error" ? "default" : "outline"}
            onClick={handleReproduce}
            disabled={!onReproduce || isSubmitting}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {task.status === "error" ? "Retry Sub-Agent" : "Reproduce This Run"}
          </Button>
        </div>
      </div>
    </>
  );
}
