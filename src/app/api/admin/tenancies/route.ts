import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter"); // "all", "active", "expiring", "vacated"

    const now = new Date();
    const fourteenDays = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    let whereClause: any = {};
    if (filter === "active") {
      whereClause = { status: "ACTIVE", endDate: { gte: now } };
    } else if (filter === "expiring") {
      whereClause = { status: "ACTIVE", endDate: { lte: fourteenDays } };
    } else if (filter === "vacated") {
      whereClause = { status: { in: ["VACATED_RELISTED", "VACATED_UNLISTED"] } };
    }

    const tenancies = await prisma.tenancy.findMany({
      where: whereClause,
      include: {
        property: {
          select: {
            id: true,
            title: true,
            area: true,
            rent: true,
            availabilityStatus: true,
            availableSpaces: true,
            totalSpaces: true,
          },
        },
        partner: {
          select: {
            id: true,
            companyName: true,
            payoutPhone: true,
            user: { select: { name: true, email: true, phone: true } },
          },
        },
        student: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
      orderBy: [{ endDate: "asc" }],
      take: 100,
    });

    return NextResponse.json(tenancies);
  } catch (error: any) {
    console.error("[GET /api/admin/tenancies]", error);
    return NextResponse.json({ error: error.message || "Failed to fetch tenancies" }, { status: 500 });
  }
}
