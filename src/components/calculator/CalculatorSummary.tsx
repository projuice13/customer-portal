"use client";

import { useState } from "react";
import type { CalculatorResult, CalculatorComponent } from "@/lib/types";
import { formatPence, formatPercent, marginColour, cn } from "@/lib/utils";

interface CalculatorSummaryProps {
  result: CalculatorResult;
  rows: CalculatorComponent[];
}

const SLICE_COLOURS = [
  "#0d9488", // teal-600
  "#0891b2", // cyan-600
  "#7c3aed", // violet-600
  "#db2777", // pink-600
  "#ea580c", // orange-600
  "#ca8a04", // yellow-600
  "#65a30d", // lime-600
  "#0284c7", // sky-600
  "#9333ea", // purple-600
  "#dc2626", // red-600
];

export function CalculatorSummary({ result, rows }: CalculatorSummaryProps) {
  const [tab, setTab] = useState<"figures" | "visual">("figures");
  const { totalCost, sellingPrice, grossProfit, marginPercent, markupPercent } = result;
  const profitPositive = grossProfit >= 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden" aria-label="Profit summary">
      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-slate-50">
        <TabButton active={tab === "figures"} onClick={() => setTab("figures")}>
          Figures
        </TabButton>
        <TabButton active={tab === "visual"} onClick={() => setTab("visual")}>
          Visual
        </TabButton>
      </div>

      {tab === "figures" && (
        <>
          <div className="divide-y divide-slate-100">
            <SummaryRow label="Total cost" value={formatPence(totalCost)} />
            <SummaryRow label="Selling price" value={formatPence(sellingPrice)} />
            <SummaryRow
              label="Gross profit"
              value={formatPence(grossProfit)}
              valueClass={profitPositive ? "text-emerald-600" : "text-red-500"}
            />
            <SummaryRow
              label="Margin %"
              value={formatPercent(marginPercent)}
              valueClass={marginColour(marginPercent)}
              hint="Profit ÷ selling price"
            />
            <SummaryRow label="Markup %" value={formatPercent(markupPercent)} hint="Profit ÷ cost" />
          </div>

          {/* Visual margin bar */}
          <div className="px-4 py-3 border-t border-slate-100">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs text-slate-400">Margin</p>
              <p className={cn("text-xs font-semibold", marginColour(marginPercent))}>{formatPercent(marginPercent)}</p>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-300",
                  marginPercent >= 50 ? "bg-emerald-400" : marginPercent >= 30 ? "bg-amber-400" : "bg-red-400"
                )}
                style={{ width: `${Math.min(Math.max(marginPercent, 0), 100)}%` }}
                role="progressbar"
                aria-valuenow={Math.round(marginPercent)}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
            <div className="flex justify-between mt-1 text-[10px] text-slate-300">
              <span>0%</span><span>30%</span><span>50%</span><span>100%</span>
            </div>
          </div>
        </>
      )}

      {tab === "visual" && (
        <VisualBreakdown rows={rows} grossProfit={grossProfit} sellingPrice={sellingPrice} />
      )}
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-1 px-4 py-3 text-xs font-semibold uppercase tracking-wider transition-colors",
        active ? "text-teal-700 bg-white border-b-2 border-teal-500" : "text-slate-500 hover:text-slate-700"
      )}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}

function SummaryRow({ label, value, valueClass, hint }: { label: string; value: string; valueClass?: string; hint?: string; }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-2.5">
      <div>
        <p className="text-sm text-slate-600">{label}</p>
        {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
      </div>
      <p className={cn("text-sm font-semibold tabular-nums", valueClass ?? "text-slate-900")}>{value}</p>
    </div>
  );
}

// ── Pie chart ────────────────────────────────────────────────────────────────

function VisualBreakdown({
  rows,
  grossProfit,
  sellingPrice,
}: {
  rows: CalculatorComponent[];
  grossProfit: number;
  sellingPrice: number;
}) {
  // Build slice data: every cost row + (if positive) gross profit
  const costSlices = rows
    .filter((r) => r.cost > 0)
    .map((r, i) => ({
      label: r.label || "Untitled",
      value: r.cost,
      colour: SLICE_COLOURS[i % SLICE_COLOURS.length],
    }));

  const slices = [
    ...costSlices,
    ...(grossProfit > 0
      ? [{ label: "Gross profit", value: grossProfit, colour: "#10b981" }]
      : []),
  ];

  const total = slices.reduce((sum, s) => sum + s.value, 0);

  if (total === 0 || sellingPrice === 0) {
    return (
      <div className="flex items-center justify-center py-16 px-4 text-center">
        <p className="text-sm text-slate-400">Add costs and a selling price to see the breakdown.</p>
      </div>
    );
  }

  // SVG pie geometry
  const size = 200;
  const radius = 80;
  const cx = size / 2;
  const cy = size / 2;
  let cumulative = 0;

  const paths = slices.map((s) => {
    const startAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2;
    cumulative += s.value;
    const endAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2;

    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);

    const largeArc = s.value / total > 0.5 ? 1 : 0;

    // Special case: single full slice
    const d =
      slices.length === 1
        ? `M ${cx - radius} ${cy} A ${radius} ${radius} 0 1 1 ${cx + radius} ${cy} A ${radius} ${radius} 0 1 1 ${cx - radius} ${cy} Z`
        : `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

    return { d, colour: s.colour, label: s.label, value: s.value, pct: (s.value / total) * 100 };
  });

  return (
    <div className="p-4">
      {/* Pie */}
      <div className="flex justify-center mb-4">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label="Cost breakdown pie chart">
          {paths.map((p, i) => (
            <path key={i} d={p.d} fill={p.colour} stroke="white" strokeWidth="2">
              <title>{`${p.label}: ${formatPence(p.value)} (${p.pct.toFixed(1)}%)`}</title>
            </path>
          ))}
        </svg>
      </div>

      {/* Legend */}
      <ul className="space-y-1.5">
        {paths.map((p, i) => (
          <li key={i} className="flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="h-2.5 w-2.5 rounded-sm flex-shrink-0"
                style={{ backgroundColor: p.colour }}
                aria-hidden="true"
              />
              <span className="text-slate-700 truncate">{p.label}</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 tabular-nums">
              <span className="text-slate-500 font-medium">{formatPence(p.value)}</span>
              <span className="text-slate-400 w-12 text-right">{p.pct.toFixed(1)}%</span>
            </div>
          </li>
        ))}
      </ul>

      {grossProfit < 0 && (
        <p className="mt-4 rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-xs text-red-700">
          Selling price is below total cost — no profit slice shown.
        </p>
      )}
    </div>
  );
}
