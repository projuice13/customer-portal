import { Skeleton, ProductCardSkeleton } from "@/components/ui/SkeletonLoader";
import { PageHeader } from "@/components/layout/PageHeader";

export function ProductInfoSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8" aria-label="Loading product info">
      <PageHeader
        title="Product Info"
        description="Browse all products and access spec sheets, images, posters and more."
        className="mb-5"
      />

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-0">
        {/* Left panel skeleton */}
        <div className="lg:w-[70%] lg:flex-shrink-0 lg:border-r lg:border-slate-200">
          <div className="space-y-2 pb-3 lg:pr-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-2/5" />
              <Skeleton className="h-10 w-3/5" />
            </div>
            <Skeleton className="h-3 w-20" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 lg:pr-1">
            {Array.from({ length: 9 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>

        {/* Right panel skeleton */}
        <div className="lg:w-[30%] lg:flex-shrink-0 lg:pl-4">
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="h-7 w-7 rounded-full border-2 border-slate-200 border-t-teal-500 animate-spin" />
            <p className="text-sm text-slate-400">Loading products…</p>
          </div>
        </div>
      </div>
    </div>
  );
}
