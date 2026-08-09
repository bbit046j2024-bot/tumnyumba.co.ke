import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { Building2, CheckCircle2, TrendingUp, Users, Shield, ArrowRight, DollarSign } from "lucide-react";

export const metadata: Metadata = {
  title: "For Partners",
  description:
    "List your rental properties on CampusKey Mombasa and reach thousands of verified students. Join our partner network today.",
  alternates: { canonical: "https://campuskey.co.ke/for-partners" },
  openGraph: {
    title: "Partner with CampusKey Mombasa",
    description:
      "List your rental properties and reach thousands of verified students. Join our partner network today.",
    url: "https://campuskey.co.ke/for-partners",
  },
};



export default function ForPartnersPage() {
  return (
    <div className="min-h-screen bg-bg">
      <Navbar />

      {/* Hero */}
      <section className="bg-hero-gradient pt-32 pb-20 text-white text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <span className="bg-white/10 px-4 py-1.5 rounded-full text-sm font-medium mb-4 inline-block">
            For Estate Agents & Property Owners
          </span>
          <h1 className="font-poppins font-bold text-4xl sm:text-5xl mb-4">
            Fill Your Units Faster with Mombasa Students
          </h1>
          <p className="text-primary-100 text-lg sm:text-xl max-w-2xl mx-auto mb-8">
            List your rental properties on CampusKey Mombasa and connect directly with thousands of verified student tenants every semester.
          </p>
          <Link href="/auth/register/partner" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-700 font-bold rounded-xl hover:bg-primary-50 transition-all font-poppins shadow-lg">
            Register as Partner <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Why Partner With Us */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="font-poppins font-bold text-3xl text-gray-900">Why Partner With CampusKey Mombasa?</h2>
          <p className="text-gray-500 mt-2">Transparent pricing, high tenant demand, and official support</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card p-8 text-center">
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-600">
              <DollarSign className="w-7 h-7" />
            </div>
            <h3 className="font-poppins font-bold text-xl text-gray-900 mb-2">Flat KSh 50 Per Lead</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              No percentage commissions on your rent. Pay a low, transparent fee of KSh 50 only when a student expresses interest (&quot;Takes&quot;) your listing.
            </p>
          </div>

          <div className="card p-8 text-center">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="font-poppins font-bold text-xl text-gray-900 mb-2">Direct Student Audience</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Reach 3,800+ TUM freshers and continuing students actively seeking housing near campus at the start of every semester.
            </p>
          </div>

          <div className="card p-8 text-center">
            <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-purple-600">
              <Shield className="w-7 h-7" />
            </div>
            <h3 className="font-poppins font-bold text-xl text-gray-900 mb-2">Verified Partner Badge</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Gain instant credibility with students through physical property verification and official TUM administration backing.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
