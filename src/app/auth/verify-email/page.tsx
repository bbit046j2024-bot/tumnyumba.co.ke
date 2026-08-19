"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Mail, RefreshCw, Loader2, XCircle } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const queryEmail = searchParams.get("email") || "";

  const [resendEmail, setResendEmail] = useState(queryEmail);
  const [resendStatus, setResendStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [resendError, setResendError] = useState("");

  useEffect(() => {
    if (queryEmail) {
      setResendEmail(queryEmail);
    }
  }, [queryEmail]);

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
        setResendError(data.error || "Something went wrong sending the email.");
        setResendStatus("error");
      } else {
        setResendStatus("sent");
      }
    } catch {
      setResendError("Network error. Please check your connection and try again.");
      setResendStatus("error");
    }
  };

  return (
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

      <div className="card p-8 shadow-2xl text-center animate-fade-in">
        <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-5">
          <Mail className="w-8 h-8 text-primary-600" />
        </div>

        <h1 className="font-poppins font-bold text-2xl text-gray-900 mb-2">
          Verify Your Email
        </h1>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          {queryEmail ? (
            <>
              We sent a verification link to <strong className="text-gray-800">{queryEmail}</strong>. Please check your inbox to activate your account.
            </>
          ) : (
            <>
              A verification link was sent to your email address. Click the link in your email to activate your account.
            </>
          )}
        </p>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left mb-6">
          <p className="text-amber-800 text-sm font-medium">💡 Didn't receive the email?</p>
          <p className="text-amber-700 text-xs mt-1 leading-relaxed">
            Check your spam or junk folder. If it hasn't arrived, click below to resend the verification link.
          </p>
        </div>

        {/* Resend form */}
        {resendStatus !== "sent" ? (
          <form onSubmit={handleResend} className="space-y-3 text-left">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Student / Partner Email
            </label>
            <input
              type="email"
              className="input"
              placeholder="Enter your email address"
              value={resendEmail}
              onChange={(e) => setResendEmail(e.target.value)}
              required
            />
            {resendStatus === "error" && (
              <div className="flex items-start gap-2 text-red-600 text-xs bg-red-50 p-3 rounded-lg border border-red-200">
                <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{resendError}</span>
              </div>
            )}
            <button
              type="submit"
              className="btn-primary w-full py-3 flex items-center justify-center gap-2"
              disabled={resendStatus === "loading"}
            >
              {resendStatus === "loading" ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Sending Verification Email...</>
              ) : (
                <><RefreshCw className="w-4 h-4" /> Resend Verification Email</>
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-left">
              <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-600" />
              <span>A fresh verification link has been sent to <strong>{resendEmail}</strong>!</span>
            </div>
            <button
              onClick={() => setResendStatus("idle")}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Send to a different email address
            </button>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between text-xs">
          <Link href="/auth/login" className="text-primary-700 font-semibold hover:text-primary-900">
            ← Back to Sign In
          </Link>
          <Link href="/auth/register/student" className="text-gray-500 hover:text-gray-700">
            Create another account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 flex items-center justify-center p-4">
      <div className="absolute top-20 left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />

      <Suspense
        fallback={
          <div className="text-white flex items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-yellow-300" />
            <span className="text-sm">Loading verification...</span>
          </div>
        }
      >
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
