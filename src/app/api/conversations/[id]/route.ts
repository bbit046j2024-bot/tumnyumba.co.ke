import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// DELETE /api/conversations/[id] — Delete a conversation and all its messages
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: conversationId } = await params;

    // Check if user is a participant or an admin
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: session.user.id,
        },
      },
    });

    if (!participant && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Not authorized to delete conversation" }, { status: 403 });
    }

    // Delete conversation (cascade deletes participants & messages)
    await prisma.conversation.delete({
      where: { id: conversationId },
    });

    return NextResponse.json({ success: true, message: "Conversation deleted" });
  } catch (error) {
    console.error("[DELETE /api/conversations/[id]]", error);
    return NextResponse.json({ error: "Failed to delete conversation" }, { status: 500 });
  }
}
