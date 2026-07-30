import { NextResponse } from "next/server";
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
      return NextResponse.json({ error: "Partner not found" }, { status: 404 });
    }

    const [total, available, taken, recentLeads] = await Promise.all([
      prisma.property.count({ where: { partnerId: partner.id } }),
      prisma.property.count({
        where: { partnerId: partner.id, availabilityStatus: "AVAILABLE" },
      }),
      prisma.property.count({
        where: { partnerId: partner.id, availabilityStatus: "TAKEN" },
      }),
      prisma.lead.findMany({
        where: { property: { partnerId: partner.id } },
        include: {
          property: { select: { title: true } },
          student: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    return NextResponse.json({ total, available, taken, recentLeads });
  } catch (error) {
    console.error("[GET /api/partner/stats]", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
