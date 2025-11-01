"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/utils";
import type { PeerRow } from "@/lib/types";

interface PeerTableProps {
  peers: PeerRow[];
}

export function PeerTable({ peers }: PeerTableProps) {
  const [sortKey, setSortKey] = useState<keyof PeerRow>("ticker");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [visibleMetrics, setVisibleMetrics] = useState<Record<string, boolean>>({
    nim: true,
    npa: true,
    llp: false,
  });

  const handleSort = (key: keyof PeerRow) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const sortedPeers = [...peers].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortOrder === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }
    const aNum = typeof aVal === "number" ? aVal : Number.NEGATIVE_INFINITY;
    const bNum = typeof bVal === "number" ? bVal : Number.NEGATIVE_INFINITY;
    return sortOrder === "asc" ? aNum - bNum : bNum - aNum;
  });

  const columns = useMemo(() => {
    const base: Array<{ key: keyof PeerRow; label: string }> = [
      { key: "ticker", label: "Ticker" },
      { key: "name", label: "Name" },
      { key: "pe", label: "P/E" },
      { key: "pb", label: "P/B" },
      { key: "roe", label: "RoE" },
    ];
    if (visibleMetrics.nim) base.push({ key: "nim", label: "NIM" });
    if (visibleMetrics.npa) base.push({ key: "npa", label: "NPA" });
    if (visibleMetrics.llp) base.push({ key: "llp", label: "LLP" });
    return base;
  }, [visibleMetrics]);

  const handleExportCsv = () => {
    if (!sortedPeers.length) return;
    const headerRow = columns.map((col) => col.label).join(",");
    const rows = sortedPeers.map((peer) =>
      columns
        .map((col) => {
          const value = peer[col.key];
          if (value === undefined || value === null) return "";
          if (typeof value === "number") return value.toString();
          return `"${value}"`;
        })
        .join(","),
    );
    const csv = [headerRow, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "peer_comparison.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="rounded-2xl border border-slate-200 bg-white shadow-md shadow-slate-900/5">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-base font-semibold">Peer Comparison</CardTitle>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {[
              { key: "nim", label: "NIM" },
              { key: "npa", label: "NPA" },
              { key: "llp", label: "LLP" },
            ].map((metric) => (
                <Button
                  key={metric.key}
                  variant={visibleMetrics[metric.key] ? "default" : "outline"}
                  size="sm"
                  className="h-8 rounded-full text-xs"
                  onClick={() =>
                    setVisibleMetrics((prev) => ({ ...prev, [metric.key]: !prev[metric.key] }))
                  }
                >
                {visibleMetrics[metric.key] ? "Hide" : "Show"} {metric.label}
              </Button>
            ))}
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleExportCsv} title="Download CSV">
          <Download className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="text-left p-3 text-sm font-semibold text-slate-700 dark:text-slate-300"
                  >
                    <button
                      onClick={() => handleSort(col.key)}
                      className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-slate-100"
                    >
                      {col.label}
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedPeers.map((peer, idx) => (
                <tr
                  key={idx}
                  className="border-b border-slate-100 dark:border-slate-900 hover:bg-slate-50 dark:hover:bg-slate-900"
                >
                  {columns.map((col) => {
                    const value = peer[col.key];
                    const numberValue = typeof value === "number" ? value : undefined;
                    return (
                      <td key={col.key as string} className="p-3 font-numeric text-sm">
                        {numberValue !== undefined
                          ? col.key === "pe" || col.key === "pb"
                            ? formatNumber(numberValue, { decimals: 1 })
                            : col.key === "roe" || col.key === "nim" || col.key === "npa" || col.key === "llp"
                            ? `${formatNumber(numberValue, { decimals: 1 })}%`
                            : formatNumber(numberValue, { decimals: 2 })
                          : (value as string) ?? "—"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
