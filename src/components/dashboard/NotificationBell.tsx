"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Bell, CheckCheck, Trash2, X, BellOff, Loader2 } from "lucide-react";
import Link from "next/link";

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
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

interface NotificationBellProps {
  notificationsPageHref?: string;
}

export default function NotificationBell({ notificationsPageHref }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [clearing, setClearing] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) setNotifications(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount and every 30 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markOne = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  };

  const markAll = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true }),
    });
  };

  const clearAll = async () => {
    setClearing(true);
    try {
      await fetch("/api/notifications", { method: "DELETE" });
      setNotifications([]);
    } finally {
      setClearing(false);
    }
  };

  return (
    <div ref={ref} className="relative">
      {/* Bell button */}
      <button
        onClick={() => { setOpen(o => !o); if (!open) fetchNotifications(); }}
        className="relative p-2.5 rounded-full bg-[#F7F8FA] text-[#1F2937] hover:bg-gray-100 transition-colors focus:outline-none"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#E24C4C] text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-14 w-80 sm:w-96 bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-gray-100 z-50 animate-fade-in overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div>
              <span className="font-poppins font-bold text-sm text-gray-900">Notifications</span>
              {unreadCount > 0 && (
                <span className="ml-2 text-xs bg-[#E24C4C] text-white rounded-full px-1.5 py-0.5 font-bold">{unreadCount}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button onClick={markAll} title="Mark all read" className="text-[#1F6B4A] hover:text-[#175339] transition-colors">
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}
              {notifications.length > 0 && (
                <button onClick={clearAll} disabled={clearing} title="Clear all" className="text-gray-400 hover:text-red-500 transition-colors">
                  {clearing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="flex items-center justify-center py-10 gap-2 text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin text-[#1F6B4A]" />
                <span className="text-xs">Loading...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-2">
                <BellOff className="w-8 h-8" />
                <span className="text-xs">No notifications yet</span>
              </div>
            ) : (
              notifications.map(n => (
                <button
                  key={n.id}
                  onClick={() => markOne(n.id)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-50 transition-colors hover:bg-gray-50 flex gap-3 items-start
                    ${!n.read ? "bg-[#F7FBF8]" : "bg-white"}`}
                >
                  {/* Unread dot */}
                  <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${!n.read ? "bg-[#1F6B4A]" : "bg-gray-200"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <span className={`text-xs font-semibold text-gray-900 ${!n.read ? "font-bold" : ""}`}>{n.title}</span>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap flex-shrink-0">{timeAgo(n.createdAt)}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.body}</p>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          {notificationsPageHref && (
            <div className="px-4 py-3 border-t border-gray-100">
              <Link
                href={notificationsPageHref}
                onClick={() => setOpen(false)}
                className="text-xs text-[#1F6B4A] font-semibold hover:underline"
              >
                View all notifications →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
