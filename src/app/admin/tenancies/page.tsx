"use client";

import { useEffect, useState } from "react";
import {
  KeyRound,
  Users,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  Home,
  RotateCcw,
  Loader2,
  Search,
  ExternalLink,
  MessageCircle,
  Play,
} from "lucide-react";
import Link from "next/link";

interface TenancyRecord {
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
  status: string;
  property: {
    id: string;
    title: string;
    area: string;
    rent: number;
    availabilityStatus: string;
    availableSpaces: number;
    totalSpaces: number;
  };
  partner: {
    id: string;
    companyName: string;
    payoutPhone: string | null;
    user: { name: string; email: string; phone: string | null };
  };
  student?: { id: string; name: string; email: string; phone: string | null } | null;
}

export default function AdminTenanciesPage() {
  const [tenancies, setTenancies] = useState<TenancyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "expiring" | "vacated">("all");
  const [search, setSearch] = useState("");
  const [triggeringWorker, setTriggeringWorker] = useState(false);
  const [workerResult, setWorkerResult] = useState<string | null>(null);

  const fetchTenancies = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/tenancies?filter=${filter}`);
      if (res.ok) {
        const data = await res.json();
        setTenancies(data);
      }
    } catch (err) {
      console.error("Error fetching tenancies for admin:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenancies();
  }, [filter]);

  // Run the reminder worker manually from admin
  const handleTriggerWorker = async () => {
    setTriggeringWorker(true);
    setWorkerResult(null);
    try {
      const res = await fetch("/api/worker/tenancy-reminders", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setWorkerResult(
          `Worker ran successfully! Sent ${data.landlordRemindersSent} landlord reminder emails. Checked ${data.upcomingChecked} upcoming and ${data.overdueChecked} overdue tenancies.`
        );
        fetchTenancies();
      } else {
        setWorkerResult(`Worker error: ${data.error || "Failed to trigger"}`);
      }
    } catch (err: any) {
      setWorkerResult(`Error: ${err.message}`);
    } finally {
      setTriggeringWorker(false);
    }
  };

  const now = new Date();
  const fourteenDaysAhead = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  const filtered = tenancies.filter((t) => {
    const q = search.toLowerCase();
    return (
      t.property.title.toLowerCase().includes(q) ||
      t.property.area.toLowerCase().includes(q) ||
      t.tenantName.toLowerCase().includes(q) ||
      t.partner.companyName.toLowerCase().includes(q) ||
      t.partner.user.name.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#E4F5EC] text-[#1F6B4A] flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-poppins font-bold text-xl sm:text-2xl text-gray-900">
                Tenancies &amp; Expiry Audit
              </h1>
              <p className="text-xs text-gray-500">
                Audit active campus housing tenancies, track overdue unlisted units, and trigger reminder jobs
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleTriggerWorker}
          disabled={triggeringWorker}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0E3B2E] hover:bg-[#155341] text-white text-xs font-semibold shadow-xs transition-all disabled:opacity-60"
        >
          {triggeringWorker ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4 text-emerald-400" />
          )}
          Run Tenancy Reminder Engine Now
        </button>
      </div>

      {workerResult && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
          {workerResult}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: "all", label: "All Records" },
            { id: "active", label: "Active Stays" },
            { id: "expiring", label: "Expiring (≤ 14 Days)" },
            { id: "vacated", label: "Vacated / Unlisted" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                filter === tab.id
                  ? "bg-[#1F6B4A] text-white shadow-xs"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search property, tenant, landlord..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10 text-xs py-2"
          />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden border border-gray-100 bg-white shadow-xs rounded-2xl">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-gray-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#1F6B4A]" />
            <p className="text-xs font-medium">Loading tenancies...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-xs">
            No tenancy records found matching the current criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50/80 text-gray-400 font-semibold border-b border-gray-100 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Property</th>
                  <th className="py-3.5 px-4">Landlord / Partner</th>
                  <th className="py-3.5 px-4">Tenant Info</th>
                  <th className="py-3.5 px-4">Academic Term</th>
                  <th className="py-3.5 px-4">Expiry Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((item) => {
                  const endObj = new Date(item.endDate);
                  const isExpired = endObj < now && item.status === "ACTIVE";
                  const isNearExpiry = endObj <= fourteenDaysAhead && endObj >= now && item.status === "ACTIVE";
                  const diffDays = Math.ceil((endObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

                  const landlordPhone = item.partner.user.phone || item.partner.payoutPhone || "";
                  const cleanPhone = landlordPhone.replace(/[^0-9]/g, "");

                  return (
                    <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-gray-900">{item.property.title}</div>
                        <div className="text-[11px] text-gray-400 flex items-center gap-1.5 mt-0.5">
                          <span>{item.property.area}</span>
                          {item.unitNumber && <span className="text-gray-600">· {item.unitNumber}</span>}
                          <span>· Ksh {item.monthlyRent.toLocaleString()}/mo</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-gray-900">
                          {item.partner.companyName || item.partner.user.name}
                        </div>
                        <div className="text-[11px] text-gray-400 mt-0.5">{landlordPhone || item.partner.user.email}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-gray-900 flex items-center gap-1.5">
                          {item.tenantName}
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded-full font-semibold ${
                              item.tenantType === "STUDENT"
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : "bg-purple-50 text-purple-700 border border-purple-200"
                            }`}
                          >
                            {item.tenantType === "STUDENT" ? "Student" : "General"}
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-400 mt-0.5">
                          {item.tenantPhone} · {item.tenantEmail}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-medium text-gray-800">
                          {item.periodType === "SEMESTER_1"
                            ? "Semester 1"
                            : item.periodType === "SEMESTER_2"
                            ? "Semester 2"
                            : item.periodType === "FULL_ACADEMIC_YEAR"
                            ? "Academic Year"
                            : "Custom Term"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-gray-900">
                          {endObj.toLocaleDateString("en-KE", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                        {item.status === "ACTIVE" && (
                          <div className="text-[10px] font-bold mt-0.5">
                            {isExpired ? (
                              <span className="text-red-600">Ended {Math.abs(diffDays)}d ago</span>
                            ) : isNearExpiry ? (
                              <span className="text-amber-600">{diffDays} days left</span>
                            ) : (
                              <span className="text-emerald-600">{diffDays} days left</span>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            item.status === "ACTIVE"
                              ? isExpired
                                ? "bg-red-100 text-red-800"
                                : isNearExpiry
                                ? "bg-amber-100 text-amber-800"
                                : "bg-emerald-100 text-emerald-800"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {item.status === "ACTIVE" && (isExpired ? "OVERDUE RELIST" : "ACTIVE")}
                          {item.status === "VACATED_RELISTED" && "RELISTED & AVAILABLE"}
                          {item.status === "PENDING_CONFIRMATION" && "PENDING CONFIRM"}
                          {item.status === "CANCELLED" && "CANCELLED"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {cleanPhone && (
                            <a
                              href={`https://wa.me/${cleanPhone.startsWith("0") ? "254" + cleanPhone.slice(1) : cleanPhone}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              title="Chat with Landlord on WhatsApp"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </a>
                          )}
                          <a
                            href={`tel:${landlordPhone}`}
                            className="p-1.5 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100"
                            title="Call Landlord"
                          >
                            <Phone className="w-4 h-4" />
                          </a>
                          <Link
                            href={`/listings/${item.property.id}`}
                            className="p-1.5 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100"
                            title="View Property Listing"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
