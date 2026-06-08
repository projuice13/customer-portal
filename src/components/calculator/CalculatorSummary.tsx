"use client";

import { useState } from "react";
import type { CalculatorResult, CalculatorComponent } from "@/lib/types";
import { formatPence, formatPercent, marginColour, cn } from "@/lib/utils";

interface CalculatorSummaryProps {
  result: CalculatorResult;
  rows: CalculatorComponent[];
}

// Colours for cost slices. Reserve all greens for profit only.
const SLICE_COLOURS = [
  "#7c3aed", // violet-600
  "#0891b2", // cyan-600
  "#db2777", // pink-600
  "#ea580c", // orange-600
  "#ca8a04", // yellow-600
  "#0284c7", // sky-600
  "#9333ea", // purple-600
  "#dc2626", // red-600
  "#e11d48", // rose-600
  "#475569", // slate-600
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
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

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

  // Make the pie large so it fills the box
  const size = 360;
  const radius = 150;
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

    const d =
      slices.length === 1
        ? `M ${cx - radius} ${cy} A ${radius} ${radius} 0 1 1 ${cx + radius} ${cy} A ${radius} ${radius} 0 1 1 ${cx - radius} ${cy} Z`
        : `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

    return { d, colour: s.colour, label: s.label, value: s.value, pct: (s.value / total) * 100 };
  });

  const hovered = hoverIndex !== null ? paths[hoverIndex] : null;

  return (
    <div className="p-4">
      <div className="relative w-full">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full h-auto block"
          aria-label="Cost breakdown pie chart"
        >
          {paths.map((p, i) => (
            <path
              key={i}
              d={p.d}
              fill={p.colour}
              stroke="white"
              strokeWidth="2"
              className="transition-opacity duration-150 cursor-pointer"
              style={{
                opacity: hoverIndex === null || hoverIndex === i ? 1 : 0.35,
              }}
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
            />
          ))}
          {/* Inner circle creates the donut hole for centre info */}
          <circle cx={cx} cy={cy} r={radius * 0.55} fill="white" className="pointer-events-none" />
        </svg>

        {/* Centre overlay shows hovered slice info */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="text-center px-4">
            {hovered ? (
              <>
                <p
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: hovered.colour }}
                >
                  {hovered.label}
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
                  {formatPence(hovered.value)}
                </p>
                <p className="text-sm text-slate-500 tabular-nums">
                  {hovered.pct.toFixed(1)}% of total
                </p>
              </>
            ) : (
              <p className="text-xs text-slate-400">Hover a slice for details</p>
            )}
          </div>
        </div>
      </div>

      {grossProfit < 0 && (
        <p className="mt-4 rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-xs text-red-700">
          Selling price is below total cost — no profit slice shown.
        </p>
      )}
    </div>
  );
}
