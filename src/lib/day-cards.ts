/**
 * Per-product "Of the day" PDF cards — stored as versioned JSON under
 * products/day-card-versions/.
 */

import { blobPutVersionedJson, blobFindLatestJson, blobCleanupVersions } from "./blob";

export interface DayCardEntry {
  url: string;
  pathname: string;
  filename: string;
}

type DayCardIndex = Record<string, DayCardEntry>;

const INDEX_PREFIX = "products/day-card-versions";

export async function getDayCardIndex(): Promise<DayCardIndex> {
  try {
    const data = await blobFindLatestJson<DayCardIndex>(INDEX_PREFIX);
    return data ?? {};
  } catch {
    return {};
  }
}

async function saveIndex(index: DayCardIndex) {
  await blobPutVersionedJson(INDEX_PREFIX, JSON.stringify(index, null, 2));
  blobCleanupVersions(INDEX_PREFIX, 5).catch(() => {});
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
