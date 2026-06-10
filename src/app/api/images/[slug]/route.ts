import { NextRequest, NextResponse } from "next/server";
import { getProductImages } from "@/lib/product-images";

// Public endpoint used by the product detail panel
export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const images = await getProductImages(slug);
    return NextResponse.json({ images }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ images: [] });
  }
}
