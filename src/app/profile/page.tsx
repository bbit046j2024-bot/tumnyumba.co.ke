"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { User, Phone, Mail, Shield, Bell, Bed, Loader2, ArrowRight } from "lucide-react";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1F6B4A]" />
      </div>
    );
  }

  if (!session?.user) {
    router.push("/auth/login?next=/profile");
    return null;
  }

  const user = session.user;

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <div className="space-y-6">
          {/* Header */}
          <div className="card p-6 sm:p-8 bg-white border border-gray-100 shadow-xs space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#E4F5EC] text-[#1F6B4A] font-poppins font-bold text-2xl flex items-center justify-center">
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div>
                <h1 className="font-poppins font-bold text-xl sm:text-2xl text-gray-900">
                  {user.name || "User Account"}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#1F6B4A]/10 text-[#1F6B4A] font-semibold uppercase tracking-wider">
                    {user.role || "STUDENT"}
                  </span>
                  <span className="text-xs text-gray-400">CampusKey Mombasa</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-gray-100 text-xs">
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 text-gray-700">
                <Mail className="w-4 h-4 text-gray-400" />
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-medium block">Email</span>
                  <span className="font-semibold">{user.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 text-gray-700">
                <Phone className="w-4 h-4 text-gray-400" />
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-medium block">M-Pesa Phone</span>
                  <span className="font-semibold">{(user as any).phone || "Registered Account"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/notifications"
              className="card p-5 hover:shadow-md transition-all border border-gray-100 flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-poppins font-bold text-sm text-gray-900 group-hover:text-[#1F6B4A] transition-colors">
                    Notifications & Booking Links
                  </h3>
                  <p className="text-xs text-gray-400">View landlord payment links & alerts</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#1F6B4A] group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              href="/listings"
              className="card p-5 hover:shadow-md transition-all border border-gray-100 flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E4F5EC] text-[#1F6B4A] flex items-center justify-center">
                  <Bed className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-poppins font-bold text-sm text-gray-900 group-hover:text-[#1F6B4A] transition-colors">
                    Browse Verified Listings
                  </h3>
                  <p className="text-xs text-gray-400">Find student bedsitters & hostels</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#1F6B4A] group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
