"use client";

import { useState, useEffect, useCallback } from "react";
import { CheckCircle2, XCircle, Building2, Mail, Phone, FileText, Loader2, RefreshCw, Clock } from "lucide-react";

interface PartnerApplication {
  id: string;
  companyName: string;
  licenseNumber: string;
  businessPermitUrl: string | null;
  status: string;
  createdAt: string;
  user: { name: string; email: string; phone: string | null };
}

export default function AdminApplicationsPage() {
  const [apps, setApps] = useState<PartnerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  const fetchApps = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/partners?status=PENDING");
      const data = await res.json();
      if (Array.isArray(data)) setApps(data);
      else setError("Failed to load applications.");
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchApps(); }, [fetchApps]);

  const handleAction = async (id: string, status: string) => {
    setActionLoading(id + status);
    try {
      const res = await fetch(`/api/admin/partners/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) setApps((prev) => prev.filter((a) => a.id !== id));
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Partner Applications</h1>
          <p className="page-subtitle">Review and approve new partner registration requests.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
            <Clock className="w-3.5 h-3.5 inline mr-1" />{apps.length} Pending
          </span>
          <button onClick={fetchApps} className="btn-secondary flex items-center gap-2 text-sm">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>}

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-7 h-7 animate-spin text-primary-600" />
          </div>
        ) : apps.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-300" />
            <p className="font-semibold text-gray-500">All applications reviewed!</p>
            <p className="text-xs mt-1">No pending partner applications at the moment.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {apps.map((app) => {
              const busy = actionLoading?.startsWith(app.id);
              return (
                <div key={app.id} className="p-5 hover:bg-gray-50/50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5 text-primary-700" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 font-poppins">{app.companyName}</div>
                        <div className="text-sm text-gray-500 mt-0.5">{app.user.name}</div>
                        <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{app.user.email}</span>
                          {app.user.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{app.user.phone}</span>}
                          {app.licenseNumber && (
                            <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-600">{app.licenseNumber}</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 mt-1.5">
                          Applied: {new Date(app.createdAt).toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" })}
                        </div>
                        {app.businessPermitUrl && (
                          <a
                            href={app.businessPermitUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary-600 hover:underline mt-1.5"
                          >
                            <FileText className="w-3.5 h-3.5" /> View Business Permit
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 md:flex-col md:items-end">
                      <button
                        onClick={() => handleAction(app.id, "APPROVED")}
                        disabled={!!busy}
                        className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {busy && actionLoading === app.id + "APPROVED"
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <CheckCircle2 className="w-3.5 h-3.5" />}
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(app.id, "REJECTED")}
                        disabled={!!busy}
                        className="btn-secondary text-xs px-4 py-2 flex items-center gap-1.5 text-red-600 border-red-200 hover:bg-red-50 disabled:opacity-50"
                      >
                        {busy && actionLoading === app.id + "REJECTED"
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <XCircle className="w-3.5 h-3.5" />}
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
