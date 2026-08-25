import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenancy = await prisma.tenancy.findFirst({
      where: {
        OR: [
          { studentId: session.user.id },
          { tenantEmail: session.user.email?.toLowerCase() },
        ],
        status: { in: ["ACTIVE", "PENDING_CONFIRMATION"] },
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            area: true,
            county: true,
            rent: true,
            images: {
              where: { isPrimary: true },
              take: 1,
              select: { url: true },
            },
          },
        },
        partner: {
          select: {
            companyName: true,
            payoutPhone: true,
            user: { select: { name: true, phone: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(tenancy || null);
  } catch (error: any) {
    console.error("[GET /api/student/tenancy]", error);
    return NextResponse.json({ error: error.message || "Failed to fetch tenancy" }, { status: 500 });
  }
}
