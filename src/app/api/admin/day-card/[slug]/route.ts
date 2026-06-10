import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { blobDelete } from "@/lib/blob";
import { getDayCard, setDayCard, removeDayCard } from "@/lib/day-cards";

function isAuthed(request: NextRequest) {
  return request.cookies.get("portal_admin_auth")?.value === "1";
}

// GET — current day card for a product
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  if (!isAuthed(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { slug } = await params;
  const card = await getDayCard(slug);
  return NextResponse.json({ card });
}

// POST — upload a new day card (replaces any existing one)
export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  if (!isAuthed(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { slug } = await params;

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  try {
    // Delete the previous one if it exists
    const existing = await getDayCard(slug);
    if (existing) {
      try { await blobDelete(existing.url); } catch { /* ignore */ }
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").toLowerCase();
    const pathname = `products/${slug}/day-card-${Date.now()}-${safeName}`;
    const blob = await put(pathname, file, {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type || "application/pdf",
    });

    const entry = { url: blob.url, pathname: blob.pathname, filename: file.name };
    await setDayCard(slug, entry);
    return NextResponse.json({ success: true, card: entry });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE — remove the day card
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  if (!isAuthed(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { slug } = await params;

  const existing = await getDayCard(slug);
  if (existing) {
    try { await blobDelete(existing.url); } catch { /* ignore */ }
  }
  await removeDayCard(slug);
  return NextResponse.json({ success: true });
}
