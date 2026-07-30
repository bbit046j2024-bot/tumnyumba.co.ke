"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Home, Building2, Users, DollarSign, ArrowUpRight, Bell,
  CheckCircle2, Clock, Loader2
} from "lucide-react";

interface AdminStats {
  totalProperties: number;
  totalPartners: number;
  totalStudents: number;
  recentProperties: Array<{
    id: string;
    title: string;
    area: string;
    rent: number;
    verificationStatus: string;
    createdAt: string;
    partner: { companyName: string; user: { name: string } };
  }>;
  partnerApplications: Array<{
    id: string;
    companyName: string;
    status: string;
    user: { name: string; email: string };
  }>;
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => { if (!d.error) setData(d); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    {
      label: "Total Houses",
      value: data ? data.totalProperties.toLocaleString() : "—",
      change: "All listed properties",
      icon: Home,
      color: "bg-[#FDF1DE] text-[#D98A1F]",
    },
    {
      label: "Verified Partners",
      value: data ? String(data.totalPartners) : "—",
      change: "Approved partners",
      icon: Building2,
      color: "bg-[#EBF5FF] text-[#2563EB]",
    },
    {
      label: "Students Registered",
      value: data ? data.totalStudents.toLocaleString() : "—",
      change: "All student accounts",
      icon: Users,
      color: "bg-[#F3E8FF] text-[#9333EA]",
    },
    {
      label: "Revenue (Est.)",
      value: data ? `KSh ${(data.totalPartners * 50 * 10).toLocaleString()}` : "—",
      change: "Based on lead fees",
      icon: DollarSign,
      color: "bg-[#E4F5EC] text-[#1F9254]",
    },
  ];

  const verificationColor: Record<string, string> = {
    VERIFIED: "badge-success",
    PENDING: "badge-warning",
    REJECTED: "badge-danger",
  };

  const partnerStatusColor: Record<string, string> = {
    APPROVED: "badge-success",
    PENDING: "badge-warning",
    SUSPENDED: "badge-danger",
    REJECTED: "badge-danger",
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">
          Welcome back, Admin 👋 Here&apos;s what&apos;s happening across TUM Nyumba today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map(({ label, value, change, icon: Icon, color }) => (
          <div key={label} className="card p-6 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-gray-500 font-poppins">{label}</div>
              <div className="font-poppins font-bold text-2xl text-gray-900 mt-1">
                {loading ? <Loader2 className="w-5 h-5 animate-spin text-gray-400" /> : value}
              </div>
              <div className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-0.5">
                <ArrowUpRight className="w-3.5 h-3.5" />
                {change}
              </div>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      {/* Middle Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue chart — visual representation */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-poppins font-bold text-lg text-gray-900">Platform Activity</h2>
              <div className="text-2xl font-bold text-emerald-700 font-poppins mt-1">
                {loading ? "—" : `${data?.totalProperties || 0} Properties`}{" "}
                <span className="text-xs font-normal text-emerald-600">across {data?.totalPartners || 0} partners</span>
              </div>
            </div>
          </div>
          <div className="h-48 bg-gradient-to-b from-emerald-50/50 to-transparent rounded-2xl border border-emerald-100 p-4 flex items-end justify-between gap-2">
            {[40, 65, 55, 80, 70, 90, 85, 100].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full bg-emerald-600 rounded-t-lg group-hover:bg-emerald-700 transition-all" style={{ height: `${h}%` }} />
                <span className="text-[10px] text-gray-400 font-medium">W{i + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Partner Applications */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-poppins font-bold text-lg text-gray-900">Partnership Requests</h2>
            <Link href="/admin/applications" className="text-xs font-semibold text-primary-700 hover:underline">View all</Link>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary-600" /></div>
          ) : !data?.partnerApplications.length ? (
            <div className="text-center py-8 text-gray-400 text-sm">No applications yet</div>
          ) : (
            <div className="space-y-4">
              {data.partnerApplications.map((req) => (
                <div key={req.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <div className="text-sm font-semibold text-gray-900 font-poppins">{req.companyName}</div>
                    <div className="text-xs text-gray-500">{req.user.email}</div>
                  </div>
                  <span className={partnerStatusColor[req.status] || "badge-warning"}>{req.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Listings */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-poppins font-bold text-lg text-gray-900">Recent Listings</h2>
            <Link href="/admin/properties" className="text-xs font-semibold text-primary-700 hover:underline">View all</Link>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary-600" /></div>
          ) : !data?.recentProperties.length ? (
            <div className="text-center py-8 text-gray-400 text-sm">No listings yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase font-poppins">
                    <th className="pb-3">Property</th>
                    <th className="pb-3">Location</th>
                    <th className="pb-3">Rent</th>
                    <th className="pb-3">Partner</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {data.recentProperties.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 font-semibold text-gray-900">{item.title}</td>
                      <td className="py-3 text-gray-500">{item.area}</td>
                      <td className="py-3 font-semibold text-emerald-700">KSh {item.rent.toLocaleString()}</td>
                      <td className="py-3 text-gray-600">{item.partner.companyName}</td>
                      <td className="py-3">
                        <span className={verificationColor[item.verificationStatus] || "badge-warning"}>
                          {item.verificationStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Stats Sidebar */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-poppins font-bold text-lg text-gray-900 flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary-700" /> Quick Stats
            </h2>
          </div>
          <div className="space-y-4">
            {[
              { icon: Home, label: "Total Properties", value: data?.totalProperties || 0, color: "text-amber-600 bg-amber-50" },
              { icon: Building2, label: "Active Partners", value: data?.totalPartners || 0, color: "text-sky-600 bg-sky-50" },
              { icon: Users, label: "Students", value: data?.totalStudents || 0, color: "text-purple-600 bg-purple-50" },
              { icon: CheckCircle2, label: "Pending Verification", value: "—", color: "text-emerald-600 bg-emerald-50" },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-gray-500">{label}</div>
                  <div className="font-poppins font-bold text-gray-900">
                    {loading ? <Clock className="w-4 h-4 text-gray-300 animate-spin" /> : value.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
