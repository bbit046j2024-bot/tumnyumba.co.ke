"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Home, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || searchParams.get("next");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      if (result.error.includes("EMAIL_NOT_VERIFIED")) {
        setError("EMAIL_NOT_VERIFIED");
      } else {
        setError("Invalid email or password. Please try again.");
      }
    } else {
      const session = await getSession();
      if (callbackUrl) {
        router.push(callbackUrl);
      } else if (session?.user?.role === "ADMIN") {
        router.push("/admin/dashboard");
      } else if (session?.user?.role === "PARTNER") {
        router.push("/partner/dashboard");
      } else {
        router.push("/");
      }
      router.refresh();
    }
  };

  return (
    <div className="w-full max-w-md relative">
      {/* Logo */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <div className="text-left">
            <div className="font-poppins font-bold text-2xl text-white">Campus<span className="text-yellow-300">Key</span></div>
            <div className="text-xs text-primary-200">Mombasa · Find. Live. Belong.</div>
          </div>
        </Link>
      </div>

      <div className="card p-8 shadow-2xl animate-fade-in">
        <h1 className="font-poppins font-bold text-2xl text-gray-900 mb-1">Welcome back</h1>
        <p className="text-gray-500 text-sm mb-7">Sign in to your CampusKey Mombasa account</p>

        {error && (
          <div className={`border text-sm rounded-xl px-4 py-3 mb-5 flex items-center gap-2 ${
            error === "EMAIL_NOT_VERIFIED"
              ? "bg-amber-50 border-amber-200 text-amber-800"
              : "bg-red-50 border-red-200 text-red-700"
          }`}>
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-current" />
            {error === "EMAIL_NOT_VERIFIED" ? (
              <span>
                Please verify your email before signing in.{" "}
                <Link
                  href={`/auth/verify-email?email=${encodeURIComponent(email)}`}
                  className="font-semibold underline text-[#1F6B4A]"
                >
                  Resend verification email
                </Link>
              </span>
            ) : error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="input-label">Email Address</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 w-4 h-4 text-gray-400 pointer-events-none z-10" />
              <input
                id="email"
                type="email"
                className="input pl-11"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="input-label mb-0">Password</label>
              <Link href="/auth/forgot-password" className="text-xs text-[#1F6B4A] hover:underline font-medium">
                Forgot password?
              </Link>
            </div>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 w-4 h-4 text-gray-400 pointer-events-none z-10" />
              <input
                id="password"
                type={showPass ? "text" : "password"}
                className="input pl-11 pr-11"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-3.5 text-gray-400 hover:text-gray-600 z-10"
                onClick={() => setShowPass(!showPass)}
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary w-full py-3.5" disabled={loading}>
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
            ) : (
              <>Sign In <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register/student" className="text-primary-700 font-semibold hover:text-primary-900">
              Register as Student
            </Link>
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Are you a property partner?{" "}
            <Link href="/auth/register/partner" className="text-primary-700 font-semibold hover:text-primary-900">
              Register here
            </Link>
          </p>
        </div>
      </div>

      <p className="text-center text-xs text-primary-200 mt-6">
        © {new Date().getFullYear()} CampusKey Mombasa · Trusted Student Housing
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />

      <Suspense
        fallback={
          <div className="text-white flex items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-yellow-300" />
            <span className="text-sm">Loading login...</span>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
