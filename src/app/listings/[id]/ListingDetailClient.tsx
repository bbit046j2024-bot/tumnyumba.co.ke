"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const PropertyMap = dynamic(() => import("@/components/map/PropertyMap"), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 text-sm">
      <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading location map...
    </div>
  ),
});
import {
  MapPin, Bed, Wifi, Shield, CheckCircle2, Phone, MessageSquare, Mail,
  ArrowLeft, Share2, Heart, Loader2, Zap, Droplet, Car, Lock, Building
} from "lucide-react";

interface PropertyDetail {
  id: string;
  title: string;
  area: string;
  subcounty: string;
  county: string;
  rent: number;
  deposit: number;
  category: string;
  description: string;
  verificationStatus: string;
  availabilityStatus: string;
  featured: boolean;
  views: number;
  wifi: boolean;
  water: boolean;
  electricity: boolean;
  parking: boolean;
  security: boolean;
  latitude: number | null;
  longitude: number | null;
  mapUrl: string | null;
  contactPerson?: string | null;
  contactPhone?: string | null;
  leadFee?: number;
  effectiveLeadFee?: number;
  totalSpaces?: number;
  availableSpaces?: number;
  images: { id: string; url: string; isPrimary: boolean }[];
  hasLead?: boolean;
  partner: {
    companyName: string;
    user: { name: string; phone?: string | null; email?: string | null };
  };
  _count: { leads: number };
}

const categoryLabels: Record<string, string> = {
  SINGLE_ROOM: "Single Room", BEDSITTER: "Bedsitter", STUDIO: "Studio", ONE_BED: "1 Bedroom",
  TWO_BED: "2 Bedroom", HOSTEL: "Hostel", SHARED_ROOM: "Shared Room", BNB: "AirBnB / BNB",
};

