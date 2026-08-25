import Link from "next/link";
import {
  GraduationCap,
  Building2,
  ArrowRight,
  ShieldCheck,
  BellRing,
  Home,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export const metadata = {
  title: "Create Account | Choose Account Type | CampusKey Mombasa",
  description: "Select whether to register as a Student looking for accommodation or as a Landlord / Real Estate Agency listing properties.",
};

export default function RegisterSelectionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 flex items-center justify-center p-4 py-12">
      {/* Background decoration */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-4xl relative z-10 space-y-8">
        {/* Header / Logo */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
              <Home className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <div className="font-poppins font-bold text-2xl text-white">
                Campus<span className="text-yellow-300">Key</span>
              </div>
              <div className="text-xs text-primary-200">Mombasa · Find. Live. Belong.</div>
            </div>
          </Link>

          <h1 className="font-poppins font-extrabold text-2xl sm:text-3xl text-white pt-4">
            Select Your Account Type
          </h1>
          <p className="text-primary-200 text-sm max-w-md mx-auto">
            Choose the right account to ensure you get access to the features built specifically for you.
          </p>
        </div>

        {/* Account Type Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. STUDENT CARD */}
          <div className="card p-8 bg-white rounded-3xl shadow-2xl border-2 border-emerald-400 hover:border-emerald-500 hover:shadow-emerald-900/20 transition-all flex flex-col justify-between group relative overflow-hidden">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-[#E4F5EC] text-[#1F6B4A] flex items-center justify-center shadow-xs">
                  <GraduationCap className="w-8 h-8" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  100% Free for Students
                </span>
              </div>

              <div>
                <h2 className="font-poppins font-bold text-xl text-gray-900 group-hover:text-[#1F6B4A] transition-colors">
                  Student Account
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Looking for hostels, bedsitters, or shared rooms around TUM and across Mombasa.
                </p>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-gray-100 text-xs text-gray-700">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#1F6B4A] flex-shrink-0 mt-0.5" />
                  <span>Browse verified student bedsitters &amp; hostels</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <BellRing className="w-4 h-4 text-[#1F6B4A] flex-shrink-0 mt-0.5" />
                  <span>Get email alerts for new listings in your chosen areas</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#1F6B4A] flex-shrink-0 mt-0.5" />
                  <span>Direct landlord contact credentials without broker fees</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-[#1F6B4A] flex-shrink-0 mt-0.5" />
                  <span>Verify and track your semester occupancy</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <Link
                href="/auth/register/student"
                className="w-full py-3.5 px-6 rounded-2xl bg-[#1F6B4A] hover:bg-[#185a3d] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-xs group-hover:shadow-md transition-all active:scale-98"
              >
                <span>Register as Student</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* 2. LANDLORD & REAL ESTATE AGENCY CARD */}
          <div className="card p-8 bg-white rounded-3xl shadow-2xl border-2 border-purple-300 hover:border-purple-500 hover:shadow-purple-900/20 transition-all flex flex-col justify-between group relative overflow-hidden">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center shadow-xs">
                  <Building2 className="w-8 h-8" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                  Landlords &amp; Agencies
                </span>
              </div>

              <div>
                <h2 className="font-poppins font-bold text-xl text-gray-900 group-hover:text-purple-700 transition-colors">
                  Partner / Landlord Account
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  For property owners, caretakers, hostel managers, and real estate management agencies.
                </p>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-gray-100 text-xs text-gray-700">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span>List student properties, single rooms &amp; apartments</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span>Manage room occupancy &amp; track semester lease cycles</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <BellRing className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span>Automated semester expiry &amp; 1-click re-listing alerts</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span>Receive direct verified student leads &amp; bookings</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <Link
                href="/auth/register/partner"
                className="w-full py-3.5 px-6 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-xs group-hover:shadow-md transition-all active:scale-98"
              >
                <span>Register as Landlord / Agency</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center pt-2">
          <p className="text-sm text-primary-200">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-yellow-300 font-bold hover:underline">
              Sign In here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
