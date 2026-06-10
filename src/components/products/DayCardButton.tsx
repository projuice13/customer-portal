"use client";

import { useEffect, useState } from "react";
import { FileText, Download } from "lucide-react";
import type { DayCardEntry } from "@/lib/day-cards";

export function DayCardButton({ slug }: { slug: string }) {
  const [card, setCard] = useState<DayCardEntry | null>(null);

  useEffect(() => {
    let cancelled = false;
    setCard(null);
    fetch(`/api/day-card/${slug}`)
      .then((r) => r.json())
      .then((data) => { if (!cancelled) setCard(data.card ?? null); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [slug]);

  if (!card) return null;

  return (
    <a
      href={card.url}
      target="_blank"
      rel="noopener noreferrer"
      download={card.filename}
      className="group flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5 hover:border-rose-300 hover:bg-rose-50/40 transition-colors"
    >
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-rose-50 group-hover:bg-rose-100 transition-colors">
        <FileText className="h-4 w-4 text-rose-500" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800">Of the Day Card</p>
        <p className="text-xs text-slate-400">PDF</p>
      </div>
      <Download className="h-4 w-4 text-slate-300 group-hover:text-rose-500 transition-colors flex-shrink-0" />
    </a>
  );
}
