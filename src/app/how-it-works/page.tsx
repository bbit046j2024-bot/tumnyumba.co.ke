import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { Search, Home, CheckCircle2, ShieldCheck, ArrowRight, PhoneCall, Building2, UserCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "See how CampusKey Mombasa makes finding student housing simple — search listings, request a viewing, get verified accommodation near your campus.",
  alternates: { canonical: "https://campuskey.co.ke/how-it-works" },
  openGraph: {
    title: "How CampusKey Mombasa Works",
    description:
      "Search listings, request a viewing, get verified accommodation near your campus.",
    url: "https://campuskey.co.ke/how-it-works",
  },
};



const studentSteps = [
  {
    step: "1",
    title: "Browse & Search Listings",
    desc: "Filter physically-verified properties by area, room type (Bedsitter, Studio, 1BR, Hostels), and monthly rent near TUM campus.",
    icon: Search,
  },
  {
    step: "2",
    title: "Express Interest ('Take')",
    desc: "Click 'Take' on any property you love. Your contact details are securely shared with the verified partner/landlord.",
    icon: Home,
  },
  {
    step: "3",
    title: "View & Move In",
    desc: "Schedule a physical viewing with the partner, inspect the house, sign the agreement, and move into your new home hassle-free.",
    icon: CheckCircle2,
  },
];

const partnerSteps = [
  {
    step: "1",
    title: "Submit Partner Application",
    desc: "Register your agency or property management company with your business details.",
    icon: Building2,
  },
  {
    step: "2",
    title: "Admin Verification",
    desc: "CampusKey Mombasa team verifies your business permit and physical properties to ensure trust.",
    icon: ShieldCheck,
  },
  {
    step: "3",
    title: "List Properties & Receive Leads",
    desc: "Add your vacant units to the partner dashboard and get qualified student leads instantly at KSh 50 per take.",
    icon: UserCheck,
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-bg">
      <Navbar />

      {/* Header */}
      <section className="bg-hero-gradient pt-32 pb-20 text-white text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <h1 className="font-poppins font-bold text-4xl sm:text-5xl mb-4">How CampusKey Mombasa Works</h1>
          <p className="text-primary-100 text-lg sm:text-xl max-w-2xl mx-auto">
            A simple, safe, and transparent marketplace connecting students to verified rentals in Mombasa.
          </p>
        </div>
      </section>

      {/* For Students Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <span className="badge-success text-sm px-4 py-1 mb-3 inline-block">For Students</span>
          <h2 className="font-poppins font-bold text-3xl text-gray-900">3 Simple Steps to Find Your Home</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {studentSteps.map(({ step, title, desc, icon: Icon }) => (
            <div key={step} className="card p-8 text-center relative hover:shadow-card-hover transition-all">
              <div className="w-10 h-10 bg-primary-700 text-white font-bold rounded-xl flex items-center justify-center mx-auto mb-5 font-poppins">
                {step}
              </div>
              <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary-700">
                <Icon className="w-7 h-7" />
              </div>
              <h3 className="font-poppins font-bold text-xl text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/listings" className="btn-primary py-3.5 px-8">
            Start Browsing Homes <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* For Partners Section */}
      <section className="bg-gray-100/70 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="badge-warning text-sm px-4 py-1 mb-3 inline-block">For Landlords & Agents</span>
            <h2 className="font-poppins font-bold text-3xl text-gray-900">How Partners List Properties</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {partnerSteps.map(({ step, title, desc, icon: Icon }) => (
              <div key={step} className="card p-8 text-center relative hover:shadow-card-hover transition-all">
                <div className="w-10 h-10 bg-amber-500 text-white font-bold rounded-xl flex items-center justify-center mx-auto mb-5 font-poppins">
                  {step}
                </div>
                <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-amber-600">
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="font-poppins font-bold text-xl text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/auth/register/partner" className="btn-outline py-3.5 px-8">
              Become a Verified Partner
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
