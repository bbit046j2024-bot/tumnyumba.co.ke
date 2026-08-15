import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Shield, FileText, CheckCircle2, Lock, HelpCircle } from "lucide-react";
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
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-4 border border-emerald-200">
              <FileText className="w-4 h-4" /> Legal & Governance
            </div>
            <h1 className="font-poppins font-extrabold text-3xl sm:text-4xl text-gray-900 tracking-tight">
              Terms of Service
            </h1>
            <p className="text-gray-500 text-sm mt-2">
              Last updated: August 15, 2026 • Applies to all CampusKey Mombasa users, students, and listing partners.
            </p>
          </div>

          {/* Highlights Box */}
          <div className="p-6 bg-gradient-to-r from-emerald-900 to-primary-900 rounded-2xl text-white space-y-3 shadow-lg">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-yellow-400" />
              <h2 className="font-poppins font-bold text-lg text-yellow-400">CampusKey Platform Promise</h2>
            </div>
            <p className="text-xs text-primary-100 leading-relaxed">
              CampusKey is committed to connecting students directly with verified property owners in Mombasa.
              Students browse listings for free, and property partners benefit from transparent, performance-based lead connections.
            </p>
          </div>

          {/* Content Sections */}
          <div className="space-y-8 text-sm leading-relaxed text-gray-600">
            {/* Section 1 */}
            <section className="card p-6 sm:p-8 space-y-3">
              <h2 className="font-poppins font-bold text-lg text-gray-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary-600" /> 1. Acceptance of Terms
              </h2>
              <p>
                By creating an account, browsing listings, or listing a property on CampusKey (<span className="font-semibold text-gray-800">campuskey.co.ke</span> or <span className="font-semibold text-gray-800">tumnyumba.co.ke</span>), you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, you must not use our platform.
              </p>
            </section>

            {/* Section 2 */}
            <section className="card p-6 sm:p-8 space-y-3">
              <h2 className="font-poppins font-bold text-lg text-gray-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary-600" /> 2. Student Users & Listings
              </h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-gray-800">Free Listing Access:</strong> Searching and viewing property details on CampusKey is free for students.
                </li>
                <li>
                  <strong className="text-gray-800">Expressing Interest:</strong> For properties where an inspection or lead fee is configured by the platform administration, students will see an explicit M-PESA payment prompt. For zero-fee properties and Hostel listings, contact details unlock instantly at KSh 0.
                </li>
                <li>
                  <strong className="text-gray-800">Direct Contact Responsibility:</strong> Students are responsible for verifying physical room availability and terms directly with the verified partner before making off-platform tenancy payments.
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="card p-6 sm:p-8 space-y-3">
              <h2 className="font-poppins font-bold text-lg text-gray-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary-600" /> 3. Property Owners & Partners
              </h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-gray-800">Permit & Ownership Verification:</strong> All partners must submit valid identification, company details, or business permits. Unverified listings may be suspended or removed.
                </li>
                <li>
                  <strong className="text-gray-800">Accuracy of Information:</strong> Partners must maintain accurate rent prices, deposit requirements, amenity tags, and remaining space counters (<span className="font-semibold text-gray-800">availableSpaces</span>).
                </li>
                <li>
                  <strong className="text-gray-800">Hostel Rules:</strong> Hostel listings are zero-rated for lead fees. Standard rental listings are subject to admin lead fee configurations payable via automated M-PESA invoicing.
                </li>
              </ul>
            </section>

            {/* Section 4 */}
            <section className="card p-6 sm:p-8 space-y-3">
              <h2 className="font-poppins font-bold text-lg text-gray-900 flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary-600" /> 4. Payments, Refunds & M-PESA
              </h2>
              <p>
                All payments processed through M-PESA via CampusKey are strictly secured using Safaricom STK Push APIs. Lead fees paid to unlock direct partner contacts are non-refundable once contact credentials have been rendered, except in cases where a property listing is proven fraudulent.
              </p>
            </section>

            {/* Section 5 */}
            <section className="card p-6 sm:p-8 space-y-3">
              <h2 className="font-poppins font-bold text-lg text-gray-900 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary-600" /> 5. Account Safety & Support
              </h2>
              <p>
                CampusKey reserves the right to suspend any account engaging in fraudulent activities, misrepresentation of housing, or harassment. If you encounter any fraudulent listing, please contact support immediately at{" "}
                <a href="mailto:campusdive.org@gmail.com" className="text-primary-700 font-semibold hover:underline">
                  campusdive.org@gmail.com
                </a>{" "}
                or call <span className="font-semibold text-gray-800">+254 797 844 540</span>.
              </p>
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
