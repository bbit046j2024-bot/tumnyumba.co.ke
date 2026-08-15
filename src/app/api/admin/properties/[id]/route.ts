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
    const body = await req.json();
    const { verificationStatus, featured, leadFee, totalSpaces, availableSpaces } = body;

    // Fetch existing property to check category
    const existing = await prisma.property.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // Hostels are strictly 0 KES lead fee
    let finalLeadFee = typeof leadFee === "number" ? Math.max(0, leadFee) : undefined;
    if (existing.category === "HOSTEL") {
      finalLeadFee = 0;
    }

    const updated = await prisma.property.update({
      where: { id },
      data: {
        ...(verificationStatus && { verificationStatus }),
        ...(typeof featured === "boolean" && { featured }),
        ...(finalLeadFee !== undefined && { leadFee: finalLeadFee }),
        ...(typeof totalSpaces === "number" && { totalSpaces }),
        ...(typeof availableSpaces === "number" && { availableSpaces }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PATCH /api/admin/properties/[id]]", error);
    return NextResponse.json({ error: "Failed to update property" }, { status: 500 });
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
    await prisma.property.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/admin/properties/[id]]", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
