import { fetchPortalProducts } from "@/lib/woo-products";
import { getProductImages } from "@/lib/product-images";
import { notFound } from "next/navigation";
import { AdminImageManager } from "@/components/admin/AdminImageManager";
import { AdminNav } from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";

export default async function AdminProductImagesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const products = await fetchPortalProducts();
  const product = products.find((p) => p.slug === slug);
  if (!product) notFound();

  let images: Awaited<ReturnType<typeof getProductImages>> = [];
  try {
    images = await getProductImages(slug);
  } catch {
    // R2 not configured — start empty
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <AdminNav />
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">{product.title}</h1>
        <p className="text-sm text-slate-500">{product.category} · {slug}</p>
      </div>
      <AdminImageManager slug={slug} initialImages={images} />
    </div>
  );
}
