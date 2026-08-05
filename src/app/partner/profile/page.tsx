"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { Building2, Mail, Phone, CheckCircle2, Trash2, AlertTriangle, Loader2 } from "lucide-react";

interface PartnerProfileData {
  id: string;
  companyName: string;
  licenseNumber: string | null;
  status: string;
  totalLeadsPaid: number;
  user: {
    name: string;
    email: string;
    phone: string | null;
  };
}

export default function PartnerProfilePage() {
  const [profile, setProfile] = useState<PartnerProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/partner/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) setProfile(data);
      })
      .catch(() => setError("Failed to load profile details."))
      .finally(() => setLoading(false));
  }, []);

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const res = await fetch("/api/partner/profile", { method: "DELETE" });
      if (res.ok) {
        await signOut({ callbackUrl: "/" });
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete account.");
      }
    } catch {
      alert("An error occurred while deleting account.");
    } finally {
      setDeleting(false);
      setShowConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  const companyInitials = profile?.companyName
    ? profile.companyName.slice(0, 2).toUpperCase()
    : "PA";

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      <div>
        <h1 className="page-title">Company Profile</h1>
        <p className="page-subtitle">Your verified business details and housing agency identity on CampusKey Mombasa.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* Main Profile Card */}
      <div className="card p-6 space-y-6">
        <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
          <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center font-bold text-2xl text-primary-800 font-poppins">
            {companyInitials}
          </div>
          <div>
            <h2 className="font-poppins font-bold text-xl text-gray-900 flex items-center gap-2">
              {profile?.companyName || "Partner Agency"}
              {profile?.status === "VERIFIED" || profile?.status === "APPROVED" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ) : null}
            </h2>
            <span
              className={
                profile?.status === "APPROVED" || profile?.status === "VERIFIED"
                  ? "badge-success mt-1 inline-block"
                  : profile?.status === "SUSPENDED"
                  ? "badge-danger mt-1 inline-block"
                  : "badge-warning mt-1 inline-block"
              }
            >
              {(profile?.status || "PENDING").toUpperCase()} PARTNER
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase">Contact Person</label>
            <div className="font-semibold text-gray-900 mt-1">{profile?.user.name || "—"}</div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase">License Number</label>
            <div className="font-mono text-gray-900 mt-1">{profile?.licenseNumber || "Not specified"}</div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase">Email Address</label>
            <div className="text-gray-900 mt-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-gray-400" />
              {profile?.user.email || "—"}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase">Phone Number</label>
            <div className="text-gray-900 mt-1 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-gray-400" />
              {profile?.user.phone || "—"}
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone: Delete Account */}
      <div className="card p-6 border-2 border-red-100 bg-red-50/30 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-poppins font-bold text-base text-gray-900">Danger Zone — Delete Account</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Permanently remove your partner profile, property listings, images, and student leads. This action is irreversible.
            </p>
          </div>
        </div>

        <div>
          <button
            onClick={() => setShowConfirm(true)}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" /> Delete My Account
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="card p-6 max-w-md w-full space-y-4 shadow-2xl bg-white">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="font-poppins font-bold text-lg text-gray-900">Confirm Account Deletion</h3>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                Are you sure you want to permanently delete your account (<strong>{profile?.companyName}</strong>)? All your uploaded properties, leads, and messages will be removed permanently.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={deleting}
                className="btn-secondary flex-1 py-2.5 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-xs flex-1 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Yes, Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
