"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Bell, BellOff, CheckCheck, Trash2, Loader2, AlertCircle, Clock, CheckCircle2, XCircle
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

export default function PartnerNotificationsPage() {
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
      if (!res.ok) throw new Error();
      setNotifications(await res.json());
    } catch {
      setError("Failed to load notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markOne = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  };

  const markAll = async () => {
    setMarkingAll(true);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true }),
    });
    setMarkingAll(false);
  };

  const clearAll = async () => {
    setClearing(true);
    await fetch("/api/notifications", { method: "DELETE" });
    setNotifications([]);
    setClearing(false);
  };

  const unread = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6 max-w-3xl animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">
            Updates on your listings, student lead requests, and system announcements.
            {unread > 0 && (
              <span className="ml-2 text-xs bg-[#E24C4C] text-white rounded-full px-2 py-0.5 font-bold">{unread} unread</span>
            )}
          </p>
        </div>

        {notifications.length > 0 && (
          <div className="flex items-center gap-2 self-start">
            {unread > 0 && (
              <button
                onClick={markAll}
                disabled={markingAll}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#1F6B4A] border border-[#1F6B4A]/30 bg-[#E4F5EC] hover:bg-[#1F6B4A] hover:text-white px-3 py-2 rounded-xl transition-all disabled:opacity-50"
              >
                {markingAll ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCheck className="w-3.5 h-3.5" />}
                Mark all read
              </button>
            )}
            <button
              onClick={clearAll}
              disabled={clearing}
              className="flex items-center gap-1.5 text-xs font-semibold text-red-500 border border-red-200 bg-[#FBE7E7] hover:bg-red-500 hover:text-white px-3 py-2 rounded-xl transition-all disabled:opacity-50"
            >
              {clearing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-24 gap-3 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin text-[#1F6B4A]" />
          <span className="text-sm">Loading notifications...</span>
        </div>
      ) : error ? (
        <div className="card p-8 text-center flex flex-col items-center gap-3">
          <AlertCircle className="w-8 h-8 text-red-400" />
          <p className="text-red-500 text-sm">{error}</p>
          <button onClick={fetchNotifications} className="btn-primary text-xs py-2 px-4">Retry</button>
        </div>
      ) : notifications.length === 0 ? (
        <div className="card p-16 text-center flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#E4F5EC] flex items-center justify-center">
            <BellOff className="w-8 h-8 text-[#1F6B4A]/40" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-700 mb-1">All caught up!</h3>
            <p className="text-sm text-gray-400 max-w-xs mx-auto">
              You have no notifications. New lead requests, listing updates, and invoice alerts will appear here.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(n => (
            <button
              key={n.id}
              onClick={() => !n.read && markOne(n.id)}
              className={`w-full text-left card p-5 flex items-start gap-4 transition-all hover:shadow-md
                ${!n.read ? "border-l-4 border-l-[#1F6B4A] bg-[#F7FBF8]" : "border-l-4 border-l-transparent"}`}
            >
              {/* Icon */}
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0
                ${!n.read ? "bg-[#E4F5EC] text-[#1F6B4A]" : "bg-gray-100 text-gray-400"}`}>
                <Bell className="w-5 h-5" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <h3 className={`text-sm ${!n.read ? "font-bold text-gray-900" : "font-semibold text-gray-700"}`}>
                    {n.title}
                  </h3>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-[#1F6B4A] flex-shrink-0" />
                    )}
                    <span className="text-xs text-gray-400 whitespace-nowrap">{timeAgo(n.createdAt)}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{n.body}</p>
                {!n.read && (
                  <span className="inline-block mt-2 text-[10px] text-[#1F6B4A] font-semibold">Click to mark as read</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
