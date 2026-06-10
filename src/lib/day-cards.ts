/**
 * Per-product "Of the day" PDF cards.
 * Index stored as products/day-cards.json in Vercel Blob.
 */

import { blobPutText, blobFindUrl } from "./blob";

export interface DayCardEntry {
  url: string;
  pathname: string;
  filename: string;
}

type DayCardIndex = Record<string, DayCardEntry>;

const INDEX_PATHNAME = "products/day-cards.json";

export async function getDayCardIndex(): Promise<DayCardIndex> {
  try {
    const indexUrl = await blobFindUrl(INDEX_PATHNAME);
    if (!indexUrl) return {};
    const bustUrl = `${indexUrl}?t=${Date.now()}`;
    const res = await fetch(bustUrl, { cache: "no-store" });
    if (!res.ok) return {};
    return (await res.json()) as DayCardIndex;
  } catch {
    return {};
  }
}

async function saveIndex(index: DayCardIndex) {
  await blobPutText(INDEX_PATHNAME, JSON.stringify(index, null, 2));
}

export async function getDayCard(slug: string): Promise<DayCardEntry | null> {
  const index = await getDayCardIndex();
  return index[slug] ?? null;
}

export async function setDayCard(slug: string, entry: DayCardEntry) {
  const index = await getDayCardIndex();
  index[slug] = entry;
  await saveIndex(index);
}

export async function removeDayCard(slug: string) {
  const index = await getDayCardIndex();
  delete index[slug];
  await saveIndex(index);
}
