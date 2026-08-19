"use client";

import { useEffect, useState } from "react";
import {
  DollarSign,
  ArrowUpRight,
  Users,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Loader2,
  AlertCircle,
  XCircle,
  ShieldCheck,
  CreditCard,
  Building2,
  RefreshCw,
} from "lucide-react";

type BookingPayment = {
  id: string;
  bookingId: string;
  studentName: string;
  amount: number;
  commissionAmount: number;
  partnerPayoutAmount: number;
  routingMode: string;
  mpesaReceiptNumber: string | null;
  payoutStatus: string | null;
  createdAt: string;
};

type BookingRevenueData = {
  partner: {
    companyName: string;
    paymentRouting: string;
    payoutPhone: string | null;
    commissionType: string;
    commissionValue: number;
  };
  summary: {
    gross: number;
    netReceived: number;
    pendingPayout: number;
    totalConfirmedPayments: number;
  };
  payments: BookingPayment[];
};

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

type LeadRevenueData = {
  partner: { companyName: string; status: string };
  invoices: Invoice[];
  totalLeads: number;
  totalPaid: number;
  paidLeadsCount: number;
  pendingAmount: number;
  unpaidLeadsCount: number;
};

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  PAID: { label: "Paid", cls: "badge-success" },
  UNPAID: { label: "Unpaid", cls: "badge-warning" },
  OVERDUE: { label: "Overdue", cls: "badge-danger" },
};

function fmt(n: number) {
  return `KSh ${n.toLocaleString()}`;
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
}

