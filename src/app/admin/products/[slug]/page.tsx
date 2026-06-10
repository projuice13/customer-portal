import { fetchPortalProducts } from "@/lib/woo-products";
import { getProductImages } from "@/lib/product-images";
import { getDayCard } from "@/lib/day-cards";
import { notFound } from "next/navigation";
import { AdminImageManager } from "@/components/admin/AdminImageManager";
import { DayCardUploader } from "@/components/admin/DayCardUploader";
import { AdminNav } from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";

export default async function AdminProductImagesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const products = await fetchPortalProducts();
  const product = products.find((p) => p.slug === slug);
  if (!product) notFound();

  let images: Awaited<ReturnType<typeof getProductImages>> = [];
  let dayCard: Awaited<ReturnType<typeof getDayCard>> = null;
  try {
    [images, dayCard] = await Promise.all([getProductImages(slug), getDayCard(slug)]);
  } catch {
    // Blob not configured — start empty
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <AdminNav />
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">{product.title}</h1>
        <p className="text-sm text-slate-500">{product.category} · {slug}</p>
      </div>

      <div className="space-y-5">
        <DayCardUploader slug={slug} initialCard={dayCard} />
        <AdminImageManager slug={slug} initialImages={images} />
      </div>
    </div>
  );
}
