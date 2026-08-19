"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  Bell,
  BellOff,
  CheckCheck,
  Trash2,
  Loader2,
  Clock,
  ArrowRight,
  CreditCard,
  Building,
  Info,
} from "lucide-react";

type Notification = {
  id: string;
  title: string;
  body: string;
  read: boolean;
  link: string | null;
  createdAt: string;
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min${mins !== 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days !== 1 ? "s" : ""} ago`;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [clearing, setClearing] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/notifications");
      if (res.status === 401) {
        router.push("/auth/login?next=/notifications");
        return;
      }
      if (!res.ok) throw new Error();
      setNotifications(await res.json());
    } catch {
      setError("Failed to load notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markOne = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  };

  const markAll = async () => {
    setMarkingAll(true);
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
    } finally {
      setMarkingAll(false);
    }
  };

  const clearAll = async () => {
    if (!confirm("Are you sure you want to clear all notifications?")) return;
    setClearing(true);
    try {
      await fetch("/api/notifications", { method: "DELETE" });
      setNotifications([]);
    } finally {
      setClearing(false);
    }
  };

  const handleClick = async (n: Notification) => {
    await markOne(n.id);
    if (n.link) {
      router.push(n.link);
    }
  };

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-poppins font-bold text-2xl sm:text-3xl text-gray-900 flex items-center gap-3">
              <Bell className="w-7 h-7 text-[#1F6B4A]" />
              Notifications
              {unread > 0 && (
                <span className="bg-[#E24C4C] text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {unread} new
                </span>
              )}
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">
              Stay updated with booking links, payment receipts, and announcements.
            </p>
          </div>

          {notifications.length > 0 && (
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button
                  onClick={markAll}
                  disabled={markingAll}
                  className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  {markingAll ? "Marking..." : "Mark all read"}
                </button>
              )}
              <button
                onClick={clearAll}
                disabled={clearing}
                className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                title="Clear all notifications"
              >
                {clearing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="card p-16 text-center text-gray-400 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#1F6B4A]" />
            <p className="text-sm">Loading your notifications...</p>
          </div>
        ) : error ? (
          <div className="card p-8 text-center space-y-3 bg-red-50/50 border border-red-200">
            <p className="text-sm text-red-700 font-medium">{error}</p>
            <button onClick={fetchNotifications} className="btn-primary text-xs py-2 px-4">
              Try Again
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="card p-16 text-center text-gray-400 space-y-3">
            <BellOff className="w-12 h-12 mx-auto text-gray-300" />
            <p className="font-poppins font-semibold text-gray-600 text-base">No notifications yet</p>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              When a landlord sends you a booking payment link or the admin shares updates, they will show up here.
            </p>
            <Link href="/listings" className="btn-primary text-xs py-2 px-4 inline-block mt-2">
              Browse Listings
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => {
              const isBooking = n.title?.toLowerCase().includes("booking") || n.body?.toLowerCase().includes("booking");
              return (
                <div
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`card p-4 sm:p-5 transition-all cursor-pointer hover:shadow-md border flex gap-4 items-start ${
                    !n.read
                      ? "bg-white border-[#1F6B4A]/30 shadow-xs"
                      : "bg-gray-50/70 border-gray-100 opacity-80 hover:opacity-100"
                  }`}
                >
                  {/* Icon */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isBooking
                        ? "bg-[#E4F5EC] text-[#1F6B4A]"
                        : "bg-blue-50 text-blue-600"
                    }`}
                  >
                    {isBooking ? <CreditCard className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3
                        className={`text-sm font-semibold text-gray-900 ${
                          !n.read ? "font-bold" : ""
                        }`}
                      >
                        {n.title}
                      </h3>
                      <span className="text-[11px] text-gray-400 flex items-center gap-1 whitespace-nowrap">
                        <Clock className="w-3 h-3" />
                        {timeAgo(n.createdAt)}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed">{n.body}</p>

                    {n.link && (
                      <div className="pt-2">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#1F6B4A] hover:underline">
                          Open link <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Unread indicator */}
                  {!n.read && (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1F6B4A] flex-shrink-0 mt-2" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
