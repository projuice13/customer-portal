/**
 * Product image index stored as products/index.json in R2.
 * Shape: { [slug]: ProductImageEntry[] }
 */

import { r2GetText, r2Put } from "./r2";

export interface ProductImageEntry {
  key: string;       // R2 object key, e.g. "products/mango-smoothie/hero.jpg"
  filename: string;  // original filename for download
  label?: string;    // optional display label
  order: number;
}

type ImageIndex = Record<string, ProductImageEntry[]>;

const INDEX_KEY = "products/index.json";

export async function getImageIndex(): Promise<ImageIndex> {
  const text = await r2GetText(INDEX_KEY);
  if (!text) return {};
  try {
    return JSON.parse(text) as ImageIndex;
  } catch {
    return {};
  }
}

export async function getProductImages(slug: string): Promise<ProductImageEntry[]> {
  const index = await getImageIndex();
  return (index[slug] ?? []).sort((a, b) => a.order - b.order);
}

export async function saveProductImages(slug: string, entries: ProductImageEntry[]) {
  const index = await getImageIndex();
  index[slug] = entries;
  await r2Put(INDEX_KEY, Buffer.from(JSON.stringify(index, null, 2)), "application/json");
}

export async function addProductImage(slug: string, entry: Omit<ProductImageEntry, "order">) {
  const index = await getImageIndex();
  const existing = index[slug] ?? [];
  const order = existing.length > 0 ? Math.max(...existing.map((e) => e.order)) + 1 : 0;
  index[slug] = [...existing, { ...entry, order }];
  await r2Put(INDEX_KEY, Buffer.from(JSON.stringify(index, null, 2)), "application/json");
}

export async function removeProductImage(slug: string, key: string) {
  const index = await getImageIndex();
  index[slug] = (index[slug] ?? []).filter((e) => e.key !== key);
  await r2Put(INDEX_KEY, Buffer.from(JSON.stringify(index, null, 2)), "application/json");
}
