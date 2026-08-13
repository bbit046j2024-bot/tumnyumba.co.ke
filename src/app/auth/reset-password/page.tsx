"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Eye, EyeOff, ArrowRight, Loader2, CheckCircle, XCircle } from "lucide-react";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setError("Invalid or missing reset token. Please request a new link.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setStatus("loading");
    setError("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        setStatus("error");
      } else {
        setStatus("success");
        // Redirect to login after 3s
        setTimeout(() => router.push("/auth/login?reset=1"), 3000);
      }
    } catch {
      setError("Network error. Please try again.");
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 flex items-center justify-center p-4">
      <div className="absolute top-20 left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="text-left">
              <div className="font-poppins font-bold text-2xl text-white">
                Campus<span className="text-yellow-300">Key</span>
              </div>
              <div className="text-xs text-primary-200">Mombasa · Find. Live. Belong.</div>
            </div>
          </Link>
        </div>

        <div className="card p-8 shadow-2xl animate-fade-in">
          {status === "success" ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="font-poppins font-bold text-2xl text-gray-900 mb-2">Password updated!</h1>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                Your password has been reset successfully. Redirecting you to sign in...
              </p>
              <Link href="/auth/login" className="btn-primary inline-flex py-3 px-8">
                Sign In Now
              </Link>
            </div>
          ) : (
            <>
              <div className="w-14 h-14 bg-primary-50 rounded-full flex items-center justify-center mb-5">
                <Lock className="w-7 h-7 text-primary-600" />
              </div>

              <h1 className="font-poppins font-bold text-2xl text-gray-900 mb-1">
                Create new password
              </h1>
              <p className="text-gray-500 text-sm mb-7 leading-relaxed">
                Your new password must be at least 8 characters long.
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-5 flex items-center gap-2">
                  <XCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {status !== "error" || token ? (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="input-label">New Password</label>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-3.5 w-4 h-4 text-gray-400 pointer-events-none z-10" />
                      <input
                        id="new-password"
                        type={showPass ? "text" : "password"}
                        className="input pl-11 pr-11"
                        placeholder="Min. 8 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
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

                  <div>
                    <label className="input-label">Confirm Password</label>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-3.5 w-4 h-4 text-gray-400 pointer-events-none z-10" />
                      <input
                        id="confirm-password"
                        type={showConfirm ? "text" : "password"}
                        className="input pl-11 pr-11"
                        placeholder="Repeat your new password"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3.5 text-gray-400 hover:text-gray-600 z-10"
                        onClick={() => setShowConfirm(!showConfirm)}
                      >
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn-primary w-full py-3.5"
                    disabled={status === "loading"}
                  >
                    {status === "loading" ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Updating password...</>
                    ) : (
                      <>Reset Password <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                </form>
              ) : (
                <div className="text-center">
                  <Link href="/auth/forgot-password" className="btn-primary inline-flex py-3 px-8">
                    Request New Reset Link
                  </Link>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                <Link href="/auth/login" className="text-sm text-primary-700 font-semibold hover:text-primary-900">
                  ← Back to Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 flex items-center justify-center p-4">
          <Loader2 className="w-8 h-8 animate-spin text-white" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
