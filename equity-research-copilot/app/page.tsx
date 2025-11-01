"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PromptBar } from "@/components/research/prompt-bar";
import { useToastStore } from "@/lib/stores/toast-store";
import { ArrowRight, TrendingUp, Shield, Zap, BarChart3, FileText, Globe, CheckCircle2 } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
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

  const handleSampleQuery = (sampleQuery: string) => {
    setQuery(sampleQuery);
    // Focus on the prompt input by scrolling to it
    document.getElementById('prompt-bar-container')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const sampleQueries = [
    { text: "TATAMOTORS.NS 1M outlook", icon: TrendingUp },
    { text: "NVDA valuation analysis", icon: BarChart3 },
    { text: "Compare HDFC vs ICICI Bank", icon: FileText },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-gradient-to-b from-white via-white to-slate-50/50 dark:to-slate-900/20">
      {/* Hero Section with Enhanced Typography */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 md:py-24 relative overflow-hidden bg-white/50 dark:bg-background">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-400/5 rounded-full blur-3xl animate-pulse [animation-delay:1s]"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-400/3 rounded-full blur-3xl"></div>
        </div>

        <div className="text-center max-w-5xl mx-auto space-y-8 md:space-y-10 relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-blue-200/60 dark:border-blue-500/30 bg-gradient-to-r from-blue-50 via-indigo-50/80 to-blue-50 dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-blue-950/40 text-sm font-semibold text-blue-900 dark:text-blue-200 shadow-sm backdrop-blur-sm hover:scale-105 transition-transform duration-300">
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse shadow-lg shadow-blue-500/50"></span>
            Powered by Advanced AI Research Models
          </div>

          {/* Main Headline */}
          <div className="space-y-4">
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.08]">
              <span className="text-black dark:text-white">
                Institutional Equity
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                Research, Reimagined
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-gray-900 dark:text-gray-100 max-w-3xl mx-auto leading-relaxed px-4">
              Transform 100-hour analyst workflows into 1-2 hours with AI-powered research.
              <br />
              <span className="font-semibold text-black dark:text-white">Transparent. Auditable. Institutional-Grade.</span>
            </p>
          </div>

          {/* Stats Bar */}
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 pt-4">
            <div className="flex items-center gap-2 text-sm md:text-base">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-black dark:text-white font-bold">127 Data Sources</span>
            </div>
            <div className="h-4 w-px bg-slate-300 dark:bg-slate-700"></div>
            <div className="flex items-center gap-2 text-sm md:text-base">
              <Zap className="h-4 w-4 text-yellow-600" />
              <span className="text-black dark:text-white font-bold">100x Faster</span>
            </div>
            <div className="h-4 w-px bg-slate-300 dark:bg-slate-700"></div>
            <div className="flex items-center gap-2 text-sm md:text-base">
              <Shield className="h-4 w-4 text-blue-600" />
              <span className="text-black dark:text-white font-bold">Enterprise Ready</span>
            </div>
          </div>

          {/* Enhanced Prompt Bar */}
          <div className="pt-6" id="prompt-bar-container">
            <PromptBar onSubmit={handleSubmit} loading={loading} initialQuery={query} />
          </div>

          {/* Sample Queries */}
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 pt-6">
            <span className="text-sm font-bold text-black dark:text-white w-full sm:w-auto">Try asking:</span>
            {sampleQueries.map((sample, idx) => {
              const Icon = sample.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSampleQuery(sample.text)}
                  className="group flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-950/40 dark:hover:to-indigo-950/40 hover:shadow-md hover:shadow-blue-500/10 hover:-translate-y-0.5 transition-all duration-200 text-slate-700 dark:text-slate-200">
                  <Icon className="h-4 w-4 text-blue-500 group-hover:scale-110 transition-transform" />
                  <span>"{sample.text}"</span>
                  <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Features Section - More Professional */}
      <div className="border-t border-slate-200/60 dark:border-slate-700/50 bg-gradient-to-b from-slate-50/50 to-white dark:from-slate-900/30 dark:to-background relative">
        <div className="container max-w-7xl mx-auto px-6 py-16 md:py-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-50 mb-4">
              Why Choose Vidur Research?
            </h2>
            <p className="text-lg text-gray-900 dark:text-gray-100 max-w-2xl mx-auto">
              Built for institutional analysts who demand speed, accuracy, and complete transparency
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* Feature 1 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative flex flex-col gap-5 p-6 md:p-8 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/40 backdrop-blur-sm hover:shadow-2xl hover:shadow-blue-500/10 dark:hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-300">
                <div className="flex-shrink-0 h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-xl group-hover:shadow-blue-500/35 group-hover:scale-110 transition-all duration-300">
                  <Zap className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-slate-50">100x Faster Insights</h3>
                  <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                    Compress weeks of research into hours. AI analyzes thousands of data points,
                    regulatory filings, and market signals in real-time.
                  </p>
                  <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-blue-500" />
                      Real-time data processing
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-blue-500" />
                      Multi-source aggregation
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative flex flex-col gap-5 p-6 md:p-8 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/40 backdrop-blur-sm hover:shadow-2xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300">
                <div className="flex-shrink-0 h-14 w-14 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-400 dark:to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:shadow-xl group-hover:shadow-indigo-500/35 group-hover:scale-110 transition-all duration-300">
                  <Globe className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-slate-50">Fully Transparent</h3>
                  <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                    Every insight is traceable. Watch the AI think, see data sources,
                    and audit every step of the research process.
                  </p>
                  <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-indigo-500" />
                      Complete audit trails
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-indigo-500" />
                      Source attribution
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative flex flex-col gap-5 p-6 md:p-8 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/40 backdrop-blur-sm hover:shadow-2xl hover:shadow-purple-500/10 dark:hover:shadow-purple-500/5 hover:-translate-y-1 transition-all duration-300">
                <div className="flex-shrink-0 h-14 w-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-400 dark:to-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:shadow-xl group-hover:shadow-purple-500/35 group-hover:scale-110 transition-all duration-300">
                  <Shield className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-slate-50">Institutional Quality</h3>
                  <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                    Analyst-ready reports with citations, version control, export to PDF/DOCX,
                    and complete audit trails for compliance.
                  </p>
                  <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-purple-500" />
                      PDF/DOCX export
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-purple-500" />
                      Compliance ready
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
