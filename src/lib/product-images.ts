/**
 * Per-product image storage. Each product slug gets its own versioned JSON
 * file at products/per-slug/{slug}/v-{timestamp}.json. Reads always pick the
 * newest version via list() (strongly consistent — no CDN cache). Old
 * versions are pruned, keeping the 5 most recent for safety.
 *
 * This isolates each product's index from every other product's index,
 * eliminating cross-slug race conditions entirely.
 */

import { put, list, del } from "@vercel/blob";
import { blobFindLatestJson, blobFindUrl } from "./blob";

export interface ProductImageEntry {
  url: string;
  pathname: string;
  filename: string;
  label?: string;
  order: number;
}

const PREFIX = "products/per-slug";

// ─── Read ────────────────────────────────────────────────────────────────────

export async function getProductImages(slug: string): Promise<ProductImageEntry[]> {
  try {
    const { blobs } = await list({ prefix: `${PREFIX}/${slug}/`, limit: 100 });
    if (blobs.length > 0) {
      const sorted = [...blobs].sort(
        (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      );
      const res = await fetch(`${sorted[0].url}?t=${Date.now()}`, { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as ProductImageEntry[];
        return data.slice().sort((a, b) => a.order - b.order);
      }
    }
    // Legacy fallback — first read for any slug uses old global index
    const legacy = await getLegacyIndex();
    return (legacy[slug] ?? []).slice().sort((a, b) => a.order - b.order);
  } catch {
    return [];
  }
}

// ─── Write ───────────────────────────────────────────────────────────────────

export async function saveProductImages(slug: string, entries: ProductImageEntry[]) {
  const pathname = `${PREFIX}/${slug}/v-${Date.now()}.json`;
  await put(pathname, JSON.stringify(entries, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: true,
    cacheControlMaxAge: 0,
  });
  cleanupSlugVersions(slug, 5).catch(() => {});
}

export async function addProductImage(slug: string, entry: Omit<ProductImageEntry, "order">) {
  const existing = await getProductImages(slug);
  const order = existing.length > 0 ? Math.max(...existing.map((e) => e.order)) + 1 : 0;
  await saveProductImages(slug, [...existing, { ...entry, order }]);
}

export async function removeProductImage(slug: string, url: string) {
  const existing = await getProductImages(slug);
  await saveProductImages(slug, existing.filter((e) => e.url !== url));
}

// ─── Internal helpers ────────────────────────────────────────────────────────

async function cleanupSlugVersions(slug: string, keep: number) {
  const { blobs } = await list({ prefix: `${PREFIX}/${slug}/`, limit: 100 });
  if (blobs.length <= keep) return;
  const sorted = [...blobs].sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );
  const toDelete = sorted.slice(keep);
  await Promise.all(toDelete.map((b) => del(b.url).catch(() => {})));
}

/**
 * One-time legacy lookup. Used only when the per-slug folder is empty, so the
 * very first read after this code deploys still finds the user's existing data.
 */
async function getLegacyIndex(): Promise<Record<string, ProductImageEntry[]>> {
  // Try the previous versioned global index first
  const data = await blobFindLatestJson<Record<string, ProductImageEntry[]>>(
    "products/index-versions"
  );
  if (data) return data;
  // Then fall back to the original global file
  const legacyUrl = await blobFindUrl("products/index.json");
  if (legacyUrl) {
    try {
      const res = await fetch(`${legacyUrl}?t=${Date.now()}`, { cache: "no-store" });
      if (res.ok) return await res.json();
    } catch {
      /* ignore */
    }
  }
  return {};
}
