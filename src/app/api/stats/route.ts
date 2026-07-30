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

    return NextResponse.json({ properties, students, partners });
  } catch (error) {
    console.error("[GET /api/stats]", error);
    // Return fallback so homepage never breaks
    return NextResponse.json({ properties: 0, students: 0, partners: 0 });
  }
}
