import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    let session = null;
    try {
      session = await auth();
    } catch (authErr) {
      console.warn("[POST /api/upload] Auth error:", authErr);
    }

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized. Please log in to upload images." }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<{ secure_url: string; public_id: string }>(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: "campuskey/properties",
              resource_type: "image",
            },
            (error, uploadResult) => {
              if (error) reject(error);
              else resolve(uploadResult as { secure_url: string; public_id: string });
            }
          )
          .end(buffer);
      }
    );

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error: any) {
    console.error("[POST /api/upload]", error);
    const errorDetails = error?.message || (typeof error === "string" ? error : "Upload failed");
    return NextResponse.json({ error: `Upload error: ${errorDetails}` }, { status: 500 });
  }
}

