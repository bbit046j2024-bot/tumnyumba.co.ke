import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [
      totalProperties,
      totalStudents,
      totalPartners,
      totalLeads,
      propertiesByCategory,
      propertiesByArea,
      propertiesByVerification,
      leadsByStatus,
      partnersByStatus,
      recentLeads,
    ] = await Promise.all([
      prisma.property.count(),
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.user.count({ where: { role: "PARTNER" } }),
      prisma.lead.count(),

      // Breakdown by property category
      prisma.property.groupBy({
        by: ["category"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
      }),

      // Breakdown by area (top 6)
      prisma.property.groupBy({
        by: ["area"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 6,
      }),

      // Properties by verification status
      prisma.property.groupBy({
        by: ["verificationStatus"],
        _count: { id: true },
      }),

      // Leads by status
      prisma.lead.groupBy({
        by: ["status"],
        _count: { id: true },
      }),

      // Partners by approval status
      prisma.partnerProfile.groupBy({
        by: ["status"],
        _count: { id: true },
      }),

      // 5 most recent leads with detail
      prisma.lead.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          property: { select: { title: true, area: true, rent: true } },
          student: { select: { name: true, email: true } },
        },
      }),
    ]);

    return NextResponse.json({
      totalProperties,
      totalStudents,
      totalPartners,
      totalLeads,
      propertiesByCategory,
      propertiesByArea,
      propertiesByVerification,
      leadsByStatus,
      partnersByStatus,
      recentLeads,
    });
  } catch (error) {
    console.error("[GET /api/admin/reports]", error);
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}
