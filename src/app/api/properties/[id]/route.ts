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
            // Always return name + companyName for display.
            // phone and email are gated — only released after a Take.
            user: { select: { id: true, name: true, phone: true, email: true } },
          },
        },
        _count: { select: { leads: true } },
      },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // Increment views asynchronously (don't await to avoid slowing response)
    prisma.property
      .update({ where: { id }, data: { views: { increment: 1 } } })
      .catch(console.error);

    // ── Contact gating ────────────────────────────────────────────────────────
    // Check if the logged-in student has an active lead for this property.
    // Only if they do, unlock the partner's phone + email.
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

    // Build the response — scrub contact details unless student has a lead
    const { partner, ...rest } = property;
    const safePartner = {
      companyName: partner.companyName,
      user: {
        name: partner.user.name,
        // Only expose contact details after a Take is logged
        ...(hasLead && {
          phone: partner.user.phone,
          email: partner.user.email,
        }),
      },
    };

    return NextResponse.json({ ...rest, partner: safePartner, hasLead });
  } catch (error) {
    console.error("[GET /api/properties/[id]]", error);
    return NextResponse.json(
      { error: "Failed to fetch property" },
      { status: 500 }
    );
  }
}
