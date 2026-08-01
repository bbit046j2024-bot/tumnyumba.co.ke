import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public endpoint — no auth required, returns platform-wide counts
export async function GET() {
  try {
    const [properties, students, partners] = await Promise.all([
      prisma.property.count({ where: { verificationStatus: "VERIFIED" } }),
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.partnerProfile.count({ where: { status: "APPROVED" } }),
    ]);

    return NextResponse.json({ properties, students, partners }, {
      headers: {
        // Platform-wide counts change rarely — cache at the CDN for 5 minutes
        // so the homepage never hammers the DB with COUNT queries under load.
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("[GET /api/stats]", error);
    // Return fallback so homepage never breaks
    return NextResponse.json({ properties: 0, students: 0, partners: 0 });
  }
}
