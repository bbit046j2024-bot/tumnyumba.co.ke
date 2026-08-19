/**
 * POST /api/worker/stk-push
 *
 * Worker route invoked by Upstash QStash to process STK push initiation.
 * Supports both SPLIT mode (platform credentials) and DIRECT mode (encrypted partner credentials).
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyQstashSignature } from "@/lib/qstash";
import {
  stkPush,
  getPlatformCredentials,
  getPlatformToken,
  getDarajaToken,
  DarajaCredentials,
} from "@/lib/daraja";
import { decrypt } from "@/lib/encrypt";

export async function POST(req: NextRequest) {
  try {
    let payload: {
      paymentId: string;
      bookingId: string;
      partnerId: string;
      amount: number;
      customerPhone: string;
      routingMode: "DIRECT" | "SPLIT";
    };

    // If QSTASH_CURRENT_SIGNING_KEY is configured, enforce signature verification
    if (process.env.QSTASH_CURRENT_SIGNING_KEY) {
      try {
        const bodyText = await verifyQstashSignature(req);
        payload = JSON.parse(bodyText);
      } catch (err) {
        console.error("[worker/stk-push] Signature verification failed:", err);
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    } else {
      // In local dev/testing where QStash keys aren't set up yet
      payload = await req.json();
    }

    const { paymentId, bookingId, partnerId, amount, customerPhone, routingMode } = payload;

    const payment = await prisma.bookingPayment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      console.error(`[worker/stk-push] Payment record ${paymentId} not found`);
      return NextResponse.json({ error: "Payment not found" }, { status: 200 }); // 200 to stop retry loop
    }

    if (payment.status !== "QUEUED") {
      // Already pushed, confirmed, or cancelled
      return NextResponse.json({ message: "Already processed" }, { status: 200 });
    }

    let credentials: DarajaCredentials;
    let token: string;

    if (routingMode === "DIRECT") {
      const partner = await prisma.partnerProfile.findUnique({
        where: { id: partnerId },
      });

      if (
        !partner?.mpesaShortcode ||
        !partner?.mpesaPasskey ||
        !partner?.mpesaConsumerKey ||
        !partner?.mpesaConsumerSecret
      ) {
        throw new Error(`Partner ${partnerId} is missing required DIRECT M-Pesa credentials`);
      }

      const consumerKey = decrypt(Buffer.from(partner.mpesaConsumerKey));
      const consumerSecret = decrypt(Buffer.from(partner.mpesaConsumerSecret));
      const passkey = decrypt(Buffer.from(partner.mpesaPasskey));
      const shortCode = partner.mpesaShortcode;

      credentials = {
        consumerKey,
        consumerSecret,
        shortCode,
        passkey,
      };

      token = await getDarajaToken(`partner-${partnerId}`, consumerKey, consumerSecret);
    } else {
      // SPLIT mode (platform collection)
      credentials = getPlatformCredentials();
      token = await getPlatformToken();
    }

    try {
      const res = await stkPush(
        {
          amount,
          customerPhone,
          accountReference: bookingId,
          transactionDesc: `CampusKey booking ${bookingId.slice(0, 8)}`,
          paymentId,
          credentials,
        },
        token
      );

      await prisma.bookingPayment.update({
        where: { id: paymentId },
        data: {
          status: "PUSHED",
          checkoutRequestId: res.checkoutRequestId,
        },
      });

      return NextResponse.json({
        success: true,
        checkoutRequestId: res.checkoutRequestId,
      });
    } catch (stkErr: any) {
      console.error(`[worker/stk-push] Daraja STK Push failed for payment ${paymentId}:`, stkErr);

      await prisma.bookingPayment.update({
        where: { id: paymentId },
        data: {
          status: "FAILED",
        },
      });

      return NextResponse.json(
        { error: stkErr?.message || "STK Push failed" },
        { status: 200 } // Return 200 to acknowledge and avoid endless QStash retries on business error
      );
    }
  } catch (error: any) {
    console.error("[worker/stk-push] Unexpected error:", error);
    // Non-2xx causes QStash to retry if it's an infrastructure/transient error
    return NextResponse.json({ error: error?.message || "Internal worker error" }, { status: 500 });
  }
}
