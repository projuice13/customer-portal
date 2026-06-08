import type { CalculatorResult } from "@/lib/types";
import { formatPence, formatPercent, marginColour, cn } from "@/lib/utils";

interface CalculatorSummaryProps {
  result: CalculatorResult;
}

export function CalculatorSummary({ result }: CalculatorSummaryProps) {
  const { totalCost, sellingPrice, grossProfit, marginPercent, markupPercent } =
    result;
  const profitPositive = grossProfit >= 0;

  return (
    <div
      className="rounded-xl border border-slate-200 bg-white overflow-hidden"
      aria-label="Profit summary"
    >
      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Summary
        </p>
      </div>

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
        <SummaryRow
          label="Markup %"
          value={formatPercent(markupPercent)}
          hint="Profit ÷ cost"
        />
      </div>

      {/* Visual margin bar */}
      <div className="px-4 py-3 border-t border-slate-100">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-xs text-slate-400">Margin</p>
          <p className={cn("text-xs font-semibold", marginColour(marginPercent))}>
            {formatPercent(marginPercent)}
          </p>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-300",
              marginPercent >= 50
                ? "bg-emerald-400"
                : marginPercent >= 30
                ? "bg-amber-400"
                : "bg-red-400"
            )}
            style={{
              width: `${Math.min(Math.max(marginPercent, 0), 100)}%`,
            }}
            role="progressbar"
            aria-valuenow={Math.round(marginPercent)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Margin: ${formatPercent(marginPercent)}`}
          />
        </div>
        <div className="flex justify-between mt-1 text-[10px] text-slate-300">
          <span>0%</span>
          <span>30%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  valueClass,
  hint,
}: {
  label: string;
  value: string;
  valueClass?: string;
  hint?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-2.5">
      <div>
        <p className="text-sm text-slate-600">{label}</p>
        {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
      </div>
      <p className={cn("text-sm font-semibold tabular-nums", valueClass ?? "text-slate-900")}>
        {value}
      </p>
    </div>
  );
}
