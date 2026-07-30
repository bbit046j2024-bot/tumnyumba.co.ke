import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "PARTNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const partner = await prisma.partnerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true, companyName: true, status: true, totalLeadsPaid: true },
    });
    if (!partner) {
      return NextResponse.json({ error: "Partner not found" }, { status: 404 });
    }

    const [invoices, totalLeads, paidLeadFees, unpaidLeadFees] = await Promise.all([
      // All invoices for this partner
      prisma.invoice.findMany({
        where: { partnerId: partner.id },
        orderBy: { createdAt: "desc" },
        include: {
          payment: true,
          leadFees: { select: { id: true, paid: true, amount: true } },
        },
      }),

      // Total leads across all this partner's properties
      prisma.lead.count({
        where: { property: { partnerId: partner.id } },
      }),

      // Paid lead fees total
      prisma.leadFee.aggregate({
        where: { partnerId: partner.id, paid: true },
        _sum: { amount: true },
        _count: { id: true },
      }),

      // Unpaid lead fees total
      prisma.leadFee.aggregate({
        where: { partnerId: partner.id, paid: false },
        _sum: { amount: true },
        _count: { id: true },
      }),
    ]);

    return NextResponse.json({
      partner,
      invoices,
      totalLeads,
      totalPaid: paidLeadFees._sum.amount ?? 0,
      paidLeadsCount: paidLeadFees._count.id,
      pendingAmount: unpaidLeadFees._sum.amount ?? 0,
      unpaidLeadsCount: unpaidLeadFees._count.id,
    });
  } catch (error) {
    console.error("[GET /api/partner/revenue]", error);
    return NextResponse.json({ error: "Failed to fetch revenue" }, { status: 500 });
  }
}
