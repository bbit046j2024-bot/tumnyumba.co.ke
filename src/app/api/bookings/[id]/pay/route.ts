/**
 * POST /api/bookings/[id]/pay
 *
 * Initiates payment for a booking. This route must return in < 150 ms —
 * it only acquires a Redis lock, creates a DB record, and enqueues a QStash
 * job. The actual Daraja STK push happens asynchronously in the worker route.
 *
 * Request body (JSON):
 *   { installmentAmount?: number }   — optional; omit to pay the full remaining balance
 *
 * Responses:
 *   202 { paymentId, status: "QUEUED" }  — job enqueued successfully
 *   400 — missing phone or invalid amount
 *   401 — not authenticated
 *   404 — booking not found or not owned by session user
 *   409 — payment already in progress OR booking already fully paid
 *   500 — unexpected server error
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { acquireLock, releaseLock } from "@/lib/redis";
import { publishJob } from "@/lib/qstash";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: bookingId } = await params;

  // ── 1. Authentication ────────────────────────────────────────────────────
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── 2. Load user + phone ─────────────────────────────────────────────────
  // Phone is always read from the DB — never from the request body (N5)
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { phone: true },
  });

  const rawPhone = user?.phone;
  if (!rawPhone) {
    return NextResponse.json(
      {
        error:
          "No phone number on your account. Please update your profile with a valid Safaricom number before paying.",
      },
      { status: 400 }
    );
  }

  // Normalise phone to 2547XXXXXXXX
  let customerPhone = rawPhone.trim().replace(/\D/g, "");
  if (customerPhone.startsWith("0")) customerPhone = "254" + customerPhone.slice(1);
  else if (customerPhone.startsWith("+")) customerPhone = customerPhone.slice(1);
  if (customerPhone.length !== 12 || !customerPhone.startsWith("254")) {
    return NextResponse.json(
      { error: "Account phone number is not a valid Safaricom number." },
      { status: 400 }
    );
  }

  // ── 3. Parse optional installment amount ─────────────────────────────────
  let installmentAmount: number | undefined;
  try {
    const body = await request.json();
    if (body.installmentAmount !== undefined) {
      installmentAmount = Number(body.installmentAmount);
      if (!Number.isFinite(installmentAmount) || installmentAmount <= 0) {
        return NextResponse.json(
          { error: "installmentAmount must be a positive number." },
          { status: 400 }
        );
      }
    }
  } catch {
    // No body / empty body — fine, we'll pay the full remaining amount
  }

  // ── 4. Idempotency lock ──────────────────────────────────────────────────
  const lockKey = `pay-lock:${bookingId}`;
  const locked = await acquireLock(lockKey, 30_000); // 30 s TTL
  if (!locked) {
    return NextResponse.json(
      { error: "A payment is already in progress for this booking. Please wait." },
      { status: 409 }
    );
  }

  try {
    // ── 5. Load booking ──────────────────────────────────────────────────
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        partner: {
          select: {
            id: true,
            paymentRouting: true,
            commissionType: true,
            commissionValue: true,
          },
        },
      },
    });

    // Only the booking's assigned student can pay (security: row-level scoping)
    if (!booking || booking.studentId !== session.user.id) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    if (booking.status === "PAID" || booking.status === "CANCELLED") {
      return NextResponse.json(
        { error: `Booking is already ${booking.status.toLowerCase()}.` },
        { status: 409 }
      );
    }

    // ── 6. Compute charge amount ─────────────────────────────────────────
    const amountDue = Number(booking.amountDue);
    const amountPaid = Number(booking.amountPaid);
    const remaining = Math.round((amountDue - amountPaid) * 100) / 100;

    if (remaining <= 0) {
      return NextResponse.json({ error: "Booking is already fully paid." }, { status: 409 });
    }

    // Clamp installment to remaining balance (server-side — N5)
    const chargeAmount = installmentAmount
      ? Math.min(installmentAmount, remaining)
      : remaining;

    if (chargeAmount < 1) {
      return NextResponse.json(
        { error: "Minimum payment amount is KSh 1." },
        { status: 400 }
      );
    }

    // ── 7. Create BookingPayment record ──────────────────────────────────
    const payment = await prisma.bookingPayment.create({
      data: {
        bookingId,
        partnerId: booking.partner.id,
        amount: chargeAmount,
        status: "QUEUED",
        routingMode: booking.partner.paymentRouting,
      },
    });

    // ── 8. Enqueue QStash job ────────────────────────────────────────────
    await publishJob("/api/worker/stk-push", {
      paymentId: payment.id,
      bookingId,
      partnerId: booking.partner.id,
      amount: chargeAmount,
      customerPhone,
      routingMode: booking.partner.paymentRouting,
    });

    // ── 9. Return fast ───────────────────────────────────────────────────
    return NextResponse.json(
      { paymentId: payment.id, status: "QUEUED" },
      { status: 202 }
    );
  } finally {
    // Always release the lock — even on error — so retries aren't blocked
    await releaseLock(lockKey);
  }
}
