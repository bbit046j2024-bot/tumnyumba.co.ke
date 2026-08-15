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
            user: { select: { id: true, name: true, phone: true, email: true } },
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

    // Only release property-specific contact placed in the listing input fields.
    // Registration account phone/email are NEVER exposed publicly.
    const { partner, contactPerson, contactPhone, ...rest } = property;
    const safePartner = {
      companyName: partner.companyName,
      user: {
        name: partner.user.name,
      },
    };

    const effectiveLeadFee = property.category === "HOSTEL" ? 0 : (property.leadFee || 0);

    return NextResponse.json({
      ...rest,
      partner: safePartner,
      hasLead,
      leadFee: property.leadFee || 0,
      effectiveLeadFee,
      totalSpaces: property.totalSpaces ?? 1,
      availableSpaces: property.availableSpaces ?? 1,
      // Only release contact if student has expressed interest AND partner filled the property contact field
      ...(hasLead && {
        contactPhone: contactPhone || null,
        contactPerson: contactPerson || null,
      }),
    });
  } catch (error) {
    console.error("[GET /api/properties/[id]]", error);
    return NextResponse.json(
      { error: "Failed to fetch property" },
      { status: 500 }
    );
  }
}
