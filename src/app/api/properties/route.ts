import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const area = searchParams.get("area");
    const category = searchParams.get("category");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const featured = searchParams.get("featured");
    const limit = searchParams.get("limit");
    const wifi = searchParams.get("wifi");
    const water = searchParams.get("water");
    const parking = searchParams.get("parking");
    const security = searchParams.get("security");

    const properties = await prisma.property.findMany({
      where: {
        verificationStatus: "VERIFIED",
        availabilityStatus: "AVAILABLE",
        ...(area && area !== "All Areas" && { area: { contains: area } }),
        ...(category && category !== "Any" && { category: category as any }),
        ...((minPrice || maxPrice) && {
          rent: {
            ...(minPrice && { gte: parseInt(minPrice) }),
            ...(maxPrice && { lte: parseInt(maxPrice) }),
          },
        }),
        ...(featured === "true" && { featured: true }),
        ...(wifi === "true" && { wifi: true }),
        ...(water === "true" && { water: true }),
        ...(parking === "true" && { parking: true }),
        ...(security === "true" && { security: true }),
      },
      include: {
        images: {
          where: { isPrimary: true },
          take: 1,
        },
        partner: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      ...(limit && { take: parseInt(limit) }),
    });

    return NextResponse.json(properties);
  } catch (error) {
    console.error("[GET /api/properties]", error);
    return NextResponse.json(
      { error: "Failed to fetch properties" },
      { status: 500 }
    );
  }
}
