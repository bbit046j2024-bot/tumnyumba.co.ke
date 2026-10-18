"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search, Filter, CheckCircle2, XCircle, Eye, Star,
  Building2, MapPin, Loader2, RefreshCw, Trash2, ImageOff,
  Video, Play, ExternalLink, ShieldCheck, Check, AlertTriangle
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
  leadFee?: number;
  totalSpaces?: number;
  availableSpaces?: number;
  description?: string;
  verificationStatus: string;
  availabilityStatus: string;
  featured: boolean;
  views: number;
  createdAt: string;
  videoUrl?: string | null;
  videoPublicId?: string | null;
  images: { id?: string; url: string; isPrimary?: boolean }[];
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

  // Edit Lead Fee & Spaces modal state
  const [editModalProp, setEditModalProp] = useState<Property | null>(null);
  const [editLeadFee, setEditLeadFee] = useState<number>(0);
  const [editTotalSpaces, setEditTotalSpaces] = useState<number>(1);
  const [editAvailableSpaces, setEditAvailableSpaces] = useState<number>(1);
  const [savingSettings, setSavingSettings] = useState(false);

  // Review Listing & Media (Safe Video + Images) modal state
  const [reviewModalProp, setReviewModalProp] = useState<Property | null>(null);
  const [selectedReviewMedia, setSelectedReviewMedia] = useState<{ type: "VIDEO" | "IMAGE"; url: string } | null>(null);

  const openReviewModal = (prop: Property) => {
    setReviewModalProp(prop);
    if (prop.videoUrl) {
      setSelectedReviewMedia({ type: "VIDEO", url: prop.videoUrl });
    } else if (prop.images?.[0]?.url) {
      setSelectedReviewMedia({ type: "IMAGE", url: prop.images[0].url });
    } else {
      setSelectedReviewMedia(null);
    }
  };

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

  const openEditModal = (prop: Property) => {
    setEditModalProp(prop);
    setEditLeadFee(prop.category === "HOSTEL" ? 0 : (prop.leadFee || 0));
    setEditTotalSpaces(prop.totalSpaces ?? 1);
    setEditAvailableSpaces(prop.availableSpaces ?? 1);
  };

  const savePropSettings = async () => {
    if (!editModalProp) return;
    setSavingSettings(true);
    try {
      const res = await fetch(`/api/admin/properties/${editModalProp.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadFee: editModalProp.category === "HOSTEL" ? 0 : editLeadFee,
          totalSpaces: editTotalSpaces,
          availableSpaces: editAvailableSpaces,
        }),
      });
      if (res.ok) {
        setProperties((prev) =>
          prev.map((p) =>
            p.id === editModalProp.id
              ? {
                  ...p,
                  leadFee: editModalProp.category === "HOSTEL" ? 0 : editLeadFee,
                  totalSpaces: editTotalSpaces,
                  availableSpaces: editAvailableSpaces,
                }
              : p
          )
        );
        setEditModalProp(null);
      }
    } catch {
      alert("Failed to save settings.");
    } finally {
      setSavingSettings(false);
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
          <p className="page-subtitle">Verify, review, and manage all student rentals listed across CampusKey Mombasa.</p>
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
                  <th className="p-4">Lead Fee & Spaces</th>
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
                            {item.videoUrl && (
                              <button
                                type="button"
                                onClick={() => openReviewModal(item)}
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md hover:bg-emerald-100 transition-colors mt-1"
                                title="Click to inspect uploaded walkthrough video"
                              >
                                <Video className="w-3 h-3 text-emerald-600" /> Walkthrough Video
                              </button>
                            )}
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

                      {/* Lead Fee & Spaces */}
                      <td className="p-4">
                        <div className="space-y-1">
                          {item.category === "HOSTEL" ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                              Hostel (0 KSh Exempt)
                            </span>
                          ) : (
                            <button
                              onClick={() => openEditModal(item)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${
                                item.leadFee && item.leadFee > 0
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                                  : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                              }`}
                            >
                              {item.leadFee && item.leadFee > 0 ? `KSh ${item.leadFee} Fee` : "Free / 0 KSh"} ✎
                            </button>
                          )}
                          <div className="text-[11px] text-gray-500 font-medium">
                            {item.availableSpaces ?? 1} / {item.totalSpaces ?? 1} spaces left
                          </div>
                        </div>
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
                          <button
                            type="button"
                            onClick={() => openReviewModal(item)}
                            title="Inspect Photos & Walkthrough Video"
                            className="p-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
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
                    <td colSpan={8} className="p-12 text-center text-gray-400 text-sm">
                      No properties found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Admin Modal to Edit Lead Fee & Spaces */}
      {editModalProp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-poppins font-bold text-gray-900 text-base">
                Edit Lead Fee & Spaces Configuration
              </h3>
              <button
                onClick={() => setEditModalProp(null)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-gray-500 font-medium">Property Title:</p>
              <p className="text-sm font-bold text-gray-900">{editModalProp.title}</p>
              <p className="text-xs text-primary-700 font-semibold">
                Category: {CATEGORY_LABELS[editModalProp.category] || editModalProp.category}
              </p>
            </div>

            {editModalProp.category === "HOSTEL" ? (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl text-purple-800 text-xs font-semibold">
                ℹ Hostels are automatically zero-rated (0 KSh lead fee). No student payment prompt will be displayed.
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Admin Lead Fee Amount (KSh)
                </label>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={editLeadFee}
                  onChange={(e) => setEditLeadFee(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Set to 0 for Free connection (no M-PESA prompt). If &gt; 0, students must pay this amount via M-PESA to express interest.
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Available Spaces
                </label>
                <input
                  type="number"
                  min="0"
                  value={editAvailableSpaces}
                  onChange={(e) => setEditAvailableSpaces(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Total Capacity
                </label>
                <input
                  type="number"
                  min="1"
                  value={editTotalSpaces}
                  onChange={(e) => setEditTotalSpaces(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditModalProp(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={savePropSettings}
                disabled={savingSettings}
                className="flex-1 py-2.5 bg-primary-700 hover:bg-primary-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-md disabled:opacity-60"
              >
                {savingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Media & Verification Safety Modal */}
      {reviewModalProp && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-5 sm:p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-gray-100 pb-3 gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-poppins font-bold text-gray-900 text-lg">
                    {reviewModalProp.title}
                  </h3>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    reviewModalProp.verificationStatus === "VERIFIED"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : reviewModalProp.verificationStatus === "REJECTED"
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}>
                    {reviewModalProp.verificationStatus}
                  </span>
                  {reviewModalProp.videoUrl && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                      <Video className="w-3 h-3 text-emerald-700" /> Walkthrough Video Included
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5 flex-wrap">
                  <span>{CATEGORY_LABELS[reviewModalProp.category] || reviewModalProp.category}</span>
                  <span>•</span>
                  <span>{reviewModalProp.area}, {reviewModalProp.subcounty}, {reviewModalProp.county}</span>
                  <span>•</span>
                  <span className="font-semibold text-emerald-700">KSh {reviewModalProp.rent.toLocaleString()}/mo</span>
                  <span>•</span>
                  <span>Partner: <strong>{reviewModalProp.partner?.companyName || reviewModalProp.partner?.user?.name}</strong></span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReviewModalProp(null)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1 rounded-lg hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            {/* Moderation Warnings */}
            {(containsPhone(reviewModalProp.title) || containsPhone(reviewModalProp.description || "")) && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-600" />
                <span>
                  <strong>Moderation Alert:</strong> Phone number pattern detected in title or description text. Verify content before approving.
                </span>
              </div>
            )}

            {/* Media Player Showcase */}
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-video max-h-[380px] w-full flex items-center justify-center border border-gray-200 shadow-inner">
                {selectedReviewMedia?.type === "VIDEO" ? (
                  <video
                    src={selectedReviewMedia.url}
                    controls
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain"
                  />
                ) : selectedReviewMedia?.type === "IMAGE" ? (
                  <img
                    src={selectedReviewMedia.url}
                    alt="Property Preview"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-gray-400 text-xs flex flex-col items-center gap-2">
                    <ImageOff className="w-8 h-8 text-gray-600" />
                    <span>No media attached to this property</span>
                  </div>
                )}
              </div>

              {/* Thumbnails to inspect all media */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {reviewModalProp.videoUrl && (
                  <button
                    type="button"
                    onClick={() => setSelectedReviewMedia({ type: "VIDEO", url: reviewModalProp.videoUrl! })}
                    className={`relative w-20 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 flex flex-col items-center justify-center bg-gray-900 text-white transition-all ${
                      selectedReviewMedia?.type === "VIDEO" ? "border-emerald-500 ring-2 ring-emerald-400/30" : "border-transparent opacity-75 hover:opacity-100"
                    }`}
                  >
                    <Play className="w-5 h-5 text-emerald-400 fill-emerald-400" />
                    <span className="text-[9px] font-bold mt-0.5 uppercase tracking-wider text-emerald-300">Video</span>
                  </button>
                )}

                {reviewModalProp.images?.map((img, i) => (
                  <button
                    key={img.id || i}
                    type="button"
                    onClick={() => setSelectedReviewMedia({ type: "IMAGE", url: img.url })}
                    className={`relative w-20 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                      selectedReviewMedia?.type === "IMAGE" && selectedReviewMedia.url === img.url
                        ? "border-primary-600 ring-2 ring-primary-500/30"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img.url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Description Details */}
            {reviewModalProp.description && (
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 text-xs text-gray-700 space-y-1">
                <span className="font-semibold text-gray-900 block">Property Description:</span>
                <p className="whitespace-pre-line leading-relaxed">{reviewModalProp.description}</p>
              </div>
            )}

            {/* Verification & Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-gray-100">
              <a
                href={`/listings/${reviewModalProp.id}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-primary-700 hover:text-primary-800 flex items-center gap-1.5"
              >
                Open Public Listing <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setReviewModalProp(null)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    await updateStatus(reviewModalProp.id, "REJECTED");
                    setReviewModalProp((p) => p ? { ...p, verificationStatus: "REJECTED" } : null);
                  }}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <XCircle className="w-4 h-4" /> Reject Listing
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    await updateStatus(reviewModalProp.id, "VERIFIED");
                    setReviewModalProp((p) => p ? { ...p, verificationStatus: "VERIFIED" } : null);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" /> Verify & Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
