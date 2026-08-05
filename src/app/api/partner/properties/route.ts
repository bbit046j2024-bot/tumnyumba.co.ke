import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { containsPhone } from "@/lib/moderation";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "PARTNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const partner = await prisma.partnerProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!partner) {
      return NextResponse.json({ error: "Partner profile not found" }, { status: 404 });
    }

    const properties = await prisma.property.findMany({
      where: { partnerId: partner.id },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        _count: { select: { leads: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(properties);
  } catch (error) {
    console.error("[GET /api/partner/properties]", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "PARTNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const partner = await prisma.partnerProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!partner) {
      return NextResponse.json({ error: "Partner profile not found" }, { status: 404 });
    }

    const body = await req.json();

    if (containsPhone(body.title || "") || containsPhone(body.description || "")) {
      return NextResponse.json(
        { error: "Phone numbers and direct contact details are not allowed in property title or description. Contact details will be released to students automatically after they express interest." },
        { status: 422 }
      );
    }

    const property = await prisma.property.create({
      data: {
        partnerId: partner.id,
        title: body.title,
        category: body.category,
        county: body.county,
        subcounty: body.subcounty,
        area: body.area,
        latitude: body.latitude ? parseFloat(body.latitude) : null,
        longitude: body.longitude ? parseFloat(body.longitude) : null,
        mapUrl: body.mapUrl || null,
        rent: parseInt(body.rent),
        deposit: parseInt(body.deposit),
        contactPerson: body.contactPerson || null,
        contactPhone: body.contactPhone || null,
        description: body.description,
        availabilityStatus: body.availabilityStatus || "AVAILABLE",
        autoRelist: body.autoRelist || false,
        wifi: body.amenities?.wifi || false,
        water: body.amenities?.water || false,
        electricity: body.amenities?.electricity || false,
        parking: body.amenities?.parking || false,
        security: body.amenities?.security || false,
      },
    });

    // Save uploaded images
    if (body.images?.length) {
      await prisma.propertyImage.createMany({
        data: body.images.map((img: { url: string; publicId: string }, i: number) => ({
          propertyId: property.id,
          url: img.url,
          publicId: img.publicId,
          isPrimary: i === 0,
        })),
      });
    }

    // Notify all admins about the new property submission
    try {
      const admins = await prisma.user.findMany({
        where: { role: "ADMIN" },
        select: { id: true },
      });

      if (admins.length > 0) {
        await prisma.notification.createMany({
          data: admins.map((admin) => ({
            userId: admin.id,
            title: "New Property Listed",
            body: `Partner ${partner.companyName} listed "${body.title}" in ${body.area}. Pending verification.`,
            link: "/admin/properties",
          })),
        });

        const { cacheDelete } = await import("@/lib/cache");
        admins.forEach((admin) => cacheDelete(`notifications:${admin.id}`));
      }
    } catch (notifErr) {
      console.warn("[Property Admin Notification Warning]", notifErr);
    }

    return NextResponse.json(property, { status: 201 });
  } catch (error) {
    console.error("[POST /api/partner/properties]", error);
    return NextResponse.json({ error: "Failed to create property" }, { status: 500 });
  }
}
