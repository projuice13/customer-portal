"use client";

import { useState } from "react";
import { allergenCategories } from "@/data/allergens";
import { PageHeader } from "@/components/layout/PageHeader";
import { cn } from "@/lib/utils";

export default function AllergenInformationPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = allergenCategories[activeIndex];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Allergen Information"
        description="Detailed allergen breakdown for every product. Click a category below to view its products."
        className="mb-6"
      />

      {/* Category tabs */}
      <div className="mb-5 flex flex-wrap gap-2" role="tablist" aria-label="Product category">
        {allergenCategories.map((cat, i) => (
          <button
            key={cat.name}
            role="tab"
            aria-selected={activeIndex === i}
            onClick={() => setActiveIndex(i)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
              activeIndex === i
                ? "bg-teal-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
        <table className="w-full text-sm" aria-label={`${active.name} allergen table`}>
          <thead>
            <tr className="bg-[#00334C] text-white">
              {active.headers.map((h, i) => (
                <th
                  key={i}
                  scope="col"
                  className={cn(
                    "px-3 py-3 text-xs font-semibold uppercase tracking-wide",
                    i === 0 ? "text-left min-w-[160px]" : "text-center min-w-[80px]"
                  )}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {active.rows.map((row, ri) => (
              <tr key={ri} className="hover:bg-slate-50/60">
                {row.map((cell, ci) => {
                  const isProduct = ci === 0;
                  const isYes = !isProduct && /yes/i.test(cell);
                  return (
                    <td
                      key={ci}
                      className={cn(
                        "px-3 py-2.5",
                        isProduct ? "text-left font-medium text-slate-800" : "text-center",
                        !isProduct && isYes ? "bg-red-50 text-red-700 font-semibold" : "",
                        !isProduct && !isYes ? "text-slate-400" : ""
                      )}
                    >
                      {cell || "—"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-slate-400">
        Cells highlighted in red indicate the allergen is present in the product. All other ingredients are produced in
        facilities that may handle allergens — please contact us if you require detailed information for a specific product.
      </p>
    </div>
  );
}
