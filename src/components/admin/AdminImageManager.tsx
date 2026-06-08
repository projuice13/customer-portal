"use client";

import { useState, useRef } from "react";
import { Upload, Trash2, GripVertical, ImageIcon } from "lucide-react";
import type { ProductImageEntry } from "@/lib/product-images";

interface Props {
  slug: string;
  initialImages: ProductImageEntry[];
}

export function AdminImageManager({ slug, initialImages }: Props) {
  const [images, setImages] = useState(initialImages);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setError("");
    setUploading(true);
    try {
      for (const file of files) {
        const form = new FormData();
        form.append("file", file);
        const res = await fetch(`/api/admin/images/${slug}`, { method: "POST", body: form });
        if (!res.ok) throw new Error(await res.text());
      }
      const res = await fetch(`/api/admin/images/${slug}`);
      const data = await res.json();
      setImages(data.images);
    } catch (err) {
      setError(`Upload failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleDelete(url: string) {
    if (!confirm("Remove this image?")) return;
    setError("");
    try {
      const res = await fetch(
        `/api/admin/images/${slug}?url=${encodeURIComponent(url)}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error();
      setImages((prev) => prev.filter((img) => img.url !== url));
    } catch {
      setError("Delete failed. Please try again.");
    }
  }

  const downloadUrl = (img: ProductImageEntry) =>
    `/api/images/download?url=${encodeURIComponent(img.url)}&filename=${encodeURIComponent(img.filename)}`;

  return (
    <div className="space-y-5">
      {/* Upload zone */}
      <div
        className="relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-10 cursor-pointer hover:border-teal-300 hover:bg-teal-50/30 transition-colors"
        onClick={() => fileRef.current?.click()}
      >
        <Upload className="h-6 w-6 text-slate-400" />
        <div className="text-center">
          <p className="text-sm font-medium text-slate-700">Click to upload images</p>
          <p className="text-xs text-slate-400 mt-0.5">JPG, PNG, WebP — multiple files supported</p>
        </div>
        {uploading && <p className="text-xs text-teal-600 font-medium">Uploading…</p>}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={handleUpload}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {images.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-12 text-slate-400">
          <ImageIcon className="h-8 w-8" />
          <p className="text-sm">No images uploaded yet</p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
          {images.map((img) => (
            <div key={img.url} className="flex items-center gap-3 px-4 py-3">
              <GripVertical className="h-4 w-4 text-slate-300 flex-shrink-0" />
              <a
                href={downloadUrl(img)}
                target="_blank"
                rel="noopener noreferrer"
                className="h-12 w-12 flex-shrink-0 rounded-lg border border-slate-200 bg-slate-100 overflow-hidden"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.filename} className="h-full w-full object-cover" />
              </a>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{img.label ?? img.filename}</p>
                <p className="text-xs text-slate-400 truncate">{img.pathname}</p>
              </div>
              <button
                onClick={() => handleDelete(img.url)}
                className="flex-shrink-0 p-1.5 text-slate-400 hover:text-red-500 transition-colors rounded"
                aria-label="Delete image"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
