"use client";

import { useState } from "react";
import Link from "next/link";
import { Package, ChevronRight, FileText } from "lucide-react";
import type { Product } from "@/lib/types";

const PROMO_KEY = "__promo__";

export function AdminProductList({ products }: { products: Product[] }) {
  const categories = Array.from(new Set(products.map((p) => p.category))).sort();
  const [activeCategory, setActiveCategory] = useState("All");

  const showingPromo = activeCategory === PROMO_KEY;

  const filtered = showingPromo
    ? []
    : activeCategory === "All"
      ? products
      : products.filter((p) => p.category === activeCategory);

  return (
    <div>
      {/* Category dropdown */}
      <div className="mb-3 flex items-center gap-3">
        <label htmlFor="admin-category" className="text-sm font-medium text-slate-700">
          Category
        </label>
        <select
          id="admin-category"
          value={activeCategory}
          onChange={(e) => setActiveCategory(e.target.value)}
          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
        >
          <option value="All">All products</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
          <option value={PROMO_KEY}>Promotional Material</option>
        </select>
      </div>

      {showingPromo ? (
        <Link
          href="/admin/promo-material"
          className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-4 hover:bg-slate-50 transition-colors group"
        >
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-rose-50 group-hover:bg-rose-100 transition-colors">
            <FileText className="h-5 w-5 text-rose-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900">Manage Promotional Material</p>
            <p className="text-xs text-slate-400">Upload posters, pavement signs and other PDFs for customers to download</p>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0" />
        </Link>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}
