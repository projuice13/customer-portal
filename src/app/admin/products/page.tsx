import { fetchPortalProducts } from "@/lib/woo-products";
import Link from "next/link";
import { Package, ChevronRight } from "lucide-react";
import { AdminNav } from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin — Products" };

export default async function AdminProductsPage() {
  const products = await fetchPortalProducts();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <AdminNav />
      <h1 className="text-xl font-semibold text-slate-900 mb-1">Product Images</h1>
      <p className="text-sm text-slate-500 mb-6">
        Select a product to upload and manage its downloadable images.
      </p>

      <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
        {products.map((product) => (
          <Link
            key={product.slug}
            href={`/admin/products/${product.slug}`}
            className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors group"
          >
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 group-hover:bg-teal-50 transition-colors">
              <Package className="h-4 w-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{product.title}</p>
              <p className="text-xs text-slate-400">{product.category}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
