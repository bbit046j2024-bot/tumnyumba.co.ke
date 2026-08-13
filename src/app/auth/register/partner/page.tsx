"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Home, Building2, User, Mail, Phone, Lock, Eye, EyeOff, ArrowRight, Loader2, Upload, FileText } from "lucide-react";

export default function PartnerRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", companyName: "", licenseNumber: "", password: "", confirmPassword: "" });
  const [permitFile, setPermitFile] = useState<File | null>(null);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError("Passwords do not match"); return; }

    setLoading(true);
    setError("");

    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));
    if (permitFile) formData.append("businessPermit", permitFile);

    const res = await fetch("/api/auth/register/partner", { method: "POST", body: formData });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) { setError(data.error || "Registration failed"); return; }
    router.push("/auth/verify-email");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-lg relative">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
              <Home className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <div className="font-poppins font-bold text-2xl text-white">Campus<span className="text-yellow-300">Key</span></div>
              <div className="text-xs text-primary-200">Partner Registration</div>
            </div>
          </Link>
        </div>

        <div className="card p-8 shadow-2xl animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary-700" />
            </div>
            <div>
              <h1 className="font-poppins font-bold text-xl text-gray-900">Partner Registration</h1>
              <p className="text-gray-500 text-xs">List properties & reach Mombasa students</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-5">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="input-label">Company / Agency Name</label>
              <div className="relative flex items-center">
                <Building2 className="absolute left-3.5 w-4 h-4 text-gray-400 pointer-events-none z-10" />
                <input type="text" className="input pl-11" placeholder="e.g. DK Real Estate" value={form.companyName} onChange={(e) => update("companyName", e.target.value)} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="input-label">Contact Person</label>
                <div className="relative flex items-center">
                  <User className="absolute left-3.5 w-4 h-4 text-gray-400 pointer-events-none z-10" />
                  <input type="text" className="input pl-11" placeholder="Full name" value={form.name} onChange={(e) => update("name", e.target.value)} required />
                </div>
              </div>
              <div>
                <label className="input-label">License Number</label>
                <input type="text" className="input" placeholder="Optional" value={form.licenseNumber} onChange={(e) => update("licenseNumber", e.target.value)} />
              </div>
            </div>

            <div>
              <label className="input-label">Business Email</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 w-4 h-4 text-gray-400 pointer-events-none z-10" />
                <input type="email" className="input pl-11" placeholder="agency@example.com" value={form.email} onChange={(e) => update("email", e.target.value)} required />
              </div>
            </div>

            <div>
              <label className="input-label">Phone Number</label>
              <div className="relative flex items-center">
                <Phone className="absolute left-3.5 w-4 h-4 text-gray-400 pointer-events-none z-10" />
                <input type="tel" className="input pl-11" placeholder="0712 345 678" value={form.phone} onChange={(e) => update("phone", e.target.value)} required />
              </div>
            </div>

            {/* Business Permit Upload */}
            <div>
              <label className="input-label">Business Permit / License (PDF or Image)</label>
              <label className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border-2 border-dashed border-gray-200 cursor-pointer hover:border-[#1F6B4A] hover:bg-[#E4F0E9] transition-all">
                {permitFile ? (
                  <>
                    <FileText className="w-5 h-5 text-[#1F6B4A] flex-shrink-0" />
                    <span className="text-sm text-[#1F6B4A] font-medium truncate">{permitFile.name}</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-500">Upload business permit</span>
                  </>
                )}
                <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setPermitFile(e.target.files?.[0] || null)} />
              </label>
            </div>

            <div>
              <label className="input-label">Password</label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 w-4 h-4 text-gray-400 pointer-events-none z-10" />
                <input type={showPass ? "text" : "password"} className="input pl-11 pr-11" placeholder="Min. 8 characters" value={form.password} onChange={(e) => update("password", e.target.value)} required />
                <button type="button" className="absolute right-3.5 text-gray-400 hover:text-gray-600 z-10" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="input-label">Confirm Password</label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 w-4 h-4 text-gray-400 pointer-events-none z-10" />
                <input type="password" className="input pl-11" placeholder="Re-enter password" value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} required />
              </div>
            </div>

            <div className="bg-primary-50 rounded-xl p-3 text-xs text-gray-600">
              <strong className="text-primary-700">Note:</strong> Your account will be reviewed by the CampusKey Mombasa admin team within 24–48 hours before activation.
            </div>

            <button type="submit" className="btn-primary w-full py-3.5" disabled={loading}>
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting application...</> : <>Submit Application <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              Already a partner?{" "}
              <Link href="/auth/login" className="text-primary-700 font-semibold">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
