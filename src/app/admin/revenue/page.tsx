"use client";

import { useEffect, useState } from "react";
import {
  DollarSign, ArrowUpRight, Download, CheckCircle2, Clock,
  Loader2, AlertCircle, XCircle, FileText, Users, TrendingUp
} from "lucide-react";

type LeadFee = { id: string; paid: boolean; amount: number };

type Invoice = {
  id: string;
  status: string;
  totalLeads: number;
  totalAmount: number;
  periodStart: string;
  periodEnd: string;
  dueDate: string;
  createdAt: string;
  partner: {
    companyName: string;
    user: { name: string; email: string };
  };
  payment: {
    amount: number;
    method: string;
    transactionRef: string | null;
    paidAt: string;
  } | null;
  leadFees: LeadFee[];
};

type RevenueData = {
  invoices: Invoice[];
  totalLeads: number;
  totalRevenue: number;
  paidLeadsCount: number;
  pendingRevenue: number;
  unpaidLeadsCount: number;
};

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  PAID:    { label: "Paid",    cls: "badge-success" },
  UNPAID:  { label: "Unpaid",  cls: "badge-warning" },
  OVERDUE: { label: "Overdue", cls: "badge-danger" },
};

function fmt(n: number) {
  return `KSh ${n.toLocaleString()}`;
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminRevenuePage() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PAID" | "UNPAID" | "OVERDUE">("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/revenue")
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setData)
      .catch(() => setError("Failed to load revenue data. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  const downloadCSV = () => {
    if (!data) return;
    const rows = [
      ["Invoice ID", "Partner", "Company", "Leads", "Amount (KSh)", "Status", "Due Date", "Payment Ref", "Paid At"],
      ...data.invoices.map(inv => [
        inv.id,
        inv.partner.user.name,
        inv.partner.companyName,
        inv.totalLeads,
        inv.totalAmount,
        inv.status,
        fmtDate(inv.dueDate),
        inv.payment?.transactionRef ?? "-",
        inv.payment ? fmtDate(inv.payment.paidAt) : "-",
      ]),
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `campuskey-revenue-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = (data?.invoices ?? []).filter(inv => {
    const matchStatus = statusFilter === "ALL" || inv.status === statusFilter;
    const matchSearch =
      inv.partner.companyName.toLowerCase().includes(search.toLowerCase()) ||
      inv.partner.user.name.toLowerCase().includes(search.toLowerCase()) ||
      inv.id.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Revenue & Lead Fee Invoices</h1>
          <p className="page-subtitle">
            Track lead generation fees (KSh 50 per student connection) and partner billing.
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
          <span className="text-sm">Loading revenue data...</span>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card p-6">
              <div className="w-10 h-10 rounded-xl bg-[#E4F5EC] text-[#1F9254] flex items-center justify-center mb-3">
                <DollarSign className="w-5 h-5" />
              </div>
              <div className="text-xs font-semibold text-gray-500">Total Revenue Collected</div>
              <div className="font-bold text-2xl text-[#1F9254] mt-1">{fmt(data.totalRevenue)}</div>
              <div className="text-xs text-[#1F9254] mt-1 flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" /> {data.paidLeadsCount} leads paid
              </div>
            </div>

            <div className="card p-6">
              <div className="w-10 h-10 rounded-xl bg-[#FDF1DE] text-amber-700 flex items-center justify-center mb-3">
                <Clock className="w-5 h-5" />
              </div>
              <div className="text-xs font-semibold text-gray-500">Pending Revenue</div>
              <div className="font-bold text-2xl text-amber-600 mt-1">{fmt(data.pendingRevenue)}</div>
              <div className="text-xs text-gray-500 mt-1">{data.unpaidLeadsCount} unpaid leads</div>
            </div>

            <div className="card p-6">
              <div className="w-10 h-10 rounded-xl bg-[#EBF5FF] text-blue-700 flex items-center justify-center mb-3">
                <Users className="w-5 h-5" />
              </div>
              <div className="text-xs font-semibold text-gray-500">Total Leads Generated</div>
              <div className="font-bold text-2xl text-blue-700 mt-1">{data.totalLeads.toLocaleString()}</div>
              <div className="text-xs text-gray-500 mt-1">All-time student connections</div>
            </div>

            <div className="card p-6">
              <div className="w-10 h-10 rounded-xl bg-[#F3E8FF] text-purple-700 flex items-center justify-center mb-3">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="text-xs font-semibold text-gray-500">Lead Fee Rate</div>
              <div className="font-bold text-2xl text-gray-900 mt-1">KSh 50 / lead</div>
              <div className="text-xs text-gray-500 mt-1">Billed per successful connection</div>
            </div>
          </div>

          {/* Invoices Table */}
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
              <h3 className="font-poppins font-bold text-base text-gray-900">Partner Invoices</h3>
              <div className="flex flex-wrap gap-2 items-center">
                {/* Search */}
                <input
                  type="text"
                  placeholder="Search partner or invoice..."
                  className="input text-xs py-1.5 px-3 w-48"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                {/* Status filter */}
                {(["ALL", "PAID", "UNPAID", "OVERDUE"] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                      statusFilter === s
                        ? "bg-[#1F6B4A] text-white border-[#1F6B4A]"
                        : "bg-white text-gray-600 border-gray-200 hover:border-[#1F6B4A]"
                    }`}
                  >
                    {s === "ALL" ? "All" : STATUS_MAP[s].label}
                  </button>
                ))}
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="py-16 text-center flex flex-col items-center gap-3 text-gray-400">
                <FileText className="w-9 h-9" />
                <p className="text-sm">
                  {data.invoices.length === 0
                    ? "No invoices have been generated yet."
                    : "No invoices match your current filters."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase font-poppins">
                      <th className="p-4">Invoice ID</th>
                      <th className="p-4">Partner</th>
                      <th className="p-4">Period</th>
                      <th className="p-4">Leads</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Due Date</th>
                      <th className="p-4">Payment Ref</th>
                      <th className="p-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered.map(inv => (
                      <tr key={inv.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="p-4 font-mono text-xs font-semibold text-gray-700 whitespace-nowrap">
                          {inv.id.slice(0, 12)}...
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-gray-900 text-xs">{inv.partner.companyName}</div>
                          <div className="text-gray-400 text-xs">{inv.partner.user.email}</div>
                        </td>
                        <td className="p-4 text-xs text-gray-500 whitespace-nowrap">
                          {fmtDate(inv.periodStart)} – {fmtDate(inv.periodEnd)}
                        </td>
                        <td className="p-4 font-semibold text-gray-700 text-xs">{inv.totalLeads}</td>
                        <td className="p-4 font-bold text-[#1F6B4A] text-xs whitespace-nowrap">{fmt(inv.totalAmount)}</td>
                        <td className="p-4 text-xs text-gray-500 whitespace-nowrap">{fmtDate(inv.dueDate)}</td>
                        <td className="p-4 text-xs font-mono text-gray-500">
                          {inv.payment?.transactionRef ?? (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <span className={STATUS_MAP[inv.status]?.cls ?? "bg-gray-100 text-gray-500 text-xs rounded-full px-2 py-0.5"}>
                            {STATUS_MAP[inv.status]?.label ?? inv.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Empty state if no invoices at all */}
          {data.invoices.length === 0 && (
            <div className="card p-10 text-center">
              <FileText className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-700 mb-1">No invoices yet</h3>
              <p className="text-sm text-gray-400 max-w-sm mx-auto">
                Invoices are generated automatically when lead fees are billed to partners.
                Once partners start generating leads, invoices will appear here.
              </p>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
