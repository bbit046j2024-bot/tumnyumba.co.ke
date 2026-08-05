import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cacheGet, cacheSet } from "@/lib/cache";

const STATS_TTL = 30; // seconds

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "PARTNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cacheKey = `partner-stats:${session.user.id}`;
    const cached = cacheGet<object>(cacheKey);
    if (cached) return NextResponse.json(cached);

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

    const data = { total, available, taken, recentLeads };
    cacheSet(cacheKey, data, STATS_TTL);
    return NextResponse.json(data);
  } catch (error) {
    console.error("[GET /api/partner/stats]", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
