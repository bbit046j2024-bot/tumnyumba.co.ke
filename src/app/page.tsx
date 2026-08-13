"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search, MapPin, DollarSign, Home, Shield, CheckCircle2, Star,
  ArrowRight, Building2, Users, TrendingUp, Loader2
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PropertyCard from "@/components/listings/PropertyCard";
import Particles from "@/components/magicui/particles";

const areas = ["All Areas", "Tudor", "TUM", "Tononoka", "Buxton", "Mikindani", "Maweni", "Mtomondoni", "Magongo", "Majengo", "Nyali"];
const priceRanges = [
  "Any Price",
  "Under KSh 3,000",
  "KSh 2,000–5,000",
  "KSh 5,000–8,000",
  "KSh 8,000–12,000",
  "KSh 12,000–20,000",
  "Over KSh 20,000",
];
const roomTypes = [
  "Any",
  "Single Room",
  "Bedsitter",
  "Studio",
  "1 Bedroom",
  "2 Bedroom",
  "Shared Room",
  "Hostel",
  "AirBnB / BNB",
];

const categoryMap: Record<string, string> = {
  "Single Room": "SINGLE_ROOM",
  "Bedsitter": "BEDSITTER",
  "Studio": "STUDIO",
  "1 Bedroom": "ONE_BED",
  "2 Bedroom": "TWO_BED",
  "Shared Room": "SHARED_ROOM",
  "Hostel": "HOSTEL",
  "AirBnB / BNB": "BNB",
};

const trustBadges = [
  { icon: CheckCircle2, title: "Verified Listings", desc: "All properties physically checked", color: "text-[#1F6B4A] bg-[#E4F0E9]" },
  { icon: Shield, title: "Safe & Trusted", desc: "No scams. Only genuine homes", color: "text-[#1F6B4A] bg-[#E4F0E9]" },
  { icon: MapPin, title: "Near Campus", desc: "Find homes close to TUM", color: "text-[#1F6B4A] bg-[#E4F0E9]" },
  { icon: DollarSign, title: "Affordable Options", desc: "Filter by your budget", color: "text-[#1F6B4A] bg-[#E4F0E9]" },
];

const howItWorks = [
  { step: "01", title: "Search Listings", desc: "Browse verified properties near TUM filtered by your budget and preferences.", icon: Search },
  { step: "02", title: "Express Interest", desc: "Click \"Take\" on a property you love. The partner contacts you directly.", icon: Home },
  { step: "03", title: "Move In", desc: "View the property, sign the lease, and move into your new home.", icon: CheckCircle2 },
];

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

