"use client";

import { useState } from "react";
import Link from "next/link";
import { Package, ChevronRight } from "lucide-react";
import type { Product } from "@/lib/types";

export function AdminProductList({ products }: { products: Product[] }) {
  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category))).sort()];
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = activeCategory === "All"
    ? products
    : products.filter((p) => p.category === activeCategory);

  return (
    <div>
      {/* Category filter */}
      <div className="mb-3 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              activeCategory === cat
                ? "bg-teal-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <p className="mb-3 text-xs text-slate-400">{filtered.length} product{filtered.length !== 1 ? "s" : ""}</p>

      <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
        {filtered.map((product) => (
          <Link
            key={product.slug}
            href={`/admin/products/${product.slug}`}
            className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors group"
          >
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 group-hover:bg-teal-50 transition-colors">
              <Package className="h-4 w-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{product.title}</p>
              <p className="text-xs text-slate-400">{product.category}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
