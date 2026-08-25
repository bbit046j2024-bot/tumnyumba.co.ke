"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  User,
  Phone,
  Mail,
  Bell,
  Bed,
  Loader2,
  ArrowRight,
  MapPin,
  X,
  Plus,
  BellRing,
  CheckCircle2,
} from "lucide-react";
import { useEffect, useState } from "react";

// Mirrored from listings/page.tsx so the same areas appear in both places
const KNOWN_AREAS = [
  "Tudor",
  "TUM",
  "Tononoka",
  "Buxton",
  "Mikindani",
  "Maweni",
  "Mshomoroni",
  "Magongo",
  "Majengo",
  "Nyali",
];

interface Subscription {
  id: string;
  area: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // ── subscription state ───────────────────────────────────────────────────
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [addingArea, setAddingArea] = useState<string | null>(null);
  const [removingArea, setRemovingArea] = useState<string | null>(null);
  const [customArea, setCustomArea] = useState("");
  const [subError, setSubError] = useState<string | null>(null);

  // ── student tenancy state ───────────────────────────────────────────────
  const [studentTenancy, setStudentTenancy] = useState<any>(null);
  const [tenancyLoading, setTenancyLoading] = useState(false);
  const [confirmActionLoading, setConfirmActionLoading] = useState(false);

  const isStudent = session?.user?.role === "STUDENT";

  // Fetch existing subscriptions and active tenancy on mount (students only)
  useEffect(() => {
    if (!isStudent) return;
    setLoadingSubs(true);
    fetch("/api/subscriptions/areas")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setSubs(data);
      })
      .catch(() => {})
      .finally(() => setLoadingSubs(false));

