import { put, del, list } from "@vercel/blob";

export async function blobPutText(pathname: string, text: string) {
  return put(pathname, text, {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 0,
  });
}

export async function blobDelete(url: string) {
  await del(url);
}

// Find a blob by its pathname and return its public URL
export async function blobFindUrl(pathname: string): Promise<string | null> {
  const { blobs } = await list({ prefix: pathname, limit: 1 });
  const match = blobs.find((b) => b.pathname === pathname);
  return match?.url ?? null;
}

/**
 * Write a versioned JSON document — each save creates a new blob with a unique
 * pathname (no overwrite, no CDN cache battle). Use blobFindLatestJson to read.
 */
export async function blobPutVersionedJson(prefix: string, text: string) {
  const pathname = `${prefix}/v-${Date.now()}.json`;
  return put(pathname, text, {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: true,
    cacheControlMaxAge: 0,
  });
}

/**
 * Find the most recently uploaded versioned JSON in a prefix and return its
 * parsed contents. List() is strongly consistent so this always sees the latest.
 */
export async function blobFindLatestJson<T>(prefix: string): Promise<T | null> {
  const { blobs } = await list({ prefix: `${prefix}/`, limit: 1000 });
  if (blobs.length === 0) return null;
  // Sort newest first
  const sorted = [...blobs].sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );
  const latest = sorted[0];
  const res = await fetch(`${latest.url}?t=${Date.now()}`, { cache: "no-store" });
  if (!res.ok) return null;
  return (await res.json()) as T;
}

/**
 * Delete all but the most recent N versions in a prefix.
 */
export async function blobCleanupVersions(prefix: string, keep = 3) {
  const { blobs } = await list({ prefix: `${prefix}/`, limit: 1000 });
  if (blobs.length <= keep) return;
  const sorted = [...blobs].sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );
  const toDelete = sorted.slice(keep);
  await Promise.all(toDelete.map((b) => del(b.url).catch(() => {})));
}
