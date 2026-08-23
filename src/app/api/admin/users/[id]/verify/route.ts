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
    const body = await req.json().catch(() => ({}));
    const shouldVerify = body.verify !== false; // defaults to true

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        emailVerified: shouldVerify ? new Date() : null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        role: true,
      },
    });

    return NextResponse.json({
      message: shouldVerify ? "Account marked as verified" : "Account verification removed",
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("[PATCH /api/admin/users/[id]/verify]", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update user verification status" },
      { status: 500 }
    );
  }
}
