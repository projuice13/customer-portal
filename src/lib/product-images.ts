/**
 * Product image index stored as products/index.json in Vercel Blob.
 * Shape: { [slug]: ProductImageEntry[] }
 */

import { blobPutText } from "./blob";

export interface ProductImageEntry {
  url: string;      // public Vercel Blob URL
  pathname: string; // blob pathname, used for deletion
  filename: string; // original filename, used as download name
  label?: string;
  order: number;
}

type ImageIndex = Record<string, ProductImageEntry[]>;

const INDEX_PATHNAME = "products/index.json";

export async function getImageIndex(): Promise<ImageIndex> {
  const indexUrl = process.env.BLOB_INDEX_URL;
  if (!indexUrl) return {};
  try {
    const res = await fetch(indexUrl, { next: { revalidate: 0 } });
    if (!res.ok) return {};
    return await res.json() as ImageIndex;
  } catch {
    return {};
  }
}

async function saveIndex(index: ImageIndex) {
  await blobPutText(INDEX_PATHNAME, JSON.stringify(index, null, 2));
}

export async function getProductImages(slug: string): Promise<ProductImageEntry[]> {
  const index = await getImageIndex();
  return (index[slug] ?? []).sort((a, b) => a.order - b.order);
}

export async function saveProductImages(slug: string, entries: ProductImageEntry[]) {
  const index = await getImageIndex();
  index[slug] = entries;
  await saveIndex(index);
}

export async function addProductImage(slug: string, entry: Omit<ProductImageEntry, "order">) {
  const index = await getImageIndex();
  const existing = index[slug] ?? [];
  const order = existing.length > 0 ? Math.max(...existing.map((e) => e.order)) + 1 : 0;
  index[slug] = [...existing, { ...entry, order }];
  await saveIndex(index);
}

export async function removeProductImage(slug: string, url: string) {
  const index = await getImageIndex();
  index[slug] = (index[slug] ?? []).filter((e) => e.url !== url);
  await saveIndex(index);
}
