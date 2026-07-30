import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    const lead = await prisma.lead.create({
      data: {
        propertyId,
        studentId: session.user.id,
        status: "PENDING",
      },
    });

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error("[POST /api/leads]", error);
    return NextResponse.json({ error: "Failed to create lead" }, { status: 500 });
  }
}
