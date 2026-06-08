import { NextRequest, NextResponse } from "next/server";
import { r2PresignedDownload } from "@/lib/r2";

// Public endpoint — generates a short-lived presigned download URL
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");
  const filename = searchParams.get("filename") ?? key?.split("/").pop() ?? "image.jpg";

  if (!key) return NextResponse.json({ error: "key is required" }, { status: 400 });

  // Only allow keys under products/
  if (!key.startsWith("products/")) {
    return NextResponse.json({ error: "Invalid key" }, { status: 400 });
  }

  const url = await r2PresignedDownload(key, filename);
  return NextResponse.redirect(url);
}
