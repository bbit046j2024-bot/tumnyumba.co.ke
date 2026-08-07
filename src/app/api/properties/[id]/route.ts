import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        images: true,
        partner: {
          include: {
            user: { select: { id: true, name: true } },
          },
        },
        _count: { select: { leads: true } },
      },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // Increment views asynchronously
    prisma.property
      .update({ where: { id }, data: { views: { increment: 1 } } })
      .catch(console.error);

    // ── Contact gating ────────────────────────────────────────────────────────
    // Check if the logged-in student has an active lead for this property.
    // Main account details are kept private; only property-specific contact details are released.
    let hasLead = false;
    if (session?.user?.id) {
      const lead = await prisma.lead.findUnique({
        where: {
          propertyId_studentId: {
            propertyId: id,
            studentId: session.user.id,
          },
        },
      });
      hasLead = !!lead;
    }

    // Build response — main account phone/email are strictly omitted.
    const { partner, contactPerson, contactPhone, ...rest } = property;
    const safePartner = {
      companyName: partner.companyName,
      user: {
        name: partner.user.name,
      },
    };

    return NextResponse.json({
      ...rest,
      partner: safePartner,
      hasLead,
      // Only release property-specific contact placed in the input field
      ...(hasLead && { contactPerson, contactPhone }),
    });
  } catch (error) {
    console.error("[GET /api/properties/[id]]", error);
    return NextResponse.json(
      { error: "Failed to fetch property" },
      { status: 500 }
    );
  }
}
