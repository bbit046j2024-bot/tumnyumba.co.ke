"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  PlusCircle, Search, Home, MapPin, Loader2, Eye,
  ToggleLeft, ToggleRight, Trash2
} from "lucide-react";

interface Property {
  id: string;
  title: string;
  area: string;
  subcounty: string;
  rent: number;
  category: string;
  availabilityStatus: string;
  verificationStatus: string;
  views: number;
  images: { url: string; isPrimary: boolean }[];
  _count: { leads: number };
}

const categoryLabels: Record<string, string> = {
  SINGLE_ROOM: "Single Room", BEDSITTER: "Bedsitter", STUDIO: "Studio", ONE_BED: "1 Bedroom",
  TWO_BED: "2 Bedroom", HOSTEL: "Hostel", SHARED_ROOM: "Shared Room", BNB: "AirBnB / BNB",
};

export default function PartnerPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/partner/properties");
      const data = await res.json();
      if (Array.isArray(data)) setProperties(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const toggleStatus = async (id: string, currentStatus: string) => {
    setTogglingId(id);
    const newStatus = currentStatus === "AVAILABLE" ? "TAKEN" : "AVAILABLE";
    try {
      const res = await fetch(`/api/partner/properties/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availabilityStatus: newStatus }),
      });
      if (res.ok) {
        setProperties((prev) =>
          prev.map((p) => p.id === id ? { ...p, availabilityStatus: newStatus } : p)
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTogglingId(null);
    }
  };

  const deleteProperty = async (id: string) => {
    if (!confirm("Are you sure you want to delete this listing? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/partner/properties/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProperties((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = properties.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.area.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">My Listed Properties</h1>
          <p className="page-subtitle">Manage your student housing listings, availability, and leads.</p>
        </div>
        <Link href="/partner/properties/add" className="btn-primary flex items-center gap-2 self-start">
          <PlusCircle className="w-5 h-5" /> Add Property
        </Link>
      </div>

      <div className="card p-4 flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search property title or area..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10 text-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Home className="w-12 h-12 mx-auto mb-3 text-gray-200" />
          <p className="font-poppins font-semibold text-gray-600">
            {properties.length === 0 ? "No listings yet" : "No results found"}
          </p>
          {properties.length === 0 && (
            <Link href="/partner/properties/add" className="btn-primary mt-4 text-sm">
              Add Your First Property
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((item) => (
            <div key={item.id} className="card p-6 flex flex-col justify-between space-y-4">
              {/* Image thumbnail */}
              {item.images[0]?.url && (
                <div className="relative h-40 rounded-xl overflow-hidden bg-gray-100">
                  <Image src={item.images[0].url} alt={item.title} fill className="object-cover" />
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-poppins font-bold text-lg text-gray-900">{item.title}</h3>
                  <span className={item.availabilityStatus === "AVAILABLE" ? "badge-success" : "badge-warning"}>
                    {item.availabilityStatus}
                  </span>
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-primary-600" /> {item.area}, {item.subcounty}
                </div>
                <div className="flex items-center gap-4 text-sm pt-1">
                  <span className="font-bold text-emerald-700 font-poppins">
                    KSh {item.rent.toLocaleString()} <span className="text-xs font-normal text-gray-500">/ mo</span>
                  </span>
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md font-medium">
                    {categoryLabels[item.category] || item.category}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${item.verificationStatus === "VERIFIED" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    {item.verificationStatus}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-xs text-gray-500">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> <strong className="text-gray-900">{item.views}</strong></span>
                  <span>•</span>
                  <span><strong className="text-primary-700">{item._count.leads}</strong> Leads</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleStatus(item.id, item.availabilityStatus)}
                    disabled={togglingId === item.id}
                    className="btn-ghost text-xs border border-gray-200 py-1.5 px-3 flex items-center gap-1"
                  >
                    {togglingId === item.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : item.availabilityStatus === "AVAILABLE" ? (
                      <ToggleRight className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <ToggleLeft className="w-3.5 h-3.5 text-amber-500" />
                    )}
                    Mark {item.availabilityStatus === "AVAILABLE" ? "Taken" : "Available"}
                  </button>
                  <button
                    onClick={() => deleteProperty(item.id)}
                    disabled={deletingId === item.id}
                    className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-all"
                  >
                    {deletingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
