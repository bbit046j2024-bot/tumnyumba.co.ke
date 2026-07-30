import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: NextRequest,
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

    // Ensure the lead exists and belongs to one of this partner's properties
    const lead = await prisma.lead.findFirst({
      where: {
        id,
        property: { partnerId: partner.id },
      },
    });

    if (!lead) {
      return NextResponse.json(
        { error: "Enquiry not found or access denied" },
        { status: 404 }
      );
    }

    await prisma.lead.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Enquiry deleted successfully" });
  } catch (error) {
    console.error("[DELETE /api/partner/leads/[id]]", error);
    return NextResponse.json({ error: "Failed to delete enquiry" }, { status: 500 });
  }
}
