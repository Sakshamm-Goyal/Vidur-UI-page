"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToastStore } from "@/lib/stores/toast-store";
import { Download, SlidersHorizontal, Filter, Send, RefreshCcw } from "lucide-react";

interface ScreenerRow {
  ticker: string;
  name: string;
  sector: string;
  factorScore: number;
  momentum: "High" | "Medium" | "Low";
  valuation: "Discount" | "Fair" | "Premium";
  quality: "Strong" | "Average" | "Weak";
  marketCap: number;
  comment: string;
}

const UNIVERSE: ScreenerRow[] = [
  {
    ticker: "TATAMOTORS.NS",
    name: "Tata Motors",
    sector: "Automobile",
    factorScore: 82,
    momentum: "High",
    valuation: "Fair",
    quality: "Strong",
    marketCap: 178000,
    comment: "DIIs absorbing supply; FX hedges protect margin stack.",
  },
  {
    ticker: "HDFCBANK.NS",
    name: "HDFC Bank",
    sector: "Banking",
    factorScore: 74,
    momentum: "Medium",
    valuation: "Fair",
    quality: "Strong",
    marketCap: 1160000,
    comment: "Deposit mix stabilising; credit cost discipline intact.",
  },
  {
    ticker: "ICICIBANK.NS",
    name: "ICICI Bank",
    sector: "Banking",
    factorScore: 79,
    momentum: "High",
    valuation: "Discount",
    quality: "Strong",
    marketCap: 760000,
    comment: "RoE expansion supported by fee engines; low stress book.",
  },
  {
    ticker: "SBIN.NS",
    name: "State Bank of India",
    sector: "Banking",
    factorScore: 68,
    momentum: "Medium",
    valuation: "Discount",
    quality: "Average",
    marketCap: 520000,
    comment: "State-backed deposit franchise; watch unsecured growth.",
  },
  {
    ticker: "RELIANCE.NS",
    name: "Reliance Industries",
    sector: "Energy",
    factorScore: 71,
    momentum: "Low",
    valuation: "Premium",
    quality: "Strong",
    marketCap: 1650000,
    comment: "Energy + retail divergence; digital optionality intact.",
  },
  {
    ticker: "INFY.NS",
    name: "Infosys",
    sector: "Technology",
    factorScore: 65,
    momentum: "Low",
    valuation: "Fair",
    quality: "Average",
    marketCap: 580000,
    comment: "Macro slowdown priced; AI pipeline ramping gradually.",
  },
  {
    ticker: "LT.NS",
    name: "Larsen & Toubro",
    sector: "Infrastructure",
    factorScore: 77,
    momentum: "High",
    valuation: "Fair",
    quality: "Strong",
    marketCap: 330000,
    comment: "Order book visibility strong; leverage moderated.",
  },
  {
    ticker: "MARUTI.NS",
    name: "Maruti Suzuki",
    sector: "Automobile",
    factorScore: 70,
    momentum: "Medium",
    valuation: "Premium",
    quality: "Strong",
    marketCap: 350000,
    comment: "Product mix upgrade underway; valuation rich vs peers.",
  },
  {
    ticker: "AXISBANK.NS",
    name: "Axis Bank",
    sector: "Banking",
    factorScore: 63,
    momentum: "Medium",
    valuation: "Fair",
    quality: "Average",
    marketCap: 325000,
    comment: "Integration costs peak; monitor unsecured book.",
  },
  {
    ticker: "NVDA",
    name: "NVIDIA Corp",
    sector: "Technology",
    factorScore: 88,
    momentum: "High",
    valuation: "Premium",
    quality: "Strong",
    marketCap: 1230000,
    comment: "AI compute leadership intact; valuation at 95th percentile.",
  },
];

const MOMENTUM_FILTERS: ScreenerRow["momentum"][] = ["High", "Medium", "Low"];
const VALUATION_FILTERS: ScreenerRow["valuation"][] = ["Discount", "Fair", "Premium"];
const QUALITY_FILTERS: ScreenerRow["quality"][] = ["Strong", "Average", "Weak"];

