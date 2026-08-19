import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";

// GET /api/conversations/[id]/messages — Fetch messages for conversation
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: conversationId } = await params;

    // Verify user is a participant
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: session.user.id,
        },
      },
    });

    if (!participant) {
      return NextResponse.json({ error: "Not a participant" }, { status: 403 });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("[GET /api/conversations/[id]/messages]", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

// POST /api/conversations/[id]/messages — Send a new message & trigger real-time Pusher event
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: conversationId } = await params;
    const { body } = await req.json();

    if (!body || !body.trim()) {
      return NextResponse.json({ error: "Message text is required" }, { status: 400 });
    }

    // Save message in DB
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: session.user.id,
        body: body.trim(),
      },
      include: {
        sender: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    // Touch conversation updatedAt
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    // Notify other participants in the conversation (including Admin if present)
    try {
      const otherParticipants = await prisma.conversationParticipant.findMany({
        where: {
          conversationId,
          userId: { not: session.user.id },
        },
        include: {
          user: { select: { id: true, role: true } },
        },
      });

      if (otherParticipants.length > 0) {
        const senderLabel = session.user.name || (session.user.role === "ADMIN" ? "Admin" : session.user.role === "PARTNER" ? "Property Partner" : "User");

        await prisma.notification.createMany({
          data: otherParticipants.map((p) => {
            const isStudent = p.user.role === "STUDENT";
            return {
              userId: p.user.id,
              title: `Message from ${senderLabel}`,
              body: `${senderLabel}: "${body.trim()}"`,
              link: isStudent
                ? null
                : p.user.role === "ADMIN"
                ? "/admin/chat"
                : "/partner/chat",
            };
          }),
        });

        // Invalidate recipient notification caches
        const { cacheDelete } = await import("@/lib/cache");
        otherParticipants.forEach((p) => cacheDelete(`notifications:${p.user.id}`));
      }
    } catch (notifErr) {
      console.warn("[Message Notification Warning]", notifErr);
    }

    // Trigger real-time event on Pusher channel
    try {
      await pusherServer.trigger(
        `conversation-${conversationId}`,
        "new-message",
        message
      );
    } catch (pusherErr) {
      console.warn("[Pusher Trigger Warning]", pusherErr);
    }

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("[POST /api/conversations/[id]/messages]", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
