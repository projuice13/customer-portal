"use client";

import { useState, useRef } from "react";
import { Upload, Trash2, GripVertical, ImageIcon } from "lucide-react";
import type { ProductImageEntry } from "@/lib/product-images";
import { cn } from "@/lib/utils";

const MAX_PX = 2000;
const JPEG_QUALITY = 0.82;

async function compressImage(file: File): Promise<{ blob: Blob; originalKb: number; compressedKb: number }> {
  const originalKb = Math.round(file.size / 1024);
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;
      if (width > MAX_PX || height > MAX_PX) {
        if (width >= height) { height = Math.round((height / width) * MAX_PX); width = MAX_PX; }
        else { width = Math.round((width / height) * MAX_PX); height = MAX_PX; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error("Canvas compression failed")); return; }
          resolve({ blob, originalKb, compressedKb: Math.round(blob.size / 1024) });
        },
        "image/jpeg",
        JPEG_QUALITY
      );
    };
    img.onerror = reject;
    img.src = objectUrl;
  });
}

interface Props {
  slug: string;
  initialImages: ProductImageEntry[];
}

export function AdminImageManager({ slug, initialImages }: Props) {
  const [images, setImages] = useState(initialImages);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const dragIndex = useRef<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setError("");
    setUploadStatus("");
    setUploading(true);
    try {
      // Compress all files first
      const compressed: { blob: Blob; safeName: string; originalKb: number; compressedKb: number }[] = [];
      for (let i = 0; i < files.length; i++) {
        setUploadStatus(`Compressing ${i + 1}/${files.length}…`);
        const { blob, originalKb, compressedKb } = await compressImage(files[i]);
        const safeName = files[i].name.replace(/[^a-zA-Z0-9._-]/g, "-").toLowerCase();
        compressed.push({ blob, safeName, originalKb, compressedKb });
      }

      // Send all in one request — server uploads to Blob and updates index once
      setUploadStatus(`Uploading ${files.length} image${files.length !== 1 ? "s" : ""}…`);
      const form = new FormData();
      compressed.forEach(({ blob, safeName }) => form.append("file", blob, safeName));
      const res = await fetch(`/api/admin/images/${slug}`, { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");

      setImages(data.images);
      setUploadStatus("");
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

  function handleDragStart(index: number) {
    dragIndex.current = index;
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    setDragOverIndex(index);
  }

  function handleDrop(e: React.DragEvent, dropIndex: number) {
    e.preventDefault();
    const from = dragIndex.current;
    if (from === null || from === dropIndex) { setDragOverIndex(null); return; }

    const reordered = [...images];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(dropIndex, 0, moved);
    const withOrder = reordered.map((img, i) => ({ ...img, order: i }));
    setImages(withOrder);
    setDragOverIndex(null);
    dragIndex.current = null;

    // Persist to server
    fetch(`/api/admin/images/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: withOrder.map((img) => img.url) }),
    }).catch(() => setError("Failed to save new order. Please reload and try again."));
  }

  function handleDragEnd() {
    dragIndex.current = null;
    setDragOverIndex(null);
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
        {uploading && uploadStatus && (
          <p className="text-xs text-teal-600 font-medium">{uploadStatus}</p>
        )}
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
          {images.map((img, index) => (
            <div
              key={img.url}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={cn(
                "flex items-center gap-3 px-4 py-3 transition-colors",
                dragOverIndex === index && dragIndex.current !== index
                  ? "bg-teal-50 border-t-2 border-teal-400"
                  : "bg-white"
              )}
            >
              <GripVertical className="h-4 w-4 text-slate-300 flex-shrink-0 cursor-grab active:cursor-grabbing" />
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
