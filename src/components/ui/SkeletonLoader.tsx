import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded bg-slate-200",
        className
      )}
      aria-hidden="true"
    />
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="p-6 space-y-4" aria-label="Loading product details">
      <Skeleton className="h-56 w-full rounded-lg" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-16 w-full" />
      <div className="space-y-2 pt-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-3/4" />
      </div>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 space-y-2" aria-hidden="true">
      <Skeleton className="h-28 w-full rounded" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}
