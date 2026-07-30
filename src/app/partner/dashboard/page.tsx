"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Home, CheckCircle2, Clock, DollarSign, PlusCircle,
  MessageSquare, CalendarCheck, Loader2, Users
} from "lucide-react";

interface Stats {
  total: number;
  available: number;
  taken: number;
  recentLeads: Array<{
    id: string;
    status: string;
    createdAt: string;
    property: { title: string };
    student: { name: string };
  }>;
}

const statusColor: Record<string, string> = {
  PENDING: "badge-warning",
  CONTACTED: "badge-warning",
  BOOKED: "badge-success",
  CANCELLED: "bg-red-100 text-red-700 px-2 py-0.5 rounded-lg text-xs font-semibold",
};

export default function PartnerDashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/partner/stats")
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) setStats(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    {
      label: "Total Listings",
      value: stats ? String(stats.total) : "—",
      sub: "All your properties",
      icon: Home,
      color: "bg-emerald-100 text-emerald-700",
    },
    {
      label: "Occupied",
      value: stats ? String(stats.taken) : "—",
      sub: "Currently taken",
      icon: CheckCircle2,
      color: "bg-blue-100 text-blue-700",
    },
    {
      label: "Available",
      value: stats ? String(stats.available) : "—",
      sub: "Ready for tenants",
      icon: Clock,
      color: "bg-amber-100 text-amber-700",
    },
    {
      label: "Total Leads",
      value: stats ? String(stats.recentLeads.length) : "—",
      sub: "Recent student interest",
      icon: Users,
      color: "bg-purple-100 text-purple-700",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Welcome back, {session?.user?.name || "Partner"} 👋
          </p>
        </div>
        <Link href="/partner/properties/add" className="btn-primary">
          <PlusCircle className="w-5 h-5" /> Add New Property
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="card p-6 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-gray-500 font-poppins">{label}</div>
              <div className="font-poppins font-bold text-2xl text-gray-900 mt-1">
                {loading ? <Loader2 className="w-5 h-5 animate-spin text-gray-400" /> : value}
              </div>
              <div className="text-xs text-emerald-600 font-medium mt-1">{sub}</div>
            </div>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
              <Icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Recent Leads */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-poppins font-bold text-lg text-gray-900 flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-primary-700" /> Recent Student Leads
          </h2>
          <Link href="/partner/bookings" className="text-xs font-semibold text-primary-700 hover:underline">
            View all
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
          </div>
        ) : !stats || stats.recentLeads.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <Users className="w-10 h-10 mx-auto mb-2 text-gray-200" />
            <p className="text-sm font-medium">No leads yet</p>
            <p className="text-xs mt-1">Students who express interest will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stats.recentLeads.map((lead) => (
              <div key={lead.id} className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl">
                <div>
                  <div className="text-sm font-semibold text-gray-900 font-poppins">{lead.student.name}</div>
                  <div className="text-xs text-gray-500">
                    {lead.property.title} · {new Date(lead.createdAt).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                </div>
                <span className={statusColor[lead.status] || "badge-warning"}>{lead.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-poppins font-bold text-lg text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary-700" /> Quick Actions
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: "/partner/properties", label: "My Properties", icon: Home },
            { href: "/partner/properties/add", label: "Add Listing", icon: PlusCircle },
            { href: "/partner/bookings", label: "All Leads", icon: CalendarCheck },
            { href: "/partner/revenue", label: "Revenue", icon: DollarSign },
          ].map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-primary-50 hover:text-primary-700 rounded-xl transition-all text-gray-600 text-sm font-medium font-poppins">
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
