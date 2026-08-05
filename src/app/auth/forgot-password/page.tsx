"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, CheckCircle2, Loader2, KeyRound } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);

    // Simulate password reset request / call API endpoint if available
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8 mt-16">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
          <div>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-primary-700 transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
            <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-700 mb-4">
              <KeyRound className="w-6 h-6" />
            </div>
            <h1 className="font-poppins font-bold text-2xl text-gray-900">
              Forgot Password?
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              No worries! Enter your registered email address and we&apos;ll send you instructions to reset your password.
            </p>
          </div>

          {submitted ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="font-poppins font-semibold text-emerald-900">
                Reset Link Sent
              </h3>
              <p className="text-xs text-emerald-700 leading-relaxed">
                If an account exists for <span className="font-bold">{email}</span>, you will receive a password reset link shortly. Please check your inbox and spam folder.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setEmail("");
                }}
                className="text-xs text-emerald-800 font-bold hover:underline pt-2 block mx-auto"
              >
                Try another email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="input-label flex items-center gap-1.5 mb-2">
                  <Mail className="w-4 h-4 text-gray-400" /> Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 text-sm font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Sending Reset Link...
                  </>
                ) : (
                  "Send Reset Instructions"
                )}
              </button>
            </form>
          )}

          <div className="text-center text-xs text-gray-400 pt-4 border-t border-gray-100">
            Remember your password?{" "}
            <Link href="/auth/login" className="text-primary-700 font-semibold hover:underline">
              Log in
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
