import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cacheDelete } from "@/lib/cache";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { action } = body; // "ACCEPT" | "REJECT"

    const tenancy = await prisma.tenancy.findUnique({
      where: { id },
      include: {
        property: true,
        partner: { include: { user: { select: { name: true, email: true } } } },
      },
    });

    if (!tenancy) {
      return NextResponse.json({ error: "Tenancy record not found" }, { status: 404 });
    }

    // Verify student ownership
    if (tenancy.studentId !== session.user.id && tenancy.tenantEmail.toLowerCase() !== session.user.email?.toLowerCase()) {
      return NextResponse.json({ error: "Unauthorized access to this tenancy" }, { status: 403 });
    }

    if (action === "ACCEPT") {
      const updated = await prisma.tenancy.update({
        where: { id },
        data: {
          status: "ACTIVE",
          studentId: session.user.id,
          studentConfirmedAt: new Date(),
        },
      });

      // Notify Landlord
      await prisma.notification.create({
        data: {
          userId: tenancy.partner.userId,
          title: "Tenancy Confirmed! ✅",
          body: `Student ${session.user.name || tenancy.tenantName} confirmed their stay at "${tenancy.property.title}".`,
          link: "/partner/tenancies",
        },
      });
      cacheDelete(`notifications:${tenancy.partner.userId}`);

      return NextResponse.json({ message: "Tenancy confirmed successfully", tenancy: updated });
    } else if (action === "REJECT") {
      const updated = await prisma.tenancy.update({
        where: { id },
        data: {
          status: "CANCELLED",
        },
      });

      // Restore available space on property
      await prisma.property.update({
        where: { id: tenancy.propertyId },
        data: {
          availableSpaces: Math.min(
            tenancy.property.totalSpaces,
            tenancy.property.availableSpaces + 1
          ),
          availabilityStatus: "AVAILABLE",
        },
      });

      // Notify Landlord
      await prisma.notification.create({
        data: {
          userId: tenancy.partner.userId,
          title: "Tenancy Declined ❌",
          body: `${session.user.name || tenancy.tenantName} indicated they are not staying at "${tenancy.property.title}". Space has been restored.`,
          link: "/partner/tenancies",
        },
      });
      cacheDelete(`notifications:${tenancy.partner.userId}`);

      return NextResponse.json({ message: "Tenancy rejected and space restored", tenancy: updated });
    }

    return NextResponse.json({ error: "Invalid action. Use ACCEPT or REJECT." }, { status: 400 });
  } catch (error: any) {
    console.error("[PATCH /api/tenancies/[id]/confirm]", error);
    return NextResponse.json({ error: error.message || "Failed to process confirmation" }, { status: 500 });
  }
}