export default function HomePage() {
  const router = useRouter();
  const [location, setLocation] = useState("All Areas");
  const [price, setPrice] = useState("Any Price");
  const [type, setType] = useState("Any");

  const [featuredListings, setFeaturedListings] = useState<Property[]>([]);
  const [stats, setStats] = useState({ properties: "—", students: "—", partners: "—" });
  const [loadingListings, setLoadingListings] = useState(true);


  useEffect(() => {
    // First try featured listings; if none exist fall back to latest verified
    fetch("/api/properties?featured=true&limit=4")
      .then((r) => r.json())
      .then(async (data) => {
        if (Array.isArray(data) && data.length > 0) {
          setFeaturedListings(data);
        } else {
          const fallback = await fetch("/api/properties?limit=4").then((r) => r.json());
          if (Array.isArray(fallback)) setFeaturedListings(fallback);
        }
      })
      .catch(console.error)
      .finally(() => setLoadingListings(false));

    // Fetch real platform stats
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => {
        if (data && typeof data.properties === "number") {
          // Animate count-up from 0 to real values
          const duration = 1200;
          const steps = 40;
          const interval = duration / steps;
          let step = 0;
          const timer = setInterval(() => {
            step++;
            const progress = step / steps;
            const ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            setStats({
              properties: Math.round(data.properties * ease).toLocaleString(),
              students: Math.round(data.students * ease).toLocaleString(),
              partners: Math.round(data.partners * ease).toLocaleString(),
            });
            if (step >= steps) {
              clearInterval(timer);
              setStats({
                properties: data.properties.toLocaleString(),
                students: data.students.toLocaleString(),
                partners: data.partners.toLocaleString(),
              });
            }
          }, interval);
        }
      })
      .catch(() => setStats({ properties: "—", students: "—", partners: "—" }));
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location !== "All Areas") params.set("area", location);
    if (price !== "Any Price") params.set("price", price);
    if (type !== "Any") params.set("type", type);
    router.push(`/listings?${params.toString()}`);
  };

  const statCards = [
    { icon: Home, value: stats.properties, label: "Listed Properties", color: "bg-primary-50 text-primary-700" },
    { icon: Users, value: stats.students, label: "Students Registered", color: "bg-blue-50 text-blue-700" },
    { icon: Building2, value: stats.partners, label: "Verified Partners", color: "bg-orange-50 text-orange-700" },
    { icon: TrendingUp, value: "94%", label: "Satisfaction Rate", color: "bg-purple-50 text-purple-700" },
  ];

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />

      {/* ─── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-gradient-to-b from-[#EAF3EC] via-[#F4F8F5] to-white pt-24 pb-16">
        <Particles className="absolute inset-0 z-0" quantity={45} ease={80} color="#1F6B4A" refresh />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Col */}
            <div className="lg:col-span-7">
              <h1 className="magic-fade-up magic-fade-up-delay-1 font-poppins font-bold text-4xl sm:text-5xl lg:text-6xl text-[#1F2937] leading-[1.1] mb-6">
                Find Verified <br className="hidden sm:inline" />
                Student Housing <br />
                <span className="magic-text">In Mombasa</span>
              </h1>
              <p className="magic-fade-up magic-fade-up-delay-2 text-base sm:text-lg text-[#6B7280] mb-8 leading-relaxed max-w-xl">
                Safe. Affordable. Verified. Connecting students to trusted rentals across Mombasa — no scams, no stress.
              </p>

              {/* Search Bar */}
              <div className="magic-fade-up magic-fade-up-delay-3 magic-border bg-white rounded-2xl p-4 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-gray-100 max-w-2xl">
                <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 gap-2 mb-3">
                  <div className="px-3 py-1">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] mb-1">Location</label>
                    <select value={location} onChange={(e) => setLocation(e.target.value)} className="w-full text-sm text-[#1F2937] font-semibold bg-transparent border-0 focus:outline-none cursor-pointer">
                      {areas.map((a) => <option key={a}>{a}</option>)}
                    </select>
                  </div>
                  <div className="px-3 py-1">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] mb-1">Price Range</label>
                    <select value={price} onChange={(e) => setPrice(e.target.value)} className="w-full text-sm text-[#1F2937] font-semibold bg-transparent border-0 focus:outline-none cursor-pointer">
                      {priceRanges.map((p) => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="px-3 py-1">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] mb-1">Room Type</label>
                    <select value={type} onChange={(e) => setType(e.target.value)} className="w-full text-sm text-[#1F2937] font-semibold bg-transparent border-0 focus:outline-none cursor-pointer">
                      {roomTypes.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <button onClick={handleSearch} className="magic-btn w-full text-white py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2">
                  <Search className="w-4 h-4" />
                  Search Properties
                </button>
              </div>
            </div>

            {/* Right Col */}
            <div className="lg:col-span-5 relative hidden lg:flex items-center justify-center">
              <div className="absolute w-96 h-96 bg-[#E4F0E9] rounded-full filter blur-2xl opacity-70 -z-10" />
              <div className="magic-float relative w-full h-[420px] rounded-3xl overflow-hidden shadow-[0_12px_36px_rgba(0,0,0,0.1)] border-4 border-white bg-[#EAF3EC]">
                <Image
                  src="https://static.vecteezy.com/system/resources/previews/026/586/050/large_2x/beautiful-modern-house-exterior-with-carport-modern-residential-district-and-minimalist-building-concept-by-ai-generated-free-photo.jpg"
                  alt="Modern Student Housing near TUM"
                  fill
                  sizes="(max-width: 1024px) 100vw, 500px"
                  className="object-cover hover:scale-105 transition-transform duration-700"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TRUST BADGES ────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 mb-16 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {trustBadges.map(({ icon: Icon, title, desc, color }, i) => (
            <div key={title} className={`magic-card magic-fade-up magic-fade-up-delay-${i + 1} p-5 flex items-start gap-4 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)]`}>
              <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-poppins font-bold text-sm text-[#1F2937]">{title}</h3>
                <p className="text-xs text-[#6B7280] mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── STATS ────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map(({ icon: Icon, value, label, color }, i) => (
            <div key={label} className={`magic-card magic-border p-6 text-center bg-white rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)]`}>
              <div className="w-12 h-12 rounded-full bg-[#E4F0E9] text-[#1F6B4A] flex items-center justify-center mx-auto mb-3">
                <Icon className="w-6 h-6" />
              </div>
              <div className="font-poppins font-bold text-3xl text-[#1F2937] mb-1">{value}</div>
              <div className="text-sm text-[#6B7280]">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── POPULAR LISTINGS ─────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-poppins font-bold text-3xl text-[#1F2937]">Popular Listings</h2>
            <p className="text-[#6B7280] mt-1">Verified properties students love</p>
          </div>
          <Link href="/listings" className="btn-outline text-sm py-2 px-5 hidden sm:flex items-center gap-1.5 border-[#1F6B4A] text-[#1F6B4A] hover:bg-[#1F6B4A] hover:text-white rounded-xl font-medium">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loadingListings ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#1F6B4A]" />
          </div>
        ) : featuredListings.length === 0 ? (
          <div className="text-center py-16 text-[#6B7280]">
            <Home className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No featured listings yet</p>
            <p className="text-sm mt-1">Check back soon or <Link href="/listings" className="text-[#1F6B4A] font-semibold">browse all listings</Link></p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredListings.map((listing) => (
              <PropertyCard
                key={listing.id}
                id={listing.id}
                title={listing.title}
                area={listing.area}
                rent={listing.rent}
                category={listing.category}
                verified={listing.verificationStatus === "VERIFIED"}
                featured={listing.featured}
                image={listing.images?.[0]?.url}
                amenities={{
                  wifi: listing.wifi,
                  water: listing.water,
                  parking: listing.parking,
                  security: listing.security,
                }}
              />
            ))}
          </div>
        )}

        <div className="text-center mt-8 sm:hidden">
          <Link href="/listings" className="btn-outline">View All Listings</Link>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────────────────────── */}
      <section className="bg-[#EAF3EC] py-20 mb-20 border-y border-[#1F6B4A]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-poppins font-bold text-3xl text-[#1F2937] mb-3">How CampusKey Works</h2>
            <p className="text-[#6B7280] max-w-xl mx-auto">Finding your ideal student home in Mombasa is now easier than ever.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map(({ step, title, desc, icon: Icon }, i) => (
              <div key={step} className={`magic-card magic-border magic-fade-up magic-fade-up-delay-${i + 1} p-8 text-center relative bg-white rounded-2xl border border-gray-100 shadow-[0_4px_12px_rgba(0,0,0,0.04)]`}>
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-[#1F6B4A] text-white text-xs font-bold rounded-full flex items-center justify-center font-poppins">
                  {step}
                </div>
                <div className="w-14 h-14 bg-[#E4F0E9] rounded-full flex items-center justify-center mx-auto mb-4 mt-2">
                  <Icon className="w-7 h-7 text-[#1F6B4A]" />
                </div>
                <h3 className="font-poppins font-bold text-lg text-[#1F2937] mb-2">{title}</h3>
                <p className="text-[#6B7280] text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PARTNER CTA ───────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="bg-[#E4F0E9] rounded-3xl p-10 lg:p-14 flex flex-col lg:flex-row items-center justify-between gap-8 border border-[#1F6B4A]/10 shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 bg-[#1F6B4A] rounded-full flex items-center justify-center text-white flex-shrink-0 shadow-xs">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[#1F6B4A] uppercase tracking-wider mb-2">
                For Estate Agents & Landlords
              </div>
              <h2 className="font-poppins font-bold text-2xl sm:text-3xl text-[#1F2937] mb-2">
                List Your Property. Reach More Students.
              </h2>
              <p className="text-[#6B7280] max-w-xl text-sm leading-relaxed">
                Join CampusKey Mombasa as a partner and connect with hundreds of students looking for verified housing every semester.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <Link href="/auth/register/partner" className="magic-btn inline-flex items-center justify-center gap-2 px-7 py-3.5 text-white font-semibold rounded-xl font-poppins">
              Partner With Us
            </Link>
            <Link href="/for-partners" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border border-[#1F6B4A]/30 text-[#1F6B4A] font-semibold rounded-xl hover:bg-[#1F6B4A]/5 transition-all font-poppins">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
