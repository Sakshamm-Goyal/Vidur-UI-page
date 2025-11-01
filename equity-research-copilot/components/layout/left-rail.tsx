"use client";

import {
  MessageSquare,
  Filter,
  Database,
  TrendingUp,
  BarChart3,
  LayoutDashboard,
  Briefcase,
  Users,
  Compass,
  Plus,
  History,
  FileText,
  Activity,
  ShieldCheck,
  Radar,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const sidebarItems = [
  { icon: MessageSquare, label: "New Chat", href: "/", featured: true },
  { icon: Filter, label: "AI Screener", href: "/screener" },
  { icon: Database, label: "Data Agent", href: "#" },
  { icon: History, label: "History & Audit", href: "/history" },
  { icon: FileText, label: "Report Builder", href: "/report-builder" },
  { icon: TrendingUp, label: "Backtest", href: "#" },
  { icon: BarChart3, label: "AI Charts", href: "#" },
  { icon: LayoutDashboard, label: "Dashboard", href: "#" },
  { icon: Briefcase, label: "Portfolio Builder", href: "#" },
  { icon: Users, label: "Agent Workflows", href: "#" },
  { icon: Compass, label: "Explore Community", href: "#" },
];

const pipelineSignals = [
  {
    icon: Activity,
    name: "Active Run",
    value: "RUN-01043",
    description: "Tata Motors • 1M horizon",
    tone: "text-blue-600",
  },
  {
    icon: ShieldCheck,
    name: "Confidence",
    value: "82%",
    description: "Coverage at 92% • no warnings",
    tone: "text-emerald-600",
  },
  {
    icon: Radar,
    name: "Latency",
    value: "12.4s",
    description: "Macro agents replay FX sensitivity",
    tone: "text-amber-600",
  },
];

export function LeftRail() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] w-64 border-r border-border/60 bg-white/95 backdrop-blur">
      <ScrollArea className="h-full px-4 py-6">
        <div className="space-y-1.5">
          {sidebarItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive =
              item.href !== "#" &&
              (pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href)));

            return (
              <a
                key={`${item.label}-${idx}`}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                  item.featured
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm hover:brightness-110"
                    : isActive
                    ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                    : "text-muted-foreground hover:bg-slate-100 hover:text-foreground"
                )}
              >
                <Icon className="h-[18px] w-[18px] flex-shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.featured && <Plus className="h-4 w-4 opacity-80" />}
              </a>
            );
          })}
        </div>

        <div className="mt-8 px-1">
          <h3 className="mb-3 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Recent runs
          </h3>
          <div className="space-y-1">
            {[
              {
                label: "TATA MOTORS • 1M Horizon",
                href: "/research/RUN-01043?q=Does%20Tata%20Motors%20go%20up%20or%20down%20in%20one-month%20horizon%3F&ticker=TATAMOTORS.NS&deep=1",
              },
              {
                label: "HDFC Bank • 5Y Performance",
                href: "/research/RUN-01012?q=How%20has%20HDFC%20Bank%20performed%20in%20the%20last%205%20years%3F&ticker=HDFCBANK.NS&deep=0",
              },
              {
                label: "NVDA • Target Analysis",
                href: "/research/RUN-01043?q=NVDA%20investment%20thesis%20for%20next%20quarter&ticker=NVDA&deep=1",
              },
            ].map((run, idx) => (
              <a
                key={`${run.label}-${idx}`}
                href={run.href}
                className="block rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition hover:bg-muted/40 hover:text-foreground"
              >
                <span className="truncate block">{run.label}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="mt-9 space-y-2 rounded-xl border border-border/60 bg-background/90 p-3 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Pipeline health
          </h3>
          <div className="space-y-2">
            {pipelineSignals.map((signal) => {
              const Icon = signal.icon;
              return (
                <div key={signal.name} className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
                  <div className="rounded-md bg-muted/40 p-1.5">
                    <Icon className={cn("h-4 w-4", signal.tone)} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                      <span>{signal.name}</span>
                      <span className={cn("text-sm font-bold", signal.tone)}>{signal.value}</span>
                    </div>
                    <p className="text-xs text-muted-foreground/80">{signal.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
}
