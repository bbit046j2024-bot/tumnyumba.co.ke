/**
 * POST /api/bookings/instant
 *
 * Automatically creates or retrieves an active booking for a student on a specific property,
 * with the full amount set to: Rent + Deposit.
 * Used for direct checkout from the property detail page.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Please sign in to book this property." }, { status: 401 });
    }

    const { propertyId } = await req.json();

    if (!propertyId) {
      return NextResponse.json({ error: "Property ID is required." }, { status: 400 });
    }

    const [user, property] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, name: true, phone: true, email: true },
      }),
      prisma.property.findUnique({
        where: { id: propertyId },
        include: {
          partner: {
            select: {
              id: true,
              companyName: true,
              paymentRouting: true,
            },
          },
        },
      }),
    ]);

    if (!user) {
      return NextResponse.json({ error: "User account not found." }, { status: 404 });
    }

    if (!user.phone) {
      return NextResponse.json(
        {
          error:
            "Please add an M-Pesa phone number to your profile before making a booking.",
          missingPhone: true,
        },
        { status: 400 }
      );
    }

    if (!property) {
      return NextResponse.json({ error: "Property not found." }, { status: 404 });
    }

    if (property.availabilityStatus !== "AVAILABLE") {
      return NextResponse.json({ error: "This property is currently not available for booking." }, { status: 400 });
    }

    // Full payment = Rent + Deposit
    const rent = Number(property.rent);
    const deposit = Number(property.deposit);
    const totalAmount = rent + deposit;

    if (totalAmount <= 0) {
      return NextResponse.json({ error: "Invalid property pricing." }, { status: 400 });
    }

    // Check if there is already an existing pending/partially paid booking for this student & partner
    let existingBooking = await prisma.booking.findFirst({
      where: {
        partnerId: property.partnerId,
        studentId: user.id,
        status: { in: ["PENDING", "PARTIALLY_PAID"] },
      },
      include: {
        payments: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (existingBooking) {
      return NextResponse.json({
        booking: existingBooking,
        isExisting: true,
      });
    }

    // Create a new Booking
    const newBooking = await prisma.booking.create({
      data: {
        partnerId: property.partnerId,
        studentId: user.id,
        amountDue: totalAmount,
        amountPaid: 0,
        status: "PENDING",
        description: `Direct Booking: 1st Month Rent (KSh ${rent.toLocaleString()}) + Refundable Deposit (KSh ${deposit.toLocaleString()}) for ${property.title}`,
      },
      include: {
        payments: true,
      },
    });

    return NextResponse.json({
      booking: newBooking,
      isExisting: false,
    }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/bookings/instant]", error);
    return NextResponse.json({ error: "Failed to create instant booking" }, { status: 500 });
  }
}
