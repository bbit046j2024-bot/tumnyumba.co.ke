"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Building2, Mail, Phone, CheckCircle, Ban, Loader2, RefreshCw, Clock, Trash2 } from "lucide-react";

interface Partner {
  id: string;
  companyName: string;
  licenseNumber: string;
  status: string;
  createdAt: string;
  user: { name: string; email: string; phone: string | null };
  _count: { properties: number };
}

const STATUS_STYLES: Record<string, string> = {
  VERIFIED: "badge-success",
  PENDING: "badge-warning",
  SUSPENDED: "badge-danger",
  REJECTED: "badge-danger",
};

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  const fetchPartners = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/partners?${params}`);
      const data = await res.json();
      if (Array.isArray(data)) setPartners(data);
      else setError("Failed to load partners.");
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const t = setTimeout(fetchPartners, 300);
    return () => clearTimeout(t);
  }, [fetchPartners]);

  const updateStatus = async (id: string, status: string) => {
    setActionLoading(id + status);
    try {
      const res = await fetch(`/api/admin/partners/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setPartners((prev) => prev.map((p) => p.id === id ? { ...p, status } : p));
      }
    } finally {
      setActionLoading(null);
    }
  };

  const deletePartner = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete partner "${name}"? This action cannot be undone and will delete all their listings.`)) return;

    setActionLoading(id + "DELETE");
    try {
      const res = await fetch(`/api/admin/partners/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPartners((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert("Failed to delete partner account.");
      }
    } catch {
      alert("Error connecting to server.");
    } finally {
      setActionLoading(null);
    }
  };

  const counts = {
    ALL: partners.length,
    PENDING: partners.filter((p) => p.status === "PENDING").length,
    VERIFIED: partners.filter((p) => p.status === "VERIFIED").length,
    SUSPENDED: partners.filter((p) => p.status === "SUSPENDED").length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Partner Management</h1>
          <p className="page-subtitle">Manage all property partners registered on CampusKey Mombasa.</p>
        </div>
        <button onClick={fetchPartners} className="btn-secondary flex items-center gap-2 text-sm self-start">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["ALL", "PENDING", "VERIFIED", "SUSPENDED"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              statusFilter === s
                ? s === "PENDING" ? "bg-amber-500 text-white border-amber-500"
                  : s === "VERIFIED" ? "bg-emerald-600 text-white border-emerald-600"
                  : s === "SUSPENDED" ? "bg-red-500 text-white border-red-500"
                  : "bg-primary-700 text-white border-primary-700"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
            }`}
          >
            {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()} ({counts[s]})
          </button>
        ))}
      </div>

      <div className="card p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by company, name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10 text-sm"
          />
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>}

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
                  <th className="p-4">Company</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">License</th>
                  <th className="p-4">Listings</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {partners.map((p) => {
                  const busy = actionLoading?.startsWith(p.id);
                  return (
                    <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-4 h-4 text-primary-700" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 font-poppins">{p.companyName}</div>
                            <div className="text-xs text-gray-400">{p.user.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-gray-600 text-xs space-y-0.5">
                        <div className="flex items-center gap-1"><Mail className="w-3 h-3 text-gray-400" /> {p.user.email}</div>
                        {p.user.phone && <div className="flex items-center gap-1"><Phone className="w-3 h-3 text-gray-400" /> {p.user.phone}</div>}
                      </td>
                      <td className="p-4 text-gray-600 font-mono text-xs">{p.licenseNumber || "—"}</td>
                      <td className="p-4 font-bold text-primary-700">{p._count.properties}</td>
                      <td className="p-4">
                        <span className={STATUS_STYLES[p.status] || "badge-warning"}>
                          {p.status.charAt(0) + p.status.slice(1).toLowerCase()}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1.5">
                          {p.status !== "VERIFIED" && (
                            <button
                              onClick={() => updateStatus(p.id, "VERIFIED")}
                              disabled={!!busy}
                              title="Approve"
                              className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors disabled:opacity-50"
                            >
                              {busy && actionLoading === p.id + "VERIFIED"
                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                : <CheckCircle className="w-4 h-4" />}
                            </button>
                          )}
                          {p.status !== "SUSPENDED" && (
                            <button
                              onClick={() => updateStatus(p.id, "SUSPENDED")}
                              disabled={!!busy}
                              title="Suspend"
                              className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                            >
                              {busy && actionLoading === p.id + "SUSPENDED"
                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                : <Ban className="w-4 h-4" />}
                            </button>
                          )}
                          {p.status !== "PENDING" && (
                            <button
                              onClick={() => updateStatus(p.id, "PENDING")}
                              disabled={!!busy}
                              title="Set to Pending"
                              className="p-1.5 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors disabled:opacity-50"
                            >
                              <Clock className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => deletePartner(p.id, p.companyName)}
                            disabled={!!busy}
                            title="Delete Partner Account"
                            className="p-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors disabled:opacity-50 ml-1"
                          >
                            {busy && actionLoading === p.id + "DELETE" ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {partners.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-gray-400 text-sm">No partners found.</td>
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
