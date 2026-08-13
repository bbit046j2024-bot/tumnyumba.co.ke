import Image from "next/image";
import Link from "next/link";
import { MapPin, Bed, Wifi, Star, CheckCircle2 } from "lucide-react";

interface PropertyCardProps {
  id: string;
  title: string;
  area: string;
  rent: number;
  category: string;
  distance?: string;
  image?: string;
  amenities?: { wifi?: boolean; water?: boolean; parking?: boolean; security?: boolean };
  verified?: boolean;
  featured?: boolean;
}

const categoryLabels: Record<string, string> = {
  BEDSITTER: "Bedsitter",
  STUDIO: "Studio",
  ONE_BED: "1 Bedroom",
  TWO_BED: "2 Bedroom",
  HOSTEL: "Hostel",
  SHARED_ROOM: "Shared Room",
};

export default function PropertyCard({
  id,
  title,
  area,
  rent,
  category,
  distance,
  image,
  amenities,
  verified = false,
  featured = false,
}: PropertyCardProps) {
  return (
    <Link href={`/listings/${id}`}>
      <div className="card-hover magic-card group overflow-hidden h-full flex flex-col bg-white rounded-2xl border border-gray-100 shadow-[0_4px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_18px_rgba(31,107,74,0.12)] transition-all duration-300">
        {/* Image */}
        <div className="relative h-48 bg-gray-100 overflow-hidden rounded-t-2xl">
          {image ? (
            <Image
              src={image}
              alt={title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-[#EAF3EC] flex items-center justify-center">
              <Bed className="w-12 h-12 text-[#1F6B4A]" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {featured && (
              <span className="bg-[#FDF1DE] text-[#D98A1F] text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
                <Star className="w-3.5 h-3.5 fill-[#D98A1F]" /> Featured
              </span>
            )}
          </div>

          {/* Category */}
          <div className="absolute bottom-3 right-3">
            <span className="bg-white/90 backdrop-blur-md text-[#1F2937] font-semibold text-xs px-2.5 py-1 rounded-full shadow-xs">
              {categoryLabels[category] || category}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          {/* Price */}
          <div className="flex items-baseline gap-1 mb-1.5">
            <span className="font-poppins font-bold text-xl text-[#1F6B4A]">
              KSh {rent.toLocaleString()}
            </span>
            <span className="text-[#6B7280] text-sm"> / month</span>
          </div>

          {/* Title */}
          <h3 className="font-poppins font-bold text-[#1F2937] text-base leading-snug mb-2 group-hover:text-[#1F6B4A] transition-colors line-clamp-1">
            {title}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-[#6B7280] text-xs mb-3">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-[#1F6B4A]" />
            <span className="line-clamp-1">{area}</span>
            {distance && (
              <>
                <span className="text-gray-300">·</span>
                <span className="text-[#1F6B4A] font-medium">{distance} to TUM</span>
              </>
            )}
          </div>

          {/* Amenities */}
          {amenities && (
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {amenities.wifi && (
                <span className="flex items-center gap-1 text-xs text-[#6B7280] bg-[#F7F8FA] px-2.5 py-1 rounded-full border border-gray-100">
                  <Wifi className="w-3 h-3 text-[#6B7280]" /> Wi-Fi
                </span>
              )}
              {amenities.water && (
                <span className="flex items-center gap-1 text-xs text-[#6B7280] bg-[#F7F8FA] px-2.5 py-1 rounded-full border border-gray-100">
                  💧 Water
                </span>
              )}
              {amenities.parking && (
                <span className="flex items-center gap-1 text-xs text-[#6B7280] bg-[#F7F8FA] px-2.5 py-1 rounded-full border border-gray-100">
                  🚗 Parking
                </span>
              )}
              {amenities.security && (
                <span className="flex items-center gap-1 text-xs text-[#6B7280] bg-[#F7F8FA] px-2.5 py-1 rounded-full border border-gray-100">
                  🔒 Security
                </span>
              )}
            </div>
          )}

          {/* Bottom Bar: Verified badge */}
          <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
            {verified ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1F9254] bg-[#E4F5EC] px-2.5 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified
              </span>
            ) : (
              <span className="text-xs text-[#6B7280]">Listing</span>
            )}
            <span className="text-xs font-semibold text-[#1F6B4A] group-hover:underline">
              View Details →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