export default function PartnerRevenuePage() {
  const [activeTab, setActiveTab] = useState<"BOOKING_EARNINGS" | "LEAD_INVOICES">("BOOKING_EARNINGS");

  // Booking revenue state
  const [bookingData, setBookingData] = useState<BookingRevenueData | null>(null);
  const [loadingBooking, setLoadingBooking] = useState(true);

  // Lead invoice revenue state
  const [leadData, setLeadData] = useState<LeadRevenueData | null>(null);
  const [loadingLead, setLoadingLead] = useState(false);

  const [error, setError] = useState("");

  const fetchBookingRevenue = async () => {
    setLoadingBooking(true);
    setError("");
    try {
      const res = await fetch("/api/partner/revenue/booking-payments");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setBookingData(data);
    } catch {
      setError("Failed to load booking earnings. Please try again.");
    } finally {
      setLoadingBooking(false);
    }
  };

  const fetchLeadRevenue = async () => {
    setLoadingLead(true);
    try {
      const res = await fetch("/api/partner/revenue");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setLeadData(data);
    } catch {
      setError("Failed to load lead fee invoice data.");
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
      ["Payment ID", "Booking ID", "Student", "Gross Collected", "Commission", "Your Net Payout", "M-Pesa Receipt", "Payout Status", "Date"],
      ...bookingData.payments.map((p) => [
        p.id,
        p.bookingId,
        p.studentName,
        p.amount,
        p.commissionAmount,
        p.partnerPayoutAmount,
        p.mpesaReceiptNumber ?? "-",
        p.payoutStatus ?? (bookingData.partner.paymentRouting === "DIRECT" ? "DIRECT TILL" : "-"),
        fmtDate(p.createdAt),
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `partner-earnings-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Revenue & Payouts</h1>
          <p className="page-subtitle">
            Track student booking payments, M-Pesa disbursements, and lead generation invoices
            {bookingData?.partner.companyName ? ` for ${bookingData.partner.companyName}` : ""}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => (activeTab === "BOOKING_EARNINGS" ? fetchBookingRevenue() : fetchLeadRevenue())}
            className="btn-secondary text-xs py-2.5 px-3 flex items-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          {activeTab === "BOOKING_EARNINGS" && (
            <button
              onClick={downloadBookingCSV}
              disabled={!bookingData || bookingData.payments.length === 0}
              className="btn-primary text-xs py-2.5 px-4 flex items-center gap-2 disabled:opacity-50"
            >
              <Download className="w-4 h-4" /> Download Statement
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab("BOOKING_EARNINGS")}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === "BOOKING_EARNINGS"
              ? "bg-[#1F6B4A] text-white shadow-sm"
              : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
          }`}
        >
          <CreditCard className="w-4 h-4" /> Student Booking Earnings & Payouts
        </button>
        <button
          onClick={() => setActiveTab("LEAD_INVOICES")}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === "LEAD_INVOICES"
              ? "bg-[#1F6B4A] text-white shadow-sm"
              : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
          }`}
        >
          <FileText className="w-4 h-4" /> Lead Fee Invoices
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* TAB 1: Booking Earnings */}
      {activeTab === "BOOKING_EARNINGS" && (
        <>
          {loadingBooking ? (
            <div className="flex items-center justify-center py-24 gap-3 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin text-[#1F6B4A]" />
              <span className="text-sm">Loading booking earnings...</span>
            </div>
          ) : bookingData ? (
            <div className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Net Earnings Received */}
                <div className="card p-6 border-l-4 border-l-[#1F9254]">
                  <div className="w-10 h-10 rounded-xl bg-[#E4F5EC] text-[#1F9254] flex items-center justify-center mb-3">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-semibold text-gray-500">Net Received (Paid Out)</div>
                  <div className="font-bold text-2xl text-[#1F9254] mt-1">
                    {fmt(bookingData.summary.netReceived)}
                  </div>
                  <div className="text-xs text-emerald-700 mt-1">Disbursed to your M-Pesa account</div>
                </div>

                {/* Gross Bookings Collected */}
                <div className="card p-6">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-semibold text-gray-500">Gross Student Bookings</div>
                  <div className="font-bold text-2xl text-blue-700 mt-1">{fmt(bookingData.summary.gross)}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {bookingData.summary.totalConfirmedPayments} confirmed payments
                  </div>
                </div>

                {/* Pending Payout */}
                <div className="card p-6">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-semibold text-gray-500">Pending M-Pesa Payout</div>
                  <div className="font-bold text-2xl text-amber-600 mt-1">
                    {fmt(bookingData.summary.pendingPayout)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Queued for automated B2C payout</div>
                </div>

                {/* Account Routing Mode */}
                <div className="card p-6">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-3">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-semibold text-gray-500">Payment Routing</div>
                  <div className="font-bold text-lg text-gray-900 mt-1 flex items-center gap-1.5">
                    <span>{bookingData.partner.paymentRouting} Mode</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {bookingData.partner.paymentRouting === "SPLIT"
                      ? `Commission: ${bookingData.partner.commissionValue}${bookingData.partner.commissionType === "FIXED" ? " KSh" : "%"}`
                      : "Direct to your own Till"}
                  </div>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="card overflow-hidden">
                <div className="p-4 border-b border-gray-100 font-poppins font-bold text-base text-gray-900 flex items-center justify-between">
                  <span>Booking Payments & Disbursements</span>
                  <span className="text-xs font-normal text-gray-400">All-time confirmed transactions</span>
                </div>

                {bookingData.payments.length === 0 ? (
                  <div className="p-16 text-center text-gray-400">
                    <CreditCard className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                    <p className="font-medium text-gray-700 text-sm">No booking payments received yet</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Payments made by students against your bookings will automatically appear here.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase font-poppins">
                          <th className="p-4">Receipt / Date</th>
                          <th className="p-4">Student</th>
                          <th className="p-4">Gross Paid</th>
                          <th className="p-4">Commission</th>
                          <th className="p-4">Your Payout</th>
                          <th className="p-4 text-right">Disbursement Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {bookingData.payments.map((p) => (
                          <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                            <td className="p-4">
                              <div className="font-mono font-semibold text-gray-900 text-xs">
                                {p.mpesaReceiptNumber || p.id.slice(0, 10)}
                              </div>
                              <div className="text-[11px] text-gray-400">{fmtDate(p.createdAt)}</div>
                            </td>
                            <td className="p-4 font-medium text-gray-800 text-xs">{p.studentName}</td>
                            <td className="p-4 font-bold text-gray-900 text-xs">{fmt(p.amount)}</td>
                            <td className="p-4 text-xs font-semibold text-gray-500">
                              {p.routingMode === "SPLIT" ? fmt(p.commissionAmount) : "0 (DIRECT)"}
                            </td>
                            <td className="p-4 font-bold text-[#1F9254] text-xs">{fmt(p.partnerPayoutAmount)}</td>
                            <td className="p-4 text-right">
                              <span
                                className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                                  p.payoutStatus === "PAID"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : p.payoutStatus === "QUEUED" || p.payoutStatus === "PENDING"
                                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {p.payoutStatus === "PAID"
                                  ? "Disbursed to Phone"
                                  : p.payoutStatus === "QUEUED" || p.payoutStatus === "PENDING"
                                  ? "Payout Queued"
                                  : bookingData.partner.paymentRouting === "DIRECT"
                                  ? "Direct in Till"
                                  : "Pending"}
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
                  <div className="w-10 h-10 rounded-xl bg-[#EBF5FF] text-blue-700 flex items-center justify-center mb-3">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-semibold text-gray-500">Total Leads Generated</div>
                  <div className="font-bold text-2xl text-gray-900 mt-1">{leadData.totalLeads.toLocaleString()}</div>
                  <div className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                    <ArrowUpRight className="w-3.5 h-3.5" /> All-time connections
                  </div>
                </div>

                <div className="card p-6">
                  <div className="w-10 h-10 rounded-xl bg-[#F3E8FF] text-purple-700 flex items-center justify-center mb-3">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-semibold text-gray-500">Lead Fee Rate</div>
                  <div className="font-bold text-2xl text-gray-900 mt-1">KSh 50 / lead</div>
                  <div className="text-xs text-gray-500 mt-1">Flat rate per student contact</div>
                </div>

                <div className="card p-6">
                  <div className="w-10 h-10 rounded-xl bg-[#E4F5EC] text-[#1F9254] flex items-center justify-center mb-3">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-semibold text-gray-500">Total Fees Paid</div>
                  <div className="font-bold text-2xl text-[#1F9254] mt-1">{fmt(leadData.totalPaid)}</div>
                  <div className="text-xs text-gray-500 mt-1">{leadData.paidLeadsCount} leads settled</div>
                </div>

                <div className="card p-6">
                  <div className="w-10 h-10 rounded-xl bg-[#E4F5EC] text-[#1F9254] flex items-center justify-center mb-3">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-semibold text-gray-500">Account Status</div>
                  <div className="font-bold text-lg text-emerald-700 mt-1 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> Active
                  </div>
                  <div className="text-xs text-emerald-600 mt-1">In Good Standing</div>
                </div>
              </div>

              {/* Billing History */}
              <div className="card overflow-hidden">
                <div className="p-4 border-b border-gray-100 font-poppins font-bold text-base text-gray-900">
                  Lead Fee Invoices
                </div>
                {leadData.invoices.length === 0 ? (
                  <div className="py-16 flex flex-col items-center gap-3 text-gray-400">
                    <FileText className="w-10 h-10" />
                    <p className="text-sm">No invoices yet.</p>
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
                        {leadData.invoices.map((inv) => (
                          <tr key={inv.id} className="hover:bg-gray-50/60 transition-colors">
                            <td className="p-4 font-mono text-xs font-semibold text-gray-700">{inv.id.slice(0, 12)}...</td>
                            <td className="p-4 text-xs text-gray-700">
                              {fmtDate(inv.periodStart)} – {fmtDate(inv.periodEnd)}
                            </td>
                            <td className="p-4 font-semibold text-gray-900 text-xs">{inv.totalLeads}</td>
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
                )}
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
