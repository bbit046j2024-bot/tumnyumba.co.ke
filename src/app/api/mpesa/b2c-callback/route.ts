/**
 * POST /api/mpesa/b2c-callback
 *
 * Daraja B2C Payout callback endpoint.
 * Called by Safaricom when a B2C partner disbursement completes or fails.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json();
    const result = rawBody?.Result;

    if (!result) {
      console.warn("[mpesa/b2c-callback] Missing Result object in payload");
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" }, { status: 200 });
    }

    const conversationId = result.ConversationID;
    const resultCode = Number(result.ResultCode);
    const resultDesc = result.ResultDesc || "";

    if (!conversationId) {
      console.warn("[mpesa/b2c-callback] No ConversationID found in result");
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" }, { status: 200 });
    }

    const payment = await prisma.bookingPayment.findFirst({
      where: { payoutConversationId: conversationId },
    });

    if (!payment) {
      console.warn(`[mpesa/b2c-callback] No payment found for ConversationID ${conversationId}`);
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" }, { status: 200 });
    }

    const payoutStatus = resultCode === 0 ? "PAID" : "FAILED";

    await prisma.bookingPayment.update({
      where: { id: payment.id },
      data: {
        payoutStatus,
      },
    });

    if (resultCode !== 0) {
      console.error(`[mpesa/b2c-callback] Payout failed for payment ${payment.id}: ${resultDesc}`);
      // Find admin users to alert
      const adminUsers = await prisma.user.findMany({
        where: { role: "ADMIN" },
        select: { id: true },
      });

      for (const admin of adminUsers) {
        await prisma.notification.create({
          data: {
            userId: admin.id,
            title: "M-Pesa B2C Payout Failed",
            body: `Payout of KSh ${payment.partnerPayoutAmount} for payment ${payment.id} failed: ${resultDesc}. Manual review needed.`,
            link: `/admin/revenue`,
          },
        });
      }
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" }, { status: 200 });
  } catch (error) {
    console.error("[mpesa/b2c-callback] Error handling B2C callback:", error);
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" }, { status: 200 });
  }
}