export default function ScreenerPage() {
  const { addToast } = useToastStore();

  const [minScore, setMinScore] = useState(65);
  const [momentum, setMomentum] = useState<ScreenerRow["momentum"][]>(["High", "Medium"]);
  const [valuation, setValuation] = useState<ScreenerRow["valuation"][]>(["Discount", "Fair"]);
  const [quality, setQuality] = useState<ScreenerRow["quality"][]>(["Strong", "Average"]);
  const [search, setSearch] = useState("");

  const filteredRows = useMemo(() => {
    return UNIVERSE.filter((row) => {
      const matchesScore = row.factorScore >= minScore;
      const matchesMomentum = momentum.includes(row.momentum);
      const matchesValuation = valuation.includes(row.valuation);
      const matchesQuality = quality.includes(row.quality);
      const matchesSearch =
        row.name.toLowerCase().includes(search.toLowerCase()) ||
        row.ticker.toLowerCase().includes(search.toLowerCase());
      return matchesScore && matchesMomentum && matchesValuation && matchesQuality && matchesSearch;
    });
  }, [minScore, momentum, valuation, quality, search]);

  const toggleFilter = <T,>(current: T[], value: T): T[] =>
    current.includes(value) ? current.filter((item) => item !== value) : [...current, value];

  const handleQueue = (row: ScreenerRow) => {
    addToast({
      title: "Queued to Research",
      description: `${row.ticker} added to Research Queue with deep analysis.`,
      variant: "default",
    });
  };

  const handleExport = () => {
    const headers = ["Ticker", "Name", "Sector", "Factor Score", "Momentum", "Valuation", "Quality", "Market Cap (₹cr)"];
    const rows = filteredRows.map((row) => [
      row.ticker,
      `"${row.name}"`,
      row.sector,
      row.factorScore,
      row.momentum,
      row.valuation,
      row.quality,
      row.marketCap,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "aime_ai_screener.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-7xl px-8 py-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold tracking-tight mb-2">AI Screener</h1>
          <p className="text-sm text-muted-foreground">
            Multi-factor screens powered by Aime. Tune factors, queue runs, and export cohorts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={() => {
            setMinScore(65);
            setMomentum(["High", "Medium"]);
            setValuation(["Discount", "Fair"]);
            setQuality(["Strong", "Average"]);
            setSearch("");
          }}>
            <RefreshCcw className="h-4 w-4" />
            Reset
          </Button>
          <Button variant="outline" className="gap-2" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export Results
          </Button>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-base font-semibold mb-1">Filter Configuration</CardTitle>
            <p className="text-xs text-muted-foreground">
              Factor score ≥ {minScore} · Momentum {momentum.join("/")} · Valuation {valuation.join("/")}
            </p>
          </div>
          <Badge variant="outline" className="gap-1.5 text-xs font-medium">
            <SlidersHorizontal className="h-3 w-3" />
            {filteredRows.length} matches
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Min factor score
              </p>
              <Input
                type="range"
                min={50}
                max={95}
                value={minScore}
                onChange={(event) => setMinScore(Number(event.target.value))}
              />
              <p className="text-xs text-muted-foreground">Score ≥ {minScore}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Momentum
              </p>
              <div className="flex flex-wrap gap-2">
                {MOMENTUM_FILTERS.map((option) => (
                  <Button
                    key={option}
                    size="sm"
                    variant={momentum.includes(option) ? "default" : "outline"}
                    onClick={() => setMomentum((current) => toggleFilter(current, option))}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Valuation
              </p>
              <div className="flex flex-wrap gap-2">
                {VALUATION_FILTERS.map((option) => (
                  <Button
                    key={option}
                    size="sm"
                    variant={valuation.includes(option) ? "default" : "outline"}
                    onClick={() => setValuation((current) => toggleFilter(current, option))}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Quality
              </p>
              <div className="flex flex-wrap gap-2">
                {QUALITY_FILTERS.map((option) => (
                  <Button
                    key={option}
                    size="sm"
                    variant={quality.includes(option) ? "default" : "outline"}
                    onClick={() => setQuality((current) => toggleFilter(current, option))}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-2 flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Filters auto-refresh results. Queue selected names to generate full research runs.
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-base font-semibold">Screened Universe</CardTitle>
          <div className="relative w-64">
            <Input
              placeholder="Search name or ticker…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-3 pr-3"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground border-b">
                <tr>
                  <th className="p-3 text-left font-semibold">Ticker</th>
                  <th className="p-3 text-left font-semibold">Name</th>
                  <th className="p-3 text-left font-semibold">Factor Score</th>
                  <th className="p-3 text-left font-semibold">Momentum</th>
                  <th className="p-3 text-left font-semibold">Valuation</th>
                  <th className="p-3 text-left font-semibold">Quality</th>
                  <th className="p-3 text-left font-semibold">Market Cap (₹ cr)</th>
                  <th className="p-3 text-left font-semibold">Notes</th>
                  <th className="p-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <tr key={row.ticker} className="border-b border-border/40 hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-mono font-semibold text-foreground">{row.ticker}</td>
                    <td className="p-3 font-medium">{row.name}</td>
                    <td className="p-3">
                      <Badge variant="outline" className="font-mono">
                        {row.factorScore}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge
                        variant={row.momentum === "High" ? "success" : row.momentum === "Medium" ? "outline" : "secondary"}
                      >
                        {row.momentum}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge
                        variant={row.valuation === "Discount" ? "success" : row.valuation === "Premium" ? "destructive" : "outline"}
                      >
                        {row.valuation}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge
                        variant={row.quality === "Strong" ? "success" : row.quality === "Weak" ? "destructive" : "outline"}
                      >
                        {row.quality}
                      </Badge>
                    </td>
                    <td className="p-3 font-mono text-xs text-muted-foreground">{row.marketCap.toLocaleString()}</td>
                    <td className="p-3 text-xs text-muted-foreground">{row.comment}</td>
                    <td className="p-3 text-right">
                      <Button size="sm" className="gap-1" onClick={() => handleQueue(row)}>
                        <Send className="h-3 w-3" />
                        Queue to Report
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!filteredRows.length && (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No tickers satisfy the current filters.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
