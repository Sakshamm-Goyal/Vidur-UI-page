import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(
  value: number,
  options?: {
    decimals?: number;
    percent?: boolean;
    currency?: boolean;
    compact?: boolean;
  }
): string {
  const { decimals = 2, percent = false, currency = false, compact = false } = options || {};

  if (compact && Math.abs(value) >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(decimals)}B`;
  }
  if (compact && Math.abs(value) >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(decimals)}M`;
  }
  if (compact && Math.abs(value) >= 1_000) {
    return `${(value / 1_000).toFixed(decimals)}K`;
  }

  let formatted = value.toFixed(decimals);

  if (!compact) {
    // Add thousand separators with thin spaces
    const parts = formatted.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    formatted = parts.join(".");
  }

  if (percent) {
    return `${formatted}%`;
  }
  if (currency) {
    return `₹${formatted}`;
  }
  return formatted;
}

export function formatDelta(value: number, decimals = 2): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${formatNumber(value, { decimals })}%`;
}

export function getColorForValue(value: number): string {
  if (value > 0) return "text-positive";
  if (value < 0) return "text-negative";
  return "text-neutral";
}

export function seedRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  return function () {
    hash = (hash * 9301 + 49297) % 233280;
    return hash / 233280;
  };
}

export function getDeterministicValue(
  seed: string,
  min: number,
  max: number
): number {
  const rng = seedRandom(seed);
  return min + rng() * (max - min);
}

export function generateTimeSeriesData(
  seed: string,
  points: number,
  baseValue: number,
  volatility: number
): Array<{ t: string; c: number }> {
  const rng = seedRandom(seed);
  const data: Array<{ t: string; c: number }> = [];

  // Generate random walk backwards, then normalize so it ends at baseValue
  const tempData: number[] = [];
  let value = baseValue;

  // Generate the random walk
  for (let i = 0; i < points; i++) {
    const change = (rng() - 0.5) * volatility * value;
    value += change;
    tempData.push(value);
  }

  // Normalize so the last value equals baseValue (current price)
  const lastValue = tempData[tempData.length - 1];
  const ratio = baseValue / lastValue;

  const now = new Date();
  for (let i = 0; i < points; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - (points - 1 - i));

    data.push({
      t: date.toISOString().split("T")[0],
      c: tempData[i] * ratio,
    });
  }

  return data;
}
