import { Trash2 } from "lucide-react";
import { parseToPence } from "@/lib/utils";
import type { CalculatorComponent } from "@/lib/types";

interface CalculatorRowProps {
  row: CalculatorComponent;
  onLabelChange: (id: string, label: string) => void;
  onCostChange: (id: string, pence: number) => void;
  onRemove: (id: string) => void;
}

export function CalculatorRow({
  row,
  onLabelChange,
  onCostChange,
  onRemove,
}: CalculatorRowProps) {
  const displayCost = row.cost > 0 ? (row.cost / 100).toFixed(2) : "";

  return (
    <div className="flex items-center gap-2 py-1.5 border-b border-slate-100 last:border-0 group">
      {/* Label */}
      {row.editable ? (
        <input
          type="text"
          value={row.label}
          onChange={(e) => onLabelChange(row.id, e.target.value)}
          placeholder="Item name"
          className="flex-1 min-w-0 rounded border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-700 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500/20 transition"
          aria-label="Cost item name"
        />
      ) : (
        <span className="flex-1 min-w-0 text-sm text-slate-700 truncate">{row.label}</span>
      )}

      {/* Cost input */}
      <div className="flex items-center gap-1 w-28 flex-shrink-0">
        <span className="text-sm text-slate-400">£</span>
        <input
          type="number"
          min="0"
          step="0.01"
          value={displayCost}
          onChange={(e) => onCostChange(row.id, parseToPence(e.target.value))}
          placeholder="0.00"
          className="w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 text-right focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500/20 transition"
          aria-label={`Cost for ${row.label}`}
        />
      </div>

      {/* Remove button */}
      <button
        type="button"
        onClick={() => onRemove(row.id)}
        disabled={!row.removable}
        className="flex-shrink-0 rounded p-1 text-slate-300 hover:text-red-400 disabled:opacity-0 disabled:pointer-events-none transition-colors"
        aria-label={`Remove ${row.label}`}
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}
