"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import type { ProductImageEntry } from "@/lib/product-images";

interface Props {
  slug: string;
}

export function ProductImageThumbnails({ slug }: Props) {
  const [images, setImages] = useState<ProductImageEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/images/${slug}`)
      .then((r) => r.json())
      .then((data) => setImages(data.images ?? []))
      .catch(() => setImages([]))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 w-16 rounded-lg bg-slate-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (images.length === 0) return null;

  const downloadUrl = (img: ProductImageEntry) =>
    `/api/images/download?url=${encodeURIComponent(img.url)}&filename=${encodeURIComponent(img.filename)}`;

  return (
    <section aria-labelledby="product-images-heading">
      <h3
        id="product-images-heading"
        className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5"
      >
        Images
      </h3>
      <div className="flex flex-wrap gap-2">
        {images.map((img) => (
          <a
            key={img.url}
            href={downloadUrl(img)}
            download
            title={`Download ${img.label ?? img.filename}`}
            className="group relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 transition hover:border-teal-300 hover:shadow-md"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.url}
              alt={img.label ?? img.filename}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
              <Download className="h-4 w-4 text-white" aria-hidden="true" />
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