    fetch("/api/student/tenancy")
      .then((r) => r.json())
      .then((data) => {
        if (data) setStudentTenancy(data);
      })
      .catch(() => {});
  }, [isStudent]);

  const handleTenancyConfirm = async (action: "ACCEPT" | "REJECT") => {
    if (!studentTenancy) return;
    setConfirmActionLoading(true);
    try {
      const res = await fetch(`/api/tenancies/${studentTenancy.id}/confirm`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        const data = await res.json();
        if (action === "ACCEPT") {
          setStudentTenancy({ ...studentTenancy, status: "ACTIVE" });
        } else {
          setStudentTenancy(null);
        }
      }
    } catch (err) {
      console.error("Failed to confirm tenancy", err);
    } finally {
      setConfirmActionLoading(false);
    }
  };

  async function subscribe(area: string) {
    const trimmed = area.trim();
    if (!trimmed) return;
    setSubError(null);
    setAddingArea(trimmed);
    try {
      const res = await fetch("/api/subscriptions/areas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ area: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to subscribe");
      // Add to local list if not already present
      setSubs((prev) =>
        prev.some((s) => s.area.toLowerCase() === data.area.toLowerCase())
          ? prev
          : [...prev, data]
      );
      setCustomArea("");
    } catch (err: any) {
      setSubError(err.message);
    } finally {
      setAddingArea(null);
    }
  }

  async function unsubscribe(area: string) {
    setSubError(null);
    setRemovingArea(area);
    try {
      const res = await fetch("/api/subscriptions/areas", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ area }),
      });
      if (!res.ok) throw new Error("Failed to remove subscription");
      setSubs((prev) => prev.filter((s) => s.area !== area));
    } catch (err: any) {
      setSubError(err.message);
    } finally {
      setRemovingArea(null);
    }
  }

  // ── render guards ────────────────────────────────────────────────────────

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1F6B4A]" />
      </div>
    );
  }

  if (!session?.user) {
    router.push("/auth/login?next=/profile");
    return null;
  }

  const user = session.user;
  const subscribedNames = new Set(subs.map((s) => s.area.toLowerCase()));

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <div className="space-y-6">
          {/* ── Account Header ─────────────────────────────────────────── */}
          <div className="card p-6 sm:p-8 bg-white border border-gray-100 shadow-xs space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#E4F5EC] text-[#1F6B4A] font-poppins font-bold text-2xl flex items-center justify-center">
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div>
                <h1 className="font-poppins font-bold text-xl sm:text-2xl text-gray-900">
                  {user.name || "User Account"}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#1F6B4A]/10 text-[#1F6B4A] font-semibold uppercase tracking-wider">
                    {user.role || "STUDENT"}
                  </span>
                  <span className="text-xs text-gray-400">CampusKey Mombasa</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-gray-100 text-xs">
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 text-gray-700">
                <Mail className="w-4 h-4 text-gray-400" />
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-medium block">Email</span>
                  <span className="font-semibold">{user.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 text-gray-700">
                <Phone className="w-4 h-4 text-gray-400" />
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-medium block">M-Pesa Phone</span>
                  <span className="font-semibold">{(user as any).phone || "Registered Account"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Active Campus Residence / Tenancy Handshake ─────────────── */}
          {isStudent && studentTenancy && (
            <div className={`card p-6 bg-white border shadow-xs rounded-2xl ${
              studentTenancy.status === "PENDING_CONFIRMATION" ? "border-amber-200 bg-amber-50/20" : "border-emerald-100"
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-[#1F6B4A]/10 text-[#1F6B4A]">
                      Current Campus Residence
                    </span>
                    {studentTenancy.status === "PENDING_CONFIRMATION" && (
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-amber-100 text-amber-800">
                        Action Required: Confirmation Pending
                      </span>
                    )}
                  </div>

                  <h3 className="font-poppins font-bold text-lg text-gray-900">
                    {studentTenancy.property?.title}
                    {studentTenancy.unitNumber ? ` (${studentTenancy.unitNumber})` : ""}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {studentTenancy.property?.area}, Mombasa · Landlord: {studentTenancy.partner?.companyName || studentTenancy.partner?.user?.name}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 pt-2">
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-medium block">Lease Duration</span>
                      <span className="font-semibold">
                        Until {new Date(studentTenancy.endDate).toLocaleDateString("en-KE", { year: "numeric", month: "short", day: "numeric" })}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-medium block">Agreed Rent</span>
                      <span className="font-semibold text-[#1F6B4A]">Ksh {studentTenancy.monthlyRent?.toLocaleString()}/mo</span>
                    </div>
                  </div>
                </div>

                {studentTenancy.status === "PENDING_CONFIRMATION" ? (
                  <div className="flex items-center gap-2 self-start sm:self-center pt-2 sm:pt-0">
                    <button
                      onClick={() => handleTenancyConfirm("ACCEPT")}
                      disabled={confirmActionLoading}
                      className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5"
                    >
                      {confirmActionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      Confirm Stay
                    </button>
                    <button
                      onClick={() => handleTenancyConfirm("REJECT")}
                      disabled={confirmActionLoading}
                      className="px-3 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 border border-gray-200"
                    >
                      Not My Room
                    </button>
                  </div>
                ) : (
                  <div className="self-start sm:self-center">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Verified Resident
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Quick Actions ───────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/notifications"
              className="card p-5 hover:shadow-md transition-all border border-gray-100 flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-poppins font-bold text-sm text-gray-900 group-hover:text-[#1F6B4A] transition-colors">
                    Notifications &amp; Booking Links
                  </h3>
                  <p className="text-xs text-gray-400">View landlord payment links &amp; alerts</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#1F6B4A] group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              href="/listings"
              className="card p-5 hover:shadow-md transition-all border border-gray-100 flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E4F5EC] text-[#1F6B4A] flex items-center justify-center">
                  <Bed className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-poppins font-bold text-sm text-gray-900 group-hover:text-[#1F6B4A] transition-colors">
                    Browse Verified Listings
                  </h3>
                  <p className="text-xs text-gray-400">Find student bedsitters &amp; hostels</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#1F6B4A] group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>

          {/* ── Area Listing Subscriptions (students only) ──────────────── */}
          {isStudent && (
            <div className="card bg-white border border-gray-100 shadow-xs overflow-hidden">
              {/* Card header */}
              <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-[#E4F5EC] text-[#1F6B4A] flex items-center justify-center flex-shrink-0">
                  <BellRing className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-poppins font-bold text-sm text-gray-900">
                    New Listing Alerts
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Get notified by email &amp; in-app when a new property is verified in your chosen areas.
                  </p>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {/* Current subscriptions */}
                {loadingSubs ? (
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading subscriptions…
                  </div>
                ) : subs.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">
                    You haven't subscribed to any areas yet. Select one below to get started.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {subs.map((sub) => (
                      <span
                        key={sub.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-[#E4F5EC] text-[#1F6B4A] border border-[#1F6B4A]/20"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        {sub.area}
                        <button
                          onClick={() => unsubscribe(sub.area)}
                          disabled={removingArea === sub.area}
                          aria-label={`Remove ${sub.area} subscription`}
                          className="ml-0.5 rounded-full hover:bg-[#1F6B4A]/10 p-0.5 transition-colors disabled:opacity-50"
                        >
                          {removingArea === sub.area ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <X className="w-3 h-3" />
                          )}
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Quick-add known areas */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Popular areas
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {KNOWN_AREAS.map((area) => {
                      const already = subscribedNames.has(area.toLowerCase());
                      return (
                        <button
                          key={area}
                          id={`sub-area-${area.toLowerCase()}`}
                          onClick={() => !already && subscribe(area)}
                          disabled={already || addingArea === area}
                          aria-pressed={already}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                            already
                              ? "bg-gray-100 text-gray-400 border-gray-200 cursor-default"
                              : "bg-white text-gray-700 border-gray-200 hover:border-[#1F6B4A] hover:text-[#1F6B4A] hover:bg-[#f0fdf4] active:scale-95"
                          } disabled:opacity-60`}
                        >
                          {addingArea === area ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Plus className={`w-3.5 h-3.5 ${already ? "hidden" : ""}`} />
                          )}
                          {area}
                          {already && <span className="text-[10px] text-gray-400 ml-0.5">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom area input */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Other area
                  </p>
                  <div className="flex gap-2">
                    <input
                      id="custom-area-input"
                      type="text"
                      value={customArea}
                      onChange={(e) => setCustomArea(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") subscribe(customArea);
                      }}
                      placeholder="e.g. Bamburi, Shanzu…"
                      maxLength={100}
                      className="flex-1 min-w-0 text-sm px-3 py-2 rounded-xl border border-gray-200 focus:border-[#1F6B4A] focus:ring-2 focus:ring-[#1F6B4A]/20 outline-none transition-all"
                    />
                    <button
                      id="custom-area-subscribe-btn"
                      onClick={() => subscribe(customArea)}
                      disabled={!customArea.trim() || addingArea === customArea.trim()}
                      className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1F6B4A] text-white text-sm font-semibold hover:bg-[#185a3d] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {addingArea === customArea.trim() ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                      Subscribe
                    </button>
                  </div>
                </div>

                {/* Error feedback */}
                {subError && (
                  <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg border border-red-100">
                    {subError}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
