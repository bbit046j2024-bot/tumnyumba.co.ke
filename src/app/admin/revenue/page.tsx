"use client";

import { useEffect, useState } from "react";
import {
  DollarSign,
  ArrowUpRight,
  Download,
  CheckCircle2,
  Clock,
  Loader2,
  AlertCircle,
  FileText,
  Users,
  TrendingUp,
  CreditCard,
  Building2,
  RefreshCw,
} from "lucide-react";

type BookingRevenueData = {
  summary: {
    totalGrossVolume: number;
    totalPlatformCommission: number;
    totalPaidToPartners: number;
    totalTransactions: number;
    splitTransactions: number;
    directTransactions: number;
  };
  perPartnerBreakdown: Array<{
    partnerId: string;
    companyName: string;
    routingMode: string;
    grossCollected: number;
    commissionEarned: number;
    paidToPartner: number;
    transactionCount: number;
  }>;
  recentPayments: Array<{
    id: string;
    bookingId: string;
    studentName: string;
    partnerName: string;
    amount: number;
    commissionAmount: number;
    partnerPayoutAmount: number;
    routingMode: string;
    mpesaReceiptNumber: string | null;
    payoutStatus: string | null;
    createdAt: string;
  }>;
};

type LeadInvoice = {
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
};

type LeadRevenueData = {
  invoices: LeadInvoice[];
  totalLeads: number;
  totalRevenue: number;
  paidLeadsCount: number;
  pendingRevenue: number;
  unpaidLeadsCount: number;
};

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  PAID: { label: "Paid", cls: "badge-success" },
  UNPAID: { label: "Unpaid", cls: "badge-warning" },
  OVERDUE: { label: "Overdue", cls: "badge-danger" },
  CONFIRMED: { label: "Confirmed", cls: "badge-success" },
};

