"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PromptBar } from "@/components/research/prompt-bar";
import { useToastStore } from "@/lib/stores/toast-store";

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { addToast } = useToastStore();

  const handleSubmit = async (query: string, deepResearch: boolean) => {
    setLoading(true);

    // Show toast notification
    addToast({
      title: "Question analysis complete",
      description: "Searching key information…",
      variant: "default",
    });

    try {
      // Extract ticker from query if present
      const tickerMatch = query.match(/\b([A-Z]{2,5}(?:\.NS)?)\b/);
      const ticker = tickerMatch ? tickerMatch[1] : "TATAMOTORS.NS";

      const response = await fetch("/api/research/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          ticker,
          deep: deepResearch,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create research run");
      }

      const run = await response.json();
      const url = new URL(`/research/${run.runId}`, window.location.origin);
      url.searchParams.set("q", query);
      url.searchParams.set("ticker", ticker);
      url.searchParams.set("deep", deepResearch ? "1" : "0");
      router.push(url.pathname + url.search);
    } catch (error) {
      console.error("Error creating research run:", error);
      addToast({
        title: "Error",
        description: "Failed to create research run. Please try again.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-gradient-to-b from-background via-background to-slate-50/30 dark:to-slate-900/20">
      {/* Hero Section with Enhanced Typography */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-24">
        <div className="text-center max-w-5xl mx-auto space-y-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-blue-200/60 dark:border-blue-500/30 bg-gradient-to-r from-blue-50 via-indigo-50/80 to-blue-50 dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-blue-950/40 text-sm font-semibold text-blue-700 dark:text-blue-300 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse shadow-lg shadow-blue-500/50"></span>
            Powered by Advanced AI Research Models
          </div>

          {/* Main Headline */}
          <h1 className="text-6xl md:text-7xl font-bold tracking-tight leading-[1.08] text-slate-900 dark:text-slate-50">
            Institutional Equity
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent drop-shadow-sm">
              Research, Reimagined
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Transform 100-hour analyst workflows into 1-2 hours with AI-powered research.
            <br />
            <span className="font-semibold text-slate-900 dark:text-slate-100">Transparent. Auditable. Institutional-Grade.</span>
          </p>

          {/* Enhanced Prompt Bar */}
          <div className="pt-6">
            <PromptBar onSubmit={handleSubmit} loading={loading} />
          </div>

          {/* Sample Queries */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-6">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Try:</span>
            <button className="px-4 py-2.5 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:shadow-sm transition-all duration-200 text-slate-700 dark:text-slate-200">
              "TATAMOTORS.NS 1M outlook"
            </button>
            <button className="px-4 py-2.5 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:shadow-sm transition-all duration-200 text-slate-700 dark:text-slate-200">
              "NVDA valuation analysis"
            </button>
            <button className="px-4 py-2.5 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:shadow-sm transition-all duration-200 text-slate-700 dark:text-slate-200">
              "Compare HDFC vs ICICI Bank"
            </button>
          </div>
        </div>
      </div>

      {/* Features Section - More Professional */}
      <div className="border-t border-slate-200/60 dark:border-slate-700/50 bg-gradient-to-b from-slate-50/50 to-white dark:from-slate-900/30 dark:to-background">
        <div className="container max-w-7xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex flex-col gap-5 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/40 backdrop-blur-sm hover:shadow-xl hover:shadow-blue-500/10 dark:hover:shadow-blue-500/5 transition-all duration-300">
                <div className="flex-shrink-0 h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-xl group-hover:shadow-blue-500/35 group-hover:scale-110 transition-all duration-300">
                  <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-2.5 text-slate-900 dark:text-slate-50">100x Faster Insights</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Compress weeks of research into hours. AI analyzes thousands of data points,
                    regulatory filings, and market signals in real-time.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex flex-col gap-5 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/40 backdrop-blur-sm hover:shadow-xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-500/5 transition-all duration-300">
                <div className="flex-shrink-0 h-14 w-14 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-400 dark:to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:shadow-xl group-hover:shadow-indigo-500/35 group-hover:scale-110 transition-all duration-300">
                  <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-2.5 text-slate-900 dark:text-slate-50">Fully Transparent</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Every insight is traceable. Watch the AI think, see data sources,
                    and audit every step of the research process.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex flex-col gap-5 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/40 backdrop-blur-sm hover:shadow-xl hover:shadow-purple-500/10 dark:hover:shadow-purple-500/5 transition-all duration-300">
                <div className="flex-shrink-0 h-14 w-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-400 dark:to-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:shadow-xl group-hover:shadow-purple-500/35 group-hover:scale-110 transition-all duration-300">
                  <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-2.5 text-slate-900 dark:text-slate-50">Institutional Quality</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Analyst-ready reports with citations, version control, export to PDF/DOCX,
                    and complete audit trails for compliance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
