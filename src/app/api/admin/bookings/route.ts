/**
 * GET /api/admin/bookings
 *
 * Paginated list of all bookings across all partners for platform admins.
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
    const status = searchParams.get("status");
    const partnerId = searchParams.get("partnerId");
    const page = Math.max(1, Number(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") || "20")));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (partnerId) where.partnerId = partnerId;

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          partner: {
            select: {
              id: true,
              companyName: true,
              paymentRouting: true,
              user: { select: { name: true, email: true, phone: true } },
            },
          },
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
            select: {
              id: true,
              amount: true,
              status: true,
              routingMode: true,
              mpesaReceiptNumber: true,
              commissionAmount: true,
              partnerPayoutAmount: true,
              payoutStatus: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ]);

    return NextResponse.json({
      bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[GET /api/admin/bookings]", error);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}
