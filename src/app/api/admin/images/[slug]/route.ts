import { NextRequest, NextResponse } from "next/server";
import { r2Put, r2Delete } from "@/lib/r2";
import { addProductImage, removeProductImage, getProductImages, saveProductImages } from "@/lib/product-images";

function isAuthed(request: NextRequest) {
  return request.cookies.get("portal_admin_auth")?.value === "1";
}

// GET /api/admin/images/[slug] — list images for a product
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  if (!isAuthed(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { slug } = await params;
  const images = await getProductImages(slug);
  return NextResponse.json({ images });
}

// POST /api/admin/images/[slug] — upload a new image
export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  if (!isAuthed(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { slug } = await params;

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const label = (formData.get("label") as string | null) ?? undefined;

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").toLowerCase();
  const key = `products/${slug}/${Date.now()}-${safeName}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  await r2Put(key, buffer, file.type || "image/jpeg");
  await addProductImage(slug, { key, filename: file.name, label });

  return NextResponse.json({ success: true, key });
}

// DELETE /api/admin/images/[slug]?key=... — remove an image
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  if (!isAuthed(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { slug } = await params;

  const key = new URL(request.url).searchParams.get("key");
  if (!key) return NextResponse.json({ error: "key is required" }, { status: 400 });

  await r2Delete(key);
  await removeProductImage(slug, key);

  return NextResponse.json({ success: true });
}

// PATCH /api/admin/images/[slug] — reorder images (body: { order: string[] } — array of keys)
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  if (!isAuthed(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { slug } = await params;

  const { order }: { order: string[] } = await request.json();
  const images = await getProductImages(slug);
  const reordered = order
    .map((key, i) => {
      const entry = images.find((e) => e.key === key);
      return entry ? { ...entry, order: i } : null;
    })
    .filter(Boolean) as typeof images;

  await saveProductImages(slug, reordered);
  return NextResponse.json({ success: true });
}
