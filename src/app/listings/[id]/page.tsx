import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import ListingDetailClient from "./ListingDetailClient";

interface Props {
  params: Promise<{ id: string }>;
}

// ─── Dynamic metadata per listing ────────────────────────────────────────────
// Google will index each listing with its own descriptive title & description.
// Example: "2-Bedroom Bedsitter in Tudor, Mombasa — KSh 7,500/mo | CampusKey"
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    const property = await prisma.property.findUnique({
      where: { id },
      select: {
        title: true,
        area: true,
        subcounty: true,
        rent: true,
        category: true,
        description: true,
        images: { where: { isPrimary: true }, take: 1, select: { url: true } },
      },
    });

    if (!property) {
      return {
        title: "Listing Not Found",
        description: "This property listing no longer exists on CampusKey Mombasa.",
      };
    }

    const categoryLabels: Record<string, string> = {
      SINGLE_ROOM: "Single Room", BEDSITTER: "Bedsitter", STUDIO: "Studio",
      ONE_BED: "1 Bedroom", TWO_BED: "2 Bedroom", HOSTEL: "Hostel",
      SHARED_ROOM: "Shared Room", BNB: "AirBnB / BNB",
    };

    const label = categoryLabels[property.category] || property.category;
    const title = `${label} in ${property.area}, Mombasa — KSh ${property.rent.toLocaleString()}/mo`;
    const description =
      property.description?.slice(0, 155) ||
      `Verified ${label} in ${property.area}, ${property.subcounty}. KSh ${property.rent.toLocaleString()} per month on CampusKey Mombasa.`;

    const imageUrl = property.images[0]?.url;

    return {
      title,
      description,
      alternates: { canonical: `https://campuskey.co.ke/listings/${id}` },
      openGraph: {
        title,
        description,
        url: `https://campuskey.co.ke/listings/${id}`,
        type: "article",
        ...(imageUrl && { images: [{ url: imageUrl, width: 1200, height: 630, alt: title }] }),
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        ...(imageUrl && { images: [imageUrl] }),
      },
    };
  } catch {
    return {
      title: "Property Listing",
      description: "Browse verified student housing in Mombasa on CampusKey.",
    };
  }
}
// ─────────────────────────────────────────────────────────────────────────────

export default function ListingDetailPage() {
  return <ListingDetailClient />;
}
