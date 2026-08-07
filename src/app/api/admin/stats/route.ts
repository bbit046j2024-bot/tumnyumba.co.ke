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
      totalPartners,
      totalStudents,
      recentProperties,
      partnerApplications,
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
    ]);

    return NextResponse.json({
      totalProperties,
      totalPartners,
      totalStudents,
      recentProperties,
      partnerApplications,
    });
  } catch (error) {
    console.error("[GET /api/admin/stats]", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
