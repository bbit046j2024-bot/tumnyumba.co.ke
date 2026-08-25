"use client";

import { useEffect, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import {
  KeyRound,
  Users,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Plus,
  RotateCcw,
  Sparkles,
  Phone,
  Mail,
  Home,
  Clock,
  ChevronRight,
  Loader2,
  X,
  GraduationCap,
  Briefcase,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

interface Property {
  id: string;
  title: string;
  area: string;
  rent: number;
  availableSpaces: number;
  totalSpaces: number;
  availabilityStatus: string;
}

interface Tenancy {
  id: string;
  propertyId: string;
  tenantType: "STUDENT" | "NON_STUDENT";
  tenantName: string;
  tenantPhone: string;
  tenantEmail: string;
  unitNumber: string | null;
  periodType: "SEMESTER_1" | "SEMESTER_2" | "FULL_ACADEMIC_YEAR" | "CUSTOM";
  startDate: string;
  endDate: string;
  monthlyRent: number;
  depositPaid: number;
  status: "PENDING_CONFIRMATION" | "ACTIVE" | "RENEWED" | "VACATED_RELISTED" | "VACATED_UNLISTED" | "CANCELLED";
  studentConfirmedAt: string | null;
  relistedAt: string | null;
  property: Property;
  student?: { id: string; name: string; email: string; phone: string } | null;
}

export default function PartnerTenanciesPage() {
  const searchParams = useSearchParams();
  const autoRelistId = searchParams.get("relist");
  const autoRenewId = searchParams.get("renew");

  const [tenancies, setTenancies] = useState<Tenancy[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "EXPIRING" | "VACATED">("ALL");

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [renewTarget, setRenewTarget] = useState<Tenancy | null>(null);

  // Form states
  const [tenantType, setTenantType] = useState<"STUDENT" | "NON_STUDENT">("STUDENT");
  const [propertyId, setPropertyId] = useState("");
  const [tenantName, setTenantName] = useState("");
  const [tenantPhone, setTenantPhone] = useState("");
  const [tenantEmail, setTenantEmail] = useState("");
  const [unitNumber, setUnitNumber] = useState("");
  const [periodType, setPeriodType] = useState<"SEMESTER_1" | "SEMESTER_2" | "FULL_ACADEMIC_YEAR" | "CUSTOM">("SEMESTER_1");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState("");
  const [monthlyRent, setMonthlyRent] = useState("");
  const [depositPaid, setDepositPaid] = useState("");
  const [requireStudentConfirmation, setRequireStudentConfirmation] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Default semester dates calculation
  useEffect(() => {
    const now = new Date();
    const currentYear = now.getFullYear();

    if (tenantType === "STUDENT") {
      if (periodType === "SEMESTER_1") {
        setEndDate(`${currentYear}-12-20`);
      } else if (periodType === "SEMESTER_2") {
        setEndDate(`${currentYear + 1}-04-30`);
      } else if (periodType === "FULL_ACADEMIC_YEAR") {
        setEndDate(`${currentYear + 1}-07-31`);
      }
    } else {
      // Non-student defaults to 6 months
      const sixMonthsLater = new Date(now.setMonth(now.getMonth() + 6)).toISOString().split("T")[0];
      setEndDate(sixMonthsLater);
    }
  }, [tenantType, periodType]);

  // Load data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [tenanciesRes, propertiesRes] = await Promise.all([
        fetch("/api/partner/tenancies"),
        fetch("/api/partner/properties"),
      ]);

      if (tenanciesRes.ok) {
        const data = await tenanciesRes.json();
        setTenancies(data);
      }

      if (propertiesRes.ok) {
        const data = await propertiesRes.json();
        setProperties(data);
        if (data.length > 0 && !propertyId) {
          setPropertyId(data[0].id);
          setMonthlyRent(String(data[0].rent || ""));
        }
      }
    } catch (err) {
      console.error("Failed to load tenancies data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle auto-relist or auto-renew from email links
  useEffect(() => {
    if (autoRelistId && tenancies.length > 0) {
      const match = tenancies.find((t) => t.id === autoRelistId);
      if (match && match.status === "ACTIVE") {
        handleRelist(match.id);
      }
    }
    if (autoRenewId && tenancies.length > 0) {
      const match = tenancies.find((t) => t.id === autoRenewId);
      if (match) {
        setRenewTarget(match);
      }
    }
  }, [autoRelistId, autoRenewId, tenancies]);

  // Handle Property Change in Create Modal
  const handlePropertyChange = (pId: string) => {
    setPropertyId(pId);
    const selected = properties.find((p) => p.id === pId);
    if (selected) {
      setMonthlyRent(String(selected.rent));
    }
  };

  // Submit Tenancy Creation
  const handleCreateTenancy = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/partner/tenancies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          tenantType,
          tenantName,
          tenantPhone,
          tenantEmail,
          unitNumber,
          periodType: tenantType === "STUDENT" ? periodType : "CUSTOM",
          startDate,
          endDate,
          monthlyRent: Number(monthlyRent),
          depositPaid: Number(depositPaid) || 0,
          requireStudentConfirmation,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to record occupancy");

      setMessage({ type: "success", text: "Tenancy successfully recorded! Property availability updated." });
      setIsCreateOpen(false);
      resetForm();
      fetchData();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  // 1-Click Relist
  const handleRelist = async (tenancyId: string) => {
    if (!confirm("Are you sure you want to mark this property as AVAILABLE and notify students looking in this area?")) return;

    setActionLoading(tenancyId);
    setMessage(null);

    try {
      const res = await fetch(`/api/partner/tenancies/${tenancyId}/relist`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to relist property");

      setMessage({ type: "success", text: "Property marked as AVAILABLE! Area alert broadcasted to subscribed students." });
      fetchData();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setActionLoading(null);
    }
  };

  // Renew Tenancy Submit
  const handleRenewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renewTarget) return;

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/partner/tenancies/${renewTarget.id}/renew`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newEndDate: endDate,
          newPeriodType: tenantType === "STUDENT" ? periodType : "CUSTOM",
          newMonthlyRent: monthlyRent ? Number(monthlyRent) : renewTarget.monthlyRent,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to renew tenancy");

      setMessage({ type: "success", text: "Tenancy successfully extended for the next term!" });
      setRenewTarget(null);
      fetchData();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setTenantName("");
    setTenantPhone("");
    setTenantEmail("");
    setUnitNumber("");
    setDepositPaid("");
  };

  // Helper date metrics
  const now = new Date();
  const fourteenDaysAhead = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  const activeTenancies = tenancies.filter((t) => t.status === "ACTIVE" && new Date(t.endDate) >= now);
  const expiringTenancies = tenancies.filter((t) => t.status === "ACTIVE" && new Date(t.endDate) <= fourteenDaysAhead);
  const vacatedUnlisted = tenancies.filter((t) => t.status === "ACTIVE" && new Date(t.endDate) < now);

  const filteredList = tenancies.filter((t) => {
    if (filter === "ACTIVE") return t.status === "ACTIVE" && new Date(t.endDate) >= now;
    if (filter === "EXPIRING") return t.status === "ACTIVE" && new Date(t.endDate) <= fourteenDaysAhead;
    if (filter === "VACATED") return t.status === "VACATED_RELISTED" || (t.status === "ACTIVE" && new Date(t.endDate) < now);
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#E4F5EC] text-[#1F6B4A] flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-poppins font-bold text-xl sm:text-2xl text-gray-900">
                Tenants &amp; Occupancy
              </h1>
              <p className="text-xs text-gray-500">
                Manage active long-term stays, student semester cycles, and automated relisting
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            resetForm();
            setIsCreateOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#1F6B4A] hover:bg-[#185a3d] text-white text-sm font-semibold shadow-xs hover:shadow-md transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Record Occupancy / New Tenant
        </button>
      </div>

      {/* Alerts */}
      {message && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center justify-between ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="p-1 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5 bg-white border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Active Tenants
            </span>
            <Users className="w-4 h-4 text-[#1F6B4A]" />
          </div>
          <p className="text-2xl font-bold font-poppins text-gray-900 mt-2">
            {activeTenancies.length}
          </p>
          <span className="text-xs text-gray-400 mt-1 block">Occupying student &amp; private rooms</span>
        </div>

        <div className="card p-5 bg-white border border-amber-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
              Expiring Soon (&le; 14 Days)
            </span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold font-poppins text-amber-900 mt-2">
            {expiringTenancies.length}
          </p>
          <span className="text-xs text-amber-600 mt-1 block">Due for semester renewal or relisting</span>
        </div>

        <div className="card p-5 bg-white border border-red-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-red-700 uppercase tracking-wide">
              Vacated / Overdue Relist
            </span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <p className="text-2xl font-bold font-poppins text-red-900 mt-2">
            {vacatedUnlisted.length}
          </p>
          <span className="text-xs text-red-600 mt-1 block">Action needed to make room available</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2 overflow-x-auto">
        {(
          [
            { id: "ALL", label: `All Records (${tenancies.length})` },
            { id: "ACTIVE", label: `Active (${activeTenancies.length})` },
            { id: "EXPIRING", label: `Expiring Soon (${expiringTenancies.length})` },
            { id: "VACATED", label: "Vacated / Ended" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              filter === tab.id
                ? "bg-[#1F6B4A] text-white shadow-xs"
                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Table / List */}
      {loading ? (
        <div className="card p-12 bg-white flex flex-col items-center justify-center text-gray-400 gap-3 border border-gray-100">
          <Loader2 className="w-8 h-8 animate-spin text-[#1F6B4A]" />
          <p className="text-sm font-medium">Loading occupancy records...</p>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="card p-12 bg-white text-center border border-gray-100 rounded-2xl space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center mx-auto">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-poppins font-bold text-gray-900 text-base">No tenancy records found</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto mt-1">
              When students or general tenants take up rooms, record them here to keep your property availability accurate and receive semester renewal alerts.
            </p>
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Record First Tenancy
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredList.map((item) => {
            const endDateObj = new Date(item.endDate);
            const isExpired = endDateObj < now && item.status === "ACTIVE";
            const isNearExpiry = endDateObj <= fourteenDaysAhead && endDateObj >= now && item.status === "ACTIVE";

            const diffDays = Math.ceil((endDateObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

            return (
              <div
                key={item.id}
                className={`card p-5 bg-white border transition-all hover:shadow-xs rounded-2xl ${
                  isExpired
                    ? "border-red-200 bg-red-50/20"
                    : isNearExpiry
                    ? "border-amber-200 bg-amber-50/20"
                    : "border-gray-100"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Property & Tenant Info */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-poppins font-bold text-base text-gray-900">
                        {item.property.title}
                      </h3>
                      {item.unitNumber && (
                        <span className="text-xs px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 font-medium">
                          {item.unitNumber}
                        </span>
                      )}
                      <span className="text-xs px-2 py-0.5 rounded-md bg-[#E4F5EC] text-[#1F6B4A] font-semibold">
                        {item.property.area}
                      </span>
                      {item.tenantType === "STUDENT" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                          <GraduationCap className="w-3 h-3" /> Student Tenant
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-semibold">
                          <Briefcase className="w-3 h-3" /> General Tenant
                        </span>
                      )}
                    </div>

                    {/* Minimal Tenant Contact Details */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                      <span className="font-semibold text-gray-800">Tenant: {item.tenantName}</span>
                      <a
                        href={`tel:${item.tenantPhone}`}
                        className="inline-flex items-center gap-1 text-gray-500 hover:text-[#1F6B4A]"
                      >
                        <Phone className="w-3 h-3" /> {item.tenantPhone}
                      </a>
                      <a
                        href={`mailto:${item.tenantEmail}`}
                        className="inline-flex items-center gap-1 text-gray-500 hover:text-[#1F6B4A]"
                      >
                        <Mail className="w-3 h-3" /> {item.tenantEmail}
                      </a>
                    </div>
                  </div>

                  {/* Middle: Dates & Rent */}
                  <div className="flex flex-wrap items-center gap-6 text-xs text-gray-600 bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-medium block">Period</span>
                      <span className="font-semibold text-gray-800">
                        {item.periodType === "SEMESTER_1"
                          ? "Semester 1"
                          : item.periodType === "SEMESTER_2"
                          ? "Semester 2"
                          : item.periodType === "FULL_ACADEMIC_YEAR"
                          ? "Academic Year"
                          : "Custom Term"}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-medium block">End Date</span>
                      <span className="font-semibold text-gray-800">
                        {endDateObj.toLocaleDateString("en-KE", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-medium block">Rent</span>
                      <span className="font-semibold text-[#1F6B4A]">
                        Ksh {item.monthlyRent.toLocaleString()}/mo
                      </span>
                    </div>

                    {/* Countdown Badge */}
                    {item.status === "ACTIVE" && (
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase font-medium block">Status</span>
                        {isExpired ? (
                          <span className="text-[11px] font-bold text-red-600 inline-flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Ended {Math.abs(diffDays)}d ago
                          </span>
                        ) : isNearExpiry ? (
                          <span className="text-[11px] font-bold text-amber-600 inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {diffDays} days left
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-emerald-700 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Active ({diffDays}d left)
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 self-end lg:self-center">
                    {item.status === "ACTIVE" ? (
                      <>
                        <button
                          onClick={() => handleRelist(item.id)}
                          disabled={actionLoading === item.id}
                          className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#E4F5EC] hover:bg-[#1F6B4A] text-[#1F6B4A] hover:text-white transition-all inline-flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                          title="Mark room as AVAILABLE and broadcast to student alert subscribers"
                        >
                          {actionLoading === item.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Sparkles className="w-3.5 h-3.5" />
                          )}
                          Student Left: Re-list
                        </button>

                        <button
                          onClick={() => {
                            setRenewTarget(item);
                            setMonthlyRent(String(item.monthlyRent));
                          }}
                          className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all inline-flex items-center gap-1.5 active:scale-95"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Renew
                        </button>
                      </>
                    ) : (
                      <span className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-500 font-medium">
                        {item.status === "VACATED_RELISTED" ? "Re-listed & Available" : item.status}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── CREATE TENANCY MODAL ─────────────────────────────────────── */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-hidden animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] sm:max-h-[88vh] shadow-2xl border border-gray-100 flex flex-col overflow-hidden">
            {/* Modal Header (Fixed) */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0 bg-white">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#E4F5EC] text-[#1F6B4A] flex items-center justify-center flex-shrink-0">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-poppins font-bold text-base sm:text-lg text-gray-900 leading-tight">
                    Record Occupancy / New Tenant
                  </h2>
                  <p className="text-[11px] sm:text-xs text-gray-500">
                    Locks in house as taken and schedules expiry reminders
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form (Scrollable Body) */}
            <form onSubmit={handleCreateTenancy} className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 custom-scrollbar">
                {/* Tenant Type Toggle (Student vs Non-Student) */}
                <div>
                  <label className="input-label mb-1.5 block">Tenant Category</label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setTenantType("STUDENT")}
                      className={`py-2 px-2.5 sm:px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        tenantType === "STUDENT"
                          ? "bg-white text-[#1F6B4A] shadow-xs"
                          : "text-gray-500 hover:text-gray-900"
                      }`}
                    >
                      <GraduationCap className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">Student Tenant</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTenantType("NON_STUDENT")}
                      className={`py-2 px-2.5 sm:px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        tenantType === "NON_STUDENT"
                          ? "bg-white text-purple-700 shadow-xs"
                          : "text-gray-500 hover:text-gray-900"
                      }`}
                    >
                      <Briefcase className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">General (Non-Student)</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">
                    {tenantType === "STUDENT"
                      ? "✓ Follows university semester cycles and enables student confirmation."
                      : "✓ General tenancy with customizable lease duration (no student requirements)."}
                  </p>
                </div>

                {/* Property Selector */}
                <div>
                  <label className="input-label">Select Property</label>
                  <select
                    className="input"
                    value={propertyId}
                    onChange={(e) => handlePropertyChange(e.target.value)}
                    required
                  >
                    {properties.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} ({p.area}) — Ksh {p.rent.toLocaleString()} ({p.availableSpaces} spaces left)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Minimal Tenant Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="input-label">Tenant Full Name</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. Kelvin Mutua"
                      value={tenantName}
                      onChange={(e) => setTenantName(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="input-label">Phone Number (M-Pesa / WhatsApp)</label>
                    <input
                      type="tel"
                      className="input"
                      placeholder="0712 345 678"
                      value={tenantPhone}
                      onChange={(e) => setTenantPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="input-label">Email Address</label>
                    <input
                      type="email"
                      className="input"
                      placeholder="tenant@example.com"
                      value={tenantEmail}
                      onChange={(e) => setTenantEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="input-label">Unit / Room No. (Optional)</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. Room 4B or Floor 2"
                      value={unitNumber}
                      onChange={(e) => setUnitNumber(e.target.value)}
                    />
                  </div>
                </div>

                {/* Academic Semester vs Custom Period */}
                {tenantType === "STUDENT" && (
                  <div>
                    <label className="input-label">Academic Duration</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: "SEMESTER_1", label: "Semester 1" },
                        { id: "SEMESTER_2", label: "Semester 2" },
                        { id: "FULL_ACADEMIC_YEAR", label: "Full Year" },
                        { id: "CUSTOM", label: "Custom Dates" },
                      ].map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setPeriodType(p.id as any)}
                          className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                            periodType === p.id
                              ? "border-[#1F6B4A] bg-[#E4F5EC] text-[#1F6B4A]"
                              : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Start & End Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="input-label">Lease Start Date</label>
                    <input
                      type="date"
                      className="input"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="input-label">Lease Expiry / Checkout Date</label>
                    <input
                      type="date"
                      className="input"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Financials */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="input-label">Agreed Monthly Rent (KES)</label>
                    <input
                      type="number"
                      className="input"
                      value={monthlyRent}
                      onChange={(e) => setMonthlyRent(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="input-label">Deposit Paid (KES)</label>
                    <input
                      type="number"
                      className="input"
                      placeholder="0"
                      value={depositPaid}
                      onChange={(e) => setDepositPaid(e.target.value)}
                    />
                  </div>
                </div>

                {/* Optional verification checkbox for students */}
                {tenantType === "STUDENT" && (
                  <label className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-100 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={requireStudentConfirmation}
                      onChange={(e) => setRequireStudentConfirmation(e.target.checked)}
                      className="mt-0.5 rounded text-[#1F6B4A] focus:ring-[#1F6B4A]"
                    />
                    <span className="text-xs text-gray-700 leading-snug">
                      Send digital confirmation request to student&apos;s CampusKey email/account.
                    </span>
                  </label>
                )}
              </div>

              {/* Modal Footer (Fixed at bottom) */}
              <div className="px-6 py-3.5 border-t border-gray-100 flex items-center justify-end gap-3 flex-shrink-0 bg-gray-50/80">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-200/60 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary text-xs py-2.5 px-6 inline-flex items-center gap-2 shadow-xs"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Confirm Occupancy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── RENEW MODAL ─────────────────────────────────────────────── */}
      {renewTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-hidden animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] shadow-2xl border border-gray-100 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0 bg-white">
              <h2 className="font-poppins font-bold text-base text-gray-900">
                Renew Tenancy for Next Semester / Term
              </h2>
              <button
                onClick={() => setRenewTarget(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleRenewSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 custom-scrollbar">
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs space-y-1">
                  <p className="font-bold text-gray-900">{renewTarget.property.title}</p>
                  <p className="text-gray-500">Tenant: {renewTarget.tenantName} ({renewTarget.tenantPhone})</p>
                </div>

                <div>
                  <label className="input-label">New Expiry / Semester End Date</label>
                  <input
                    type="date"
                    className="input"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="input-label">Monthly Rent (KES)</label>
                  <input
                    type="number"
                    className="input"
                    value={monthlyRent}
                    onChange={(e) => setMonthlyRent(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-3.5 border-t border-gray-100 flex items-center justify-end gap-3 flex-shrink-0 bg-gray-50/80">
                <button
                  type="button"
                  onClick={() => setRenewTarget(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-200/60 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary text-xs py-2 px-5 inline-flex items-center gap-2 shadow-xs"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Renewal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
