import { NextRequest, NextResponse } from "next/server";
import { getDayCard } from "@/lib/day-cards";

// Public endpoint — returns the day card for a product, or null
export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const card = await getDayCard(slug);
    return NextResponse.json(
      { card },
      { headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=300" } }
    );
  } catch {
    return NextResponse.json({ card: null });
  }
}
