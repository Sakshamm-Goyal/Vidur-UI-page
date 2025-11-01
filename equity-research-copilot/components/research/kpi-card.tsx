"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ValueFormat = "percent" | "number" | "currency";

interface KPICardProps {
  title: string;
  value: number;
  delta?: number;
  format?: ValueFormat;
  decimals?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export function KPICard({
  title,
  value,
  delta,
  format = "percent",
  decimals = 1,
  className,
  prefix = "",
  suffix = "",
}: KPICardProps) {
  let formattedValue = value.toFixed(decimals);

  switch (format) {
    case "currency":
      formattedValue = `${prefix || "₹"}${value.toFixed(decimals)}`;
      break;
    case "percent":
      formattedValue = `${(value * 100).toFixed(decimals)}%`;
      break;
    default:
      formattedValue = `${prefix}${value.toFixed(decimals)}${suffix}`;
      break;
  }

  const hasDelta = delta !== undefined;
  const isPositive = (delta ?? 0) >= 0;

  return (
    <Card className={cn("rounded-xl border border-slate-200 bg-white shadow-sm", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-2xl font-bold font-numeric">{formattedValue}</span>
          {hasDelta && (
            <Badge variant={isPositive ? "success" : "destructive"} className="gap-1">
              {isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span className="font-numeric text-xs">
                {isPositive ? "+" : "-"}
                {Math.abs(delta ?? 0).toFixed(1)}%
              </span>
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface KPIGridProps {
  kpis: {
    priceTarget?: number;
    ret_1m: number;
    ret_3m: number;
    ret_6m: number;
    ret_1y: number;
    ret_3y: number;
    cagr_5y: number;
    max_dd_5y: number;
    sharpe_5y: number;
    beta_1y: number;
  };
  currency?: string;
}

export function KPIGrid({ kpis, currency = "₹" }: KPIGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {kpis.priceTarget && (
        <KPICard
          title="Price Target"
          value={kpis.priceTarget}
          format="currency"
          decimals={0}
          prefix={currency}
        />
      )}
      <KPICard title="1M Return" value={kpis.ret_1m} />
      <KPICard title="3M Return" value={kpis.ret_3m} />
      <KPICard title="6M Return" value={kpis.ret_6m} />
      <KPICard title="1Y Return" value={kpis.ret_1y} />
      <KPICard title="3Y Return" value={kpis.ret_3y} />
      <KPICard title="5Y CAGR" value={kpis.cagr_5y} />
      <KPICard
        title="Max Drawdown"
        value={kpis.max_dd_5y}
        className="border-destructive/40"
      />
      <KPICard title="5Y Sharpe" value={kpis.sharpe_5y} format="number" decimals={2} />
      <KPICard title="Beta (1Y)" value={kpis.beta_1y} format="number" decimals={2} />
    </div>
  );
}
