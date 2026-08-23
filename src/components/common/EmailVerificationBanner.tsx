"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Mail, CheckCircle, RefreshCw, X, Loader2, AlertTriangle } from "lucide-react";

export default function EmailVerificationBanner() {
  const { data: session } = useSession();
  const [dismissed, setDismissed] = useState(true);
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<"idle" | "sent" | "error">("idle");
  const [resendMsg, setResendMsg] = useState("");

  useEffect(() => {
    // Only show if user is logged in, email is unverified, and banner not dismissed in current browser session
    if (session?.user && !session.user.emailVerified) {
      const isDismissed = sessionStorage.getItem("dismissed_verify_banner");
      if (!isDismissed) {
        setDismissed(false);
      }
    } else {
      setDismissed(true);
    }
  }, [session]);

  if (dismissed || !session?.user || session.user.emailVerified) {
    return null;
  }

  const handleResend = async () => {
    if (!session.user.email || resending) return;
    setResending(true);
    setResendStatus("idle");
    setResendMsg("");

    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session.user.email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResendStatus("error");
        setResendMsg(data.error || "Could not send verification email.");
      } else {
        setResendStatus("sent");
        setResendMsg("Verification link sent! Check your inbox or spam folder.");
      }
    } catch {
      setResendStatus("error");
      setResendMsg("Network error. Please try again.");
    } finally {
      setResending(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("dismissed_verify_banner", "1");
  };

  return (
    <aside aria-label="Email verification notice" className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-white text-xs sm:text-sm px-4 py-2.5 shadow-md relative z-40">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[280px]">
          <AlertTriangle className="w-4 h-4 text-amber-200 flex-shrink-0" />
          <span>
            <strong>Verify your email:</strong> We sent a link to <span className="underline font-semibold">{session.user.email}</span>. Click it to unlock verified status and alerts.
          </span>
        </div>

        <div className="flex items-center gap-3">
          {resendStatus === "sent" ? (
            <span className="flex items-center gap-1 text-emerald-100 font-semibold bg-emerald-900/40 px-3 py-1 rounded-full text-xs">
              <CheckCircle className="w-3.5 h-3.5" />
              {resendMsg}
            </span>
          ) : (
            <button
              onClick={handleResend}
              disabled={resending}
              className="inline-flex items-center gap-1.5 bg-white text-amber-800 hover:bg-amber-50 font-bold px-3.5 py-1 rounded-full text-xs transition-colors shadow-xs disabled:opacity-75"
            >
              {resending ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <RefreshCw className="w-3 h-3" />
                  Resend Link
                </>
              )}
            </button>
          )}

          {resendStatus === "error" && (
            <span className="text-red-100 text-xs">{resendMsg}</span>
          )}

          <button
            onClick={handleDismiss}
            aria-label="Dismiss verification banner"
            className="p-1 text-amber-100 hover:text-white rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
