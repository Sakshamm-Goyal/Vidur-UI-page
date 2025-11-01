"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Search, Command, HelpCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", href: "/" },
  {
    label: "Research",
    href:
      "/research/RUN-01043?q=Does%20Tata%20Motors%20go%20up%20or%20down%20in%20one-month%20horizon%3F&ticker=TATAMOTORS.NS&deep=1",
  },
  { label: "Screener", href: "/screener" },
  { label: "History", href: "/history" },
  { label: "Reports", href: "/report-builder" },
];

const paletteActions = [
  { label: "Start new research run", href: "/" },
  { label: "Open AI Screener", href: "/screener" },
  { label: "View history & audit", href: "/history" },
  { label: "Launch report builder", href: "/report-builder" },
];

const shortcutList = [
  { combo: "⌘ + K", description: "Open command palette" },
  { combo: "/", description: "Focus global search" },
  { combo: "?", description: "Keyboard shortcuts" },
  { combo: "Shift + R", description: "Retry active pipeline" },
];

export function TopNav() {
  const searchRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "/" && !event.metaKey && !event.ctrlKey && !paletteOpen && !shortcutsOpen) {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if ((event.key === "k" || event.key === "K") && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setPaletteOpen(true);
      }
      if (event.key === "?" && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        setShortcutsOpen(true);
      }
      if (event.key === "Escape") {
        setPaletteOpen(false);
        setShortcutsOpen(false);
      }
      if ((event.key === "R" || event.key === "r") && event.shiftKey) {
        const retryButton = document.querySelector<HTMLButtonElement>("button[data-retry]");
        retryButton?.click();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [paletteOpen, shortcutsOpen]);

  const triggerAction = (href: string) => {
    setPaletteOpen(false);
    window.location.href = href;
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-white/90 backdrop-blur shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg overflow-hidden">
              <Image
                src="/image.png"
                alt="Vidur Research Logo"
                width={36}
                height={36}
                className="object-contain"
              />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Vidur Research
              </p>
              <p className="text-sm font-semibold text-foreground">Institutional Equity</p>
            </div>
            <Badge className="ml-2 border-primary/40 bg-primary/10 text-primary">Deep Research</Badge>
          </div>

          <nav className="hidden items-center gap-1 rounded-full border border-border/60 bg-white px-1 py-1 shadow-inner md:flex">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <a
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-white shadow-sm"
                      : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                  )}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative hidden w-72 lg:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={searchRef}
              placeholder="Search tickers, companies, teams…"
              className="h-10 border-border/60 pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="hidden gap-2 text-xs text-muted-foreground md:flex"
              onClick={() => setShortcutsOpen(true)}
            >
              <HelpCircle className="h-3.5 w-3.5" />
              Shortcuts
            </Button>
            <button
              className="flex h-10 items-center gap-2 rounded-lg border border-border/60 px-3 text-xs font-medium text-muted-foreground hover:bg-muted/40"
              onClick={() => setPaletteOpen(true)}
            >
              <Command className="h-4 w-4" />
              K
            </button>
          </div>
        </div>
      </div>

      {paletteOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4"
          onClick={() => setPaletteOpen(false)}
        >
          <div
            className="mt-24 w-full max-w-md overflow-hidden rounded-2xl border border-border/60 bg-background shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-border/60 px-4 py-3">
              <p className="text-sm font-semibold text-muted-foreground">Command palette</p>
              <p className="text-xs text-muted-foreground">
                Navigate the copilot or trigger a workflow without leaving the keyboard.
              </p>
            </div>
            <div className="divide-y divide-border/60">
              {paletteActions.map((action) => (
                <button
                  key={action.label}
                  className="flex w-full items-center justify-between px-4 py-3 text-sm hover:bg-muted/40"
                  onClick={() => triggerAction(action.href)}
                >
                  <span>{action.label}</span>
                  <span className="text-xs text-muted-foreground">Go</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {shortcutsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4"
          onClick={() => setShortcutsOpen(false)}
        >
          <div
            className="mt-24 w-full max-w-md overflow-hidden rounded-2xl border border-border/60 bg-background shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-border/60 px-4 py-3">
              <p className="text-sm font-semibold text-muted-foreground">Keyboard shortcuts</p>
              <p className="text-xs text-muted-foreground">
                Optimise your workflow with quick access to key actions.
              </p>
            </div>
            <div className="space-y-2 px-4 py-4">
              {shortcutList.map((item) => (
                <div
                  key={item.combo}
                  className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2 text-sm"
                >
                  <span className="text-muted-foreground">{item.description}</span>
                  <span className="rounded bg-muted px-2 py-1 font-mono text-xs">{item.combo}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