function fmt(n: number) {
  return `KSh ${n.toLocaleString()}`;
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminRevenuePage() {
  const [activeTab, setActiveTab] = useState<"BOOKINGS" | "LEAD_INVOICES">("BOOKINGS");

  // Booking payments state
  const [bookingData, setBookingData] = useState<BookingRevenueData | null>(null);
  const [loadingBooking, setLoadingBooking] = useState(true);

  // Lead invoices state
  const [leadData, setLeadData] = useState<LeadRevenueData | null>(null);
  const [loadingLead, setLoadingLead] = useState(false);

  const [error, setError] = useState("");

  const fetchBookingRevenue = async () => {
    setLoadingBooking(true);
    setError("");
    try {
      const res = await fetch("/api/admin/revenue/booking-payments");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setBookingData(data);
    } catch {
      setError("Failed to load booking payments revenue.");
    } finally {
      setLoadingBooking(false);
    }
  };

  const fetchLeadRevenue = async () => {
    setLoadingLead(true);
    try {
      const res = await fetch("/api/admin/revenue");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setLeadData(data);
    } catch {
      setError("Failed to load lead invoice revenue.");
    } finally {
      setLoadingLead(false);
    }
  };

  useEffect(() => {
    fetchBookingRevenue();
  }, []);

  useEffect(() => {
    if (activeTab === "LEAD_INVOICES" && !leadData) {
      fetchLeadRevenue();
    }
  }, [activeTab, leadData]);

  const downloadBookingCSV = () => {
    if (!bookingData) return;
    const rows = [
      ["Payment ID", "Booking ID", "Partner", "Student", "Gross Amount", "Commission Earned", "Partner Share", "Mode", "Receipt", "Payout Status", "Date"],
      ...bookingData.recentPayments.map((p) => [
        p.id,
        p.bookingId,
        p.partnerName,
        p.studentName,
        p.amount,
        p.commissionAmount,
        p.partnerPayoutAmount,
        p.routingMode,
        p.mpesaReceiptNumber ?? "-",
        p.payoutStatus ?? "-",
        fmtDate(p.createdAt),
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `campuskey-booking-payments-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Platform Revenue & Financials</h1>
          <p className="page-subtitle">
            Track M-Pesa booking payments, commissions earned, and partner disbursements.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => (activeTab === "BOOKINGS" ? fetchBookingRevenue() : fetchLeadRevenue())}
            className="btn-secondary text-xs py-2.5 px-3 flex items-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          {activeTab === "BOOKINGS" && (
            <button
              onClick={downloadBookingCSV}
              disabled={!bookingData}
              className="btn-primary text-xs py-2.5 px-4 flex items-center gap-2 disabled:opacity-50"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab("BOOKINGS")}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === "BOOKINGS"
              ? "bg-[#1F6B4A] text-white shadow-sm"
              : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
          }`}
        >
          <CreditCard className="w-4 h-4" /> M-Pesa Booking Payments & Commissions
        </button>
        <button
          onClick={() => setActiveTab("LEAD_INVOICES")}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === "LEAD_INVOICES"
              ? "bg-[#1F6B4A] text-white shadow-sm"
              : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
          }`}
        >
          <FileText className="w-4 h-4" /> Lead Fee Invoices (KSh 50)
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* TAB 1: Booking Payments & Commissions */}
      {activeTab === "BOOKINGS" && (
        <>
          {loadingBooking ? (
            <div className="flex items-center justify-center py-24 gap-3 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin text-[#1F6B4A]" />
              <span className="text-sm">Loading booking revenue analytics...</span>
            </div>
          ) : bookingData ? (
            <div className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Platform Commission Earned */}
                <div className="card p-6 border-l-4 border-l-[#1F9254]">
                  <div className="w-10 h-10 rounded-xl bg-[#E4F5EC] text-[#1F9254] flex items-center justify-center mb-3">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-semibold text-gray-500">Platform Commission Earned</div>
                  <div className="font-bold text-2xl text-[#1F9254] mt-1">
                    {fmt(bookingData.summary.totalPlatformCommission)}
                  </div>
                  <div className="text-xs text-emerald-700 mt-1">Net revenue from SPLIT payments</div>
                </div>

                {/* Gross Volume Processed */}
                <div className="card p-6">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-semibold text-gray-500">Total Booking Volume</div>
                  <div className="font-bold text-2xl text-blue-700 mt-1">
                    {fmt(bookingData.summary.totalGrossVolume)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {bookingData.summary.totalTransactions} transactions total
                  </div>
                </div>

                {/* Disbursed to Partners */}
                <div className="card p-6">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-3">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-semibold text-gray-500">Paid to Partners (B2C)</div>
                  <div className="font-bold text-2xl text-purple-700 mt-1">
                    {fmt(bookingData.summary.totalPaidToPartners)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Automatic partner payouts</div>
                </div>

                {/* Routing Breakdown */}
                <div className="card p-6">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-semibold text-gray-500">Routing Modes</div>
                  <div className="font-bold text-lg text-gray-900 mt-1 flex items-center gap-2">
                    <span>{bookingData.summary.splitTransactions} SPLIT</span>
                    <span className="text-gray-300">|</span>
                    <span className="text-purple-600">{bookingData.summary.directTransactions} DIRECT</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Active partner configurations</div>
                </div>
              </div>

              {/* Per-Partner Breakdown Table */}
              <div className="card overflow-hidden">
                <div className="p-4 border-b border-gray-100 font-poppins font-bold text-base text-gray-900 flex items-center justify-between">
                  <span>Revenue by Partner</span>
                  <span className="text-xs font-normal text-gray-500">Grouped by partner account</span>
                </div>

                {bookingData.perPartnerBreakdown.length === 0 ? (
                  <div className="p-12 text-center text-gray-400 text-sm">No booking payments recorded yet.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase font-poppins">
                          <th className="p-4">Partner Company</th>
                          <th className="p-4">Routing Mode</th>
                          <th className="p-4">Gross Collected</th>
                          <th className="p-4">Commission Earned</th>
                          <th className="p-4">Paid to Partner</th>
                          <th className="p-4 text-right">Transactions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {bookingData.perPartnerBreakdown.map((p) => (
                          <tr key={p.partnerId} className="hover:bg-gray-50/60 transition-colors">
                            <td className="p-4 font-semibold text-gray-900">{p.companyName}</td>
                            <td className="p-4">
                              <span
                                className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                                  p.routingMode === "SPLIT"
                                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                                    : "bg-purple-50 text-purple-700 border border-purple-200"
                                }`}
                              >
                                {p.routingMode}
                              </span>
                            </td>
                            <td className="p-4 font-semibold text-gray-900">{fmt(p.grossCollected)}</td>
                            <td className="p-4 font-bold text-[#1F9254]">{fmt(p.commissionEarned)}</td>
                            <td className="p-4 text-gray-700">{fmt(p.paidToPartner)}</td>
                            <td className="p-4 text-right font-mono font-semibold">{p.transactionCount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Recent Transactions */}
              <div className="card overflow-hidden">
                <div className="p-4 border-b border-gray-100 font-poppins font-bold text-base text-gray-900">
                  Recent M-Pesa Booking Transactions
                </div>

                {bookingData.recentPayments.length === 0 ? (
                  <div className="p-12 text-center text-gray-400 text-sm">No recent transactions.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase font-poppins">
                          <th className="p-4">Receipt / Date</th>
                          <th className="p-4">Partner</th>
                          <th className="p-4">Student</th>
                          <th className="p-4">Amount</th>
                          <th className="p-4">Commission</th>
                          <th className="p-4">Partner Payout</th>
                          <th className="p-4 text-right">Payout Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {bookingData.recentPayments.map((pay) => (
                          <tr key={pay.id} className="hover:bg-gray-50/60 transition-colors">
                            <td className="p-4">
                              <div className="font-mono font-semibold text-gray-900 text-xs">
                                {pay.mpesaReceiptNumber || pay.id.slice(0, 12)}
                              </div>
                              <div className="text-[11px] text-gray-400">{fmtDate(pay.createdAt)}</div>
                            </td>
                            <td className="p-4 text-xs font-medium text-gray-800">{pay.partnerName}</td>
                            <td className="p-4 text-xs text-gray-600">{pay.studentName}</td>
                            <td className="p-4 font-bold text-gray-900 text-xs">{fmt(pay.amount)}</td>
                            <td className="p-4 font-semibold text-[#1F9254] text-xs">
                              {pay.routingMode === "SPLIT" ? fmt(pay.commissionAmount) : "0 (DIRECT)"}
                            </td>
                            <td className="p-4 text-gray-700 text-xs">{fmt(pay.partnerPayoutAmount)}</td>
                            <td className="p-4 text-right">
                              <span
                                className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                                  pay.payoutStatus === "PAID"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : pay.payoutStatus === "QUEUED" || pay.payoutStatus === "PENDING"
                                    ? "bg-amber-50 text-amber-700"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {pay.payoutStatus || (pay.routingMode === "DIRECT" ? "DIRECT TILL" : "PENDING")}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </>
      )}

      {/* TAB 2: Lead Invoices (Existing) */}
      {activeTab === "LEAD_INVOICES" && (
        <>
          {loadingLead ? (
            <div className="flex items-center justify-center py-24 gap-3 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin text-[#1F6B4A]" />
              <span className="text-sm">Loading lead invoice data...</span>
            </div>
          ) : leadData ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card p-6">
                  <div className="w-10 h-10 rounded-xl bg-[#E4F5EC] text-[#1F9254] flex items-center justify-center mb-3">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-semibold text-gray-500">Lead Fees Collected</div>
                  <div className="font-bold text-2xl text-[#1F9254] mt-1">{fmt(leadData.totalRevenue)}</div>
                  <div className="text-xs text-[#1F9254] mt-1 flex items-center gap-1">
                    <ArrowUpRight className="w-3.5 h-3.5" /> {leadData.paidLeadsCount} leads settled
                  </div>
                </div>

                <div className="card p-6">
                  <div className="w-10 h-10 rounded-xl bg-[#FDF1DE] text-amber-700 flex items-center justify-center mb-3">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-semibold text-gray-500">Pending Lead Fees</div>
                  <div className="font-bold text-2xl text-amber-600 mt-1">{fmt(leadData.pendingRevenue)}</div>
                  <div className="text-xs text-gray-500 mt-1">{leadData.unpaidLeadsCount} unpaid leads</div>
                </div>

                <div className="card p-6">
                  <div className="w-10 h-10 rounded-xl bg-[#EBF5FF] text-blue-700 flex items-center justify-center mb-3">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-semibold text-gray-500">Total Leads Generated</div>
                  <div className="font-bold text-2xl text-blue-700 mt-1">{leadData.totalLeads.toLocaleString()}</div>
                  <div className="text-xs text-gray-500 mt-1">Student property enquiries</div>
                </div>

                <div className="card p-6">
                  <div className="w-10 h-10 rounded-xl bg-[#F3E8FF] text-purple-700 flex items-center justify-center mb-3">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-semibold text-gray-500">Lead Fee Rate</div>
                  <div className="font-bold text-2xl text-gray-900 mt-1">KSh 50 / lead</div>
                  <div className="text-xs text-gray-500 mt-1">Billed per connection</div>
                </div>
              </div>

              {/* Table */}
              <div className="card overflow-hidden">
                <div className="p-4 border-b border-gray-100 font-poppins font-bold text-base text-gray-900">
                  Lead Generation Invoices
                </div>
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
                      {leadData.invoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="p-4 font-mono text-xs font-semibold text-gray-700">{inv.id.slice(0, 12)}...</td>
                          <td className="p-4">
                            <div className="font-medium text-gray-900 text-xs">{inv.partner.companyName}</div>
                            <div className="text-gray-400 text-xs">{inv.partner.user.email}</div>
                          </td>
                          <td className="p-4 text-xs text-gray-500">
                            {fmtDate(inv.periodStart)} – {fmtDate(inv.periodEnd)}
                          </td>
                          <td className="p-4 font-semibold text-gray-700 text-xs">{inv.totalLeads}</td>
                          <td className="p-4 font-bold text-[#1F6B4A] text-xs">{fmt(inv.totalAmount)}</td>
                          <td className="p-4 text-xs text-gray-500">{fmtDate(inv.dueDate)}</td>
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
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
