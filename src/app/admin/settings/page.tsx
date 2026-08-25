"use client";

import { useState, useEffect } from "react";
import { Settings, Save, Shield, CreditCard, Bell, ToggleLeft, ToggleRight, Loader2, CheckCircle2 } from "lucide-react";

export default function AdminSettingsPage() {
  const [enableDirectBooking, setEnableDirectBooking] = useState(false);
  const [leadFee, setLeadFee] = useState("50");
  const [supportEmail, setSupportEmail] = useState("campusdive.org@gmail.com");
  const [mpesaPaybill, setMpesaPaybill] = useState("400200");
  
  const [semester1EndDate, setSemester1EndDate] = useState("2026-12-20");
  const [semester2EndDate, setSemester2EndDate] = useState("2026-04-30");
  const [academicYearEndDate, setAcademicYearEndDate] = useState("2026-07-31");
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load settings");
        return res.json();
      })
      .then((data) => {
        if (data) {
          setEnableDirectBooking(Boolean(data.enableDirectBooking));
          if (data.leadFee !== undefined) setLeadFee(String(data.leadFee));
          if (data.supportEmail) setSupportEmail(data.supportEmail);
          if (data.mpesaPaybill) setMpesaPaybill(data.mpesaPaybill);
          if (data.semester1EndDate) setSemester1EndDate(data.semester1EndDate);
          if (data.semester2EndDate) setSemester2EndDate(data.semester2EndDate);
          if (data.academicYearEndDate) setAcademicYearEndDate(data.academicYearEndDate);
        }
      })
      .catch((err) => {
        console.error("Error loading settings:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enableDirectBooking,
          leadFee: Number(leadFee) || 50,
          supportEmail,
          mpesaPaybill,
          semester1EndDate,
          semester2EndDate,
          academicYearEndDate,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save settings");
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in pb-12">
      <div>
        <h1 className="page-title">Platform Settings</h1>
        <p className="page-subtitle">Configure system options, academic semester cycles, fees, and automated relisting parameters.</p>
      </div>

      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl p-4 font-medium flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>Platform settings saved and applied successfully across the platform!</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Academic Calendar & Tenancy Reminder Schedule */}
        <div className="card p-6 space-y-4">
          <h3 className="font-poppins font-bold text-base text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
            <Bell className="w-5 h-5 text-primary-700" /> Academic Calendar &amp; Tenancy Expiry Reminders
          </h3>
          <p className="text-xs text-gray-500">
            Defines the default university semester end dates. The automated reminder worker uses these dates to send Landlords 1-click re-listing emails when students vacate.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div>
              <label className="input-label">Semester 1 End Date</label>
              <input
                type="date"
                value={semester1EndDate}
                onChange={(e) => setSemester1EndDate(e.target.value)}
                className="input"
                required
              />
              <span className="text-xs text-gray-400 mt-1 block">Usually mid-December.</span>
            </div>

            <div>
              <label className="input-label">Semester 2 End Date</label>
              <input
                type="date"
                value={semester2EndDate}
                onChange={(e) => setSemester2EndDate(e.target.value)}
                className="input"
                required
              />
              <span className="text-xs text-gray-400 mt-1 block">Usually late April.</span>
            </div>

            <div>
              <label className="input-label">Full Academic Year End</label>
              <input
                type="date"
                value={academicYearEndDate}
                onChange={(e) => setAcademicYearEndDate(e.target.value)}
                className="input"
                required
              />
              <span className="text-xs text-gray-400 mt-1 block">Usually late July.</span>
            </div>
          </div>
        </div>

        {/* Feature Switches */}
        <div className="card p-6 space-y-4">
          <h3 className="font-poppins font-bold text-base text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
            <Shield className="w-5 h-5 text-primary-700" /> Feature Controls
          </h3>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-poppins font-semibold text-sm text-gray-900">
                  Direct Rent &amp; Deposit Online Checkout
                </span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${enableDirectBooking ? "bg-emerald-100 text-emerald-800" : "bg-gray-200 text-gray-600"}`}>
                  {enableDirectBooking ? "ENABLED (Visible)" : "DISABLED (Hidden)"}
                </span>
              </div>
              <p className="text-xs text-gray-500 max-w-xl leading-relaxed">
                When <strong>disabled</strong>, the &ldquo;Book &amp; Pay (Rent + Deposit)&rdquo; button is hidden on all listings. Students only see the &ldquo;Take / Express Interest&rdquo; button to connect with partners directly.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setEnableDirectBooking(!enableDirectBooking)}
              className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                enableDirectBooking ? "bg-[#1F6B4A]" : "bg-gray-300"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  enableDirectBooking ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Billing & Fees */}
        <div className="card p-6 space-y-4">
          <h3 className="font-poppins font-bold text-base text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
            <CreditCard className="w-5 h-5 text-primary-700" /> Lead Fee &amp; Payment Configuration
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="input-label">Standard Lead Fee (KSh)</label>
              <input
                type="number"
                value={leadFee}
                onChange={(e) => setLeadFee(e.target.value)}
                className="input"
              />
              <span className="text-xs text-gray-400 mt-1 block">Billed to students/partners per contact unlock (0 KSh if free).</span>
            </div>
            <div>
              <label className="input-label">M-Pesa Business Paybill / Till No.</label>
              <input
                type="text"
                value={mpesaPaybill}
                onChange={(e) => setMpesaPaybill(e.target.value)}
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Support & System Email */}
        <div className="card p-6 space-y-4">
          <h3 className="font-poppins font-bold text-base text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
            <Bell className="w-5 h-5 text-primary-700" /> Platform System Email
          </h3>
          <div>
            <label className="input-label">Official Support &amp; Enquiries Email</label>
            <input
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              className="input"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="btn-primary py-3.5 px-8 flex items-center gap-2 disabled:opacity-60"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving Changes..." : "Save Settings"}
        </button>
      </form>
    </div>
  );
}
