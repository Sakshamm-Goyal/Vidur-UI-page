"use client";

import { useMemo, useRef } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { toPng } from "html-to-image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, ImageDown } from "lucide-react";
import { cn } from "@/lib/utils";

type ChartType = "line" | "area" | "bar" | "scatter";

interface SeriesConfig {
  dataKey: string;
  name?: string;
  type?: "line" | "area";
  color?: string;
}

interface ChartCardProps {
  title: string;
  description?: string;
  data: any[];
  height?: number;
  type?: ChartType;
  dataKey?: string;
  xKey?: string;
  series?: SeriesConfig[];
  className?: string;
  children?: React.ReactNode;
  formatTooltipLabel?: (label: any) => string;
}

export function ChartCard({
  title,
  description,
  data,
  height = 300,
  type = "line",
  dataKey = "value",
  xKey = "t",
  series,
  className,
  children,
  formatTooltipLabel,
}: ChartCardProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  const headers = useMemo(() => {
    if (!data || data.length === 0) return [];
    return Object.keys(data[0]);
  }, [data]);

  const handleExportCsv = () => {
    if (!data || data.length === 0 || headers.length === 0) return;
    const rows = data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          if (value === undefined || value === null) return "";
          if (typeof value === "string" && value.includes(",")) {
            return `"${value}"`;
          }
          return value;
        })
        .join(","),
    );
    const content = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title.replace(/\s+/g, "_").toLowerCase()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPng = async () => {
    if (!chartRef.current) return;
    try {
      const dataUrl = await toPng(chartRef.current, {
        cacheBust: true,
        backgroundColor: "#ffffff",
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `${title.replace(/\s+/g, "_").toLowerCase()}.png`;
      link.click();
    } catch (error) {
      console.error("Failed to export chart as PNG", error);
    }
  };

  const defaultChart = () => {
    const sharedElements = (
      <>
        <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
        <XAxis
          dataKey={xKey}
          tick={{ fontSize: 12 }}
          className="text-slate-600 dark:text-slate-400"
        />
        <YAxis
          tick={{ fontSize: 12 }}
          className="text-slate-600 dark:text-slate-400"
        />
        <Tooltip
          labelFormatter={formatTooltipLabel}
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
        />
      </>
    );

    switch (type) {
      case "area":
        return (
          <AreaChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
            {sharedElements}
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke="hsl(217.2 91.2% 59.8%)"
              fill="hsl(217.2 91.2% 59.8% / 0.2)"
              strokeWidth={2}
              dot={false}
            />
          </AreaChart>
        );
      case "bar":
        return (
          <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
            {sharedElements}
            <Bar
              dataKey={dataKey}
              fill="hsl(217.2 91.2% 59.8%)"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        );
      case "scatter":
        return (
          <ScatterChart margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
            <XAxis
              dataKey={xKey}
              name={xKey}
              tick={{ fontSize: 12 }}
              className="text-slate-600 dark:text-slate-400"
            />
            <YAxis
              dataKey={dataKey}
              name={dataKey}
              tick={{ fontSize: 12 }}
              className="text-slate-600 dark:text-slate-400"
            />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Scatter
              name="Peers"
              data={data}
              fill="hsl(224.3 76.3% 48%)"
            />
          </ScatterChart>
        );
      case "line":
      default:
        return (
          <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
            {sharedElements}
            {series && series.length > 0 ? (
              <>
                {series.map((serie, idx) =>
                  serie.type === "area" ? (
                    <Area
                      key={serie.dataKey}
                      type="monotone"
                      dataKey={serie.dataKey}
                      name={serie.name}
                      stroke={serie.color || `hsl(${217 + idx * 32} 91% 60%)`}
                      fill={`${serie.color || `hsl(${217 + idx * 32} 91% 60%)`} / 0.15`}
                      strokeWidth={2}
                    />
                  ) : (
                    <Line
                      key={serie.dataKey}
                      type="monotone"
                      dataKey={serie.dataKey}
                      name={serie.name}
                      stroke={serie.color || `hsl(${217 + idx * 32} 91% 60%)`}
                      strokeWidth={2}
                      dot={false}
                    />
                  ),
                )}
                <Legend />
              </>
            ) : (
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke="hsl(217.2 91.2% 59.8%)"
                strokeWidth={2}
                dot={false}
              />
            )}
          </LineChart>
        );
    }
  };

  return (
    <Card className={cn("h-full rounded-2xl border border-slate-200 bg-white shadow-md shadow-slate-900/5", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleExportPng}
            title="Download PNG"
          >
            <ImageDown className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleExportCsv}
            title="Download CSV"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div ref={chartRef} className="h-full w-full">
          <ResponsiveContainer width="100%" height={height}>
            {children ? children : defaultChart()}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
