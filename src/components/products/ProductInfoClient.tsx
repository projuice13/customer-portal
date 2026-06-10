"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Product } from "@/lib/types";
import { SearchBar } from "@/components/ui/SearchBar";
import { ProductFilterBar } from "@/components/products/ProductFilterBar";
import { ProductGrid } from "@/components/products/ProductGrid";
import { ProductDetailPanel } from "@/components/products/ProductDetailPanel";
import { PromoMaterialSection } from "@/components/products/PromoMaterialSection";
import { PageHeader } from "@/components/layout/PageHeader";

interface ProductInfoClientProps {
  products: Product[];
  categories: string[];
}

export function ProductInfoClient({ products, categories }: ProductInfoClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loadingSlug, setLoadingSlug] = useState<string | null>(null);

  const selectedSlug = searchParams.get("product") ?? null;

  // Clear loading state once the URL has caught up to the pending slug
  useEffect(() => {
    if (loadingSlug && loadingSlug === selectedSlug) {
      setLoadingSlug(null);
    }
  }, [selectedSlug, loadingSlug]);

  const selectedProduct = useMemo(
    () => products.find((p) => p.slug === selectedSlug) ?? null,
    [products, selectedSlug]
  );

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        !search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.shortDescription.toLowerCase().includes(search.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory = !category || p.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, category]);

  const handleSelect = useCallback(
    (slug: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (params.get("product") === slug) {
        params.delete("product");
        setLoadingSlug(null);
      } else {
        params.set("product", slug);
        setLoadingSlug(slug);
      }
      router.replace(`/product-info?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  useEffect(() => {
    if (selectedSlug) {
      const panel = document.getElementById("product-detail-panel");
      if (panel && window.innerWidth < 1024) {
        panel.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [selectedSlug]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Product Info"
        description="Browse all products and access spec sheets, images, posters and more."
        className="mb-5"
      />

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-0">
        {/* ── Left panel: list ─────────────────────────────────────── */}
        <div className="lg:w-[70%] lg:flex-shrink-0 lg:border-r lg:border-slate-200">
          <div className="space-y-2 pb-3 lg:pr-4">
            <div className="flex items-center gap-2">
              <div className="w-[40%]">
                <ProductFilterBar
                  categoryValue={category}
                  onCategoryChange={setCategory}
                  categories={categories}
                />
              </div>
              <div className="w-[60%]">
                <SearchBar
                  value={search}
                  onChange={setSearch}
                  placeholder="Search products…"
                  id="product-search"
                />
              </div>
            </div>
            <p className="text-xs text-slate-400 px-0.5">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="lg:max-h-[calc(100vh-220px)] lg:overflow-y-auto scrollbar-thin lg:pr-1">
            <ProductGrid
              products={filteredProducts}
              selectedSlug={selectedSlug}
              onSelect={handleSelect}
            />
          </div>
        </div>

        {/* ── Right panel: detail ───────────────────────────────────── */}
        <div
          id="product-detail-panel"
          className="lg:w-[30%] lg:flex-shrink-0 lg:pl-4 scroll-mt-4"
        >
          <ProductDetailPanel
            product={selectedProduct}
            loading={!!loadingSlug}
            className="lg:max-h-[calc(100vh-160px)] lg:sticky lg:top-[80px]"
          />
        </div>
      </div>

      {/* Promotional material section */}
      <PromoMaterialSection />
    </div>
  );
}
