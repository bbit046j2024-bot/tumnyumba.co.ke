import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { imagekit } from "@/lib/imagekit";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fileId } = await req.json();
    if (!fileId) {
      return NextResponse.json({ error: "fileId is required" }, { status: 400 });
    }

    await imagekit.deleteFile(fileId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[POST /api/imagekit/delete] Error:", error);
    // Don't fail the request if file wasn't found or already deleted
    return NextResponse.json(
      { error: error?.message || "Failed to delete file from ImageKit" },
      { status: 500 }
    );
  }
}
