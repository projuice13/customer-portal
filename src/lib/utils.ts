import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { CalculatorResult } from "./types";

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format pence as £ currency string */
export function formatPence(pence: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(pence / 100);
}

/** Format a percentage to 1 decimal place */
export function formatPercent(value: number): string {
  if (!isFinite(value)) return "—";
  return `${value.toFixed(1)}%`;
}

/** Parse a £ string input to pence (integer), returns 0 for invalid */
export function parseToPence(value: string): number {
  const cleaned = value.replace(/[^0-9.]/g, "");
  const parsed = parseFloat(cleaned);
  if (isNaN(parsed) || parsed < 0) return 0;
  return Math.round(parsed * 100);
}

/** Calculate profit/margin from cost components and selling price (all in pence) */
export function calculateResult(
  totalCostPence: number,
  sellingPricePence: number
): CalculatorResult {
  const grossProfit = sellingPricePence - totalCostPence;
  const marginPercent =
    sellingPricePence > 0 ? (grossProfit / sellingPricePence) * 100 : 0;
  const markupPercent =
    totalCostPence > 0 ? (grossProfit / totalCostPence) * 100 : 0;
  return {
    totalCost: totalCostPence,
    sellingPrice: sellingPricePence,
    grossProfit,
    marginPercent,
    markupPercent,
  };
}

/** Margin colour coding: green > 50%, amber 30–50%, red < 30% */
export function marginColour(marginPercent: number): string {
  if (marginPercent >= 50) return "text-emerald-600";
  if (marginPercent >= 30) return "text-amber-600";
  return "text-red-500";
}
