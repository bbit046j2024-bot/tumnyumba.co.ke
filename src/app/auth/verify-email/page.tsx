"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle, Mail, RefreshCw, Loader2, XCircle } from "lucide-react";

export default function VerifyEmailPage() {
  const [resendEmail, setResendEmail] = useState("");
  const [resendStatus, setResendStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [resendError, setResendError] = useState("");

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail) return;
    setResendStatus("loading");
    setResendError("");

    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resendEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResendError(data.error || "Something went wrong");
        setResendStatus("error");
      } else {
        setResendStatus("sent");
      }
    } catch {
      setResendError("Network error. Please try again.");
      setResendStatus("error");
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

        <div className="card p-8 shadow-2xl text-center">
          <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <Mail className="w-8 h-8 text-primary-600" />
          </div>

          <h1 className="font-poppins font-bold text-2xl text-gray-900 mb-2">
            Check your inbox
          </h1>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            We've sent a verification link to your email address. Click the link to activate your account.
            The link expires in <strong className="text-gray-700">24 hours</strong>.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left mb-6">
            <p className="text-amber-800 text-sm font-medium">💡 Don't see the email?</p>
            <p className="text-amber-700 text-xs mt-1">Check your spam or junk folder. If it's not there, use the form below to resend.</p>
          </div>

          {/* Resend form */}
          {resendStatus !== "sent" ? (
            <form onSubmit={handleResend} className="space-y-3 text-left">
              <p className="text-sm font-medium text-gray-700">Resend verification email</p>
              <input
                type="email"
                className="input"
                placeholder="Enter your email address"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                required
              />
              {resendStatus === "error" && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <XCircle className="w-4 h-4 flex-shrink-0" />
                  {resendError}
                </div>
              )}
              <button
                type="submit"
                className="btn-primary w-full py-3"
                disabled={resendStatus === "loading"}
              >
                {resendStatus === "loading" ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                ) : (
                  <><RefreshCw className="w-4 h-4" /> Resend Email</>
                )}
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-xl p-4 text-sm">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              Verification email sent! Check your inbox.
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-100">
            <Link href="/auth/login" className="text-sm text-primary-700 font-semibold hover:text-primary-900">
              ← Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
