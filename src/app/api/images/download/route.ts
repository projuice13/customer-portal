import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");
  const filename = searchParams.get("filename") ?? "image.jpg";

  if (!url) return NextResponse.json({ error: "url is required" }, { status: 400 });

  if (!url.includes("vercel-storage.com")) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const res = await fetch(url);
  if (!res.ok) return NextResponse.json({ error: "Failed to fetch image" }, { status: 502 });

  const contentType = res.headers.get("content-type") ?? "image/jpeg";
  const body = await res.arrayBuffer();

  return new NextResponse(body, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
