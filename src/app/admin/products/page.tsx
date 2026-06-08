import { fetchPortalProducts } from "@/lib/woo-products";
import { AdminNav } from "@/components/admin/AdminNav";
import { ShippingRefreshButton } from "@/components/admin/ShippingRefreshButton";
import { AdminProductList } from "@/components/admin/AdminProductList";

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

      {/* Shipping data refresh */}
      <div className="mb-8 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-0.5">Shipping Data</h2>
        <p className="text-sm text-slate-400 mb-4">
          Refresh the cached WooCommerce shipping zones used by the Postcode Checker.
        </p>
        <ShippingRefreshButton />
      </div>

      <AdminProductList products={products} />
    </div>
  );
}
