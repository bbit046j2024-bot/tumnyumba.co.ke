import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Return ALL properties so admin can see both featured and non-featured and manage them
    const properties = await prisma.property.findMany({
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        partner: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
        _count: { select: { leads: true } },
      },
    });

    return NextResponse.json(properties);
  } catch (error) {
    console.error("[GET /api/admin/advertisements]", error);
    return NextResponse.json({ error: "Failed to fetch advertisements" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { propertyId, featured } = await req.json();
    if (!propertyId || typeof featured !== "boolean") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const updated = await prisma.property.update({
      where: { id: propertyId },
      data: { featured },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PATCH /api/admin/advertisements]", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
