"use client";

import { useEffect, useState } from "react";
import {
  DollarSign, ArrowUpRight, Users, CheckCircle2, Clock,
  Download, FileText, Loader2, AlertCircle, XCircle, ShieldCheck
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
  payment: {
    amount: number;
    method: string;
    transactionRef: string | null;
    paidAt: string;
  } | null;
  leadFees: LeadFee[];
};

type RevenueData = {
  partner: { companyName: string; status: string };
  invoices: Invoice[];
  totalLeads: number;
  totalPaid: number;
  paidLeadsCount: number;
  pendingAmount: number;
  unpaidLeadsCount: number;
};

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  PAID:    { label: "Paid",    cls: "badge-success" },
  UNPAID:  { label: "Unpaid",  cls: "badge-warning" },
  OVERDUE: { label: "Overdue", cls: "badge-danger" },
};

const ACCOUNT_STATUS: Record<string, { label: string; icon: React.ReactNode; cls: string }> = {
  APPROVED:  { label: "Active – In Good Standing", icon: <ShieldCheck className="w-4 h-4" />, cls: "text-[#1F9254]" },
  PENDING:   { label: "Pending Review",             icon: <Clock className="w-4 h-4" />,       cls: "text-amber-600" },
  SUSPENDED: { label: "Suspended",                  icon: <XCircle className="w-4 h-4" />,     cls: "text-red-500" },
  REJECTED:  { label: "Rejected",                   icon: <XCircle className="w-4 h-4" />,     cls: "text-red-500" },
};

function fmt(n: number) {
  return `KSh ${n.toLocaleString()}`;
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
}

export default function PartnerRevenuePage() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/partner/revenue")
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setData)
      .catch(() => setError("Failed to load revenue data. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  const downloadCSV = () => {
    if (!data) return;
    const rows = [
      ["Invoice ID", "Period Start", "Period End", "Leads", "Amount (KSh)", "Status", "Due Date", "Payment Ref", "Paid At"],
      ...data.invoices.map(inv => [
        inv.id,
        fmtDate(inv.periodStart),
        fmtDate(inv.periodEnd),
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
    a.download = `revenue-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const accountInfo = data ? (ACCOUNT_STATUS[data.partner.status] ?? ACCOUNT_STATUS.PENDING) : null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Earnings & Lead Invoices</h1>
          <p className="page-subtitle">
            Track lead generation fees and review monthly invoices
            {data?.partner.companyName ? ` for ${data.partner.companyName}` : ""}.
          </p>
        </div>
        <button
          onClick={downloadCSV}
          disabled={!data || data.invoices.length === 0}
          className="btn-primary text-xs py-2.5 px-4 flex items-center gap-2 self-start disabled:opacity-40"
        >
          <Download className="w-4 h-4" /> Download Statement
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
          <p className="text-red-500 text-sm">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-primary text-xs py-2 px-4">Retry</button>
        </div>
      ) : data ? (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Leads */}
            <div className="card p-6">
              <div className="w-10 h-10 rounded-xl bg-[#EBF5FF] text-blue-700 flex items-center justify-center mb-3">
                <Users className="w-5 h-5" />
              </div>
              <div className="text-xs font-semibold text-gray-500">Total Leads Generated</div>
              <div className="font-bold text-2xl text-gray-900 mt-1">{data.totalLeads.toLocaleString()}</div>
              <div className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" /> All-time connections
              </div>
            </div>

            {/* Lead Fee Rate */}
            <div className="card p-6">
              <div className="w-10 h-10 rounded-xl bg-[#F3E8FF] text-purple-700 flex items-center justify-center mb-3">
                <DollarSign className="w-5 h-5" />
              </div>
              <div className="text-xs font-semibold text-gray-500">Lead Fee Rate</div>
              <div className="font-bold text-2xl text-gray-900 mt-1">KSh 50 / lead</div>
              <div className="text-xs text-gray-500 mt-1">Flat rate per student contact</div>
            </div>

            {/* Total Paid */}
            <div className="card p-6">
              <div className="w-10 h-10 rounded-xl bg-[#E4F5EC] text-[#1F9254] flex items-center justify-center mb-3">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="text-xs font-semibold text-gray-500">Total Fees Paid</div>
              <div className="font-bold text-2xl text-[#1F9254] mt-1">{fmt(data.totalPaid)}</div>
              <div className="text-xs text-gray-500 mt-1">{data.paidLeadsCount} leads settled</div>
            </div>

            {/* Account Status */}
            <div className="card p-6">
              <div className="w-10 h-10 rounded-xl bg-[#E4F5EC] text-[#1F9254] flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-xs font-semibold text-gray-500">Account Status</div>
              <div className={`font-bold text-lg mt-1 flex items-center gap-2 ${accountInfo?.cls}`}>
                {accountInfo?.icon} {data.partner.status === "APPROVED" ? "Active" : data.partner.status}
              </div>
              <div className={`text-xs mt-1 ${accountInfo?.cls}`}>{accountInfo?.label}</div>
            </div>
          </div>

          {/* Pending alert */}
          {data.pendingAmount > 0 && (
            <div className="flex items-start gap-3 bg-[#FDF1DE] border border-amber-200 rounded-2xl px-5 py-4">
              <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-amber-800 text-sm">Outstanding Balance: {fmt(data.pendingAmount)}</div>
                <div className="text-xs text-amber-700 mt-0.5">
                  You have {data.unpaidLeadsCount} unpaid lead fee{data.unpaidLeadsCount !== 1 ? "s" : ""}. Please settle your outstanding balance to keep your account active.
                </div>
              </div>
            </div>
          )}

          {/* Billing History */}
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-gray-100 font-poppins font-bold text-base text-gray-900">
              Billing History
            </div>

            {data.invoices.length === 0 ? (
              <div className="py-16 flex flex-col items-center gap-3 text-gray-400">
                <FileText className="w-10 h-10" />
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600">No invoices yet</p>
                  <p className="text-xs mt-1 max-w-xs">
                    Invoices are generated monthly based on lead activity. Start generating leads by getting your properties verified.
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase font-poppins">
                      <th className="p-4">Invoice No</th>
                      <th className="p-4">Billing Period</th>
                      <th className="p-4">Leads</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Due Date</th>
                      <th className="p-4">Payment Ref</th>
                      <th className="p-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.invoices.map(inv => (
                      <tr key={inv.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="p-4 font-mono text-xs font-semibold text-gray-700 whitespace-nowrap">
                          {inv.id.slice(0, 12)}...
                        </td>
                        <td className="p-4 text-xs text-gray-700 whitespace-nowrap">
                          {fmtDate(inv.periodStart)} – {fmtDate(inv.periodEnd)}
                        </td>
                        <td className="p-4 font-semibold text-gray-900 text-xs">{inv.totalLeads}</td>
                        <td className="p-4 font-bold text-[#1F6B4A] text-xs whitespace-nowrap">{fmt(inv.totalAmount)}</td>
                        <td className="p-4 text-xs text-gray-500 whitespace-nowrap">{fmtDate(inv.dueDate)}</td>
                        <td className="p-4 text-xs font-mono text-gray-500">
                          {inv.payment?.transactionRef ?? <span className="text-gray-300">—</span>}
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
        </>
      ) : null}
    </div>
  );
}
