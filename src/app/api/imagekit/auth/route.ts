import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getImageKitAuth } from "@/lib/imagekit";

export async function GET(_req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const authParams = getImageKitAuth();

    return NextResponse.json({
      ...authParams,
      publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || process.env.IMAGEKIT_PUBLIC_KEY || "public_tSMaUnQgppIX50gYO/ZSxBiJAFY=",
      urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || process.env.IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/d1tywic6tn",
    });
  } catch (error: any) {
    console.error("[GET /api/imagekit/auth] Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate ImageKit authentication parameters." },
      { status: 500 }
    );
  }
}
