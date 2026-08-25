import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** Normalise area names so "Tudor" and "tudor" are the same subscription. */
function normalise(raw: string): string {
  return raw.trim().toLowerCase();
}

// GET — return the signed-in student's subscribed areas
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subs = await prisma.areaSubscription.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: { id: true, area: true, createdAt: true },
    });

    // Return the display-capitalised form so the UI can show "Tudor" not "tudor"
    return NextResponse.json(
      subs.map((s) => ({
        ...s,
        area: s.area.charAt(0).toUpperCase() + s.area.slice(1),
      }))
    );
  } catch (error) {
    console.error("[GET /api/subscriptions/areas]", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

// POST — subscribe to an area (body: { area: string })
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const raw: string = body.area ?? "";
    if (!raw.trim()) {
      return NextResponse.json({ error: "Area name is required" }, { status: 400 });
    }
    if (raw.trim().length > 100) {
      return NextResponse.json({ error: "Area name too long" }, { status: 400 });
    }

    const area = normalise(raw);

    // upsert so duplicate POSTs are idempotent
    const sub = await prisma.areaSubscription.upsert({
      where: { userId_area: { userId: session.user.id, area } },
      create: { userId: session.user.id, area },
      update: {}, // no fields to update — just keep existing record
    });

    return NextResponse.json(
      { id: sub.id, area: sub.area.charAt(0).toUpperCase() + sub.area.slice(1) },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/subscriptions/areas]", error);
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }
}

// DELETE — unsubscribe from an area (body: { area: string })
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const area = normalise(body.area ?? "");

    await prisma.areaSubscription.deleteMany({
      where: { userId: session.user.id, area },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/subscriptions/areas]", error);
    return NextResponse.json({ error: "Failed to unsubscribe" }, { status: 500 });
  }
}
