"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, User, LogOut, LayoutDashboard } from "lucide-react";
import NotificationBell from "@/components/dashboard/NotificationBell";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/listings", label: "Listings" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/for-partners", label: "For Partners" },
  { href: "/about", label: "About Us" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const getDashboardHref = () => {
    if (!session?.user) return "/auth/login";
    if (session.user.role === "ADMIN") return "/admin/dashboard";
    if (session.user.role === "PARTNER") return "/partner/dashboard";
    return "/profile";
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100" : "bg-white border-b border-gray-100/80 shadow-xs"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/logo.png"
              alt="CampusKey Mombasa"
              width={160}
              height={44}
              className="h-10 w-auto object-contain"
              priority
            />
            <div className="flex flex-col">
              <div className="flex items-center">
                <span className="font-poppins font-bold text-xl text-[#1F2937]">Campus</span>
                <span className="font-poppins font-bold text-xl text-[#1F6B4A] ml-0.5">Key</span>
              </div>
              <span className="text-[9px] font-bold tracking-widest text-[#1F6B4A] uppercase border-b border-[#1F6B4A]/40 pb-0.5 leading-none w-fit">
                MOMBASA
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-[15px] font-medium transition-all duration-200 py-1 font-inter relative ${
                    isActive
                      ? "text-[#1F6B4A] font-semibold after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#1F6B4A] after:rounded-full"
                      : "text-[#1F2937] hover:text-[#1F6B4A]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Actions & Notification Bell */}
          <div className="hidden lg:flex items-center gap-3">
            {session?.user ? (
              <div className="flex items-center gap-3">
                {/* Notification Bell for Student / Partner / Admin */}
                <NotificationBell notificationsPageHref="/notifications" />

                {/* Dashboard / Profile Button */}
                <Link
                  href={getDashboardHref()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1F6B4A]/10 text-[#1F6B4A] hover:bg-[#1F6B4A] hover:text-white transition-all text-xs font-semibold"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>{session.user.name?.split(" ")[0] || "Account"}</span>
                </Link>

                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  title="Sign out"
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Link href="/auth/login" className="px-6 py-2.5 rounded-full bg-[#1F6B4A] text-white font-medium text-sm hover:bg-[#175339] transition-all shadow-xs">
                  Login
                </Link>
                <Link href="/auth/register/student" className="btn-outline text-sm py-2 px-4 rounded-full border-[#1F6B4A] text-[#1F6B4A] hover:bg-[#1F6B4A] hover:text-white">
                  Find a Home
                </Link>
              </>
            )}
          </div>

          {/* Mobile Right Controls: Notification Bell + Hamburger */}
          <div className="lg:hidden flex items-center gap-2">
            {session?.user && (
              <NotificationBell notificationsPageHref="/notifications" />
            )}
            <button
              className="p-2 rounded-lg text-[#1F2937] hover:bg-gray-100"
              onClick={() => setOpen(!open)}
            >
              {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg animate-fade-in">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => {
              const isMobileActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                    isMobileActive
                      ? "text-[#1F6B4A] font-semibold bg-primary-50"
                      : "text-gray-700 hover:text-primary-700 hover:bg-primary-50"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="pt-3 pb-1 flex flex-col gap-2">
              {session?.user ? (
                <>
                  <Link
                    href={getDashboardHref()}
                    onClick={() => setOpen(false)}
                    className="btn-primary w-full text-sm py-2.5 flex items-center justify-center gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    {session.user.role === "STUDENT" ? "My Account" : "Dashboard"}
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="btn-outline w-full text-sm py-2.5 text-red-600 border-red-200 hover:bg-red-50 flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="btn-outline w-full text-sm py-2.5">
                    Login
                  </Link>
                  <Link href="/auth/register/student" className="btn-primary w-full text-sm py-2.5">
                    Find a Home
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
