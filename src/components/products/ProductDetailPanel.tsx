"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/lib/types";
import { AllergenBadgeList } from "./AllergenBadgeList";
import { IngredientsList } from "./IngredientsList";
import { ResourceButton } from "./ResourceButton";
import { ProductImageThumbnails } from "./ProductImageThumbnails";
import { EmptyState } from "@/components/ui/EmptyState";
import { MousePointerClick } from "lucide-react";
import { cn } from "@/lib/utils";

interface PdfData {
  allergens: string[];
  ingredients: string[];
}

const categoryColours: Record<string, string> = {};

const typeLabels: Record<string, string> = {
  smoothie: "Smoothie",
  shake: "Shake",
  juice: "Juice",
  other: "Other",
};

interface ProductDetailPanelProps {
  product: Product | null;
  loading?: boolean;
  className?: string;
}

export function ProductDetailPanel({ product, loading = false, className }: ProductDetailPanelProps) {
  const [pdfData, setPdfData] = useState<PdfData | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  // Fetch PDF data whenever the selected product changes
  useEffect(() => {
    const specSheet = product?.resources.find((r) => r.type === "spec-sheet");
    if (!specSheet) {
      setPdfData(null);
      return;
    }

    let cancelled = false;
    setPdfLoading(true);
    setPdfData(null);

    fetch(`/api/product-pdf?url=${encodeURIComponent(specSheet.url)}`)
      .then((r) => r.json())
      .then((data: PdfData) => {
        if (!cancelled) setPdfData(data);
      })
      .catch(() => {
        if (!cancelled) setPdfData(null);
      })
      .finally(() => {
        if (!cancelled) setPdfLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [product]);

  if (!product) {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <EmptyState
          icon={<MousePointerClick className="h-5 w-5" aria-hidden="true" />}
          title="Select a product"
          description="Click any product on the left to view its details, assets, and downloads."
        />
      </div>
    );
  }

  const categoryClass =
    categoryColours[product.category] ?? "bg-pj-yellow-light text-pj-yellow-text";

  const allergens = pdfData?.allergens ?? [];
  const ingredients = pdfData?.ingredients ?? [];

  return (
    <article
      className={cn("relative overflow-y-auto scrollbar-thin", className)}
      aria-label={`Product details: ${product.title}`}
    >
      {loading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-xl bg-white/80 backdrop-blur-sm">
          <div className="h-7 w-7 rounded-full border-2 border-slate-200 border-t-teal-500 animate-spin" />
          <p className="text-xs text-slate-400">Loading product…</p>
        </div>
      )}
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", categoryClass)}>
              {product.category}
            </span>
          </div>
          <h2 className="text-lg font-semibold text-slate-900">{product.title}</h2>
          <p className="mt-1 text-sm text-slate-500">{product.shortDescription}</p>
        </div>

        {/* Product images */}
        <ProductImageThumbnails slug={product.slug} />

        {/* Downloads & assets */}
        {product.resources.length > 0 && (
          <section aria-labelledby="resources-heading">
            <h3 id="resources-heading" className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
              Downloads & Assets
            </h3>
            <div className="space-y-2">
              {product.resources.map((resource) => (
                <ResourceButton key={resource.id} resource={resource} />
              ))}
            </div>
          </section>
        )}

        {/* Allergens */}
        {pdfLoading ? (
          <div className="space-y-2">
            <div className="h-3 w-20 rounded bg-slate-100 animate-pulse" />
            <div className="flex gap-1.5">
              <div className="h-6 w-14 rounded-full bg-slate-100 animate-pulse" />
              <div className="h-6 w-10 rounded-full bg-slate-100 animate-pulse" />
            </div>
          </div>
        ) : allergens.length > 0 ? (
          <section aria-labelledby="allergens-heading">
            <h3 id="allergens-heading" className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
              Allergens
            </h3>
            <AllergenBadgeList allergens={allergens} />
          </section>
        ) : null}

        {/* Ingredients */}
        {!pdfLoading && ingredients.length > 0 && (
          <section aria-labelledby="ingredients-heading">
            <h3 id="ingredients-heading" className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
              Ingredients
            </h3>
            <IngredientsList ingredients={ingredients} />
          </section>
        )}
      </div>
    </article>
  );
}
