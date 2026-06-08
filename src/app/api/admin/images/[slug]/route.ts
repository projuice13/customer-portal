import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { blobDelete } from "@/lib/blob";
import { addProductImage, removeProductImage, getProductImages, saveProductImages } from "@/lib/product-images";

function isAuthed(request: NextRequest) {
  return request.cookies.get("portal_admin_auth")?.value === "1";
}

// GET — list images for a product
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  if (!isAuthed(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { slug } = await params;
  const images = await getProductImages(slug);
  return NextResponse.json({ images });
}

// POST — upload a new image
export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  if (!isAuthed(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { slug } = await params;

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const label = (formData.get("label") as string | null) ?? undefined;

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").toLowerCase();
  const pathname = `products/${slug}/${Date.now()}-${safeName}`;

  try {
    const blob = await put(pathname, file, { access: "public", addRandomSuffix: false });

    await addProductImage(slug, {
      url: blob.url,
      pathname: blob.pathname,
      filename: file.name,
      label,
    });

    return NextResponse.json({ success: true, url: blob.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE — remove an image (?url=...)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  if (!isAuthed(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { slug } = await params;

  const url = new URL(request.url).searchParams.get("url");
  if (!url) return NextResponse.json({ error: "url is required" }, { status: 400 });

  await blobDelete(url);
  await removeProductImage(slug, url);

  return NextResponse.json({ success: true });
}

// PATCH — reorder (body: { order: string[] } — array of urls)
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  if (!isAuthed(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { slug } = await params;

  const { order }: { order: string[] } = await request.json();
  const images = await getProductImages(slug);
  const reordered = order
    .map((url, i) => {
      const entry = images.find((e) => e.url === url);
      return entry ? { ...entry, order: i } : null;
    })
    .filter(Boolean) as typeof images;

  await saveProductImages(slug, reordered);
  return NextResponse.json({ success: true });
}
