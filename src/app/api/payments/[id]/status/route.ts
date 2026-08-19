/**
 * GET /api/payments/[id]/status
 *
 * Polling endpoint for customer & partner interfaces.
 * Returns the current status of a BookingPayment, receipt number (if confirmed),
 * and payout status (if applicable).
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paymentId } = await params;

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payment = await prisma.bookingPayment.findUnique({
      where: { id: paymentId },
      include: {
        booking: {
          select: {
            id: true,
            studentId: true,
            amountDue: true,
            amountPaid: true,
            status: true,
          },
        },
        partner: {
          select: {
            id: true,
            userId: true,
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Authorization check:
    // User must be either the student who made the booking, the partner who owns the booking, or an admin.
    const isStudent = payment.booking.studentId === session.user.id;
    const isPartner = payment.partner.userId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    if (!isStudent && !isPartner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      id: payment.id,
      bookingId: payment.bookingId,
      amount: Number(payment.amount),
      status: payment.status,
      routingMode: payment.routingMode,
      mpesaReceiptNumber: payment.mpesaReceiptNumber,
      payoutStatus: payment.payoutStatus,
      bookingStatus: payment.booking.status,
      amountDue: Number(payment.booking.amountDue),
      amountPaid: Number(payment.booking.amountPaid),
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    });
  } catch (error) {
    console.error("[GET /api/payments/[id]/status]", error);
    return NextResponse.json(
      { error: "Failed to retrieve payment status" },
      { status: 500 }
    );
  }
}
