"use client";

import { useRef, useState } from "react";
import { FileText, Upload, Trash2 } from "lucide-react";
import type { PromoMaterialEntry, PromoMaterialType } from "@/lib/promo-material";

const TYPES: PromoMaterialType[] = ["Poster", "Pavement Sign", "Menu Board", "Other"];

export function PromoMaterialManager({ initialItems }: { initialItems: PromoMaterialEntry[] }) {
  const [items, setItems] = useState(initialItems);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<PromoMaterialType>("Poster");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!title.trim()) {
      setError("Please enter a title before choosing a file.");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    setError("");
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("title", title.trim());
      form.append("type", type);
      const res = await fetch(`/api/admin/promo-material`, { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setItems(data.items);
      setTitle("");
    } catch (err) {
      setError(`Upload failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this promotional material?")) return;
    setError("");
    try {
      const res = await fetch(`/api/admin/promo-material?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch {
      setError("Delete failed. Please try again.");
    }
  }

  // Group by type for display
  const grouped: Record<string, PromoMaterialEntry[]> = {};
  for (const item of items) {
    (grouped[item.type] ??= []).push(item);
  }

  return (
    <div className="space-y-5">
      {/* Upload form */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
        <h2 className="text-sm font-semibold text-slate-700">Upload Promotional Material</h2>

        <div className="grid grid-cols-1 sm:grid-cols-[1fr_180px] gap-3">
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Smoothies summer poster"
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as PromoMaterialType)}
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            >
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

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

        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      {/* Existing items grouped by type */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-12 text-slate-400">
          <FileText className="h-8 w-8" />
          <p className="text-sm">No promotional material uploaded yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {TYPES.filter((t) => grouped[t]?.length > 0).map((t) => (
            <div key={t} className="rounded-xl border border-slate-200 bg-white">
              <div className="px-4 py-3 border-b border-slate-100">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">{t}s</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {grouped[t].map((item) => (
                  <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-rose-50">
                      <FileText className="h-4 w-4 text-rose-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-slate-800 hover:text-teal-700 truncate block">
                        {item.title}
                      </a>
                      <p className="text-xs text-slate-400 truncate">{item.filename}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="flex-shrink-0 p-1.5 text-slate-400 hover:text-red-500 transition-colors rounded"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
