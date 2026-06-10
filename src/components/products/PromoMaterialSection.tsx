"use client";

import { useEffect, useState } from "react";
import { FileText, Download } from "lucide-react";
import type { PromoMaterialEntry } from "@/lib/promo-material";

const TYPE_ORDER = ["Poster", "Pavement Sign", "Menu Board", "Other"] as const;

export function PromoMaterialSection() {
  const [items, setItems] = useState<PromoMaterialEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/promo-material")
      .then((r) => r.json())
      .then((data) => setItems(data.items ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading || items.length === 0) return null;

  const grouped: Record<string, PromoMaterialEntry[]> = {};
  for (const item of items) {
    (grouped[item.type] ??= []).push(item);
  }

  return (
    <section className="mt-10 pt-8 border-t border-slate-200" aria-labelledby="promo-material-heading">
      <div className="mb-5">
        <h2 id="promo-material-heading" className="text-lg font-semibold text-slate-900">
          Promotional Material
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Posters, pavement signs and other downloadable marketing PDFs.
        </p>
      </div>

      <div className="space-y-6">
        {TYPE_ORDER.filter((t) => grouped[t]?.length > 0).map((t) => (
          <div key={t}>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
              {t}s
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {grouped[t].map((item) => (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={item.filename}
                  className="group flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5 transition-colors hover:border-teal-300 hover:bg-teal-50/30"
                  aria-label={`Download ${item.title}`}
                >
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-50 group-hover:bg-teal-50 transition-colors">
                    <FileText className="h-4 w-4 text-slate-600 group-hover:text-teal-600 transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-slate-700">{item.title}</p>
                  </div>
                  <span className="flex-shrink-0 rounded bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500 border border-slate-200">
                    PDF
                  </span>
                  <Download className="h-4 w-4 text-slate-300 group-hover:text-teal-500 transition-colors flex-shrink-0" />
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
