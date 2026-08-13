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
    const search = searchParams.get("search");

    const admins = await prisma.user.findMany({
      where: {
        role: "ADMIN",
        ...(search && {
          OR: [
            { name: { contains: search } },
            { email: { contains: search } },
          ],
        }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        createdAt: true,
        emailVerified: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      admins,
      currentAdminId: session.user.id,
    });
  } catch (error) {
    console.error("[GET /api/admin/admins]", error);
    return NextResponse.json({ error: "Failed to fetch admin accounts" }, { status: 500 });
  }
}
