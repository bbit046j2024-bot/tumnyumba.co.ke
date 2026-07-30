"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Home, Building2, Users, FileText,
  BarChart3, MessageSquare, Megaphone, Settings, LogOut,
  ChevronLeft, ChevronRight, Bell, TrendingUp,
} from "lucide-react";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/properties", icon: Home, label: "Properties" },
  { href: "/admin/partners", icon: Building2, label: "Partners" },
  { href: "/admin/applications", icon: FileText, label: "Applications" },
  { href: "/admin/students", icon: Users, label: "Students" },
  { href: "/admin/revenue", icon: TrendingUp, label: "Revenue" },
  { href: "/admin/chat", icon: MessageSquare, label: "Chat" },
  { href: "/admin/advertisements", icon: Megaphone, label: "Advertisements" },
  { href: "/admin/reports", icon: BarChart3, label: "Reports" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`flex flex-col h-screen sticky top-0 bg-[#0E3B2E] shadow-sidebar transition-all duration-300 ${
        collapsed ? "w-20" : "w-[230px]"
      }`}
    >
      {/* Logo */}
      <div className={`flex items-center h-20 px-5 border-b border-white/10 ${collapsed ? "justify-center" : "gap-3"}`}>
        <div className="w-9 h-9 bg-[#1F6B4A] rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
          <Home className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div>
            <div className="font-poppins font-bold text-white text-base leading-tight">
              TUM<span className="text-[#3CB474]"> Nyumba</span>
            </div>
            <div className="text-[11px] text-emerald-200/80 font-medium">Find. Live. Belong</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`${active ? "sidebar-link-active" : "sidebar-link"} ${collapsed ? "justify-center" : ""}`}
              title={collapsed ? label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="px-3 pb-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-primary-300 hover:text-white hover:bg-white/10 rounded-xl transition-all text-sm"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /><span>Collapse</span></>}
        </button>
      </div>

      {/* Logout */}
      <div className="px-3 pb-5 border-t border-white/10 pt-3">
        <button
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
          className={`sidebar-link w-full text-red-300 hover:bg-red-500/20 hover:text-red-200 ${collapsed ? "justify-center" : ""}`}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
