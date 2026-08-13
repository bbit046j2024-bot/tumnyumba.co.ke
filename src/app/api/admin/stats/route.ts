import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();

    // Generate date ranges for the last 8 weeks
    const weeklyDataPromises = Array.from({ length: 8 }).map(async (_, index) => {
      const weekOffset = 7 - index;
      const weekStart = new Date(now.getTime() - (weekOffset + 1) * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(now.getTime() - weekOffset * 7 * 24 * 60 * 60 * 1000);

      const count = await prisma.property.count({
        where: {
          createdAt: {
            gte: weekStart,
            lt: weekEnd,
          },
        },
      });

      return {
        label: `W${index + 1}`,
        count,
      };
    });

    const [
      totalProperties,
      totalPartners,
      totalStudents,
      recentProperties,
      partnerApplications,
      weeklyData,
    ] = await Promise.all([
      prisma.property.count(),
      prisma.partnerProfile.count({ where: { status: { in: ["APPROVED", "VERIFIED"] } } }),
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.property.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          partner: {
            include: {
              user: { select: { name: true } },
            },
          },
        },
      }),
      prisma.partnerProfile.findMany({
        orderBy: { createdAt: "desc" },
        take: 4,
        include: {
          user: { select: { name: true, email: true } },
        },
      }),
      Promise.all(weeklyDataPromises),
    ]);

    return NextResponse.json({
      totalProperties,
      totalPartners,
      totalStudents,
      recentProperties,
      partnerApplications,
      weeklyData,
    });
  } catch (error) {
    console.error("[GET /api/admin/stats]", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
