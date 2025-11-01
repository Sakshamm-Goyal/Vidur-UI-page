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
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-blue-200/60 bg-gradient-to-r from-blue-50 via-indigo-50/80 to-blue-50 text-sm font-semibold text-blue-900 shadow-sm backdrop-blur-sm hover:scale-105 transition-transform duration-300">
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse shadow-lg shadow-blue-500/50"></span>
            Powered by Advanced AI Research Models
          </div>

          {/* Main Headline */}
          <div className="space-y-4">
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.08]">
              <span className="text-slate-900">
                Institutional Equity
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 bg-clip-text text-transparent">
                Research, Reimagined
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-slate-700 max-w-3xl mx-auto leading-relaxed px-4">
              Transform 100-hour analyst workflows into 1-2 hours with AI-powered research.
              <br />
              <span className="font-semibold text-slate-900">Transparent. Auditable. Institutional-Grade.</span>
            </p>
          </div>

          {/* Stats Bar */}
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 pt-4">
            <div className="flex items-center gap-2 text-sm md:text-base">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-slate-900 font-bold">127 Data Sources</span>
            </div>
            <div className="h-4 w-px bg-slate-300"></div>
            <div className="flex items-center gap-2 text-sm md:text-base">
              <Zap className="h-4 w-4 text-yellow-600" />
              <span className="text-slate-900 font-bold">100x Faster</span>
            </div>
            <div className="h-4 w-px bg-slate-300"></div>
            <div className="flex items-center gap-2 text-sm md:text-base">
              <Shield className="h-4 w-4 text-blue-600" />
              <span className="text-slate-900 font-bold">Enterprise Ready</span>
            </div>
          </div>

          {/* Enhanced Prompt Bar */}
          <div className="pt-6" id="prompt-bar-container">
            <PromptBar onSubmit={handleSubmit} loading={loading} initialQuery={query} />
          </div>

          {/* Sample Queries */}
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 pt-6">
            <span className="text-sm font-bold text-slate-900 w-full sm:w-auto">Try asking:</span>
            {sampleQueries.map((sample, idx) => {
              const Icon = sample.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSampleQuery(sample.text)}
                  className="group flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border border-slate-200 bg-white hover:border-blue-400 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:shadow-md hover:shadow-blue-500/10 hover:-translate-y-0.5 transition-all duration-200 text-slate-700">
                  <Icon className="h-4 w-4 text-blue-500 group-hover:scale-110 transition-transform" />
                  <span>"{sample.text}"</span>
                  <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Features Section - Enhanced */}
      <div className="border-t border-slate-200 bg-gradient-to-b from-white via-slate-50/30 to-white relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-400/5 rounded-full blur-3xl"></div>
        </div>

        <div className="container max-w-7xl mx-auto px-6 py-20 md:py-28 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-5 tracking-tight">
              Why Choose Vidur Research?
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Built for institutional analysts who demand speed, accuracy, and complete transparency
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            {/* Feature 1 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/8 via-blue-400/4 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative flex flex-col h-full p-8 rounded-3xl border border-slate-200 bg-white shadow-sm hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-2 hover:border-blue-200/60 transition-all duration-300">
                {/* Icon */}
                <div className="flex-shrink-0 mb-6">
                  <div className="inline-flex h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-xl group-hover:shadow-blue-500/40 group-hover:scale-110 transition-all duration-300">
                    <Zap className="h-8 w-8 text-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col">
                  <h3 className="text-2xl font-bold mb-4 text-slate-900">100x Faster Insights</h3>
                  <p className="text-base text-slate-600 leading-relaxed mb-6 flex-grow">
                    Compress weeks of research into hours. AI analyzes thousands of data points,
                    regulatory filings, and market signals in real-time.
                  </p>
                  
                  {/* Feature list */}
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-50 flex items-center justify-center">
                        <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-slate-700">Real-time data processing</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-50 flex items-center justify-center">
                        <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-slate-700">Multi-source aggregation</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/8 via-indigo-400/4 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative flex flex-col h-full p-8 rounded-3xl border border-slate-200 bg-white shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-2 hover:border-indigo-200/60 transition-all duration-300">
                {/* Icon */}
                <div className="flex-shrink-0 mb-6">
                  <div className="inline-flex h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:shadow-xl group-hover:shadow-indigo-500/40 group-hover:scale-110 transition-all duration-300">
                    <Globe className="h-8 w-8 text-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col">
                  <h3 className="text-2xl font-bold mb-4 text-slate-900">Fully Transparent</h3>
                  <p className="text-base text-slate-600 leading-relaxed mb-6 flex-grow">
                    Every insight is traceable. Watch the AI think, see data sources,
                    and audit every step of the research process.
                  </p>
                  
                  {/* Feature list */}
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 h-5 w-5 rounded-full bg-indigo-50 flex items-center justify-center">
                        <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600" />
                      </div>
                      <span className="text-sm font-medium text-slate-700">Complete audit trails</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 h-5 w-5 rounded-full bg-indigo-50 flex items-center justify-center">
                        <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600" />
                      </div>
                      <span className="text-sm font-medium text-slate-700">Source attribution</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/8 via-purple-400/4 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative flex flex-col h-full p-8 rounded-3xl border border-slate-200 bg-white shadow-sm hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-2 hover:border-purple-200/60 transition-all duration-300">
                {/* Icon */}
                <div className="flex-shrink-0 mb-6">
                  <div className="inline-flex h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:shadow-xl group-hover:shadow-purple-500/40 group-hover:scale-110 transition-all duration-300">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col">
                  <h3 className="text-2xl font-bold mb-4 text-slate-900">Institutional Quality</h3>
                  <p className="text-base text-slate-600 leading-relaxed mb-6 flex-grow">
                    Analyst-ready reports with citations, version control, export to PDF/DOCX,
                    and complete audit trails for compliance.
                  </p>
                  
                  {/* Feature list */}
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 h-5 w-5 rounded-full bg-purple-50 flex items-center justify-center">
                        <CheckCircle2 className="h-3.5 w-3.5 text-purple-600" />
                      </div>
                      <span className="text-sm font-medium text-slate-700">PDF/DOCX export</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 h-5 w-5 rounded-full bg-purple-50 flex items-center justify-center">
                        <CheckCircle2 className="h-3.5 w-3.5 text-purple-600" />
                      </div>
                      <span className="text-sm font-medium text-slate-700">Compliance ready</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
