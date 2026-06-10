import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { blobDelete } from "@/lib/blob";
import { getPromoMaterial, savePromoMaterial, type PromoMaterialEntry } from "@/lib/promo-material";

function isAuthed(request: NextRequest) {
  return request.cookies.get("portal_admin_auth")?.value === "1";
}

// GET — list all promo material
export async function GET(request: NextRequest) {
  if (!isAuthed(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const items = await getPromoMaterial();
  return NextResponse.json({ items });
}

// POST — upload one PDF
export async function POST(request: NextRequest) {
  if (!isAuthed(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const title = (formData.get("title") as string | null) ?? "Untitled";
  const type = (formData.get("type") as string | null) ?? "Other";

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  try {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").toLowerCase();
    const pathname = `products/promo-material/${Date.now()}-${safeName}`;
    const blob = await put(pathname, file, {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type || "application/pdf",
    });

    const existing = await getPromoMaterial();
    const maxOrder = existing.length > 0 ? Math.max(...existing.map((e) => e.order)) : -1;
    const entry: PromoMaterialEntry = {
      id: `promo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title,
      type: (["Poster", "Pavement Sign", "Menu Board", "Other"].includes(type) ? type : "Other") as PromoMaterialEntry["type"],
      url: blob.url,
      pathname: blob.pathname,
      filename: file.name,
      order: maxOrder + 1,
    };
    const updated = [...existing, entry];
    await savePromoMaterial(updated);
    return NextResponse.json({ success: true, items: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE — remove one item (?id=...)
export async function DELETE(request: NextRequest) {
  if (!isAuthed(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const existing = await getPromoMaterial();
  const target = existing.find((e) => e.id === id);
  if (target) {
    try { await blobDelete(target.url); } catch { /* ignore */ }
  }
  await savePromoMaterial(existing.filter((e) => e.id !== id));
  return NextResponse.json({ success: true });
}
