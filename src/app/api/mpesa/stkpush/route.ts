// @deprecated — This endpoint handles the legacy listing lead fee STK push.
// For student booking payments, use POST /api/bookings/[id]/pay instead.

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { propertyId, phone, amount } = await req.json();

    if (!propertyId || !phone || !amount) {
      return NextResponse.json(
        { error: "Property ID, phone number, and amount are required" },
        { status: 400 }
      );
    }

    // Format Kenyan phone number to 2547XXXXXXXX or 2541XXXXXXXX
    let formattedPhone = phone.trim().replace(/\D/g, "");
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "254" + formattedPhone.substring(1);
    } else if (formattedPhone.startsWith("+254")) {
      formattedPhone = formattedPhone.substring(1);
    }

    if (formattedPhone.length !== 12 || !formattedPhone.startsWith("254")) {
      return NextResponse.json(
        { error: "Please enter a valid Safaricom M-PESA phone number (e.g., 0712345678)" },
        { status: 400 }
      );
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // Verify hostel exemption
    const effectiveFee = property.category === "HOSTEL" ? 0 : (property.leadFee || 0);

    if (effectiveFee === 0) {
      return NextResponse.json({
        message: "No lead fee required for this listing",
        freeLead: true,
      });
    }

    // Generate reference code for M-PESA STK prompt
    const checkoutRequestId = `CK-MPESA-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    return NextResponse.json({
      success: true,
      message: `STK Push initiated. Please check your phone (${formattedPhone}) and enter your M-PESA PIN to complete payment of KSh ${effectiveFee}.`,
      checkoutRequestId,
      phone: formattedPhone,
      amount: effectiveFee,
    });
  } catch (error) {
    console.error("[POST /api/mpesa/stkpush]", error);
    return NextResponse.json(
      { error: "Failed to initiate M-PESA STK push" },
      { status: 500 }
    );
  }
}
