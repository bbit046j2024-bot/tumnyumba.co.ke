import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cacheGet, cacheSet, cacheDelete } from "@/lib/cache";

const NOTIF_TTL = 10; // seconds — short enough to feel real-time, long enough to absorb burst polling

// GET — fetch notifications for the current user (cached per-user, 10s TTL)
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cacheKey = `notifications:${session.user.id}`;
    const cached = cacheGet<object[]>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    cacheSet(cacheKey, notifications, NOTIF_TTL);
    return NextResponse.json(notifications);
  } catch (error) {
    console.error("[GET /api/notifications]", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

// PATCH — mark one or all as read (invalidates this user's cache)
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, markAll } = body;

    if (markAll) {
      await prisma.notification.updateMany({
        where: { userId: session.user.id, read: false },
        data: { read: true },
      });
    } else if (id) {
      await prisma.notification.updateMany({
        where: { id, userId: session.user.id },
        data: { read: true },
      });
    }

    // Invalidate so the next poll reflects the updated read state immediately
    cacheDelete(`notifications:${session.user.id}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PATCH /api/notifications]", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

// DELETE — delete all notifications for the current user (invalidates cache)
export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.notification.deleteMany({
      where: { userId: session.user.id },
    });

    cacheDelete(`notifications:${session.user.id}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/notifications]", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
