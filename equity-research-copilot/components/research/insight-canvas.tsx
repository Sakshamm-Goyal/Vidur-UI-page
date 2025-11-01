"use client";

import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ReferenceDot,
  AreaChart,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KPIGrid } from "./kpi-card";
import { ChartCard } from "./chart-card";
import { PeerTable } from "./peer-table";
import { SummaryBar } from "./summary-bar";
import { ModelQna } from "./model-qna";
import type { ResearchResults } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

interface InsightCanvasProps {
  results: ResearchResults;
  ticker: string;
  query: string;
}

const formatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
});

export function InsightCanvas({ results, ticker: tickerProp, query }: InsightCanvasProps) {
  const { summary, ticker, kpis, drivers, charts, peers, valuation, riskFactors, citations, modelQna } = results;

  const priceDrawdownData = charts.price.map((point, idx) => ({
    date: formatter.format(new Date(point.t)),
    price: point.c,
    drawdown: Math.round((charts.drawdown[idx] ?? 0) * 1000) / 10,
  }));

  const distributionData = charts.distribution.map((bucket) => ({
    bucket: bucket.bucket,
    frequency: bucket.frequency,
  }));

  const scatterData = charts.volatilityScatter.map((item) => ({
    ...item,
    volatility: Math.round(item.volatility * 1000) / 10,
    oneMonthReturn: Math.round(item.oneMonthReturn * 1000) / 10,
  }));

  const valuationBandData = charts.valuationBands.map((band) => ({
    date: formatter.format(new Date(band.t)),
    low: band.low,
    base: band.base,
    high: band.high,
  }));

  return (
    <div className="space-y-6">
      <SummaryBar
        ticker={ticker.symbol}
        companyName={ticker.name}
        currentPrice={ticker.currentPrice}
        currency={ticker.currency}
        priceTarget={kpis.priceTarget}
        convictionLabel={summary.conviction}
        convictionScore={summary.convictionScore}
        confidence={summary.confidence}
        changes={[
          { period: "1D", value: ticker.changes["1D"] },
          { period: "1W", value: ticker.changes["1W"] },
          { period: "1M", value: ticker.changes["1M"] },
          { period: "1Y", value: ticker.changes["1Y"] },
          { period: "5Y", value: ticker.changes["5Y"] },
        ]}
      />

      <Card className="rounded-2xl border border-slate-200 bg-white shadow-md shadow-slate-900/5">
        <CardContent className="space-y-4 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Headline
              </p>
              <h2 className="text-xl font-bold text-foreground">{summary.headline}</h2>
            </div>
            <Badge variant={summary.conviction === "High" ? "success" : "outline"} className="text-xs">
              {summary.conviction} conviction · {summary.convictionScore} score
            </Badge>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">{summary.thesis}</p>
        </CardContent>
      </Card>

      <KPIGrid kpis={kpis} currency={ticker.currency} />

      <div className="grid gap-6 md:grid-cols-2">
        <ChartCard
          title="Price & Drawdown (5Y)"
          description="Price series overlayed with drawdowns and notable events"
          data={priceDrawdownData}
          height={320}
        >
          <ComposedChart data={priceDrawdownData} margin={{ top: 16, right: 24, bottom: 8, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 12 }}
              domain={["auto", "auto"]}
              tickFormatter={(value) => `${ticker.currency}${value.toFixed(0)}`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `${value.toFixed(0)}%`}
            />
            <ChartTooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="drawdown"
              stroke="hsl(0 62.8% 45%)"
              fill="hsl(0 62.8% 45% / 0.1)"
              strokeWidth={1.5}
              name="Drawdown"
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="price"
              stroke="hsl(217.2 91.2% 59.8%)"
              strokeWidth={2}
              dot={false}
              name="Price"
            />
            {charts.events.map((event, idx) => (
              <ReferenceDot
                key={idx}
                x={formatter.format(new Date(event.t))}
                yAxisId="left"
                y={priceDrawdownData[idx]?.price}
                r={4}
                fill={event.impact === "negative" ? "hsl(0 84% 60%)" : "hsl(148 70% 45%)"}
                stroke="white"
                label={{
                  value: event.label,
                  position: "top",
                  className: "text-[10px] fill-muted-foreground",
                }}
              />
            ))}
          </ComposedChart>
        </ChartCard>

        <ChartCard
          title="Return Distribution (Daily)"
          description="Histogram of daily returns over the trailing period"
          data={distributionData}
          type="bar"
          dataKey="frequency"
          xKey="bucket"
          height={320}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ChartCard
          title="Drivers Attribution"
          description="Net impact by research pillar"
          data={drivers.map((driver) => ({
            bucket: driver.bucket,
            score: Math.round(driver.score * 100),
          }))}
          type="bar"
          dataKey="score"
          xKey="bucket"
        />

        <ChartCard
          title="Volatility vs Return (Peers)"
          description="1M return vs annualised volatility"
          data={scatterData}
          type="scatter"
          dataKey="oneMonthReturn"
          xKey="volatility"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ChartCard
          title="Valuation Bands (Forward PE)"
          description="Percentile bands across the last 3 years"
          data={valuationBandData}
          height={320}
        >
          <AreaChart data={valuationBandData} margin={{ top: 16, right: 24, bottom: 8, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <ChartTooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Area
              type="monotone"
              dataKey="high"
              stroke="transparent"
              fill="hsl(217 91% 60% / 0.08)"
            />
            <Area
              type="monotone"
              dataKey="low"
              stroke="transparent"
              fill="hsl(217 91% 60% / 0.08)"
            />
            <Line
              type="monotone"
              dataKey="base"
              stroke="hsl(217.2 91.2% 59.8%)"
              strokeWidth={2}
              dot={false}
              name="Forward PE"
            />
          </AreaChart>
        </ChartCard>

        <Card className="rounded-2xl border border-slate-200 bg-white shadow-md">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Risk Radar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {riskFactors.map((risk, idx) => (
              <div key={idx} className="flex items-start gap-3 rounded-lg border border-border/60 px-3 py-2">
                <Badge
                  variant={
                    risk.level === "Elevated"
                      ? "destructive"
                      : risk.level === "Medium"
                      ? "outline"
                      : "success"
                  }
                  className="mt-0.5 text-xs"
                >
                  {risk.level}
                </Badge>
                <div>
                  <p className="text-sm font-semibold">{risk.name}</p>
                  <p className="text-xs text-muted-foreground">{risk.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <PeerTable peers={peers} />

      <Card className="rounded-2xl border border-slate-200 bg-white shadow-md">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Valuation Snapshot</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Forward PE</p>
            <p className="mt-1 text-xl font-semibold">
              {formatNumber(valuation.fwd_pe, { decimals: 1 })}x
            </p>
            <p className="text-xs text-muted-foreground">
              Percentile {formatNumber(valuation.percentile.pe * 100, { decimals: 0 })}th
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">EV / EBITDA</p>
            <p className="mt-1 text-xl font-semibold">
              {formatNumber(valuation.ev_ebitda, { decimals: 1 })}x
            </p>
            <p className="text-xs text-muted-foreground">
              Percentile {formatNumber(valuation.percentile.ev * 100, { decimals: 0 })}th
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Relative view</p>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
              Valuation trading near historical mean; risk-reward balanced with upside skew if margin expansion
              materialises.
            </p>
          </div>
        </CardContent>
      </Card>

      {modelQna && modelQna.length > 0 && (
        <Card className="rounded-2xl border border-slate-200 bg-white shadow-md">
          <CardContent className="p-6">
            <ModelQna qnaPairs={modelQna} />
          </CardContent>
        </Card>
      )}

      <Card className="rounded-2xl border border-slate-200 bg-white shadow-md">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Sources & Citations ({citations.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {citations.map((citation) => (
            <div
              key={citation.id}
              className="rounded-lg border border-border/60 px-4 py-3 transition-colors hover:bg-muted/40"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">{citation.title}</p>
                <Badge variant="outline" className="text-xs">
                  {new Date(citation.dt).toLocaleDateString()}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{citation.domain}</p>
              {citation.excerpt && <p className="mt-2 text-sm">{citation.excerpt}</p>}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
