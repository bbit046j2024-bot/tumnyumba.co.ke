import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Shield, FileText, CheckCircle2, Lock, HelpCircle, Building2, UserCheck, KeyRound, AlertTriangle } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Terms of Service | CampusKey Mombasa",
  description: "Terms of Service and User Agreement for CampusKey student accommodation platform.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-bg text-gray-800 flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <div className="space-y-8">
          {/* Header */}
          <div className="border-b border-gray-200 pb-8 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-4 border border-emerald-200">
              <FileText className="w-4 h-4 text-[#1F6B4A]" /> Legal Agreement &amp; Platform Governance
            </div>
            <h1 className="font-poppins font-extrabold text-3xl sm:text-4xl text-gray-900 tracking-tight">
              Terms of Service
            </h1>
            <p className="text-gray-500 text-sm mt-2">
              Last updated: August 2026 • Governs all Students, Landlords, Property Managers, and Agencies using CampusKey Mombasa.
            </p>
          </div>

          {/* Highlights Box */}
          <div className="p-6 bg-gradient-to-r from-[#0E3B2E] to-[#1F6B4A] rounded-2xl text-white space-y-3 shadow-lg">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-yellow-300" />
              <h2 className="font-poppins font-bold text-lg text-yellow-300">The CampusKey Platform Covenant</h2>
            </div>
            <p className="text-xs text-emerald-100 leading-relaxed">
              CampusKey connects students directly with verified property owners, landlords, and professional real estate agencies in Mombasa. We uphold verified listing accuracy, zero-middleman direct contact, transparent semester tenancy tracking, and secure M-PESA payment flows.
            </p>
          </div>

          {/* Content Sections */}
          <div className="space-y-6 text-sm leading-relaxed text-gray-600">
            {/* Section 1 */}
            <section className="card p-6 sm:p-8 space-y-3 bg-white border border-gray-100 rounded-2xl shadow-xs">
              <h2 className="font-poppins font-bold text-lg text-gray-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#1F6B4A]" /> 1. Acceptance of Terms &amp; Scope
              </h2>
              <p>
                By creating an account, browsing listings, subscribing to area notifications, or listing a property on CampusKey (<span className="font-semibold text-gray-800">campuskey.co.ke</span> or <span className="font-semibold text-gray-800">tumnyumba.co.ke</span>), you acknowledge that you have read, understood, and agree to be legally bound by these Terms of Service and our Privacy Policy.
              </p>
            </section>

            {/* Section 2 */}
            <section className="card p-6 sm:p-8 space-y-4 bg-white border border-gray-100 rounded-2xl shadow-xs">
              <h2 className="font-poppins font-bold text-lg text-gray-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-blue-600" /> 2. Student User Provisions
              </h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-gray-800">Free Listing Discovery:</strong> Searching, filtering, and viewing verified student bedsitters, hostels, and single rooms across Mombasa is free.
                </li>
                <li>
                  <strong className="text-gray-800">Area Alert Subscriptions:</strong> Students may subscribe to specific geographic zones (e.g. Tudor, Nyali, Mshomoroni, Buxton, Tononoka). Subscriptions can be configured or deactivated at any time in the student profile.
                </li>
                <li>
                  <strong className="text-gray-800">Direct Landlord Contact:</strong> Once interest is expressed, verified landlord/agency phone numbers are released immediately for direct inspection arrangements without broker exploitation.
                </li>
                <li>
                  <strong className="text-gray-800">Tenancy Confirmation:</strong> When an assigned landlord records a student stay, the student may confirm or dispute the tenancy handshake via their dashboard.
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="card p-6 sm:p-8 space-y-4 bg-white border border-gray-100 rounded-2xl shadow-xs">
              <h2 className="font-poppins font-bold text-lg text-gray-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#1F6B4A]" /> 3. Landlords &amp; Real Estate Agencies (Partners)
              </h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-gray-800">Identity &amp; Business Permit Verification:</strong> All property owners, caretakers, and agencies must complete account verification. Listings undergo administrative vetting before becoming publicly visible.
                </li>
                <li>
                  <strong className="text-gray-800">Listing Integrity:</strong> Partners must ensure accurate representations of rent, deposit requirements, utility amenities (water, electricity, wifi, security), and exact space counts.
                </li>
                <li>
                  <strong className="text-gray-800">Content Moderation &amp; Anti-Spam:</strong> Phone numbers and external contact spam within property titles or public descriptions are strictly prohibited and filtered automatically.
                </li>
              </ul>
            </section>

            {/* Section 4 */}
            <section className="card p-6 sm:p-8 space-y-4 bg-white border border-gray-100 rounded-2xl shadow-xs">
              <h2 className="font-poppins font-bold text-lg text-gray-900 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#1F6B4A]" /> 4. Tenancy Cycles, Expiry &amp; Relisting Rules
              </h2>
              <p>
                To maintain real-time housing availability and prevent stale/ghost listings:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-gray-800">Recording Occupancy:</strong> When a room is taken, the landlord or agency records the tenant (Student or General Tenant) with basic contact details. The system automatically updates room availability.
                </li>
                <li>
                  <strong className="text-gray-800">Semester &amp; Lease Tracking:</strong> Tenancies are structured around university semesters (Semester 1, Semester 2, Academic Year) or custom durations.
                </li>
                <li>
                  <strong className="text-gray-800">Automated Expiry &amp; Relisting:</strong> At the conclusion of a semester or lease, landlords receive automated email reminders. If the tenant vacates, the landlord is obligated to re-list or pause the unit promptly.
                </li>
                <li>
                  <strong className="text-gray-800">Instant Alert Broadcast:</strong> Re-listing a vacated property triggers automatic vacancy alerts to students watching that area.
                </li>
              </ul>
            </section>

            {/* Section 5 */}
            <section className="card p-6 sm:p-8 space-y-4 bg-white border border-gray-100 rounded-2xl shadow-xs">
              <h2 className="font-poppins font-bold text-lg text-gray-900 flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#1F6B4A]" /> 5. Payments, Fees &amp; M-PESA Security
              </h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  All financial transactions on CampusKey are processed via official Safaricom Daraja M-PESA STK Push channels.
                </li>
                <li>
                  Hostel categories remain strictly zero-rated for lead fees. Standard private rentals and bedsitters are subject to administrative lead fee schedules.
                </li>
                <li>
                  Lead unlocking fees are considered fulfilled once contact details are rendered, except where a property is proven to be fraudulent.
                </li>
              </ul>
            </section>

            {/* Section 6 */}
            <section className="card p-6 sm:p-8 space-y-4 bg-white border border-gray-100 rounded-2xl shadow-xs">
              <h2 className="font-poppins font-bold text-lg text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" /> 6. Fraud Prevention &amp; Account Suspension
              </h2>
              <p>
                CampusKey maintains zero tolerance for fraud, scam housing, fake pictures, or harassment. We reserve the immediate right to suspend or permanently ban accounts found violating platform integrity or Kenyan law.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row gap-4 text-xs font-semibold">
                <a href="mailto:campusdive.org@gmail.com" className="flex items-center gap-2 text-[#1F6B4A] hover:underline">
                  <HelpCircle className="w-4 h-4" /> campusdive.org@gmail.com
                </a>
                <span className="flex items-center gap-2 text-gray-700">
                  <Shield className="w-4 h-4 text-[#1F6B4A]" /> Dedicated Fraud Desk: +254 797 844 540
                </span>
              </div>
            </section>
          </div>

          <div className="pt-6 text-center">
            <Link href="/" className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm">
              Return to CampusKey Home
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
