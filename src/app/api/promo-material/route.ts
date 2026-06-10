import { NextResponse } from "next/server";
import { getPromoMaterial } from "@/lib/promo-material";

export async function GET() {
  try {
    const items = await getPromoMaterial();
    return NextResponse.json(
      { items },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json({ items: [] });
  }
}
