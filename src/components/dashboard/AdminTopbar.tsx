"use client";

import { Bell, Search, ChevronDown } from "lucide-react";
import NotificationBell from "@/components/dashboard/NotificationBell";

interface AdminTopbarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
  };
}

export default function AdminTopbar({ user }: AdminTopbarProps) {
  return (
    <header className="h-20 bg-white border-b border-[#F0F1F4] px-6 flex items-center justify-between flex-shrink-0">
      {/* Search Bar */}
      <div className="relative w-72 lg:w-96">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A94A6]" />
        <input
          type="text"
          placeholder="Search anything..."
          className="w-full pl-11 pr-4 py-2.5 bg-[#F7F8FA] border border-transparent rounded-full text-sm text-[#1F2937] placeholder-[#8A94A6] focus:outline-none focus:border-[#1F6B4A] focus:bg-white transition-all font-inter"
        />
      </div>

      {/* User & Notifications */}
      <div className="flex items-center gap-4">
        {/* Live Notification Bell */}
        <NotificationBell notificationsPageHref="/admin/settings" />

        {/* User Profile */}
        <div className="flex items-center gap-3 border-l border-[#F0F1F4] pl-4 cursor-pointer">
          <div className="w-10 h-10 rounded-full bg-[#E4F5EC] text-[#1F9254] flex items-center justify-center font-bold font-poppins text-sm border border-[#C8EDD9]">
            {user?.name ? user.name[0].toUpperCase() : "A"}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-sm font-semibold text-[#1F2937] font-poppins leading-tight">{user?.name || "Super Admin"}</div>
            <div className="text-xs text-[#8A94A6] font-inter">{user?.email || "admin@campuskey.co.ke"}</div>
          </div>
          <ChevronDown className="w-4 h-4 text-[#8A94A6] hidden sm:block" />
        </div>
      </div>
    </header>
  );
}
