import type { Product } from "@/lib/types";
import { ProductCard } from "./ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { PackageSearch } from "lucide-react";

interface ProductGridProps {
  products: Product[];
  selectedSlug: string | null;
  onSelect: (slug: string) => void;
}

export function ProductGrid({ products, selectedSlug, onSelect }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <EmptyState
        icon={<PackageSearch className="h-5 w-5" aria-hidden="true" />}
        title="No products found"
        description="Try adjusting your search or filters."
      />
    );
  }

  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 p-3"
      role="list"
      aria-label="Product list"
    >
      {products.map((product) => (
        <div key={product.id} role="listitem" className="flex">
          <ProductCard
            product={product}
            isSelected={product.slug === selectedSlug}
            onClick={() => onSelect(product.slug)}
          />
        </div>
      ))}
    </div>
  );
}