export default function ListingDetailClient() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const propertyId = params?.id as string;

  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeImage, setActiveImage] = useState<string>("");
  const [saved, setSaved] = useState(false);
  const [interestLoading, setInterestLoading] = useState(false);
  const [interestSubmitted, setInterestSubmitted] = useState(false);
  const [interestError, setInterestError] = useState("");

  // M-PESA Payment Modal State
  const [showMpesaModal, setShowMpesaModal] = useState(false);
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [mpesaLoading, setMpesaLoading] = useState(false);
  const [mpesaMessage, setMpesaMessage] = useState("");

  useEffect(() => {
    if (!propertyId) return;
    fetch(`/api/properties/${propertyId}`)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json();
      })
      .then((data) => {
        if (data) {
          setProperty(data);
          const primary = data.images.find((i: { isPrimary: boolean; url: string }) => i.isPrimary)?.url || data.images[0]?.url || "";
          setActiveImage(primary);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [propertyId]);

  const submitLeadDirectly = async () => {
    setInterestLoading(true);
    setInterestError("");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId }),
      });
      if (res.ok || res.status === 200) {
        setInterestSubmitted(true);
        setShowMpesaModal(false);
        const updated = await fetch(`/api/properties/${propertyId}`).then((r) => r.json());
        if (updated) setProperty(updated);
      } else {
        const data = await res.json();
        setInterestError(data.error || "Something went wrong");
      }
    } catch {
      setInterestError("Network error. Please try again.");
    } finally {
      setInterestLoading(false);
    }
  };

  const handleExpressInterest = async () => {
    if (!session) {
      router.push(`/auth/login?next=/listings/${propertyId}`);
      return;
    }

    const fee = property?.effectiveLeadFee ?? 0;
    // If effective lead fee > 0 (and NOT hostel), show M-PESA payment prompt
    if (fee > 0 && property?.category !== "HOSTEL") {
      setShowMpesaModal(true);
      setMpesaMessage("");
    } else {
      // 0 KES lead fee or Hostel: submit lead directly without prompt!
      await submitLeadDirectly();
    }
  };

  const handlePayMpesa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mpesaPhone.trim()) {
      setMpesaMessage("Please enter your M-PESA phone number.");
      return;
    }
    setMpesaLoading(true);
    setMpesaMessage("");
    try {
      const res = await fetch("/api/mpesa/stkpush", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          phone: mpesaPhone,
          amount: property?.effectiveLeadFee || 50,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMpesaMessage(data.error || "STK Push failed. Please try again.");
        setMpesaLoading(false);
        return;
      }

      setMpesaMessage(data.message || "STK Push sent. Unlocking contact details...");
      // Complete lead creation and unlock contact details
      setTimeout(async () => {
        await submitLeadDirectly();
        setMpesaLoading(false);
      }, 1500);
    } catch {
      setMpesaMessage("Network error during M-PESA payment. Please try again.");
      setMpesaLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (notFound || !property) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-4">
        <Bed className="w-16 h-16 text-gray-200" />
        <h1 className="font-poppins font-bold text-2xl text-gray-700">Property Not Found</h1>
        <p className="text-gray-500 text-sm">This listing may have been removed or does not exist.</p>
        <Link href="/listings" className="btn-primary">Browse All Listings</Link>
      </div>
    );
  }

  const displayPhone = property.contactPhone || "";
  const displayName = property.contactPerson || property.partner.user.name;
  const whatsappNumber = displayPhone.replace(/\D/g, "");
  const whatsappMsg = encodeURIComponent(
    `Hi ${displayName}, I am interested in your listing: ${property.title} on CampusKey Mombasa.`
  );

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between py-4 mb-4 text-sm">
          <button onClick={() => router.back()} className="inline-flex items-center gap-1.5 text-gray-600 hover:text-primary-700 font-medium transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to listings
          </button>
          <div className="flex items-center gap-3">
            <button onClick={() => setSaved(!saved)} className={`p-2 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-semibold ${saved ? "bg-red-50 text-red-600 border-red-200" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"}`}>
              <Heart className={`w-4 h-4 ${saved ? "fill-red-600 text-red-600" : ""}`} />
              {saved ? "Saved" : "Save"}
            </button>
            <button onClick={() => navigator.clipboard?.writeText(window.location.href).then(() => alert("Link copied!"))} className="p-2 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-all flex items-center gap-1.5 text-xs font-semibold">
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery */}
            <div className="space-y-3">
              <div className="relative h-[360px] sm:h-[450px] w-full rounded-2xl overflow-hidden bg-gray-100 shadow-md">
                {activeImage ? (
                  <Image src={activeImage} alt={property.title} fill priority sizes="(max-width: 768px) 100vw, 75vw" className="object-cover transition-all duration-300" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                    <Bed className="w-16 h-16 text-primary-400" />
                  </div>
                )}
                <div className="absolute top-4 left-4 flex gap-2">
                  {property.verificationStatus === "VERIFIED" && (
                    <span className="bg-primary-700 text-white text-xs font-bold px-3 py-1 rounded-lg flex items-center gap-1 shadow-md">
                      <CheckCircle2 className="w-3.5 h-3.5" /> TUM Verified
                    </span>
                  )}
                  <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-bold px-3 py-1 rounded-lg shadow-md">
                    {categoryLabels[property.category] || property.category}
                  </span>
                </div>
              </div>

              {property.images.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  {property.images.map((img) => (
                    <button key={img.id} onClick={() => setActiveImage(img.url)} className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${activeImage === img.url ? "border-primary-600 scale-95" : "border-transparent opacity-70 hover:opacity-100"}`}>
                      <Image src={img.url} alt="Thumbnail" fill sizes="80px" className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Header */}
            <div>
              <h1 className="font-poppins font-bold text-2xl sm:text-3xl text-gray-900">{property.title}</h1>
              <div className="flex items-center gap-3 mt-3 text-gray-600 text-sm flex-wrap">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-primary-600" />
                  <span>{property.area}, {property.subcounty}, {property.county}</span>
                </div>
                <span className="text-gray-300">•</span>
                <span className="text-xs text-gray-500">{property.views} views</span>
                <span className="text-gray-300">•</span>
                <span className="text-xs text-gray-500">{property._count.leads} interested</span>
              </div>
            </div>

            {/* Key Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div>
                <span className="text-xs text-gray-400 font-medium">Monthly Rent</span>
                <p className="font-poppins font-bold text-lg text-primary-700">KSh {property.rent.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-xs text-gray-400 font-medium">Deposit</span>
                <p className="font-poppins font-bold text-lg text-gray-800">KSh {property.deposit.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-xs text-gray-400 font-medium">Category</span>
                <p className="font-poppins font-bold text-base text-gray-800">{categoryLabels[property.category] || property.category}</p>
              </div>
              <div>
                <span className="text-xs text-gray-400 font-medium">Spaces Left</span>
                <p className={`font-poppins font-bold text-base ${property.availableSpaces && property.availableSpaces > 0 ? "text-emerald-700" : "text-red-600"}`}>
                  {property.availableSpaces && property.availableSpaces > 0 ? `${property.availableSpaces} ${property.availableSpaces === 1 ? "Space" : "Spaces"}` : "Fully Booked"}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-400 font-medium">Status</span>
                <p className={`font-poppins font-bold text-base flex items-center gap-1 ${property.availabilityStatus === "AVAILABLE" && (property.availableSpaces === undefined || property.availableSpaces > 0) ? "text-emerald-600" : "text-amber-600"}`}>
                  <span className={`w-2 h-2 rounded-full ${property.availabilityStatus === "AVAILABLE" && (property.availableSpaces === undefined || property.availableSpaces > 0) ? "bg-emerald-500 animate-pulse" : "bg-amber-400"}`} />
                  {property.availabilityStatus === "AVAILABLE" && (property.availableSpaces === undefined || property.availableSpaces > 0) ? "Available" : "Taken"}
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="card p-6 space-y-3">
              <h2 className="font-poppins font-bold text-lg text-gray-900">About this Property</h2>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{property.description}</p>
            </div>

            {/* Amenities */}
            <div className="card p-6 space-y-4">
              <h2 className="font-poppins font-bold text-lg text-gray-900">Amenities & Features</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { key: "wifi", label: "High-speed Wi-Fi", Icon: Wifi, color: "bg-primary-50/60 text-primary-900", iconColor: "text-primary-600" },
                  { key: "water", label: "24/7 Water Supply", Icon: Droplet, color: "bg-blue-50/60 text-blue-900", iconColor: "text-blue-600" },
                  { key: "electricity", label: "Prepaid Electricity", Icon: Zap, color: "bg-yellow-50/60 text-yellow-900", iconColor: "text-yellow-600" },
                  { key: "security", label: "CCTV / Security", Icon: Lock, color: "bg-emerald-50/60 text-emerald-900", iconColor: "text-emerald-600" },
                  { key: "parking", label: "Tenant Parking", Icon: Car, color: "bg-purple-50/60 text-purple-900", iconColor: "text-purple-600" },
                ].map(({ key, label, Icon, color, iconColor }) => {
                  const hasIt = property[key as keyof typeof property] as boolean;
                  return (
                    <div key={key} className={`flex items-center gap-3 p-3 rounded-xl ${hasIt ? color : "bg-gray-50 text-gray-400"}`}>
                      <Icon className={`w-5 h-5 ${hasIt ? iconColor : "text-gray-400"}`} />
                      <span className="text-sm font-medium">{label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Location Map */}
            <div className="card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-poppins font-bold text-lg text-gray-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary-700" /> Location & Nearby
                </h2>
                <span className="text-xs text-gray-500 font-medium">Distance relative to TUM Mombasa</span>
              </div>
              <PropertyMap
                lat={property.latitude}
                lng={property.longitude}
                mapUrl={property.mapUrl}
                title={property.title}
                area={property.area}
              />
            </div>

            {/* Verification Banner */}
            <div className="p-5 bg-gradient-to-r from-emerald-900 to-primary-900 rounded-2xl text-white space-y-2">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-yellow-400" />
                <h3 className="font-poppins font-semibold text-base text-yellow-400">CampusKey Mombasa Verification Guarantee</h3>
              </div>
              <p className="text-xs text-primary-100 leading-relaxed">
                This property has been physically inspected by our field team. Never send money to anyone outside the CampusKey Mombasa platform.
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="card p-6 space-y-6 sticky top-28">
              <div className="border-b border-gray-100 pb-4">
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Total Monthly</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="font-poppins font-bold text-3xl text-primary-700">KSh {property.rent.toLocaleString()}</span>
                  <span className="text-gray-500 text-sm">/ month</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Refundable Deposit: KSh {property.deposit.toLocaleString()}</p>
              </div>

              {/* Interest Action */}
              {interestError && (
                <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{interestError}</p>
              )}
              {interestSubmitted || property.hasLead ? (
                <div className="p-4 bg-emerald-50 rounded-xl text-center space-y-2 border border-emerald-200">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <h4 className="font-poppins font-bold text-emerald-900 text-sm">Interest Recorded!</h4>
                  <p className="text-xs text-emerald-700">Contact details unlocked. You can now reach out to the partner directly below.</p>
                </div>
              ) : (
                <button onClick={handleExpressInterest} disabled={interestLoading || property.availabilityStatus !== "AVAILABLE"} className="w-full btn-primary py-3.5 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary-700/20 disabled:opacity-60">
                  {interestLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Building className="w-4 h-4" />}
                  {property.availabilityStatus !== "AVAILABLE" ? "Currently Unavailable" : session ? "Take / Express Interest" : "Sign In to Express Interest"}
                </button>
              )}

              {/* Partner Info & Gated Contact Details */}
              <div className="pt-4 border-t border-gray-100 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-lg font-poppins">
                    {property.partner.user.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-poppins font-bold text-gray-900 text-sm flex items-center gap-1">
                      {property.partner.user.name}
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary-600" />
                    </h4>
                    <p className="text-xs text-gray-500">{property.partner.companyName}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 pt-2">
                  {property.hasLead || interestSubmitted ? (
                    <>
                      {property.contactPhone ? (
                        <>
                          <a href={`tel:${property.contactPhone}`} className="w-full btn-primary py-2.5 text-xs font-semibold flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700">
                            <Phone className="w-4 h-4 text-white" />
                            Call {property.contactPerson ? property.contactPerson : "Property Contact"} ({property.contactPhone})
                          </a>
                          {whatsappNumber ? (
                            <a href={`https://wa.me/${whatsappNumber}?text=${whatsappMsg}`} target="_blank" rel="noopener noreferrer" className="w-full py-2.5 text-xs font-semibold flex items-center justify-center gap-2 rounded-xl bg-green-500 hover:bg-green-600 text-white transition-all">
                              <MessageSquare className="w-4 h-4 text-white" />
                              WhatsApp {displayName} ({property.contactPhone})
                            </a>
                          ) : null}
                        </>
                      ) : (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-medium text-center space-y-1">
                          <p className="font-semibold">No contact phone listed for this property.</p>
                          <p className="text-amber-700 font-normal">The partner has not filled in the <span className="font-semibold">Direct Contact Phone Number</span> field for this listing. Please check back later.</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-center space-y-1">
                      <div className="flex items-center justify-center gap-1.5 text-gray-700 font-semibold text-xs">
                        <Lock className="w-3.5 h-3.5 text-gray-500" /> Contact Details Locked
                      </div>
                      <p className="text-[11px] text-gray-500">
                        Click <span className="font-medium text-primary-700">&quot;Take / Express Interest&quot;</span> above to view phone & email.
      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-xs text-gray-400 space-y-1.5 pt-2">
                <div className="flex items-center justify-between">
                  <span>Inspection Fee:</span>
                  <span className="font-medium text-emerald-600">FREE</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Commission Fee:</span>
                  <span className="font-medium text-emerald-600">KSh 0 (Students)</span>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* M-PESA Payment Modal */}
        {showMpesaModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-green-500 text-white font-bold flex items-center justify-center text-xs">
                    M
                  </div>
                  <h3 className="font-poppins font-bold text-gray-900 text-base">
                    M-PESA Lead Connection Payment
                  </h3>
                </div>
                <button
                  onClick={() => setShowMpesaModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                <div className="flex justify-between items-center text-xs font-semibold text-emerald-900">
                  <span>Property Lead Fee:</span>
                  <span className="text-base text-emerald-700 font-bold">
                    KSh {property.effectiveLeadFee || 50}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-700">
                  Enter your Safaricom M-PESA registered number below to receive an instant STK PIN prompt.
                </p>
              </div>

              <form onSubmit={handlePayMpesa} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    M-PESA Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="0712345678 or 254712345678"
                    value={mpesaPhone}
                    onChange={(e) => setMpesaPhone(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {mpesaMessage && (
                  <p
                    className={`text-xs p-3 rounded-xl ${
                      mpesaMessage.includes("STK Push sent") || mpesaMessage.includes("Unlocking")
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    {mpesaMessage}
                  </p>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowMpesaModal(false)}
                    className="flex-1 py-3 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={mpesaLoading}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 disabled:opacity-60"
                  >
                    {mpesaLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Sending STK...
                      </>
                    ) : (
                      `Pay KSh ${property.effectiveLeadFee || 50} via M-PESA`
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
