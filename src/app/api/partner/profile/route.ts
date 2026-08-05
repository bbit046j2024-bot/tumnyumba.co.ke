import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/partner/profile — Fetch current partner details
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "PARTNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const partner = await prisma.partnerProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        user: { select: { name: true, email: true, phone: true } },
      },
    });

    if (!partner) {
      return NextResponse.json({ error: "Partner profile not found" }, { status: 404 });
    }

    return NextResponse.json(partner);
  } catch (error) {
    console.error("[GET /api/partner/profile]", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

// DELETE /api/partner/profile — Partner self-deletes account & all associated data
export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "PARTNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Deleting user cascades to PartnerProfile, properties, images, leads, invoices, etc.
    await prisma.user.delete({
      where: { id: session.user.id },
    });

    return NextResponse.json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    console.error("[DELETE /api/partner/profile]", error);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}
