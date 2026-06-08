import { Suspense } from "react";
import { fetchPortalProducts } from "@/lib/woo-products";
import { ProductInfoClient } from "@/components/products/ProductInfoClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Product Info" };

export default async function ProductInfoPage() {
  const products = await fetchPortalProducts();

  const categories = [...new Set(products.map((p) => p.category))].sort();

  return (
    <Suspense>
      <ProductInfoClient
        products={products}
        categories={categories}
      />
    </Suspense>
  );
}
