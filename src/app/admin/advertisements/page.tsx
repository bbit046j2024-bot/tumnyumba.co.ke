"use client";

import { useEffect, useState } from "react";
import { Megaphone, Star, StarOff, Eye, Search, Filter, Loader2, Building2, AlertCircle, CheckCircle, X } from "lucide-react";

const CATEGORY_LABELS: Record<string, string> = {
  SINGLE_ROOM: "Single Room",
  BEDSITTER: "Bedsitter",
  STUDIO: "Studio",
  ONE_BED: "1 Bedroom",
  TWO_BED: "2 Bedroom",
  HOSTEL: "Hostel",
  SHARED_ROOM: "Shared Room",
  BNB: "AirBnB / BnB",
};

type Property = {
  id: string;
  title: string;
  category: string;
  area: string;
  rent: number;
  featured: boolean;
  verificationStatus: string;
  availabilityStatus: string;
  views: number;
  _count: { leads: number };
  partner: {
    companyName: string;
    user: { name: string; email: string };
  };
  images: { url: string }[];
};

export default function AdminAdvertisementsPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "featured" | "not_featured">("all");
  const [toggling, setToggling] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const fetchProperties = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/advertisements");
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setProperties(data);
    } catch {
      setError("Failed to load property listings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProperties(); }, []);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const toggleFeatured = async (property: Property) => {
    setToggling(property.id);
    try {
      const res = await fetch("/api/admin/advertisements", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId: property.id, featured: !property.featured }),
      });
      if (!res.ok) throw new Error();
      setProperties(prev =>
        prev.map(p => p.id === property.id ? { ...p, featured: !p.featured } : p)
      );
      showToast(
        property.featured
          ? `"${property.title}" removed from featured listings.`
          : `"${property.title}" is now featured on the homepage!`,
        "success"
      );
    } catch {
      showToast("Failed to update featured status.", "error");
    } finally {
      setToggling(null);
    }
  };

  const filtered = properties.filter(p => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.partner.companyName.toLowerCase().includes(search.toLowerCase()) ||
      p.area.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "featured" && p.featured) ||
      (filter === "not_featured" && !p.featured);
    return matchesSearch && matchesFilter;
  });

  const featuredCount = properties.filter(p => p.featured).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all
          ${toast.type === "success" ? "bg-[#E4F5EC] text-[#1F9254] border border-[#1F9254]/20" : "bg-[#FBE7E7] text-[#E24C4C] border border-[#E24C4C]/20"}`}
        >
          {toast.type === "success" ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
          {toast.msg}
          <button onClick={() => setToast(null)} className="ml-2 opacity-60 hover:opacity-100"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Advertisements & Promotions</h1>
          <p className="page-subtitle">
            Manage which properties appear as featured listings on the homepage and search results.
            {" "}<span className="font-semibold text-[#1F6B4A]">{featuredCount} featured</span> of {properties.length} total.
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Listings", value: properties.length, color: "bg-[#EBF5FF]", text: "text-blue-700" },
          { label: "Featured Now", value: featuredCount, color: "bg-[#E4F5EC]", text: "text-[#1F9254]" },
          { label: "Verified", value: properties.filter(p => p.verificationStatus === "VERIFIED").length, color: "bg-[#FDF1DE]", text: "text-amber-700" },
          { label: "Total Views", value: properties.reduce((s, p) => s + p.views, 0).toLocaleString(), color: "bg-[#F3E8FF]", text: "text-purple-700" },
        ].map(stat => (
          <div key={stat.label} className="card p-4">
            <div className={`text-2xl font-bold ${stat.text}`}>{stat.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title, partner, or area..."
            className="input pl-10 text-sm"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {(["all", "featured", "not_featured"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-3 py-2 rounded-xl border font-medium transition-all ${
                filter === f
                  ? "bg-[#1F6B4A] text-white border-[#1F6B4A]"
                  : "bg-white text-gray-600 border-gray-200 hover:border-[#1F6B4A]"
              }`}
            >
              {f === "all" ? "All" : f === "featured" ? "⭐ Featured" : "Not Featured"}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400 gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-[#1F6B4A]" />
          <span className="text-sm">Loading listings...</span>
        </div>
      ) : error ? (
        <div className="card p-8 text-center text-red-500 text-sm">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Megaphone className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No properties found matching your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map(property => (
            <div key={property.id} className={`card p-5 flex flex-col md:flex-row md:items-center gap-5 border-l-4 transition-all
              ${property.featured ? "border-l-[#1F6B4A] bg-[#F7FBF8]" : "border-l-gray-200"}`}
            >
              {/* Thumbnail */}
              <div className="w-20 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-[#EAF3EC] flex items-center justify-center">
                {property.images[0] ? (
                  <img src={property.images[0].url} alt={property.title} className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-7 h-7 text-[#1F6B4A]/40" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  {property.featured && (
                    <span className="inline-flex items-center gap-1 text-xs bg-[#E4F5EC] text-[#1F9254] font-semibold px-2 py-0.5 rounded-full">
                      <Star className="w-3 h-3 fill-current" /> Featured
                    </span>
                  )}
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    property.verificationStatus === "VERIFIED" ? "badge-success" :
                    property.verificationStatus === "PENDING" ? "badge-warning" : "badge-danger"
                  }`}>{property.verificationStatus}</span>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    {CATEGORY_LABELS[property.category] ?? property.category}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 text-sm truncate">{property.title}</h3>
                <div className="text-xs text-gray-500 mt-0.5 flex flex-wrap gap-3">
                  <span><strong>Partner:</strong> {property.partner.companyName}</span>
                  <span>•</span>
                  <span><strong>Area:</strong> {property.area}</span>
                  <span>•</span>
                  <span className="text-[#1F6B4A] font-semibold">KSh {property.rent.toLocaleString()} / mo</span>
                </div>
                <div className="flex gap-4 mt-1.5 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {property.views.toLocaleString()} views</span>
                  <span>{property._count.leads} leads</span>
                </div>
              </div>

              {/* Action */}
              <button
                onClick={() => toggleFeatured(property)}
                disabled={toggling === property.id}
                className={`flex items-center gap-2 text-xs font-semibold py-2.5 px-4 rounded-xl border transition-all flex-shrink-0
                  ${property.featured
                    ? "bg-[#FBE7E7] text-[#E24C4C] border-[#E24C4C]/20 hover:bg-[#E24C4C] hover:text-white"
                    : "bg-[#E4F5EC] text-[#1F9254] border-[#1F9254]/20 hover:bg-[#1F6B4A] hover:text-white"
                  } disabled:opacity-50`}
              >
                {toggling === property.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : property.featured ? (
                  <StarOff className="w-3.5 h-3.5" />
                ) : (
                  <Star className="w-3.5 h-3.5" />
                )}
                {toggling === property.id ? "Updating..." : property.featured ? "Remove Featured" : "Set as Featured"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
