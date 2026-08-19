/**
 * GET /api/partner/revenue/booking-payments
 *
 * Partner-specific booking payments revenue aggregation.
 * Scoped strictly to session.user.id -> PartnerProfile.id (server-enforced security).
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user.role !== "PARTNER" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let partner = null;

    if (session.user.role === "PARTNER") {
      partner = await prisma.partnerProfile.findUnique({
        where: { userId: session.user.id },
        select: {
          id: true,
          companyName: true,
          paymentRouting: true,
          payoutPhone: true,
          commissionType: true,
          commissionValue: true,
        },
      });

      // Auto-create PartnerProfile if missing for this PARTNER user
      if (!partner) {
        const user = await prisma.user.findUnique({ where: { id: session.user.id } });
        if (user) {
          partner = await prisma.partnerProfile.create({
            data: {
              userId: user.id,
              companyName: user.name || "Partner Business",
              status: "PENDING",
            },
            select: {
              id: true,
              companyName: true,
              paymentRouting: true,
              payoutPhone: true,
              commissionType: true,
              commissionValue: true,
            },
          });
        }
      }
    } else {
      // ADMIN preview
      partner = await prisma.partnerProfile.findFirst({
        select: {
          id: true,
          companyName: true,
          paymentRouting: true,
          payoutPhone: true,
          commissionType: true,
          commissionValue: true,
        },
      });
    }

    if (!partner) {
      // Return empty default dataset instead of hard 404 crash
      return NextResponse.json({
        partner: {
          companyName: "Partner Business",
          paymentRouting: "SPLIT",
          payoutPhone: null,
          commissionType: "PERCENTAGE",
          commissionValue: 10,
        },
        summary: {
          gross: 0,
          netReceived: 0,
          pendingPayout: 0,
          totalConfirmedPayments: 0,
        },
        payments: [],
      });
    }

    const confirmedPayments = await prisma.bookingPayment.findMany({
      where: {
        partnerId: partner.id,
        status: "CONFIRMED",
      },
      include: {
        booking: {
          select: {
            id: true,
            student: { select: { name: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    let gross = 0;
    let netReceived = 0;
    let pendingPayout = 0;

    for (const p of confirmedPayments) {
      const amount = Number(p.amount);
      const partnerShare = p.partnerPayoutAmount !== null ? Number(p.partnerPayoutAmount) : amount;

      gross += amount;

      if (p.routingMode === "DIRECT") {
        netReceived += amount;
      } else {
        if (p.payoutStatus === "PAID") {
          netReceived += partnerShare;
        } else if (p.payoutStatus === "PENDING" || p.payoutStatus === "QUEUED") {
          pendingPayout += partnerShare;
        }
      }
    }

    return NextResponse.json({
      partner: {
        ...partner,
        commissionValue: Number(partner.commissionValue ?? 10),
      },
      summary: {
        gross,
        netReceived,
        pendingPayout,
        totalConfirmedPayments: confirmedPayments.length,
      },
      payments: confirmedPayments.map((p) => ({
        id: p.id,
        bookingId: p.bookingId,
        studentName: p.booking?.student?.name || "Student",
        amount: Number(p.amount),
        commissionAmount: Number(p.commissionAmount || 0),
        partnerPayoutAmount: p.partnerPayoutAmount !== null ? Number(p.partnerPayoutAmount) : Number(p.amount),
        routingMode: p.routingMode,
        mpesaReceiptNumber: p.mpesaReceiptNumber,
        payoutStatus: p.payoutStatus,
        createdAt: p.createdAt,
      })),
    });
  } catch (error: any) {
    console.error("[GET /api/partner/revenue/booking-payments]", error);
    return NextResponse.json({ error: error.message || "Failed to load partner revenue" }, { status: 500 });
  }
}
