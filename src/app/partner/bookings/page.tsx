"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CalendarCheck,
  Phone,
  Mail,
  Home,
  Loader2,
  RefreshCw,
  User,
  MapPin,
  Trash2,
  CreditCard,
  Plus,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  Ban,
  X,
} from "lucide-react";

interface Lead {
  id: string;
  message: string | null;
  status: string;
  createdAt: string;
  property: { id: string; title: string; category: string; area: string };
  student: { id: string; name: string; email: string; phone: string | null };
}

interface Booking {
  id: string;
  amountDue: number;
  amountPaid: number;
  status: "PENDING" | "PARTIALLY_PAID" | "PAID" | "CANCELLED";
  description: string | null;
  createdAt: string;
  student: { id: string; name: string; email: string; phone: string | null };
  payments: Array<{
    id: string;
    amount: number;
    status: string;
    routingMode: string;
    mpesaReceiptNumber: string | null;
    partnerPayoutAmount: number | null;
    payoutStatus: string | null;
    createdAt: string;
  }>;
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

const BOOKING_STATUS_STYLES: Record<string, { label: string; cls: string }> = {
  PENDING: { label: "Pending Payment", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  PARTIALLY_PAID: { label: "Partially Paid", cls: "bg-blue-50 text-blue-700 border-blue-200" },
  PAID: { label: "Fully Paid", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  CANCELLED: { label: "Cancelled", cls: "bg-red-50 text-red-700 border-red-200" },
};

function fmt(n: number) {
  return `KSh ${n.toLocaleString()}`;
}

export default function PartnerBookingsPage() {
  const [activeTab, setActiveTab] = useState<"BOOKINGS" | "LEADS">("BOOKINGS");

  // Bookings state
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New booking form state
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPhone, setStudentPhone] = useState("");
  const [amountDue, setAmountDue] = useState("");
  const [bookingDesc, setBookingDesc] = useState("");
  const [createError, setCreateError] = useState("");

  // Leads state
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingBookingId, setDeletingBookingId] = useState<string | null>(null);

  const [error, setError] = useState("");

  const fetchBookings = useCallback(async () => {
    setLoadingBookings(true);
    setError("");
    try {
      const res = await fetch("/api/partner/bookings");
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (Array.isArray(data)) setBookings(data);
    } catch {
      setError("Failed to load bookings.");
    } finally {
      setLoadingBookings(false);
    }
  }, []);

  const fetchLeads = useCallback(async () => {
    setLoadingLeads(true);
    setError("");
    try {
      const res = await fetch("/api/partner/leads");
      const data = await res.json();
      if (Array.isArray(data)) setLeads(data);
    } catch {
      setError("Failed to load student enquiries.");
    } finally {
      setLoadingLeads(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  useEffect(() => {
    if (activeTab === "LEADS" && leads.length === 0) {
      fetchLeads();
    }
  }, [activeTab, leads.length, fetchLeads]);

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError("");

    try {
      const res = await fetch("/api/partner/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentEmail: studentEmail.trim() || undefined,
          studentPhone: studentPhone.trim() || undefined,
          amountDue: Number(amountDue),
          description: bookingDesc,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setCreateError(data.error || "Failed to create booking.");
        return;
      }

      setBookings((prev) => [data, ...prev]);
      setShowCreateModal(false);
      setStudentEmail("");
      setStudentPhone("");
      setAmountDue("");
      setBookingDesc("");
    } catch {
      setCreateError("Network error creating booking.");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to delete this booking record?")) return;
    setDeletingBookingId(bookingId);
    try {
      const res = await fetch(`/api/partner/bookings/${bookingId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to delete booking.");
        return;
      }
      setBookings((prev) => prev.filter((b) => b.id !== bookingId));
    } catch {
      alert("Network error deleting booking.");
    } finally {
      setDeletingBookingId(null);
    }
  };

  const copyPaymentLink = (bookingId: string) => {
    const url = `${window.location.origin}/pay/${bookingId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(bookingId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteLead = async (leadId: string, studentName: string) => {
    if (!confirm(`Are you sure you want to remove ${studentName}'s enquiry?`)) return;

    setDeletingId(leadId);
    try {
      const res = await fetch(`/api/partner/leads/${leadId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setLeads((prev) => prev.filter((l) => l.id !== leadId));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to remove enquiry.");
      }
    } catch {
      alert("Network error. Could not delete enquiry.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Bookings & Student Enquiries</h1>
          <p className="page-subtitle">
            Manage M-Pesa payments for confirmed bookings and view prospective student enquiries.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => (activeTab === "BOOKINGS" ? fetchBookings() : fetchLeads())}
            className="btn-secondary flex items-center gap-2 text-xs py-2.5 px-3"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          {activeTab === "BOOKINGS" && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center gap-2 text-xs py-2.5 px-4"
            >
              <Plus className="w-4 h-4" /> Create Student Booking
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
          <CreditCard className="w-4 h-4" /> M-Pesa Bookings ({bookings.length})
        </button>
        <button
          onClick={() => setActiveTab("LEADS")}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === "LEADS"
              ? "bg-[#1F6B4A] text-white shadow-sm"
              : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
          }`}
        >
          <CalendarCheck className="w-4 h-4" /> Student Enquiries ({leads.length})
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>}

      {/* TAB 1: M-Pesa Bookings */}
      {activeTab === "BOOKINGS" && (
        <div className="space-y-4">
          {loadingBookings ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-7 h-7 animate-spin text-primary-600" />
            </div>
          ) : bookings.length === 0 ? (
            <div className="card p-12 text-center text-gray-400">
              <CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-200" />
              <p className="font-semibold text-gray-700 text-base">No M-Pesa bookings created yet</p>
              <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
                Create a booking with a set price for a student. The student can then securely pay in full or in
                installments via M-Pesa STK push.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary text-xs py-2 px-4 mt-4 inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Create First Booking
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {bookings.map((b) => {
                const amountDue = Number(b.amountDue);
                const amountPaid = Number(b.amountPaid);
                const remaining = Math.max(0, amountDue - amountPaid);
                const progressPct = Math.min(100, Math.round((amountPaid / amountDue) * 100));
                const statusMeta = BOOKING_STATUS_STYLES[b.status] || BOOKING_STATUS_STYLES.PENDING;

                return (
                  <div key={b.id} className="card p-5 hover:shadow-md transition-all border border-gray-100 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#E4F5EC] text-[#1F6B4A] flex items-center justify-center flex-shrink-0 font-bold">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-base font-poppins">{b.student.name}</div>
                          <div className="flex flex-wrap gap-3 text-xs text-gray-500 mt-0.5">
                            <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {b.student.email}</span>
                            {b.student.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {b.student.phone}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusMeta.cls}`}>
                          {statusMeta.label}
                        </span>
                        <button
                          onClick={() => copyPaymentLink(b.id)}
                          title="Copy Student Checkout Link"
                          className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
                        >
                          {copiedId === b.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied Link
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" /> Share Pay Link
                            </>
                          )}
                        </button>
                        <a
                          href={`/pay/${b.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
                          title="Open student checkout page in new tab"
                        >
                          <CreditCard className="w-3.5 h-3.5" /> Open Pay Page ↗
                        </a>
                        <button
                          onClick={() => handleDeleteBooking(b.id)}
                          disabled={deletingBookingId === b.id}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-200 transition-all"
                          title="Delete Booking"
                        >
                          {deletingBookingId === b.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-red-600" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {b.description && (
                      <p className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                        {b.description}
                      </p>
                    )}

                    {/* Progress Bar */}
                    <div className="space-y-1.5 bg-gray-50/70 p-3 rounded-xl border border-gray-100">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-gray-600">
                          Paid: <strong className="text-[#1F6B4A]">{fmt(amountPaid)}</strong> of {fmt(amountDue)}
                        </span>
                        <span className="text-gray-500">
                          {remaining > 0 ? `Remaining: ${fmt(remaining)}` : "Fully Settled"}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-[#1F9254] h-2 rounded-full transition-all duration-500"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Payment Transactions */}
                    {b.payments && b.payments.length > 0 && (
                      <div className="border-t border-gray-100 pt-3 space-y-2">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Payment Transactions ({b.payments.length})
                        </div>
                        <div className="space-y-1.5">
                          {b.payments.map((p) => (
                            <div
                              key={p.id}
                              className="flex items-center justify-between text-xs p-2 rounded-lg bg-white border border-gray-100"
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className={`w-2 h-2 rounded-full ${
                                    p.status === "CONFIRMED"
                                      ? "bg-emerald-500"
                                      : p.status === "PUSHED"
                                      ? "bg-amber-500 animate-pulse"
                                      : "bg-gray-400"
                                  }`}
                                />
                                <span className="font-mono font-semibold text-gray-800">
                                  {p.mpesaReceiptNumber || p.id.slice(0, 10)}
                                </span>
                                <span className="text-gray-400">
                                  {new Date(p.createdAt).toLocaleDateString("en-KE", {
                                    day: "numeric",
                                    month: "short",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-gray-900">{fmt(Number(p.amount))}</span>
                                <span
                                  className={`text-[11px] px-2 py-0.5 rounded font-semibold ${
                                    p.status === "CONFIRMED"
                                      ? "bg-emerald-50 text-emerald-700"
                                      : "bg-gray-100 text-gray-600"
                                  }`}
                                >
                                  {p.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Leads (Existing) */}
      {activeTab === "LEADS" && (
        <div className="space-y-3">
          {loadingLeads ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-7 h-7 animate-spin text-primary-600" />
            </div>
          ) : leads.length === 0 ? (
            <div className="card p-12 text-center text-gray-400">
              <CalendarCheck className="w-12 h-12 mx-auto mb-3 text-gray-200" />
              <p className="font-semibold text-gray-500">No enquiries yet</p>
              <p className="text-xs mt-1">Student interest submissions will appear here once students contact you.</p>
            </div>
          ) : (
            leads.map((lead) => (
              <div key={lead.id} className="card p-5 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <User className="w-4.5 h-4.5 text-primary-700" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 font-poppins">{lead.student.name}</div>
                      <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{lead.student.email}</span>
                        {lead.student.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{lead.student.phone}</span>}
                      </div>
                      {lead.message && (
                        <p className="text-sm text-gray-600 mt-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100 italic">
                          &quot;{lead.message}&quot;
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col md:items-end gap-2 flex-shrink-0">
                    <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700 bg-primary-50 border border-primary-100 px-3 py-1.5 rounded-xl">
                      <Home className="w-3.5 h-3.5" />
                      {lead.property.title}
                    </div>
                    <div className="flex items-center md:justify-end gap-1 text-xs text-gray-400">
                      <MapPin className="w-3 h-3" />
                      {CATEGORY_LABELS[lead.property.category] || lead.property.category} · {lead.property.area}
                    </div>
                    <div className="flex items-center justify-between md:justify-end gap-2 w-full mt-1 flex-wrap">
                      <span className="text-xs text-gray-400 mr-auto md:mr-0">
                        {new Date(lead.createdAt).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                      <button
                        onClick={() => {
                          setStudentEmail(lead.student.email);
                          if (lead.student.phone) setStudentPhone(lead.student.phone);
                          setBookingDesc(`Booking for ${lead.property.title} (${lead.property.area})`);
                          setShowCreateModal(true);
                        }}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#1F6B4A] hover:text-[#175339] bg-[#E4F5EC] hover:bg-[#d5eee0] border border-[#1F6B4A]/20 px-2.5 py-1 rounded-lg transition-colors"
                        title="Create a booking payment request for this student"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Create Booking
                      </button>
                      <button
                        onClick={() => handleDeleteLead(lead.id, lead.student.name)}
                        disabled={deletingId === lead.id}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50"
                        title="Remove student enquiry"
                      >
                        {deletingId === lead.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Create Booking Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-lg font-poppins text-gray-900">Create Student Booking</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="space-y-4 text-sm">
              {createError && (
                <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl p-3 text-xs">{createError}</div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Student Account Email</label>
                <input
                  type="email"
                  placeholder="student@example.com"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  className="input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Student M-Pesa Phone Number</label>
                <input
                  type="tel"
                  placeholder="0712345678 or 254712345678"
                  value={studentPhone}
                  onChange={(e) => setStudentPhone(e.target.value)}
                  className="input text-xs"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Enter student email or phone number. An instant notification & payment link will be sent to them.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Total Amount Due (KSh)</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="e.g. 8000"
                  value={amountDue}
                  onChange={(e) => setAmountDue(e.target.value)}
                  className="input text-xs"
                  required
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Fixed price set by you. The student cannot edit this amount (supports installment payments).
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Description / Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Deposit for 1-Bedroom Room 3B (Tudor)"
                  value={bookingDesc}
                  onChange={(e) => setBookingDesc(e.target.value)}
                  className="input text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
                >
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Create Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
