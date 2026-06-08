import { NextRequest, NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { addProductImage } from "@/lib/product-images";

function isAuthed(request: NextRequest) {
  return request.cookies.get("portal_admin_auth")?.value === "1";
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const body = (await request.json()) as HandleUploadBody;

  // Only block the token generation phase — the upload-completed callback
  // comes from Vercel's servers and won't carry the auth cookie.
  if (body.type === "blob.generate-client-token" && !isAuthed(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => ({
        allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
        addRandomSuffix: false,
        tokenPayload: JSON.stringify({ slug, pathname }),
      }),
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        const { slug: s } = JSON.parse(tokenPayload ?? "{}");
        const filename = blob.pathname.split("/").pop() ?? "image";
        await addProductImage(s, {
          url: blob.url,
          pathname: blob.pathname,
          filename,
        });
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
