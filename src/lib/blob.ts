import { put, del, head } from "@vercel/blob";

export async function blobPut(pathname: string, body: Buffer, contentType: string) {
  return put(pathname, body, {
    access: "public",
    contentType,
    addRandomSuffix: false,
  });
}

export async function blobPutText(pathname: string, text: string) {
  return put(pathname, text, {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
  });
}

export async function blobDelete(url: string) {
  await del(url);
}

export async function blobExists(pathname: string): Promise<boolean> {
  try {
    await head(pathname);
    return true;
  } catch {
    return false;
  }
}
