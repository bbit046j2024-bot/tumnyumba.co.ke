import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    const updatedLead = await prisma.lead.update({
      where: { id },
      data: {
        ...(status && { status }),
      },
      include: {
        property: { select: { title: true, area: true, rent: true } },
        student: { select: { name: true, email: true } },
      },
    });

    return NextResponse.json(updatedLead);
  } catch (error: any) {
    console.error("[PATCH /api/admin/leads/[id]]", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update lead status" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await prisma.lead.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Lead deleted successfully" });
  } catch (error: any) {
    console.error("[DELETE /api/admin/leads/[id]]", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete lead" },
      { status: 500 }
    );
  }
}
