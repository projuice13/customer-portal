"use client";

import { useRef, useState } from "react";
import { FileText, Upload, Trash2 } from "lucide-react";
import type { DayCardEntry } from "@/lib/day-cards";

interface Props {
  slug: string;
  initialCard: DayCardEntry | null;
}

export function DayCardUploader({ slug, initialCard }: Props) {
  const [card, setCard] = useState<DayCardEntry | null>(initialCard);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`/api/admin/day-card/${slug}`, { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setCard(data.card);
    } catch (err) {
      setError(`Upload failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleDelete() {
    if (!confirm("Remove this day card?")) return;
    setError("");
    try {
      const res = await fetch(`/api/admin/day-card/${slug}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setCard(null);
    } catch {
      setError("Delete failed. Please try again.");
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="text-sm font-semibold text-slate-700 mb-0.5">Of the Day Card (PDF)</h2>
      <p className="text-sm text-slate-400 mb-4">
        Optional. If uploaded, it will appear under the spec sheet on the product detail page.
      </p>

      {card ? (
        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
          <FileText className="h-5 w-5 text-rose-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <a
              href={card.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-slate-800 hover:text-teal-700 truncate block"
            >
              {card.filename}
            </a>
            <p className="text-xs text-slate-400 truncate">{card.pathname}</p>
          </div>
          <button
            onClick={handleDelete}
            className="flex-shrink-0 p-1.5 text-slate-400 hover:text-red-500 transition-colors rounded"
            aria-label="Remove day card"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          className="relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-6 cursor-pointer hover:border-teal-300 hover:bg-teal-50/30 transition-colors"
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="h-5 w-5 text-slate-400" />
          <p className="text-sm font-medium text-slate-700">
            {uploading ? "Uploading…" : "Click to upload PDF"}
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf,.pdf"
            className="sr-only"
            onChange={handleUpload}
          />
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}
