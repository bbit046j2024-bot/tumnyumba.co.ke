"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search, Filter, CheckCircle2, XCircle, Eye, Star,
  Building2, MapPin, Loader2, RefreshCw, Trash2, ImageOff
} from "lucide-react";

import { containsPhone } from "@/lib/moderation";

interface Property {
  id: string;
  title: string;
  category: string;
  area: string;
  subcounty: string;
  county: string;
  rent: number;
  deposit: number;
  description?: string;
  verificationStatus: string;
  availabilityStatus: string;
  featured: boolean;
  views: number;
  createdAt: string;
  images: { url: string }[];
  partner: {
    companyName: string;
    user: { name: string; email: string };
  };
  _count: { leads: number };
}

const CATEGORY_LABELS: Record<string, string> = {
  BEDSITTER: "Bedsitter",
  ONE_BEDROOM: "1 Bedroom",
  TWO_BEDROOM: "2 Bedroom",
  THREE_BEDROOM: "3 Bedroom",
  STUDIO: "Studio",
  SINGLE_ROOM: "Single Room",
  BNB: "BnB / AirBnB",
  HOSTEL: "Hostel",
  SHARED: "Shared",
};

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/properties?${params.toString()}`);
      const data = await res.json();
      if (Array.isArray(data)) setProperties(data);
      else setError("Failed to load properties.");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    const timer = setTimeout(fetchProperties, 300);
    return () => clearTimeout(timer);
  }, [fetchProperties]);

  const updateStatus = async (id: string, verificationStatus: string) => {
    setActionLoading(id + verificationStatus);
    try {
      const res = await fetch(`/api/admin/properties/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verificationStatus }),
      });
      if (res.ok) {
        setProperties((prev) =>
          prev.map((p) => p.id === id ? { ...p, verificationStatus } : p)
        );
      }
    } finally {
      setActionLoading(null);
    }
  };

  const toggleFeatured = async (id: string, featured: boolean) => {
    setActionLoading(id + "featured");
    try {
      const res = await fetch(`/api/admin/properties/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !featured }),
      });
      if (res.ok) {
        setProperties((prev) =>
          prev.map((p) => p.id === id ? { ...p, featured: !featured } : p)
        );
      }
    } finally {
      setActionLoading(null);
    }
  };

  const deleteProperty = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setActionLoading(id + "delete");
    try {
      const res = await fetch(`/api/admin/properties/${id}`, { method: "DELETE" });
      if (res.ok) setProperties((prev) => prev.filter((p) => p.id !== id));
    } finally {
      setActionLoading(null);
    }
  };

  const counts = {
    ALL: properties.length,
    PENDING: properties.filter((p) => p.verificationStatus === "PENDING").length,
    VERIFIED: properties.filter((p) => p.verificationStatus === "VERIFIED").length,
    REJECTED: properties.filter((p) => p.verificationStatus === "REJECTED").length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Property Listings Management</h1>
          <p className="page-subtitle">Verify, review, and manage all student rentals listed across TUM Nyumba.</p>
        </div>
        <button
          onClick={fetchProperties}
          className="btn-secondary flex items-center gap-2 text-sm self-start"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["ALL", "PENDING", "VERIFIED", "REJECTED"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              statusFilter === s
                ? s === "PENDING"
                  ? "bg-amber-500 text-white border-amber-500"
                  : s === "VERIFIED"
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : s === "REJECTED"
                  ? "bg-red-500 text-white border-red-500"
                  : "bg-primary-700 text-white border-primary-700"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
            }`}
          >
            {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()} ({counts[s]})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title, area, county..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10 text-sm"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-7 h-7 animate-spin text-primary-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase font-poppins">
                  <th className="p-4">Property</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Rent</th>
                  <th className="p-4">Partner</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Stats</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {properties.map((item) => {
                  const busy = actionLoading?.startsWith(item.id);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                      {/* Property */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-200">
                            {item.images[0] ? (
                              <img src={item.images[0].url} alt={item.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageOff className="w-5 h-5 text-gray-300" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 font-poppins leading-tight line-clamp-1">{item.title}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-primary-600 flex-shrink-0" />
                              {item.area}, {item.subcounty}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-4 text-gray-600 font-medium">
                        {CATEGORY_LABELS[item.category] || item.category}
                      </td>

                      {/* Rent */}
                      <td className="p-4 font-bold text-emerald-700 font-poppins whitespace-nowrap">
                        KSh {item.rent.toLocaleString()}
                      </td>

                      {/* Partner */}
                      <td className="p-4 text-gray-700">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                          <div>
                            <div className="font-medium">{item.partner?.companyName || item.partner?.user?.name}</div>
                            <div className="text-xs text-gray-400">{item.partner?.user?.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <div className="flex flex-wrap items-center gap-1">
                          {item.verificationStatus === "VERIFIED" && <span className="badge-success">Verified</span>}
                          {item.verificationStatus === "PENDING" && <span className="badge-warning">Pending</span>}
                          {item.verificationStatus === "REJECTED" && <span className="badge-danger">Rejected</span>}
                          {item.featured && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">
                              <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" /> Featured
                            </span>
                          )}
                          {(containsPhone(item.title) || containsPhone(item.description || "")) && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full" title="Phone number detected in title/description">
                              ⚠ Phone Detected
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Stats */}
                      <td className="p-4 text-gray-500 text-xs">
                        <div className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {item.views} views</div>
                        <div className="mt-0.5">{item._count.leads} leads</div>
                      </td>

                      {/* Actions */}
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1.5">
                          {item.verificationStatus !== "VERIFIED" && (
                            <button
                              onClick={() => updateStatus(item.id, "VERIFIED")}
                              disabled={!!busy}
                              title="Approve"
                              className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors disabled:opacity-50"
                            >
                              {busy && actionLoading === item.id + "VERIFIED"
                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                : <CheckCircle2 className="w-4 h-4" />}
                            </button>
                          )}
                          {item.verificationStatus !== "REJECTED" && (
                            <button
                              onClick={() => updateStatus(item.id, "REJECTED")}
                              disabled={!!busy}
                              title="Reject"
                              className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                            >
                              {busy && actionLoading === item.id + "REJECTED"
                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                : <XCircle className="w-4 h-4" />}
                            </button>
                          )}
                          <button
                            onClick={() => toggleFeatured(item.id, item.featured)}
                            disabled={!!busy}
                            title={item.featured ? "Unfeature" : "Feature"}
                            className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 ${item.featured ? "bg-amber-100 text-amber-600 hover:bg-amber-200" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}
                          >
                            <Star className={`w-4 h-4 ${item.featured ? "fill-amber-500" : ""}`} />
                          </button>
                          <button
                            onClick={() => deleteProperty(item.id, item.title)}
                            disabled={!!busy}
                            title="Delete"
                            className="p-1.5 bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {properties.length === 0 && !loading && (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-gray-400 text-sm">
                      No properties found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
