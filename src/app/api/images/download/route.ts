import { NextRequest, NextResponse } from "next/server";

// Redirects to the public Vercel Blob URL with a download filename header
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");
  const filename = searchParams.get("filename") ?? "image.jpg";

  if (!url) return NextResponse.json({ error: "url is required" }, { status: 400 });

  // Only allow Vercel Blob URLs
  if (!url.includes("vercel-storage.com") && !url.includes("public.blob.vercel-storage.com")) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  return NextResponse.redirect(url, {
    headers: {
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
