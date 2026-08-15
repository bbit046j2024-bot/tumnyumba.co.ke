import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { containsPhone } from "@/lib/moderation";

export async function GET(
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

    const property = await prisma.property.findFirst({
      where: { id, partnerId: partner.id },
      include: {
        images: true,
      },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    return NextResponse.json(property);
  } catch (error) {
    console.error("[GET /api/partner/properties/[id]]", error);
    return NextResponse.json({ error: "Failed to fetch property" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "PARTNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const partner = await prisma.partnerProfile.findUnique({
      where: { userId: session.user.id },
    });
    const property = await prisma.property.findFirst({
      where: { id, partnerId: partner?.id },
    });
    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // Quick availability status toggle
    if (Object.keys(body).length === 1 && body.availabilityStatus) {
      const updated = await prisma.property.update({
        where: { id },
        data: { availabilityStatus: body.availabilityStatus },
      });
      return NextResponse.json(updated);
    }

    // Moderation check on title & description
    if (containsPhone(body.title || "") || containsPhone(body.description || "")) {
      return NextResponse.json(
        { error: "Phone numbers and direct contact details are not allowed in property title or description. Please use the Caretaker / Contact fields." },
        { status: 422 }
      );
    }

    // Full property update
    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.county !== undefined) updateData.county = body.county;
    if (body.subcounty !== undefined) updateData.subcounty = body.subcounty;
    if (body.area !== undefined) updateData.area = body.area;
    if (body.rent !== undefined) updateData.rent = parseInt(body.rent);
    if (body.deposit !== undefined) updateData.deposit = parseInt(body.deposit);
    if (body.contactPerson !== undefined) updateData.contactPerson = body.contactPerson || null;
    if (body.contactPhone !== undefined) updateData.contactPhone = body.contactPhone || null;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.availabilityStatus !== undefined) updateData.availabilityStatus = body.availabilityStatus;
    if (body.autoRelist !== undefined) updateData.autoRelist = body.autoRelist;
    if (body.totalSpaces !== undefined) updateData.totalSpaces = parseInt(body.totalSpaces) || 1;
    if (body.availableSpaces !== undefined) updateData.availableSpaces = parseInt(body.availableSpaces) || 0;
    if (body.latitude !== undefined) updateData.latitude = body.latitude ? parseFloat(body.latitude) : null;
    if (body.longitude !== undefined) updateData.longitude = body.longitude ? parseFloat(body.longitude) : null;
    if (body.mapUrl !== undefined) updateData.mapUrl = body.mapUrl || null;

    if (body.amenities) {
      updateData.wifi = !!body.amenities.wifi;
      updateData.water = !!body.amenities.water;
      updateData.electricity = !!body.amenities.electricity;
      updateData.parking = !!body.amenities.parking;
      updateData.security = !!body.amenities.security;
    }

    const updated = await prisma.property.update({
      where: { id },
      data: updateData,
    });

    // Update images if provided
    if (Array.isArray(body.images)) {
      await prisma.propertyImage.deleteMany({ where: { propertyId: id } });
      if (body.images.length > 0) {
        await prisma.propertyImage.createMany({
          data: body.images.map((img: { url: string; publicId: string }, i: number) => ({
            propertyId: id,
            url: img.url,
            publicId: img.publicId,
            isPrimary: i === 0,
          })),
        });
      }
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PATCH /api/partner/properties/[id]]", error);
    return NextResponse.json({ error: "Failed to update property" }, { status: 500 });
  }
}

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
    const property = await prisma.property.findFirst({
      where: { id, partnerId: partner?.id },
    });
    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    await prisma.property.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/partner/properties/[id]]", error);
    return NextResponse.json({ error: "Failed to delete property" }, { status: 500 });
  }
}
