"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Home } from "lucide-react";

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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
            <div className="w-10 h-10 bg-[#1F6B4A] rounded-xl flex items-center justify-center shadow-xs group-hover:bg-[#175339] transition-colors">
              <Home className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center">
                <span className="font-poppins font-bold text-xl text-[#1F2937]">TUM</span>
                <span className="font-poppins font-bold text-xl text-[#1F6B4A] ml-1">Nyumba</span>
              </div>
              <span className="text-[9px] font-bold tracking-widest text-[#1F6B4A] uppercase border-b border-[#1F6B4A]/40 pb-0.5 leading-none w-fit">
                FIND. LIVE. BELONG.
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

          {/* Auth Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Link href="/auth/login" className="px-6 py-2.5 rounded-full bg-[#1F6B4A] text-white font-medium text-sm hover:bg-[#175339] transition-all shadow-xs">
              Login
            </Link>
            <Link href="/auth/register/student" className="btn-outline text-sm py-2 px-4 rounded-full border-[#1F6B4A] text-[#1F6B4A] hover:bg-[#1F6B4A] hover:text-white">
              Find a Home
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-2 rounded-lg text-[#1F2937] hover:bg-gray-100"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
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
              <Link href="/auth/login" className="btn-outline w-full text-sm py-2.5">
                Login
              </Link>
              <Link href="/auth/register/student" className="btn-primary w-full text-sm py-2.5">
                Find a Home
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
