"use client";

import React, { useEffect, useState } from "react";
import { BarChart3, MapPin, TrendingUp, Users, Building2, FileText, Loader2, AlertCircle, Download, CheckCircle2, Clock, XCircle } from "lucide-react";

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

const LEAD_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  CONTACTED: "Contacted",
  BOOKED: "Booked",
  CANCELLED: "Cancelled",
};

const PARTNER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending Review",
  APPROVED: "Approved",
  SUSPENDED: "Suspended",
  REJECTED: "Rejected",
};

type ReportData = {
  totalProperties: number;
  totalStudents: number;
  totalPartners: number;
  totalLeads: number;
  propertiesByCategory: { category: string; _count: { id: number } }[];
  propertiesByArea: { area: string; _count: { id: number } }[];
  propertiesByVerification: { verificationStatus: string; _count: { id: number } }[];
  leadsByStatus: { status: string; _count: { id: number } }[];
  partnersByStatus: { status: string; _count: { id: number } }[];
  recentLeads: {
    id: string;
    status: string;
    createdAt: string;
    property: { title: string; area: string; rent: number };
    student: { name: string; email: string };
  }[];
};

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="w-full bg-gray-100 rounded-full h-2">
      <div className={`h-2 rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function AdminReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/reports")
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(setData)
      .catch(() => setError("Failed to load analytics. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  const downloadCSV = () => {
    if (!data) return;
    const rows = [
      ["Metric", "Value"],
      ["Total Properties", data.totalProperties],
      ["Total Students", data.totalStudents],
      ["Total Partners", data.totalPartners],
      ["Total Leads", data.totalLeads],
      [],
      ["Category", "Count"],
      ...data.propertiesByCategory.map(c => [CATEGORY_LABELS[c.category] ?? c.category, c._count.id]),
      [],
      ["Area", "Count"],
      ...data.propertiesByArea.map(a => [a.area, a._count.id]),
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `campuskey-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const maxCategoryCount = data ? Math.max(...data.propertiesByCategory.map(c => c._count.id), 1) : 1;
  const maxAreaCount = data ? Math.max(...data.propertiesByArea.map(a => a._count.id), 1) : 1;

  const leadStatusIcons: Record<string, React.ReactElement> = {
    PENDING: <Clock className="w-3.5 h-3.5 text-amber-500" />,
    CONTACTED: <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />,
    BOOKED: <CheckCircle2 className="w-3.5 h-3.5 text-[#1F9254]" />,
    CANCELLED: <XCircle className="w-3.5 h-3.5 text-red-400" />,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Analytics & Reports</h1>
          <p className="page-subtitle">
            Real-time platform metrics, housing demand trends, and location analytics.
          </p>
        </div>
        <button
          onClick={downloadCSV}
          disabled={!data}
          className="btn-primary text-xs py-2.5 px-4 flex items-center gap-2 self-start disabled:opacity-50"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 gap-3 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin text-[#1F6B4A]" />
          <span className="text-sm">Loading analytics...</span>
        </div>
      ) : error ? (
        <div className="card p-8 text-center flex flex-col items-center gap-3">
          <AlertCircle className="w-8 h-8 text-red-400" />
          <p className="text-red-600 text-sm">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-primary text-xs py-2 px-4">Retry</button>
        </div>
      ) : data ? (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Properties", value: data.totalProperties, icon: <Building2 className="w-5 h-5" />, bg: "bg-[#EBF5FF]", text: "text-blue-700" },
              { label: "Registered Students", value: data.totalStudents, icon: <Users className="w-5 h-5" />, bg: "bg-[#E4F5EC]", text: "text-[#1F9254]" },
              { label: "Active Partners", value: data.totalPartners, icon: <FileText className="w-5 h-5" />, bg: "bg-[#FDF1DE]", text: "text-amber-700" },
              { label: "Total Leads", value: data.totalLeads, icon: <TrendingUp className="w-5 h-5" />, bg: "bg-[#F3E8FF]", text: "text-purple-700" },
            ].map(kpi => (
              <div key={kpi.label} className="card p-5">
                <div className={`w-10 h-10 rounded-xl ${kpi.bg} ${kpi.text} flex items-center justify-center mb-3`}>
                  {kpi.icon}
                </div>
                <div className={`text-2xl font-bold ${kpi.text}`}>{kpi.value.toLocaleString()}</div>
                <div className="text-xs text-gray-500 mt-0.5">{kpi.label}</div>
              </div>
            ))}
          </div>

          {/* Breakdown Row 1: Category + Area */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* By Category */}
            <div className="card p-6">
              <h3 className="font-poppins font-bold text-base text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#1F6B4A]" /> Properties by Category
              </h3>
              {data.propertiesByCategory.length === 0 ? (
                <p className="text-xs text-gray-400">No data available.</p>
              ) : (
                <div className="space-y-3">
                  {data.propertiesByCategory.map(c => (
                    <div key={c.category} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-gray-700">
                        <span>{CATEGORY_LABELS[c.category] ?? c.category}</span>
                        <span className="text-[#1F6B4A]">{c._count.id} listing{c._count.id !== 1 ? "s" : ""}</span>
                      </div>
                      <ProgressBar value={c._count.id} max={maxCategoryCount} color="bg-[#1F6B4A]" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* By Area */}
            <div className="card p-6">
              <h3 className="font-poppins font-bold text-base text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#1F6B4A]" /> Popular Student Areas
              </h3>
              {data.propertiesByArea.length === 0 ? (
                <p className="text-xs text-gray-400">No data available.</p>
              ) : (
                <div className="space-y-3">
                  {data.propertiesByArea.map(a => (
                    <div key={a.area} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-gray-700">
                        <span>{a.area}</span>
                        <span className="text-[#1F6B4A]">{a._count.id} listing{a._count.id !== 1 ? "s" : ""}</span>
                      </div>
                      <ProgressBar value={a._count.id} max={maxAreaCount} color="bg-emerald-500" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Breakdown Row 2: Verification + Leads + Partners */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Verification Status */}
            <div className="card p-6">
              <h3 className="font-poppins font-bold text-sm text-gray-900 mb-4">Property Verification</h3>
              <div className="space-y-3">
                {data.propertiesByVerification.map(v => (
                  <div key={v.verificationStatus} className="flex items-center justify-between text-sm">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      v.verificationStatus === "VERIFIED" ? "badge-success" :
                      v.verificationStatus === "PENDING" ? "badge-warning" : "badge-danger"
                    }`}>{v.verificationStatus}</span>
                    <span className="font-bold text-gray-800">{v._count.id}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Lead Status */}
            <div className="card p-6">
              <h3 className="font-poppins font-bold text-sm text-gray-900 mb-4">Leads by Status</h3>
              <div className="space-y-3">
                {data.leadsByStatus.length === 0 ? (
                  <p className="text-xs text-gray-400">No leads yet.</p>
                ) : data.leadsByStatus.map(l => (
                  <div key={l.status} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                      {leadStatusIcons[l.status]}
                      {LEAD_STATUS_LABELS[l.status] ?? l.status}
                    </span>
                    <span className="font-bold text-gray-800">{l._count.id}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Partner Status */}
            <div className="card p-6">
              <h3 className="font-poppins font-bold text-sm text-gray-900 mb-4">Partners by Status</h3>
              <div className="space-y-3">
                {data.partnersByStatus.map(p => (
                  <div key={p.status} className="flex items-center justify-between text-sm">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      p.status === "APPROVED" ? "badge-success" :
                      p.status === "PENDING" ? "badge-warning" :
                      p.status === "SUSPENDED" ? "badge-danger" : "bg-gray-100 text-gray-600"
                    }`}>{PARTNER_STATUS_LABELS[p.status] ?? p.status}</span>
                    <span className="font-bold text-gray-800">{p._count.id}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Leads Table */}
          <div className="card p-6">
            <h3 className="font-poppins font-bold text-base text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#1F6B4A]" /> Recent Lead Activity
            </h3>
            {data.recentLeads.length === 0 ? (
              <p className="text-xs text-gray-400">No leads recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left text-xs text-gray-500 font-semibold pb-3">Student</th>
                      <th className="text-left text-xs text-gray-500 font-semibold pb-3">Property</th>
                      <th className="text-left text-xs text-gray-500 font-semibold pb-3">Area</th>
                      <th className="text-left text-xs text-gray-500 font-semibold pb-3">Rent</th>
                      <th className="text-left text-xs text-gray-500 font-semibold pb-3">Status</th>
                      <th className="text-left text-xs text-gray-500 font-semibold pb-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.recentLeads.map(lead => (
                      <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 pr-4">
                          <div className="font-medium text-gray-800 text-xs">{lead.student.name}</div>
                          <div className="text-gray-400 text-xs">{lead.student.email}</div>
                        </td>
                        <td className="py-3 pr-4 text-xs text-gray-700 max-w-[160px] truncate">{lead.property.title}</td>
                        <td className="py-3 pr-4 text-xs text-gray-500">{lead.property.area}</td>
                        <td className="py-3 pr-4 text-xs font-semibold text-[#1F6B4A]">KSh {lead.property.rent.toLocaleString()}</td>
                        <td className="py-3 pr-4">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                            lead.status === "BOOKED" ? "badge-success" :
                            lead.status === "PENDING" ? "badge-warning" :
                            lead.status === "CANCELLED" ? "badge-danger" : "bg-blue-50 text-blue-700"
                          }`}>{LEAD_STATUS_LABELS[lead.status] ?? lead.status}</span>
                        </td>
                        <td className="py-3 text-xs text-gray-400">
                          {new Date(lead.createdAt).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
