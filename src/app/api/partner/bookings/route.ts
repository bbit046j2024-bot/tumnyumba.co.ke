/**
 * /api/partner/bookings
 *
 * GET:  Fetch all bookings owned by the authenticated partner
 * POST: Partner creates a new booking for a student (partner sets amountDue — F3)
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cacheDelete } from "@/lib/cache";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user.role !== "PARTNER" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const queryPartnerId = searchParams.get("partnerId");

    let partnerId: string | null = queryPartnerId;

    if (session.user.role === "PARTNER") {
      const partner = await prisma.partnerProfile.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      });

      if (!partner) {
        return NextResponse.json({ error: "Partner profile not found" }, { status: 404 });
      }
      partnerId = partner.id;
    } else if (!partnerId) {
      // If ADMIN accessing without partnerId, pick the first partner for preview
      const firstPartner = await prisma.partnerProfile.findFirst({
        select: { id: true },
      });
      partnerId = firstPartner?.id || null;
    }

    const where: any = partnerId ? { partnerId } : {};
    if (status) where.status = status;

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        payments: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            amount: true,
            status: true,
            routingMode: true,
            mpesaReceiptNumber: true,
            commissionAmount: true,
            partnerPayoutAmount: true,
            payoutStatus: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("[GET /api/partner/bookings]", error);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "PARTNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const partner = await prisma.partnerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true, companyName: true },
    });

    if (!partner) {
      return NextResponse.json({ error: "Partner profile not found" }, { status: 404 });
    }

    const { studentEmail, studentPhone, amountDue, description } = await req.json();

    if (!amountDue || Number(amountDue) <= 0) {
      return NextResponse.json({ error: "Please specify a valid amount due." }, { status: 400 });
    }

    if (!studentEmail && !studentPhone) {
      return NextResponse.json(
        { error: "Please provide either the student's email or registered phone number." },
        { status: 400 }
      );
    }

    // Resolve student user
    let student = null;
    if (studentEmail) {
      student = await prisma.user.findFirst({
        where: { email: String(studentEmail).trim() },
      });
    }

    if (!student && studentPhone) {
      const cleanDigits = String(studentPhone).replace(/\D/g, "");
      const suffix9 = cleanDigits.slice(-9);
      student = await prisma.user.findFirst({
        where: { phone: { contains: suffix9 } },
      });
    }

    if (!student) {
      return NextResponse.json(
        {
          error:
            "No student account found with the provided details. The student must register an account on CampusKey first.",
        },
        { status: 404 }
      );
    }

    // If student user has no phone saved yet but partner provided one, update student profile phone
    if (!student.phone && studentPhone) {
      const cleanDigits = String(studentPhone).replace(/\D/g, "");
      const formatted = cleanDigits.startsWith("0") ? "254" + cleanDigits.slice(1) : cleanDigits;
      student = await prisma.user.update({
        where: { id: student.id },
        data: { phone: formatted },
      });
    }

    if (!student.phone) {
      return NextResponse.json(
        {
          error:
            "The student account does not have a registered M-Pesa phone number. Please enter their phone number or have them update their profile.",
        },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.create({
      data: {
        partnerId: partner.id,
        studentId: student.id,
        amountDue: Number(amountDue),
        amountPaid: 0,
        status: "PENDING",
        description: description ? String(description).trim() : null,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    // Notify the student about the new booking and payment link
    try {
      await prisma.notification.create({
        data: {
          userId: student.id,
          title: "New Booking Payment Request",
          body: `${partner.companyName || "Partner"} sent you a booking payment request for KSh ${Number(amountDue).toLocaleString()}${description ? ` (${description})` : ""}. Click here to pay securely via M-Pesa.`,
          link: `/pay/${booking.id}`,
        },
      });

      // Clear the student's notification cache so it appears immediately on their bell
      cacheDelete(`notifications:${student.id}`);
    } catch (notifError) {
      console.warn("[Booking Notification Warning]", notifError);
    }

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error("[POST /api/partner/bookings]", error);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}
