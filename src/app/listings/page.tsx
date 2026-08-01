"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PropertyCard from "@/components/listings/PropertyCard";
import { SlidersHorizontal, Loader2, Home } from "lucide-react";

interface Property {
  id: string;
  title: string;
  area: string;
  rent: number;
  category: string;
  featured: boolean;
  verificationStatus: string;
  images: { url: string; isPrimary: boolean }[];
  wifi: boolean;
  water: boolean;
  parking: boolean;
  security: boolean;
}

const areas = ["All Areas", "Tudor", "TUM", "Tononoka", "Buxton", "Mikindani", "Maweni", "Mtomondoni", "Magongo", "Majengo", "Nyali"];
const roomTypes = ["Any", "SINGLE_ROOM", "BEDSITTER", "STUDIO", "ONE_BED", "TWO_BED", "SHARED_ROOM", "HOSTEL", "BNB"];
const roomTypeLabels: Record<string, string> = {
  Any: "Any",
  SINGLE_ROOM: "Single Room",
  BEDSITTER: "Bedsitter",
  STUDIO: "Studio",
  ONE_BED: "1 Bedroom",
  TWO_BED: "2 Bedroom",
  SHARED_ROOM: "Shared Room",
  HOSTEL: "Hostel",
  BNB: "AirBnB / BNB",
};

import { Suspense } from "react";

function ListingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [selectedArea, setSelectedArea] = useState(searchParams.get("area") || "All Areas");
  const [selectedType, setSelectedType] = useState(searchParams.get("type") || "Any");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [amenitiesFilter, setAmenitiesFilter] = useState({
    wifi: false, water: false, parking: false, security: false,
  });

  const [listings, setListings] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedArea !== "All Areas") params.set("area", selectedArea);
    if (selectedType !== "Any") params.set("category", selectedType);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (amenitiesFilter.wifi) params.set("wifi", "true");
    if (amenitiesFilter.water) params.set("water", "true");
    if (amenitiesFilter.parking) params.set("parking", "true");
    if (amenitiesFilter.security) params.set("security", "true");

    try {
      const res = await fetch(`/api/properties?${params.toString()}`);
      const data = await res.json();
      if (Array.isArray(data)) setListings(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [selectedArea, selectedType, minPrice, maxPrice, amenitiesFilter]);

  useEffect(() => {
    fetchListings();
  }, []);

  const handleApplyFilters = () => {
    fetchListings();
  };

  const handleReset = () => {
    setSelectedArea("All Areas");
    setSelectedType("Any");
    setMinPrice("");
    setMaxPrice("");
    setAmenitiesFilter({ wifi: false, water: false, parking: false, security: false });
    setTimeout(fetchListings, 0);
  };

  const toggleAmenity = (key: keyof typeof amenitiesFilter) => {
    setAmenitiesFilter((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <div className="mb-8">
          <h1 className="font-poppins font-bold text-3xl text-[#1F2937]">All Listings</h1>
          <p className="text-[#6B7280] mt-1">Explore physically verified student rentals around TUM campus</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="card p-6 space-y-6 bg-white rounded-2xl border border-gray-100 shadow-xs">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <h2 className="font-poppins font-bold text-lg text-[#1F2937] flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-[#1F6B4A]" /> Filters
                </h2>
                <button onClick={handleReset} className="text-xs font-semibold text-[#1F6B4A] hover:underline">
                  Reset
                </button>
              </div>

              <div>
                <label className="input-label">Location</label>
                <select value={selectedArea} onChange={(e) => setSelectedArea(e.target.value)} className="select text-sm">
                  {areas.map((a) => <option key={a}>{a}</option>)}
                </select>
              </div>

              <div>
                <label className="input-label">Price Range (KSh)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="input text-sm py-2 px-3" />
                  <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="input text-sm py-2 px-3" />
                </div>
              </div>

              <div>
                <label className="input-label">Room Type</label>
                <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="select text-sm">
                  {roomTypes.map((t) => <option key={t} value={t}>{roomTypeLabels[t]}</option>)}
                </select>
              </div>

              <div>
                <label className="input-label mb-2">Amenities</label>
                <div className="space-y-2">
                  {[
                    { key: "wifi", label: "Wi-Fi" },
                    { key: "water", label: "Water 24/7" },
                    { key: "parking", label: "Parking" },
                    { key: "security", label: "Security" },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2.5 cursor-pointer text-sm text-[#1F2937]">
                      <input
                        type="checkbox"
                        checked={amenitiesFilter[key as keyof typeof amenitiesFilter]}
                        onChange={() => toggleAmenity(key as keyof typeof amenitiesFilter)}
                        className="w-4 h-4 text-[#1F6B4A] rounded focus:ring-[#1F6B4A]"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              <button onClick={handleApplyFilters} className="btn-primary w-full py-2.5 text-sm bg-[#1F6B4A] hover:bg-[#175339] text-white rounded-xl">
                Apply Filters
              </button>
            </div>
          </aside>

          {/* Listings Grid */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#6B7280]">
                {loading ? "Loading..." : <>Showing <strong className="text-[#1F2937]">{listings.length}</strong> properties</>}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#6B7280] font-medium">Sort by:</span>
                <select className="text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white font-inter focus:outline-none">
                  <option>Newest</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="w-8 h-8 animate-spin text-[#1F6B4A]" />
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-24 text-[#6B7280]">
                <Home className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="font-poppins font-semibold text-lg text-[#1F2937]">No properties found</p>
                <p className="text-sm mt-1">Try adjusting your filters or check back later.</p>
                <button onClick={handleReset} className="btn-outline mt-4 text-sm border-[#1F6B4A] text-[#1F6B4A]">Clear Filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((property) => (
                  <PropertyCard
                    key={property.id}
                    id={property.id}
                    title={property.title}
                    area={property.area}
                    rent={property.rent}
                    category={property.category}
                    verified={property.verificationStatus === "VERIFIED"}
                    featured={property.featured}
                    image={property.images?.[0]?.url}
                    amenities={{
                      wifi: property.wifi,
                      water: property.water,
                      parking: property.parking,
                      security: property.security,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function ListingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#1F6B4A]" /></div>}>
      <ListingsContent />
    </Suspense>
  );
}
