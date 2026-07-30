import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [invoices, totalLeads, paidLeadFees, unpaidLeadFees] = await Promise.all([
      // All invoices with partner + payment details
      prisma.invoice.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          partner: {
            include: {
              user: { select: { name: true, email: true } },
            },
          },
          payment: true,
          leadFees: { select: { id: true, paid: true, amount: true } },
        },
      }),

      // Total leads ever created
      prisma.lead.count(),

      // Paid revenue: sum of all paid lead fees
      prisma.leadFee.aggregate({
        where: { paid: true },
        _sum: { amount: true },
        _count: { id: true },
      }),

      // Unpaid: sum of all unpaid lead fees
      prisma.leadFee.aggregate({
        where: { paid: false },
        _sum: { amount: true },
        _count: { id: true },
      }),
    ]);

    return NextResponse.json({
      invoices,
      totalLeads,
      totalRevenue: paidLeadFees._sum.amount ?? 0,
      paidLeadsCount: paidLeadFees._count.id,
      pendingRevenue: unpaidLeadFees._sum.amount ?? 0,
      unpaidLeadsCount: unpaidLeadFees._count.id,
    });
  } catch (error) {
    console.error("[GET /api/admin/revenue]", error);
    return NextResponse.json({ error: "Failed to fetch revenue" }, { status: 500 });
  }
}
