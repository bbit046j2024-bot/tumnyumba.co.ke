/**
 * /api/partner/bookings/[id]
 *
 * GET:   Get single booking details with payment transaction list
 * PATCH: Partner cancels booking (if not fully paid)
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "PARTNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const partner = await prisma.partnerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!partner) {
      return NextResponse.json({ error: "Partner profile not found" }, { status: 404 });
    }

    const booking = await prisma.booking.findFirst({
      where: {
        id,
        partnerId: partner.id,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        payments: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error("[GET /api/partner/bookings/[id]]", error);
    return NextResponse.json({ error: "Failed to fetch booking" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "PARTNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const partner = await prisma.partnerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!partner) {
      return NextResponse.json({ error: "Partner profile not found" }, { status: 404 });
    }

    const booking = await prisma.booking.findFirst({
      where: { id, partnerId: partner.id },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (body.status === "CANCELLED") {
      if (booking.status === "PAID") {
        return NextResponse.json(
          { error: "Cannot cancel an already fully paid booking" },
          { status: 400 }
        );
      }

      const updated = await prisma.booking.update({
        where: { id },
        data: { status: "CANCELLED" },
      });

      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Unsupported operation" }, { status: 400 });
  } catch (error) {
    console.error("[PATCH /api/partner/bookings/[id]]", error);
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user.role !== "PARTNER" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    let partnerId: string | null = null;
    if (session.user.role === "PARTNER") {
      const partner = await prisma.partnerProfile.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      });
      if (!partner) {
        return NextResponse.json({ error: "Partner profile not found" }, { status: 404 });
      }
      partnerId = partner.id;
    }

    const where: any = { id };
    if (partnerId) where.partnerId = partnerId;

    const booking = await prisma.booking.findFirst({
      where,
      include: { payments: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const hasConfirmedPayments = booking.payments.some((p) => p.status === "CONFIRMED");
    if (hasConfirmedPayments) {
      return NextResponse.json(
        { error: "Cannot delete a booking with confirmed payments. You can cancel it instead." },
        { status: 400 }
      );
    }

    // Delete any unconfirmed/pending payments
    await prisma.bookingPayment.deleteMany({
      where: { bookingId: id },
    });

    await prisma.booking.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/partner/bookings/[id]]", error);
    return NextResponse.json({ error: "Failed to delete booking" }, { status: 500 });
  }
}
