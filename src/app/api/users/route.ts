import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");
    const query = searchParams.get("q");

    const users = await prisma.user.findMany({
      where: {
        id: { not: session.user.id }, // Exclude current user
        ...(role && { role: role as any }),
        ...(query && {
          OR: [
            { name: { contains: query } },
            { email: { contains: query } },
          ],
        }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
      },
      take: 20,
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("[GET /api/users]", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
