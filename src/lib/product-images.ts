/**
 * Product image index — stored as versioned JSON files under products/index-versions/.
 * Each save writes a new file; reads pick the newest via list() which is strongly
 * consistent. This avoids CDN caching issues entirely.
 */

import { blobPutVersionedJson, blobFindLatestJson, blobCleanupVersions, blobFindUrl } from "./blob";

export interface ProductImageEntry {
  url: string;
  pathname: string;
  filename: string;
  label?: string;
  order: number;
}

type ImageIndex = Record<string, ProductImageEntry[]>;

const INDEX_PREFIX = "products/index-versions";

export async function getImageIndex(): Promise<ImageIndex> {
  try {
    const data = await blobFindLatestJson<ImageIndex>(INDEX_PREFIX);
    if (data) return data;
    // One-time migration: fall back to the legacy products/index.json
    const legacyUrl = await blobFindUrl("products/index.json");
    if (legacyUrl) {
      const res = await fetch(`${legacyUrl}?t=${Date.now()}`, { cache: "no-store" });
      if (res.ok) return (await res.json()) as ImageIndex;
    }
    return {};
  } catch {
    return {};
  }
}

async function saveIndex(index: ImageIndex) {
  await blobPutVersionedJson(INDEX_PREFIX, JSON.stringify(index, null, 2));
  // Best-effort cleanup of older versions (keeps 5 most recent for safety)
  blobCleanupVersions(INDEX_PREFIX, 5).catch(() => {});
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
