"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Building2,
  Mail,
  Phone,
  CheckCircle,
  Ban,
  Loader2,
  RefreshCw,
  Clock,
  Trash2,
  CreditCard,
  AlertTriangle,
  X,
  Save,
  ShieldAlert,
} from "lucide-react";

interface Partner {
  id: string;
  companyName: string;
  licenseNumber: string;
  status: string;
  paymentRouting: "DIRECT" | "SPLIT";
  commissionType: "PERCENTAGE" | "FIXED";
  commissionValue: number;
  payoutPhone: string | null;
  mpesaShortcode: string | null;
  createdAt: string;
  user: { name: string; email: string; phone: string | null };
  _count: { properties: number };
}

const STATUS_STYLES: Record<string, string> = {
  APPROVED: "badge-success",
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

  // Payment settings modal state
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [routingMode, setRoutingMode] = useState<"DIRECT" | "SPLIT">("SPLIT");
  const [commissionType, setCommissionType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
  const [commissionValue, setCommissionValue] = useState<number>(10);
  const [payoutPhone, setPayoutPhone] = useState<string>("");
  const [shortcode, setShortcode] = useState<string>("");
  const [passkey, setPasskey] = useState<string>("");
  const [consumerKey, setConsumerKey] = useState<string>("");
  const [consumerSecret, setConsumerSecret] = useState<string>("");
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

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
        setPartners((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
      }
    } finally {
      setActionLoading(null);
    }
  };

  const deletePartner = async (id: string, name: string) => {
    if (
      !confirm(
        `Are you sure you want to permanently delete partner "${name}"? This action cannot be undone and will delete all their listings.`
      )
    )
      return;

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

  const openPaymentSettings = (p: Partner) => {
    setSelectedPartner(p);
    setRoutingMode(p.paymentRouting || "SPLIT");
    setCommissionType(p.commissionType || "PERCENTAGE");
    setCommissionValue(Number(p.commissionValue) || 10);
    setPayoutPhone(p.payoutPhone || p.user.phone || "");
    setShortcode(p.mpesaShortcode || "");
    setPasskey("");
    setConsumerKey("");
    setConsumerSecret("");
    setSettingsSuccess(false);
  };

  const savePaymentSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartner) return;

    setSavingSettings(true);
    try {
      const payload: any = {
        paymentRouting: routingMode,
        commissionType,
        commissionValue: Number(commissionValue),
        payoutPhone,
      };

      if (routingMode === "DIRECT") {
        payload.mpesaShortcode = shortcode;
        if (passkey) payload.mpesaPasskey = passkey;
        if (consumerKey) payload.mpesaConsumerKey = consumerKey;
        if (consumerSecret) payload.mpesaConsumerSecret = consumerSecret;
      }

      const res = await fetch(`/api/admin/partners/${selectedPartner.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const updated = await res.json();
        setPartners((prev) =>
          prev.map((p) =>
            p.id === selectedPartner.id
              ? {
                  ...p,
                  paymentRouting: updated.paymentRouting,
                  commissionType: updated.commissionType,
                  commissionValue: updated.commissionValue,
                  payoutPhone: updated.payoutPhone,
                  mpesaShortcode: updated.mpesaShortcode,
                }
              : p
          )
        );
        setSettingsSuccess(true);
        setTimeout(() => setSelectedPartner(null), 1200);
      } else {
        alert("Failed to update payment settings.");
      }
    } catch {
      alert("Network error saving settings.");
    } finally {
      setSavingSettings(false);
    }
  };

  const counts: Record<string, number> = {
    ALL: partners.length,
    PENDING: partners.filter((p) => p.status === "PENDING").length,
    VERIFIED: partners.filter((p) => p.status === "VERIFIED" || p.status === "APPROVED").length,
    SUSPENDED: partners.filter((p) => p.status === "SUSPENDED").length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Partner Management</h1>
          <p className="page-subtitle">Manage partner accounts, verification, and M-Pesa payment routing.</p>
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
                ? s === "PENDING"
                  ? "bg-amber-500 text-white border-amber-500"
                  : s === "VERIFIED"
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : s === "SUSPENDED"
                  ? "bg-red-500 text-white border-red-500"
                  : "bg-primary-700 text-white border-primary-700"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
            }`}
          >
            {s === "ALL" ? "All" : s === "VERIFIED" ? "Verified" : s.charAt(0) + s.slice(1).toLowerCase()} ({counts[s] ?? 0})
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
                  <th className="p-4">Routing Mode</th>
                  <th className="p-4">Commission</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {partners.map((p) => {
                  const busy = actionLoading?.startsWith(p.id);
                  const isSplit = p.paymentRouting === "SPLIT";
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
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                            isSplit
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-purple-50 text-purple-700 border border-purple-200"
                          }`}
                        >
                          <CreditCard className="w-3 h-3" />
                          {p.paymentRouting || "SPLIT"}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-xs">
                        {isSplit ? (
                          <span className="text-gray-900 font-semibold">
                            {p.commissionValue ?? 10}
                            {p.commissionType === "FIXED" ? " KSh" : "%"}
                          </span>
                        ) : (
                          <span className="text-amber-600 font-medium">0% (Direct Till)</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={STATUS_STYLES[p.status] || (p.status === "APPROVED" || p.status === "VERIFIED" ? "badge-success" : "badge-warning")}>
                          {p.status === "APPROVED" || p.status === "VERIFIED" ? "Verified" : p.status.charAt(0) + p.status.slice(1).toLowerCase()}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Payment Settings button */}
                          <button
                            onClick={() => openPaymentSettings(p)}
                            title="Payment & Commission Settings"
                            className="p-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>

                          {p.status !== "VERIFIED" && p.status !== "APPROVED" && (
                            <button
                              onClick={() => updateStatus(p.id, "VERIFIED")}
                              disabled={!!busy}
                              title="Verify"
                              className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors disabled:opacity-50"
                            >
                              {busy && actionLoading === p.id + "VERIFIED" ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                            </button>
                          )}
                          {p.status !== "SUSPENDED" && (
                            <button
                              onClick={() => updateStatus(p.id, "SUSPENDED")}
                              disabled={!!busy}
                              title="Suspend"
                              className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                            >
                              {busy && actionLoading === p.id + "SUSPENDED" ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Ban className="w-4 h-4" />
                              )}
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
                    <td colSpan={6} className="p-12 text-center text-gray-400 text-sm">
                      No partners found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Settings Modal */}
      {selectedPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 border border-gray-100 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-lg font-poppins text-gray-900">M-Pesa Payment Settings</h3>
                <p className="text-xs text-gray-500">{selectedPartner.companyName}</p>
              </div>
              <button
                onClick={() => setSelectedPartner(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={savePaymentSettings} className="space-y-4 text-sm">
              {/* Mode Toggle */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Payment Routing Mode</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRoutingMode("SPLIT")}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      routingMode === "SPLIT"
                        ? "border-[#1F6B4A] bg-[#E4F5EC] text-[#1F6B4A] font-semibold ring-2 ring-[#1F6B4A]/20"
                        : "border-gray-200 hover:border-gray-300 text-gray-600"
                    }`}
                  >
                    <div className="font-bold text-sm">SPLIT (Collect & Disburse)</div>
                    <div className="text-xs mt-1 opacity-80">
                      Paid to CampusKey Paybill, platform commission deducted, partner disbursed via B2C.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRoutingMode("DIRECT")}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      routingMode === "DIRECT"
                        ? "border-purple-600 bg-purple-50 text-purple-900 font-semibold ring-2 ring-purple-600/20"
                        : "border-gray-200 hover:border-gray-300 text-gray-600"
                    }`}
                  >
                    <div className="font-bold text-sm">DIRECT (Partner Till)</div>
                    <div className="text-xs mt-1 opacity-80">
                      Paid straight to partner&apos;s own M-Pesa Shortcode.
                    </div>
                  </button>
                </div>
              </div>

              {/* Requirement F8 Banner */}
              {routingMode === "DIRECT" && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3 text-amber-800">
                  <ShieldAlert className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5" />
                  <div className="text-xs leading-relaxed">
                    <strong>Important Notice:</strong> For DIRECT partners, payments go straight to the partner&apos;s own
                    till/paybill. <strong>No automatic platform commission can be deducted</strong>. This is a hard
                    Safaricom Daraja API limitation.
                  </div>
                </div>
              )}

              {/* SPLIT Mode Settings */}
              {routingMode === "SPLIT" && (
                <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Commission Type</label>
                      <select
                        value={commissionType}
                        onChange={(e) => setCommissionType(e.target.value as any)}
                        className="input text-xs"
                      >
                        <option value="PERCENTAGE">Percentage (%)</option>
                        <option value="FIXED">Fixed Amount (KSh)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Commission Value ({commissionType === "PERCENTAGE" ? "%" : "KSh"})
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={commissionValue}
                        onChange={(e) => setCommissionValue(Number(e.target.value))}
                        className="input text-xs"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Partner M-Pesa Payout Phone (B2C)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 0712345678"
                      value={payoutPhone}
                      onChange={(e) => setPayoutPhone(e.target.value)}
                      className="input text-xs"
                      required
                    />
                    <p className="text-[11px] text-gray-400 mt-1">
                      Partner receives their net share automatically at this phone number upon each confirmed payment.
                    </p>
                  </div>
                </div>
              )}

              {/* DIRECT Mode Settings (Encrypted) */}
              {routingMode === "DIRECT" && (
                <div className="space-y-3 bg-purple-50/50 p-4 rounded-xl border border-purple-100">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Partner M-Pesa Shortcode</label>
                    <input
                      type="text"
                      placeholder="e.g. 174379"
                      value={shortcode}
                      onChange={(e) => setShortcode(e.target.value)}
                      className="input text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Online Passkey (Encrypted at Rest)
                    </label>
                    <input
                      type="password"
                      placeholder={selectedPartner.mpesaShortcode ? "•••••••••••• (Leave blank to keep existing)" : "Enter Daraja Passkey"}
                      value={passkey}
                      onChange={(e) => setPasskey(e.target.value)}
                      className="input text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Consumer Key</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={consumerKey}
                        onChange={(e) => setConsumerKey(e.target.value)}
                        className="input text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Consumer Secret</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={consumerSecret}
                        onChange={(e) => setConsumerSecret(e.target.value)}
                        className="input text-xs"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-purple-700">
                    🔒 All credentials are encrypted using AES-256-GCM before database storage.
                  </p>
                </div>
              )}

              {settingsSuccess && (
                <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl p-2.5 text-xs text-center font-medium">
                  ✓ Payment settings saved successfully!
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSelectedPartner(null)}
                  className="btn-secondary text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
                >
                  {savingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Payment Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
