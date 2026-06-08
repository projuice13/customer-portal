"use client";

import Image from "next/image";
import { useState } from "react";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  isSelected: boolean;
  onClick: () => void;
}

const categoryColours: Record<string, string> = {
  Smoothies: "bg-pj-yellow-light text-pj-yellow-text",
  Shakes: "bg-pj-yellow-light text-pj-yellow-text",
  Juices: "bg-pj-yellow-light text-pj-yellow-text",
};

export function ProductCard({ product, isSelected, onClick }: ProductCardProps) {
  const [imgError, setImgError] = useState(false);
  const categoryClass =
    categoryColours[product.category] ?? "bg-pj-yellow-light text-pj-yellow-text";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full h-full text-left rounded-lg border bg-white p-3 transition-all duration-100",
        "flex flex-col",
        "hover:border-pj-yellow hover:shadow-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pj-yellow focus-visible:ring-offset-1",
        isSelected
          ? "border-pj-yellow shadow-sm ring-1 ring-pj-yellow bg-pj-yellow-light/20"
          : "border-slate-200"
      )}
      aria-pressed={isSelected}
      aria-label={`View ${product.title}`}
    >
      {/* Thumbnail */}
      <div className="relative mb-2.5 h-28 w-full overflow-hidden rounded bg-slate-100">
        <Image
          src={imgError ? "/products/placeholder.svg" : product.image}
          alt={product.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, 200px"
          onError={() => setImgError(true)}
        />
      </div>

      {/* Info */}
      <p className="flex-1 text-sm font-semibold text-slate-800 leading-tight line-clamp-2">
        {product.title}
      </p>
      <span
        className={cn(
          "mt-1.5 inline-block self-start rounded-full px-2 py-0.5 text-xs font-medium",
          categoryClass
        )}
      >
        {product.category}
      </span>
    </button>
  );
}
