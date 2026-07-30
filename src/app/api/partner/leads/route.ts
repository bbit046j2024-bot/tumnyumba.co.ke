import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "PARTNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const partner = await prisma.partnerProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!partner) {
      return NextResponse.json({ error: "Partner profile not found" }, { status: 404 });
    }

    const leads = await prisma.lead.findMany({
      where: {
        property: { partnerId: partner.id },
      },
      include: {
        property: { select: { id: true, title: true, category: true, area: true } },
        student: { select: { id: true, name: true, email: true, phone: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(leads);
  } catch (error) {
    console.error("[GET /api/partner/leads]", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
