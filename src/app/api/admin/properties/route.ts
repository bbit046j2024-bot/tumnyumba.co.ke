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
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const properties = await prisma.property.findMany({
      where: {
        ...(status && status !== "ALL" && { verificationStatus: status as any }),
        ...(search && {
          OR: [
            { title: { contains: search } },
            { area: { contains: search } },
            { county: { contains: search } },
          ],
        }),
      },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        partner: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
        _count: { select: { leads: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(properties);
  } catch (error) {
    console.error("[GET /api/admin/properties]", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
