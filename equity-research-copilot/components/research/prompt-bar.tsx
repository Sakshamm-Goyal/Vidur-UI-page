"use client";

import { useState } from "react";
import { Mic, ChevronDown, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PromptBarProps {
  onSubmit: (query: string, deepResearch: boolean) => void;
  loading?: boolean;
}

export function PromptBar({ onSubmit, loading = false }: PromptBarProps) {
  const [query, setQuery] = useState("");
  const [deepResearch, setDeepResearch] = useState(true);
  const [model, setModel] = useState("Auto");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSubmit(query, deepResearch);
    }
  };

  const suggestedPrompts = [
    "How has HDFC performed in the last 5 years?",
    "Does Tata Motors go up or down in one-month horizon?",
    "What's driving NVDA's recent performance?",
    "Compare ICICI Bank vs HDFC Bank valuation",
  ];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Enhanced Prompt Input */}
      <Card className="p-2 shadow-2xl border-2 border-border/50 bg-card/95 backdrop-blur-sm">
        <form onSubmit={handleSubmit}>
          <div className="flex items-center gap-2 p-4 bg-background/50 rounded-lg border border-border/30">
            <div className="flex-1 relative">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask: 'TATAMOTORS.NS 1M outlook' or 'Compare HDFC vs ICICI valuation metrics'"
                className="text-base h-14 border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-foreground placeholder:text-muted-foreground/60 pr-16"
                disabled={loading}
              />
              {query && (
                <Badge
                  variant="outline"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono"
                >
                  {query.length}
                </Badge>
              )}
            </div>
            <button
              type="button"
              className="h-11 w-11 rounded-lg border border-border/50 flex items-center justify-center hover:bg-muted/80 hover:border-border transition-all"
              disabled={loading}
              title="Voice input"
            >
              <Mic className="h-5 w-5 text-muted-foreground" />
            </button>
            <Button
              type="submit"
              disabled={loading || !query.trim()}
              size="lg"
              className="h-11 px-8 shadow-lg shadow-primary/20 font-semibold"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Analyzing
                </span>
              ) : (
                "Analyze →"
              )}
            </Button>
          </div>

          {/* Options Bar */}
          <div className="flex items-center gap-3 px-4 pt-3 pb-2">
            <button
              type="button"
              className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border/50 hover:bg-muted/50 transition-colors text-sm"
              title="Select research model"
            >
              <span className="text-muted-foreground">Model:</span>
              <span className="font-medium">{model}</span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>

            <button
              type="button"
              onClick={() => setDeepResearch(!deepResearch)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md border transition-all text-sm font-medium",
                deepResearch
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-lg shadow-blue-500/20"
                  : "border-border/50 hover:bg-muted/50 text-muted-foreground"
              )}
              title="Enable comprehensive multi-source research"
            >
              <Sparkles className={cn("h-4 w-4", deepResearch && "animate-pulse")} />
              Deep Research
            </button>

            <div className="flex-1" />

            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              Connected to 127 data sources
            </div>
          </div>
        </form>
      </Card>

      {/* Suggested Prompts - Removed as per new design showing them in the main content */}
    </div>
  );
}
