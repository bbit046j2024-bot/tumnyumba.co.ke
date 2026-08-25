import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyAreaSubscribers } from "@/lib/notifyAreaSubscribers";

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

    const tenancy = await prisma.tenancy.findFirst({
      where: { id, partnerId: partner.id },
      include: { property: true },
    });

    if (!tenancy) {
      return NextResponse.json({ error: "Tenancy record not found" }, { status: 404 });
    }

    // Update tenancy record to VACATED_RELISTED
    const updatedTenancy = await prisma.tenancy.update({
      where: { id: tenancy.id },
      data: {
        status: "VACATED_RELISTED",
        relistedAt: new Date(),
      },
    });

    // Update property availability: Increment spaces & mark AVAILABLE
    const updatedProperty = await prisma.property.update({
      where: { id: tenancy.propertyId },
      data: {
        availabilityStatus: "AVAILABLE",
        availableSpaces: Math.min(
          tenancy.property.totalSpaces,
          tenancy.property.availableSpaces + 1
        ),
      },
    });

    // Broadcast vacancy to all students subscribed to alerts in this area
    if (updatedProperty.verificationStatus === "VERIFIED") {
      notifyAreaSubscribers({
        id: updatedProperty.id,
        title: updatedProperty.title,
        area: updatedProperty.area,
        rent: updatedProperty.rent,
      }).catch((err) =>
        console.warn("[Tenancy Relist: Area Subscriber Notification Warning]", err)
      );
    }

    return NextResponse.json({
      message: "Property successfully re-listed as AVAILABLE and area subscribers notified.",
      tenancy: updatedTenancy,
      property: updatedProperty,
    });
  } catch (error: any) {
    console.error("[PATCH /api/partner/tenancies/[id]/relist]", error);
    return NextResponse.json({ error: error.message || "Failed to relist property" }, { status: 500 });
  }
}
