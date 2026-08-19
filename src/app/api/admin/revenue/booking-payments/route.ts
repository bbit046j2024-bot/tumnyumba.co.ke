/**
 * GET /api/admin/revenue/booking-payments
 *
 * Provides aggregated booking payment financial data for admin dashboards:
 *  - Platform revenue (total commissions earned from SPLIT mode, transaction counts)
 *  - Gross booking volume (total money processed across DIRECT and SPLIT)
 *  - Per-partner financial breakdown
 *  - Recent confirmed payments list
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    const dateFilter: any = {};
    if (startDateParam) dateFilter.gte = new Date(startDateParam);
    if (endDateParam) dateFilter.lte = new Date(endDateParam);

    const whereConfirmed: any = {
      status: "CONFIRMED",
      ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
    };

    // 1. Fetch all confirmed payments with partner details
    const payments = await prisma.bookingPayment.findMany({
      where: whereConfirmed,
      include: {
        partner: {
          select: {
            id: true,
            companyName: true,
            paymentRouting: true,
            payoutPhone: true,
            commissionType: true,
            commissionValue: true,
          },
        },
        booking: {
          select: {
            id: true,
            student: { select: { name: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // 2. Compute platform-level aggregates
    let totalGrossVolume = 0;
    let totalPlatformCommission = 0;
    let totalPaidToPartners = 0;
    let splitTransactionCount = 0;
    let directTransactionCount = 0;

    const partnerMap = new Map<
      string,
      {
        partnerId: string;
        companyName: string;
        routingMode: string;
        grossCollected: number;
        commissionEarned: number;
        paidToPartner: number;
        transactionCount: number;
      }
    >();

    for (const p of payments) {
      const amount = Number(p.amount);
      const commission = Number(p.commissionAmount || 0);
      const payout = Number(p.partnerPayoutAmount || 0);

      totalGrossVolume += amount;

      if (p.routingMode === "SPLIT") {
        totalPlatformCommission += commission;
        totalPaidToPartners += payout;
        splitTransactionCount++;
      } else {
        directTransactionCount++;
      }

      // Group per partner
      const existing = partnerMap.get(p.partnerId) || {
        partnerId: p.partnerId,
        companyName: p.partner.companyName,
        routingMode: p.partner.paymentRouting,
        grossCollected: 0,
        commissionEarned: 0,
        paidToPartner: 0,
        transactionCount: 0,
      };

      existing.grossCollected += amount;
      existing.commissionEarned += commission;
      existing.paidToPartner += payout;
      existing.transactionCount++;
      partnerMap.set(p.partnerId, existing);
    }

    const perPartnerBreakdown = Array.from(partnerMap.values()).sort(
      (a, b) => b.grossCollected - a.grossCollected
    );

    return NextResponse.json({
      summary: {
        totalGrossVolume,
        totalPlatformCommission,
        totalPaidToPartners,
        totalTransactions: payments.length,
        splitTransactions: splitTransactionCount,
        directTransactions: directTransactionCount,
      },
      perPartnerBreakdown,
      recentPayments: payments.slice(0, 25).map((p) => ({
        id: p.id,
        bookingId: p.bookingId,
        studentName: p.booking?.student?.name || "Student",
        partnerName: p.partner.companyName,
        amount: Number(p.amount),
        commissionAmount: Number(p.commissionAmount || 0),
        partnerPayoutAmount: Number(p.partnerPayoutAmount || 0),
        routingMode: p.routingMode,
        mpesaReceiptNumber: p.mpesaReceiptNumber,
        payoutStatus: p.payoutStatus,
        createdAt: p.createdAt,
      })),
    });
  } catch (error) {
    console.error("[GET /api/admin/revenue/booking-payments]", error);
    return NextResponse.json(
      { error: "Failed to load booking payments revenue" },
      { status: 500 }
    );
  }
}
