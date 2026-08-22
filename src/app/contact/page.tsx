"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Phone, Mail, MapPin, Send, Loader2, CheckCircle2, MessageSquare } from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to send message. Please try again.");
        return;
      }
      setSuccess(true);
      setName(""); setEmail(""); setSubject(""); setMessage("");
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />

      <section className="bg-hero-gradient pt-32 pb-20 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="font-poppins font-bold text-4xl sm:text-5xl mb-4">Contact Us</h1>
          <p className="text-primary-100 text-lg sm:text-xl max-w-2xl mx-auto">
            Have questions or need support? We&apos;re here to help students and property partners.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Contact Info Cards */}
          <div className="space-y-6">
            <a href="tel:+254797844540" className="card p-6 flex items-start gap-4 hover:border-primary-200 transition-colors group">
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-primary-700 flex-shrink-0 group-hover:bg-primary-100 transition-colors">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-poppins font-bold text-gray-900">Phone / WhatsApp</h3>
                <p className="text-sm text-primary-700 font-semibold mt-1">+254 797 844 540</p>
                <p className="text-xs text-gray-400 mt-0.5">Mon–Fri: 8am – 6pm</p>
              </div>
            </a>

            <a href="mailto:campusdive.org@gmail.com" className="card p-6 flex items-start gap-4 hover:border-primary-200 transition-colors group">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-700 flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-poppins font-bold text-gray-900">Email Us</h3>
                <span className="text-sm text-primary-700 hover:underline mt-1 block break-all">
                  campusdive.org@gmail.com
                </span>
              </div>
            </a>

            <a
              href="https://wa.me/254797844540"
              target="_blank"
              rel="noopener noreferrer"
              className="card p-6 flex items-start gap-4 hover:border-green-200 transition-colors group"
            >
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-700 flex-shrink-0 group-hover:bg-green-100 transition-colors">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-poppins font-bold text-gray-900">WhatsApp Chat</h3>
                <p className="text-sm text-green-700 font-semibold mt-1">Chat with us instantly</p>
                <p className="text-xs text-gray-400 mt-0.5">Fastest response channel</p>
              </div>
            </a>

            <div className="card p-6 flex items-start gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-700 flex-shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-poppins font-bold text-gray-900">Office Location</h3>
                <p className="text-sm text-gray-500 mt-1">Mombasa, Kenya</p>
                <p className="text-xs text-gray-400 mt-0.5">Near TUM Main Campus</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2 card p-8">
            <h2 className="font-poppins font-bold text-2xl text-gray-900 mb-6">Send Us a Message</h2>

            {success ? (
              <div className="flex flex-col items-center justify-center text-center py-16 space-y-4 animate-fade-in">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-9 h-9 text-emerald-600" />
                </div>
                <h3 className="font-poppins font-bold text-xl text-gray-900">Message Sent! 🎉</h3>
                <p className="text-gray-500 text-sm max-w-sm">
                  Thanks for reaching out. We&apos;ve sent a confirmation to your email and our team will get back to you within 24 hours.
                </p>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setSuccess(false)}
                    className="btn-ghost text-sm px-6"
                  >
                    Send Another
                  </button>
                  <Link href="/listings" className="btn-primary text-sm px-6">
                    Browse Listings
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="input-label">Your Name</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="Full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="input-label">Email Address</label>
                    <input
                      type="email"
                      className="input"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="input-label">Subject</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. Housing Inquiry / Partnership"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="input-label">Message</label>
                  <textarea
                    rows={5}
                    className="input resize-none"
                    placeholder="Write your message here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary py-3.5 px-8 flex items-center gap-2 disabled:opacity-60"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                  ) : (
                    <><Send className="w-4 h-4" /> Send Message</>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
