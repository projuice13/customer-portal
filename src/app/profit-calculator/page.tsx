"use client";

import { useState, useMemo, useCallback } from "react";
import { Plus, RotateCcw } from "lucide-react";
import { calculatorPresets } from "@/data/calculator-presets";
import { CalculatorRow } from "@/components/calculator/CalculatorRow";
import { CalculatorSummary } from "@/components/calculator/CalculatorSummary";
import { PageHeader } from "@/components/layout/PageHeader";
import { calculateResult, parseToPence } from "@/lib/utils";
import type { CalculatorComponent } from "@/lib/types";

function clonePreset(presetId: string): {
  rows: CalculatorComponent[];
  sellingPrice: number;
} {
  const preset = calculatorPresets.find((p) => p.id === presetId);
  if (!preset) {
    return { rows: [], sellingPrice: 400 };
  }
  // Deep clone rows with fresh IDs to avoid key collisions
  const rows = preset.components.map((c) => ({
    ...c,
    id: `${c.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  }));
  return { rows, sellingPrice: preset.defaultSellingPrice };
}

export default function ProfitCalculatorPage() {
  const [activePresetId, setActivePresetId] = useState("smoothie");
  const [rows, setRows] = useState<CalculatorComponent[]>(
    () => clonePreset("smoothie").rows
  );
  const [sellingPricePence, setSellingPricePence] = useState(
    () => clonePreset("smoothie").sellingPrice
  );
  const [sellingPriceInput, setSellingPriceInput] = useState(
    () => (clonePreset("smoothie").sellingPrice / 100).toFixed(2)
  );

  const totalCostPence = useMemo(
    () => rows.reduce((sum, r) => sum + r.cost, 0),
    [rows]
  );

  const result = useMemo(
    () => calculateResult(totalCostPence, sellingPricePence),
    [totalCostPence, sellingPricePence]
  );

  // ── Preset switching ──────────────────────────────────────────────────────

  function handlePresetChange(presetId: string) {
    const { rows: newRows, sellingPrice } = clonePreset(presetId);
    setActivePresetId(presetId);
    setRows(newRows);
    setSellingPricePence(sellingPrice);
    setSellingPriceInput((sellingPrice / 100).toFixed(2));
  }

  // ── Row operations ────────────────────────────────────────────────────────

  const handleLabelChange = useCallback((id: string, label: string) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, label } : r))
    );
  }, []);

  const handleCostChange = useCallback((id: string, pence: number) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, cost: pence } : r))
    );
  }, []);

  const handleRemove = useCallback((id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }, []);

  function handleAddRow() {
    const newRow: CalculatorComponent = {
      id: `custom-${Date.now()}`,
      label: "",
      cost: 0,
      editable: true,
      removable: true,
    };
    setRows((prev) => [...prev, newRow]);
  }

  function handleReset() {
    handlePresetChange(activePresetId);
  }

  // ── Selling price ─────────────────────────────────────────────────────────

  function handleSellingPriceChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    setSellingPriceInput(raw);
    setSellingPricePence(parseToPence(raw));
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="Profit Calculator"
        description="Estimate your selling price, cost, margin and markup for drinks. The below defaults are estimates and each cost should be updated to match specific costs incurred by your business."
        className="mb-6"
      />

      {/* Preset selector */}
      <div className="mb-5">
        <p className="text-sm font-medium text-slate-700 mb-2">Template</p>
        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 gap-1" role="group" aria-label="Calculator template">
          {calculatorPresets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handlePresetChange(preset.id)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-1 ${
                activePresetId === preset.id
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
              aria-pressed={activePresetId === preset.id}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* ── Cost rows panel ──────────────────────────────────────────── */}
        <div className="lg:w-1/2 flex-shrink-0">
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            {/* Table header */}
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-100 bg-slate-50">
              <span className="flex-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Cost item
              </span>
              <span className="w-28 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right pr-6">
                Cost (£)
              </span>
            </div>

            {/* Rows */}
            <div className="px-4">
              {rows.map((row) => (
                <CalculatorRow
                  key={row.id}
                  row={row}
                  onLabelChange={handleLabelChange}
                  onCostChange={handleCostChange}
                  onRemove={handleRemove}
                />
              ))}
            </div>

            {/* Add row */}
            <div className="px-4 pb-3 pt-1">
              <button
                type="button"
                onClick={handleAddRow}
                className="flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add item
              </button>
            </div>

            {/* Selling price row */}
            <div className="flex items-center gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3">
              <label
                htmlFor="selling-price"
                className="flex-1 text-sm font-semibold text-slate-700"
              >
                Selling price
              </label>
              <div className="flex items-center gap-1 w-28 flex-shrink-0">
                <span className="text-sm text-slate-400">£</span>
                <input
                  id="selling-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={sellingPriceInput}
                  onChange={handleSellingPriceChange}
                  className="w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 text-right focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500/20 transition font-semibold"
                  aria-label="Selling price in pounds"
                />
              </div>
              {/* Empty space matching remove button width */}
              <span className="w-[26px] flex-shrink-0" aria-hidden="true" />
            </div>
          </div>

          {/* Reset button */}
          <button
            type="button"
            onClick={handleReset}
            className="mt-3 flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Reset to defaults
          </button>
        </div>

        {/* ── Summary panel ────────────────────────────────────────────── */}
        <div className="lg:w-1/2 flex-shrink-0">
          <CalculatorSummary result={result} rows={rows} />

          {/* Formula reference */}
          <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 px-3.5 py-3 space-y-1.5">
            <p className="text-xs font-semibold text-slate-500">Formulas</p>
            <ul className="space-y-1 text-xs text-slate-400">
              <li>Profit = Selling price − Total cost</li>
              <li>Margin % = Profit ÷ Selling price × 100</li>
              <li>Markup % = Profit ÷ Total cost × 100</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
