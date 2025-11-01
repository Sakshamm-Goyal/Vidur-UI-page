"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";

interface PriceChange {
  period: string;
  value: number;
}

interface SummaryBarProps {
  ticker: string;
  companyName?: string;
  currentPrice: number;
  priceTarget?: number;
  convictionLabel?: string;
  convictionScore?: number;
  confidence?: number;
  currency?: string;
  changes: PriceChange[];
  isLive?: boolean;
}

export function SummaryBar({
  ticker,
  companyName,
  currentPrice,
  priceTarget,
  convictionLabel,
  convictionScore,
  confidence,
  currency = "₹",
  changes,
  isLive = true,
}: SummaryBarProps) {
  return (
    <Card className="sticky top-0 z-10 rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-900/5">
      <div className="flex flex-wrap items-center justify-between gap-6 px-6 py-5">
        {/* Left: Ticker & Price */}
        <div className="flex flex-wrap items-center gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-3xl font-bold font-mono text-slate-900">{ticker}</h2>
              {isLive && (
                <Badge variant="outline" className="text-xs border-emerald-500/40 text-emerald-600">
                  LIVE
                </Badge>
              )}
            </div>
            {companyName && (
              <p className="text-sm text-muted-foreground">{companyName}</p>
            )}
          </div>

          <div className="flex flex-col gap-1 border-l border-slate-200 pl-6">
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold font-mono text-slate-900">
                {currency}
                {formatNumber(currentPrice, { decimals: 2 })}
              </span>
              {priceTarget && (
                <Badge variant="outline" className="text-xs font-mono border-slate-200">
                  Target {currency}
                  {formatNumber(priceTarget, { decimals: 2 })}
                </Badge>
              )}
            </div>
            {confidence !== undefined && (
              <p className="text-xs text-muted-foreground">
                Confidence {Math.round(confidence * 100)}%
                {convictionLabel && (
                  <>
                    {" "}
                    • Conviction {convictionLabel}
                    {convictionScore !== undefined && ` (${convictionScore}%)`}
                  </>
                )}
              </p>
            )}
          </div>
        </div>

        {/* Right: Performance Changes */}
        <div className="flex flex-wrap items-center gap-4">
          {changes.map((change) => {
            const isPositive = change.value >= 0;
            return (
              <div
                key={change.period}
                className="flex flex-col items-center min-w-[80px] rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
              >
                <span className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {change.period}
                </span>
                <div className="flex items-center gap-1">
                  {isPositive ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span
                    className={cn(
                      "text-sm font-semibold font-mono",
                      isPositive ? "text-green-600" : "text-red-600"
                    )}
                  >
                    {isPositive ? "+" : ""}
                    {(change.value * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
