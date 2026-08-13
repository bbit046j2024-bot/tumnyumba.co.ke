import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { role: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    if (targetUser.role !== "STUDENT") {
      return NextResponse.json({ error: "Cannot delete non-student user from this endpoint" }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Student account deleted successfully" });
  } catch (error) {
    console.error("[DELETE /api/admin/students/[id]]", error);
    return NextResponse.json({ error: "Failed to delete student" }, { status: 500 });
  }
}
