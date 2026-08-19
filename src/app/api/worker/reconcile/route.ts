/**
 * POST /api/worker/reconcile
 *
 * Reconciliation worker invoked periodically (e.g., via QStash cron or scheduled task)
 * to query Daraja STK status for payments that have been in "PUSHED" status for > 25 seconds.
 * Serves as a reliable safety net if M-Pesa callbacks are delayed or dropped.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyQstashSignature, publishJob } from "@/lib/qstash";
import {
  stkQuery,
  getPlatformCredentials,
  getPlatformToken,
  getDarajaToken,
  DarajaCredentials,
} from "@/lib/daraja";
import { decrypt } from "@/lib/encrypt";
import { calculateCommission, partnerShare } from "@/lib/commission";
import { redisIncr } from "@/lib/redis";

export async function POST(req: NextRequest) {
  try {
    if (process.env.QSTASH_CURRENT_SIGNING_KEY) {
      try {
        await verifyQstashSignature(req);
      } catch (err) {
        console.error("[worker/reconcile] Signature verification failed:", err);
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    // Find payments stuck in PUSHED state created/updated over 25 seconds ago
    const cutoffTime = new Date(Date.now() - 25 * 1000);
    const pendingPayments = await prisma.bookingPayment.findMany({
      where: {
        status: "PUSHED",
        updatedAt: { lte: cutoffTime },
        checkoutRequestId: { not: null },
      },
      include: {
        booking: true,
        partner: true,
      },
      take: 20, // Process in manageable batches
    });

    const results = [];

    for (const payment of pendingPayments) {
      if (!payment.checkoutRequestId) continue;

      try {
        let credentials: DarajaCredentials;
        let token: string;

        if (payment.routingMode === "DIRECT") {
          if (
            !payment.partner.mpesaShortcode ||
            !payment.partner.mpesaPasskey ||
            !payment.partner.mpesaConsumerKey ||
            !payment.partner.mpesaConsumerSecret
          ) {
            console.error(`[reconcile] Partner ${payment.partnerId} missing credentials`);
            continue;
          }

          const consumerKey = decrypt(Buffer.from(payment.partner.mpesaConsumerKey));
          const consumerSecret = decrypt(Buffer.from(payment.partner.mpesaConsumerSecret));
          const passkey = decrypt(Buffer.from(payment.partner.mpesaPasskey));
          const shortCode = payment.partner.mpesaShortcode;

          credentials = { consumerKey, consumerSecret, shortCode, passkey };
          token = await getDarajaToken(`partner-${payment.partnerId}`, consumerKey, consumerSecret);
        } else {
          credentials = getPlatformCredentials();
          token = await getPlatformToken();
        }

        const queryRes = await stkQuery(payment.checkoutRequestId, credentials, token);
        const resultCode = queryRes.resultCode;

        if (resultCode === 0) {
          // Confirmed!
          const amount = Number(payment.amount);

          await prisma.$transaction(async (tx) => {
            // Update payment
            await tx.bookingPayment.update({
              where: { id: payment.id },
              data: {
                status: "CONFIRMED",
              },
            });

            // Atomically increment booking amountPaid and update status
            const updatedBooking = await tx.booking.update({
              where: { id: payment.bookingId },
              data: {
                amountPaid: { increment: amount },
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

          // If SPLIT mode, calculate commission & publish payout job
          if (payment.routingMode === "SPLIT") {
            const commission = calculateCommission(
              amount,
              payment.partner.commissionType,
              Number(payment.partner.commissionValue)
            );
            const share = partnerShare(amount, commission);

            await prisma.bookingPayment.update({
              where: { id: payment.id },
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
              console.error(`[reconcile] Failed to enqueue payout for ${payment.id}:`, payoutPubErr);
            }
          }

          results.push({ id: payment.id, outcome: "CONFIRMED" });
        } else if ([1032, 1037, 1031, 1].includes(resultCode)) {
          // Explicit terminal failure codes (1032=cancelled by user, 1037=DS timeout, 1=insufficient balance)
          await prisma.bookingPayment.update({
            where: { id: payment.id },
            data: { status: "FAILED" },
          });
          results.push({ id: payment.id, outcome: "FAILED", code: resultCode });
        } else {
          // Still in progress or other transient response — check retry count
          const triesKey = `reconcile-tries:${payment.id}`;
          const tries = await redisIncr(triesKey, 3600); // 1 hr TTL

          if (tries >= 10) {
            // Reached ~5+ minutes without confirmation
            await prisma.bookingPayment.update({
              where: { id: payment.id },
              data: { status: "TIMEOUT" },
            });
            results.push({ id: payment.id, outcome: "TIMEOUT", tries });
          } else {
            results.push({ id: payment.id, outcome: "PENDING", tries });
          }
        }
      } catch (err: any) {
        console.error(`[reconcile] Error processing payment ${payment.id}:`, err);
        results.push({ id: payment.id, error: err?.message });
      }
    }

    return NextResponse.json({
      success: true,
      processed: pendingPayments.length,
      results,
    });
  } catch (error: any) {
    console.error("[worker/reconcile] Fatal error:", error);
    return NextResponse.json({ error: error?.message || "Reconciliation failed" }, { status: 500 });
  }
}
