"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Home, User, Mail, Phone, Lock, Eye, EyeOff, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";

export default function StudentRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.phone.trim()) { setError("Phone number is required"); return; }
    if (form.password !== form.confirmPassword) { setError("Passwords do not match"); return; }
    if (form.password.length < 8) { setError("Password must be at least 8 characters"); return; }

    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/register/student", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) { setError(data.error || "Registration failed"); return; }
    router.push("/auth/login?registered=true");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 flex items-center justify-center p-4 py-12">
      <div className="absolute top-20 right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />

      <div className="w-full max-w-lg relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
              <Home className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <div className="font-poppins font-bold text-2xl text-white">Campus<span className="text-yellow-300">Key</span></div>
              <div className="text-xs text-primary-200">Find. Live. Belong.</div>
            </div>
          </Link>
        </div>

        <div className="card p-8 shadow-2xl animate-fade-in">
          <h1 className="font-poppins font-bold text-2xl text-gray-900 mb-1">Create Student Account</h1>
          <p className="text-gray-500 text-sm mb-7">Start finding verified student housing in Mombasa</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="input-label">Full Name</label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 w-4 h-4 text-gray-400 pointer-events-none z-10" />
                <input type="text" className="input pl-11" placeholder="John Ochieng" value={form.name} onChange={(e) => update("name", e.target.value)} required />
              </div>
            </div>

            <div>
              <label className="input-label">Phone Number</label>
              <div className="relative flex items-center">
                <Phone className="absolute left-3.5 w-4 h-4 text-gray-400 pointer-events-none z-10" />
                <input type="tel" className="input pl-11" placeholder="0712 345 678" value={form.phone} onChange={(e) => update("phone", e.target.value)} required />
              </div>
            </div>

            <div>
              <label className="input-label">Email Address</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 w-4 h-4 text-gray-400 pointer-events-none z-10" />
                <input type="email" className="input pl-11" placeholder="you@example.com" value={form.email} onChange={(e) => update("email", e.target.value)} required />
              </div>
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

            {/* Terms */}
            <p className="text-xs text-gray-500">
              By registering, you agree to our{" "}
              <Link href="/terms" className="text-primary-600 hover:underline">Terms of Service</Link> and{" "}
              <Link href="/privacy" className="text-primary-600 hover:underline">Privacy Policy</Link>.
            </p>

            <button type="submit" className="btn-primary w-full py-3.5" disabled={loading}>
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</> : <>Create Account <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-primary-700 font-semibold hover:text-primary-900">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
