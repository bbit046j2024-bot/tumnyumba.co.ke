"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Home, ShieldCheck, Mail, Lock, Phone, User, Key, ArrowRight, Loader2 } from "lucide-react";

export default function AdminRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    secretKey: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/register/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Failed to create admin account");
      return;
    }

    router.push("/auth/login?registered=admin");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
              <Home className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <div className="font-poppins font-bold text-2xl text-white">Campus<span className="text-yellow-300">Key</span></div>
              <div className="text-xs text-primary-200">Admin Account Setup</div>
            </div>
          </Link>
        </div>

        <div className="card p-8 shadow-2xl animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-primary-700" />
            </div>
            <div>
              <h1 className="font-poppins font-bold text-xl text-gray-900">Create Admin Account</h1>
              <p className="text-gray-500 text-xs">For authorized CampusKey Mombasa administrators</p>
            </div>
          </div>

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
                <input
                  type="text"
                  className="input pl-11"
                  placeholder="Admin Name"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="input-label">Admin Email Address</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 w-4 h-4 text-gray-400 pointer-events-none z-10" />
                <input
                  type="email"
                  className="input pl-11"
                  placeholder="admin@campuskey.co.ke"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="input-label">Phone Number</label>
              <div className="relative flex items-center">
                <Phone className="absolute left-3.5 w-4 h-4 text-gray-400 pointer-events-none z-10" />
                <input
                  type="tel"
                  className="input pl-11"
                  placeholder="0700 000 000"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="input-label">Admin Secret Key</label>
              <div className="relative flex items-center">
                <Key className="absolute left-3.5 w-4 h-4 text-gray-400 pointer-events-none z-10" />
                <input
                  type="password"
                  className="input pl-11"
                  placeholder="Enter admin secret key"
                  value={form.secretKey}
                  onChange={(e) => update("secretKey", e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="input-label">Password</label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 w-4 h-4 text-gray-400 pointer-events-none z-10" />
                <input
                  type="password"
                  className="input pl-11"
                  placeholder="Min 8 characters"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="input-label">Confirm Password</label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 w-4 h-4 text-gray-400 pointer-events-none z-10" />
                <input
                  type="password"
                  className="input pl-11"
                  placeholder="Re-enter password"
                  value={form.confirmPassword}
                  onChange={(e) => update("confirmPassword", e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-primary w-full py-3.5" disabled={loading}>
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating Admin...</> : <>Create Admin Account <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-primary-700 font-semibold">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
