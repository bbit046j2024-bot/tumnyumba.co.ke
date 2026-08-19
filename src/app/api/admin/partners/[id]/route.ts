import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/encrypt";

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

    const dataToUpdate: any = {};

    if (body.status !== undefined) {
      dataToUpdate.status = body.status === "VERIFIED" ? "APPROVED" : body.status;
    }

    if (body.paymentRouting !== undefined) {
      dataToUpdate.paymentRouting = body.paymentRouting; // "DIRECT" | "SPLIT"
    }

    if (body.commissionType !== undefined) {
      dataToUpdate.commissionType = body.commissionType; // "PERCENTAGE" | "FIXED"
    }

    if (body.commissionValue !== undefined) {
      dataToUpdate.commissionValue = Number(body.commissionValue);
    }

    if (body.payoutPhone !== undefined) {
      dataToUpdate.payoutPhone = body.payoutPhone ? String(body.payoutPhone).trim() : null;
    }

    // DIRECT mode credentials (encrypted at rest)
    if (body.mpesaShortcode !== undefined) {
      dataToUpdate.mpesaShortcode = body.mpesaShortcode ? String(body.mpesaShortcode).trim() : null;
    }
    if (body.mpesaPasskey) {
      dataToUpdate.mpesaPasskey = encrypt(String(body.mpesaPasskey).trim());
    }
    if (body.mpesaConsumerKey) {
      dataToUpdate.mpesaConsumerKey = encrypt(String(body.mpesaConsumerKey).trim());
    }
    if (body.mpesaConsumerSecret) {
      dataToUpdate.mpesaConsumerSecret = encrypt(String(body.mpesaConsumerSecret).trim());
    }

    const updated = await prisma.partnerProfile.update({
      where: { id },
      data: dataToUpdate,
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
