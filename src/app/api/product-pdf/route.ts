import { NextRequest, NextResponse } from "next/server";
import { parsePdfSpecSheet } from "@/lib/pdf-parser";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "Missing url param" }, { status: 400 });
  }

  // Only allow PDFs from the Projuice domain
  if (!url.startsWith("https://www.projuice.co.uk/")) {
    return NextResponse.json({ error: "Disallowed URL" }, { status: 403 });
  }

  try {
    const data = await parsePdfSpecSheet(url);
    return NextResponse.json(data, {
      headers: {
        // Cache the parsed result in the browser for 24 h
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
      },
    });
  } catch (err) {
    console.error("[api/product-pdf] Failed to parse PDF:", url, err);
    return NextResponse.json({ allergens: [], ingredients: [] }, { status: 200 });
  }
}
