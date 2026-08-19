/**
 * POST /api/mpesa/callback/[paymentId]
 *
 * M-Pesa Daraja STK Push callback endpoint.
 * Called by Safaricom when the customer completes (or cancels) their M-PESA PIN prompt.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateCommission, partnerShare } from "@/lib/commission";
import { publishJob } from "@/lib/qstash";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  try {
    const { paymentId } = await params;

    const rawBody = await request.json();
    const stkCallback = rawBody?.Body?.stkCallback;

    if (!stkCallback) {
      console.warn(`[mpesa/callback] Missing stkCallback payload for payment ${paymentId}`);
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" }, { status: 200 });
    }

    const checkoutRequestId = stkCallback.CheckoutRequestID;
    const resultCode = Number(stkCallback.ResultCode);
    const resultDesc = stkCallback.ResultDesc || "";

    const payment = await prisma.bookingPayment.findUnique({
      where: { id: paymentId },
      include: {
        partner: true,
        booking: true,
      },
    });

    if (!payment) {
      console.error(`[mpesa/callback] Payment ${paymentId} not found`);
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" }, { status: 200 });
    }

    // Idempotency: If already confirmed, don't reprocess
    if (payment.status === "CONFIRMED") {
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" }, { status: 200 });
    }

    // Security Check: Verify CheckoutRequestID matches the stored record if available
    if (payment.checkoutRequestId && checkoutRequestId && payment.checkoutRequestId !== checkoutRequestId) {
      console.error(
        `[mpesa/callback] CheckoutRequestID mismatch for ${paymentId}: expected ${payment.checkoutRequestId}, got ${checkoutRequestId}`
      );
      return NextResponse.json({ ResultCode: 1, ResultDesc: "Validation Failed" }, { status: 400 });
    }

    // Failed or cancelled transaction
    if (resultCode !== 0) {
      console.warn(`[mpesa/callback] Payment ${paymentId} failed with code ${resultCode}: ${resultDesc}`);
      await prisma.bookingPayment.update({
        where: { id: paymentId },
        data: {
          status: "FAILED",
        },
      });
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" }, { status: 200 });
    }

    // Extract callback metadata items
    let mpesaReceiptNumber = "";
    if (Array.isArray(stkCallback?.CallbackMetadata?.Item)) {
      for (const item of stkCallback.CallbackMetadata.Item) {
        if (item.Name === "MpesaReceiptNumber") {
          mpesaReceiptNumber = String(item.Value);
        }
      }
    }

    const paymentAmount = Number(payment.amount);

    // Atomically confirm payment and increment booking amountPaid
    await prisma.$transaction(async (tx) => {
      await tx.bookingPayment.update({
        where: { id: paymentId },
        data: {
          status: "CONFIRMED",
          mpesaReceiptNumber: mpesaReceiptNumber || null,
        },
      });

      const updatedBooking = await tx.booking.update({
        where: { id: payment.bookingId },
        data: {
          amountPaid: { increment: paymentAmount },
        },
      });

      const newTotalPaid = Number(updatedBooking.amountPaid);
      const amountDue = Number(updatedBooking.amountDue);
      const newStatus = newTotalPaid >= amountDue ? "PAID" : "PARTIALLY_PAID";

      if (updatedBooking.status !== newStatus) {
        await tx.booking.update({
          where: { id: payment.bookingId },
          data: { status: newStatus },
        });
      }
    });

    // Handle SPLIT mode: Calculate commission & dispatch payout job
    if (payment.routingMode === "SPLIT") {
      const commission = calculateCommission(
        paymentAmount,
        payment.partner.commissionType,
        Number(payment.partner.commissionValue)
      );
      const share = partnerShare(paymentAmount, commission);

      await prisma.bookingPayment.update({
        where: { id: paymentId },
        data: {
          commissionAmount: commission,
          partnerPayoutAmount: share,
          payoutStatus: "PENDING",
        },
      });

      try {
        await publishJob("/api/worker/payout", {
          paymentId: payment.id,
          partnerId: payment.partnerId,
          amount: share,
        });
      } catch (payoutPubErr) {
        console.error(`[mpesa/callback] Failed to publish payout job for payment ${paymentId}:`, payoutPubErr);
      }
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" }, { status: 200 });
  } catch (error) {
    console.error("[mpesa/callback] Unexpected error handling callback:", error);
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" }, { status: 200 });
  }
}
