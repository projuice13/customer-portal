/**
 * Promotional material — PDFs (posters, pavement signs, menu boards etc.)
 * managed entirely from the admin section, not pulled from WooCommerce.
 * Stored as versioned JSON at products/promo-material-versions/v-*.json.
 */

import { put, list, del } from "@vercel/blob";

export type PromoMaterialType = "Poster" | "Pavement Sign" | "Menu Board" | "Other";

export interface PromoMaterialEntry {
  id: string;
  title: string;
  type: PromoMaterialType;
  url: string;
  pathname: string;
  filename: string;
  order: number;
}

const PREFIX = "products/promo-material-versions";

export async function getPromoMaterial(): Promise<PromoMaterialEntry[]> {
  try {
    const { blobs } = await list({ prefix: `${PREFIX}/`, limit: 100 });
    if (blobs.length === 0) return [];
    const sorted = [...blobs].sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
    const res = await fetch(`${sorted[0].url}?t=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = (await res.json()) as unknown;
    if (!Array.isArray(data)) return [];
    return [...(data as PromoMaterialEntry[])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  } catch {
    return [];
  }
}

export async function savePromoMaterial(entries: PromoMaterialEntry[]) {
  const pathname = `${PREFIX}/v-${Date.now()}.json`;
  await put(pathname, JSON.stringify(entries, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: true,
    cacheControlMaxAge: 0,
  });
  cleanupVersions(5).catch(() => {});
}

async function cleanupVersions(keep: number) {
  const { blobs } = await list({ prefix: `${PREFIX}/`, limit: 100 });
  if (blobs.length <= keep) return;
  const sorted = [...blobs].sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );
  await Promise.all(sorted.slice(keep).map((b) => del(b.url).catch(() => {})));
}
