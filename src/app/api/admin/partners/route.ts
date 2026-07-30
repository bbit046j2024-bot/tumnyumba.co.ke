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
    const status = searchParams.get("status"); // PENDING | VERIFIED | SUSPENDED | ALL
    const search = searchParams.get("search");

    const partners = await prisma.partnerProfile.findMany({
      where: {
        ...(status && status !== "ALL" && { status: status as any }),
        ...(search && {
          OR: [
            { companyName: { contains: search } },
            { user: { name: { contains: search } } },
            { user: { email: { contains: search } } },
          ],
        }),
      },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, createdAt: true } },
        _count: { select: { properties: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(partners);
  } catch (error) {
    console.error("[GET /api/admin/partners]", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
