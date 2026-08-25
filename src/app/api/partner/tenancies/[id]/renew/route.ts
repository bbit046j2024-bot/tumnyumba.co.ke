import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "PARTNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const partner = await prisma.partnerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!partner) {
      return NextResponse.json({ error: "Partner profile not found" }, { status: 404 });
    }

    const body = await req.json();
    const { newEndDate, newPeriodType, newMonthlyRent } = body;

    if (!newEndDate) {
      return NextResponse.json({ error: "New End Date is required to renew tenancy." }, { status: 400 });
    }

    const tenancy = await prisma.tenancy.findFirst({
      where: { id, partnerId: partner.id },
    });

    if (!tenancy) {
      return NextResponse.json({ error: "Tenancy record not found" }, { status: 404 });
    }

    const updated = await prisma.tenancy.update({
      where: { id: tenancy.id },
      data: {
        endDate: new Date(newEndDate),
        status: "ACTIVE",
        ...(newPeriodType && { periodType: newPeriodType }),
        ...(newMonthlyRent && { monthlyRent: Number(newMonthlyRent) }),
        lastReminderSentAt: null, // reset reminder tracking
      },
    });

    return NextResponse.json({
      message: "Tenancy renewed successfully.",
      tenancy: updated,
    });
  } catch (error: any) {
    console.error("[PATCH /api/partner/tenancies/[id]/renew]", error);
    return NextResponse.json({ error: error.message || "Failed to renew tenancy" }, { status: 500 });
  }
}
