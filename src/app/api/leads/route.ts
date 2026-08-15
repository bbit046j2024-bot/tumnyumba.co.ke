import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  sendBookingConfirmationToStudent,
  sendBookingNotificationToPartner,
} from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Please sign in to express interest" },
        { status: 401 }
      );
    }

    const { propertyId } = await req.json();

    if (!propertyId) {
      return NextResponse.json({ error: "Property ID is required" }, { status: 400 });
    }

    // Check if lead already exists
    const existing = await prisma.lead.findUnique({
      where: {
        propertyId_studentId: {
          propertyId,
          studentId: session.user.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ message: "Already expressed interest", lead: existing });
    }

    // Fetch property + partner details for notification emails
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        partner: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    const effectiveLeadFee = property.category === "HOSTEL" ? 0 : (property.leadFee || 0);

    const lead = await prisma.lead.create({
      data: {
        propertyId,
        studentId: session.user.id,
        status: "PENDING",
        ...(effectiveLeadFee > 0 && {
          leadFee: {
            create: {
              partnerId: property.partnerId,
              amount: effectiveLeadFee,
              paid: true,
            },
          },
        }),
      },
    });

    // Auto decrement availableSpaces if availableSpaces > 0
    if (property.availableSpaces && property.availableSpaces > 0) {
      const newSpaces = property.availableSpaces - 1;
      await prisma.property.update({
        where: { id: propertyId },
        data: {
          availableSpaces: newSpaces,
          ...(newSpaces === 0 && { availabilityStatus: "TAKEN" }),
        },
      }).catch((err) => console.error("[api/leads] spaces update failed:", err));
    }

    // Send notification emails (fire-and-forget — don't block the response)
    const studentName = session.user.name ?? "A student";
    const studentEmail = session.user.email ?? "";

    if (studentEmail) {
      sendBookingConfirmationToStudent(
        studentEmail,
        studentName,
        property.title,
        property.id
      ).catch((err) => console.error("[email] student confirmation failed:", err));
    }

    if (property.partner?.user?.email) {
      sendBookingNotificationToPartner(
        property.partner.user.email,
        property.partner.user.name,
        studentName,
        property.title,
        property.id
      ).catch((err) => console.error("[email] partner notification failed:", err));
    }

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error("[POST /api/leads]", error);
    return NextResponse.json({ error: "Failed to create lead" }, { status: 500 });
  }
}
