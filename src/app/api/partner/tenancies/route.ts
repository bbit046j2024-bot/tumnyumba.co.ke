import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendTenancyConfirmationEmailToStudent } from "@/lib/email";
import { cacheDelete } from "@/lib/cache";

// GET — Fetch all tenancies for the authenticated partner
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "PARTNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const partner = await prisma.partnerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!partner) {
      return NextResponse.json({ error: "Partner profile not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status");

    const tenancies = await prisma.tenancy.findMany({
      where: {
        partnerId: partner.id,
        ...(statusFilter && { status: statusFilter as any }),
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            area: true,
            category: true,
            rent: true,
            availabilityStatus: true,
            availableSpaces: true,
            totalSpaces: true,
            images: {
              where: { isPrimary: true },
              take: 1,
              select: { url: true },
            },
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: [{ status: "asc" }, { endDate: "asc" }],
    });

    return NextResponse.json(tenancies);
  } catch (error: any) {
    console.error("[GET /api/partner/tenancies]", error);
    return NextResponse.json({ error: error.message || "Failed to fetch tenancies" }, { status: 500 });
  }
}

// POST — Record a new occupancy / tenancy (Student or Non-Student)
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "PARTNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const partner = await prisma.partnerProfile.findUnique({
      where: { userId: session.user.id },
      include: { user: { select: { name: true, phone: true } } },
    });

    if (!partner) {
      return NextResponse.json({ error: "Partner profile not found" }, { status: 404 });
    }

    const body = await req.json();
    const {
      propertyId,
      tenantType = "STUDENT", // "STUDENT" | "NON_STUDENT"
      tenantName,
      tenantPhone,
      tenantEmail,
      unitNumber,
      periodType = "SEMESTER_1",
      startDate,
      endDate,
      monthlyRent,
      depositPaid = 0,
      requireStudentConfirmation = false,
    } = body;

    if (!propertyId || !tenantName?.trim() || !tenantPhone?.trim() || !tenantEmail?.trim()) {
      return NextResponse.json(
        { error: "Property ID, Tenant Name, Phone Number, and Email Address are all required." },
        { status: 400 }
      );
    }

    if (!startDate || !endDate) {
      return NextResponse.json({ error: "Start Date and End Date are required." }, { status: 400 });
    }

    // Verify property ownership
    const property = await prisma.property.findFirst({
      where: { id: propertyId, partnerId: partner.id },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found or not owned by partner" }, { status: 404 });
    }

    // Check if the tenant is a registered user/student
    let linkedStudentId: string | null = null;
    const cleanEmail = tenantEmail.trim().toLowerCase();
    const cleanPhone = tenantPhone.trim().replace(/[\s\-()]/g, "");

    const matchedUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanEmail },
          { phone: { contains: cleanPhone.slice(-9) } },
        ],
      },
      select: { id: true, name: true, email: true, role: true },
    });

    if (matchedUser) {
      linkedStudentId = matchedUser.id;
    }

    const parsedStart = new Date(startDate);
    const parsedEnd = new Date(endDate);
    const parsedRent = Number(monthlyRent) || property.rent;
    const parsedDeposit = Number(depositPaid) || 0;

    // Status: if student verification requested & student found -> PENDING_CONFIRMATION, else ACTIVE
    const isStudent = tenantType === "STUDENT";
    const initialStatus = isStudent && requireStudentConfirmation && linkedStudentId
      ? "PENDING_CONFIRMATION"
      : "ACTIVE";

    const tenancy = await prisma.tenancy.create({
      data: {
        propertyId: property.id,
        partnerId: partner.id,
        tenantType: isStudent ? "STUDENT" : "NON_STUDENT",
        tenantName: tenantName.trim(),
        tenantPhone: tenantPhone.trim(),
        tenantEmail: cleanEmail,
        studentId: linkedStudentId,
        unitNumber: unitNumber?.trim() || null,
        periodType: periodType || "SEMESTER_1",
        startDate: parsedStart,
        endDate: parsedEnd,
        monthlyRent: parsedRent,
        depositPaid: parsedDeposit,
        status: initialStatus,
        studentConfirmedAt: initialStatus === "ACTIVE" ? new Date() : null,
      },
      include: {
        property: { select: { title: true, area: true } },
      },
    });

    // Automatically update property capacity & availability
    const newAvailable = Math.max(0, property.availableSpaces - 1);
    await prisma.property.update({
      where: { id: property.id },
      data: {
        availableSpaces: newAvailable,
        ...(newAvailable === 0 && { availabilityStatus: "TAKEN" }),
      },
    });

    // If confirmation required, dispatch notifications to the student
    if (initialStatus === "PENDING_CONFIRMATION" && matchedUser) {
      try {
        const periodLabels: Record<string, string> = {
          SEMESTER_1: "Semester 1",
          SEMESTER_2: "Semester 2",
          FULL_ACADEMIC_YEAR: "Full Academic Year",
          CUSTOM: "Custom Lease",
        };
        const periodLabel = periodLabels[periodType] || "Academic Period";
        const formattedEnd = parsedEnd.toLocaleDateString("en-KE", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });

        // In-app notification
        await prisma.notification.create({
          data: {
            userId: matchedUser.id,
            title: "Tenancy Confirmation Request 🏠",
            body: `Landlord ${partner.companyName || partner.user.name} recorded your stay at "${property.title}" for ${periodLabel}. Please confirm on your account.`,
            link: "/profile",
          },
        });
        cacheDelete(`notifications:${matchedUser.id}`);

        // Email notification
        await sendTenancyConfirmationEmailToStudent(
          matchedUser.email,
          matchedUser.name,
          partner.companyName || partner.user.name,
          property.title,
          unitNumber?.trim() || null,
          periodLabel,
          formattedEnd,
          parsedRent,
          tenancy.id
        );
      } catch (notifyErr) {
        console.warn("[Tenancy Confirmation Notification Error]", notifyErr);
      }
    }

    return NextResponse.json(tenancy, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/partner/tenancies]", error);
    return NextResponse.json({ error: error.message || "Failed to create tenancy" }, { status: 500 });
  }
}
