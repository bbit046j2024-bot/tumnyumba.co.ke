import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPlatformSettings, updatePlatformSettings } from "@/lib/settings";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await getPlatformSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error("[GET /api/admin/settings]", error);
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const updated = await updatePlatformSettings({
      enableDirectBooking: body.enableDirectBooking !== undefined ? Boolean(body.enableDirectBooking) : undefined,
      leadFee: body.leadFee !== undefined ? Number(body.leadFee) : undefined,
      supportEmail: body.supportEmail !== undefined ? String(body.supportEmail) : undefined,
      mpesaPaybill: body.mpesaPaybill !== undefined ? String(body.mpesaPaybill) : undefined,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PATCH /api/admin/settings]", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
