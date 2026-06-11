import { Suspense } from "react";
import { fetchPortalProducts } from "@/lib/woo-products";
import { ProductInfoClient } from "@/components/products/ProductInfoClient";
import { ProductInfoSkeleton } from "@/components/products/ProductInfoSkeleton";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Product Info" };

async function ProductInfoData() {
  const products = await fetchPortalProducts();
  const categories = [...new Set(products.map((p) => p.category))].sort();
  return <ProductInfoClient products={products} categories={categories} />;
}

export default function ProductInfoPage() {
  return (
    <Suspense fallback={<ProductInfoSkeleton />}>
      <ProductInfoData />
    </Suspense>
  );
}
