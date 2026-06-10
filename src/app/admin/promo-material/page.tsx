import { getPromoMaterial } from "@/lib/promo-material";
import { AdminNav } from "@/components/admin/AdminNav";
import { PromoMaterialManager } from "@/components/admin/PromoMaterialManager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin — Promotional Material" };

export default async function AdminPromoMaterialPage() {
  let items: Awaited<ReturnType<typeof getPromoMaterial>> = [];
  try {
    items = await getPromoMaterial();
  } catch {
    // Blob not configured
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <AdminNav />
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">Promotional Material</h1>
        <p className="text-sm text-slate-500">
          Manage posters, pavement signs and other downloadable PDFs shown on the customer Product Info page.
        </p>
      </div>
      <PromoMaterialManager initialItems={items} />
    </div>
  );
}
