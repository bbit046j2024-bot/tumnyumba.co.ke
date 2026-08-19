/**
 * POST /api/worker/payout
 *
 * Worker route invoked by Upstash QStash to process B2C partner disbursements in SPLIT mode.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyQstashSignature } from "@/lib/qstash";
import { b2cPayment, getPlatformToken } from "@/lib/daraja";

export async function POST(req: NextRequest) {
  try {
    let payload: {
      paymentId: string;
      partnerId: string;
      amount: number;
    };

    if (process.env.QSTASH_CURRENT_SIGNING_KEY) {
      try {
        const bodyText = await verifyQstashSignature(req);
        payload = JSON.parse(bodyText);
      } catch (err) {
        console.error("[worker/payout] Signature verification failed:", err);
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    } else {
      payload = await req.json();
    }

    const { paymentId, partnerId, amount } = payload;

    const payment = await prisma.bookingPayment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      console.error(`[worker/payout] Payment ${paymentId} not found`);
      return NextResponse.json({ error: "Payment not found" }, { status: 200 });
    }

    if (payment.payoutStatus === "PAID" || payment.payoutStatus === "QUEUED") {
      return NextResponse.json({ message: "Payout already handled" }, { status: 200 });
    }

    const partner = await prisma.partnerProfile.findUnique({
      where: { id: partnerId },
      select: { payoutPhone: true },
    });

    if (!partner?.payoutPhone) {
      console.error(`[worker/payout] Partner ${partnerId} has no payoutPhone configured`);
      await prisma.bookingPayment.update({
        where: { id: paymentId },
        data: { payoutStatus: "FAILED" },
      });
      return NextResponse.json(
        { error: "Partner missing payoutPhone" },
        { status: 200 }
      );
    }

    let recipientPhone = partner.payoutPhone.trim().replace(/\D/g, "");
    if (recipientPhone.startsWith("0")) recipientPhone = "254" + recipientPhone.slice(1);
    else if (recipientPhone.startsWith("+")) recipientPhone = recipientPhone.slice(1);

    const token = await getPlatformToken();

    try {
      const b2cRes = await b2cPayment(
        {
          amount,
          recipientPhone,
          paymentId,
          remarks: `CampusKey Payout for payment ${paymentId.slice(0, 8)}`,
        },
        token
      );

      await prisma.bookingPayment.update({
        where: { id: paymentId },
        data: {
          payoutStatus: "QUEUED",
          payoutConversationId: b2cRes.conversationId,
        },
      });

      return NextResponse.json({
        success: true,
        conversationId: b2cRes.conversationId,
      });
    } catch (b2cErr: any) {
      console.error(`[worker/payout] B2C payment failed for payment ${paymentId}:`, b2cErr);

      await prisma.bookingPayment.update({
        where: { id: paymentId },
        data: {
          payoutStatus: "FAILED",
        },
      });

      return NextResponse.json(
        { error: b2cErr?.message || "B2C payout failed" },
        { status: 200 }
      );
    }
  } catch (error: any) {
    console.error("[worker/payout] Unexpected error:", error);
    return NextResponse.json({ error: error?.message || "Internal payout worker error" }, { status: 500 });
  }
}
