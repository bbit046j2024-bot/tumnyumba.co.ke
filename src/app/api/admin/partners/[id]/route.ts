import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { status } = await req.json();

    const updated = await prisma.partnerProfile.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PATCH /api/admin/partners/[id]]", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const partner = await prisma.partnerProfile.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!partner) {
      return NextResponse.json({ error: "Partner profile not found" }, { status: 404 });
    }

    // Deleting user cascades to PartnerProfile, properties, images, leads, etc.
    await prisma.user.delete({
      where: { id: partner.userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/admin/partners/[id]]", error);
    return NextResponse.json({ error: "Failed to delete partner account" }, { status: 500 });
  }
}
