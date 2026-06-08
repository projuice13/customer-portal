import { put, del, list } from "@vercel/blob";

export async function blobPutText(pathname: string, text: string) {
  return put(pathname, text, {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
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
