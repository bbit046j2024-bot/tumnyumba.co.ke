import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ShieldCheck, Lock, Eye, Database, Phone, Mail } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | CampusKey Mombasa",
  description: "Privacy Policy and Data Protection declaration for CampusKey student housing platform.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-bg text-gray-800 flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <div className="space-y-8">
          {/* Header */}
          <div className="border-b border-gray-200 pb-8 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-4 border border-blue-200">
              <ShieldCheck className="w-4 h-4" /> Data Protection & Privacy
            </div>
            <h1 className="font-poppins font-extrabold text-3xl sm:text-4xl text-gray-900 tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-gray-500 text-sm mt-2">
              Last updated: August 15, 2026 • Compliant with the Kenya Data Protection Act, 2019.
            </p>
          </div>

          {/* Highlights Box */}
          <div className="p-6 bg-gradient-to-r from-blue-900 to-primary-900 rounded-2xl text-white space-y-3 shadow-lg">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-400" />
              <h2 className="font-poppins font-bold text-lg text-emerald-400">Your Privacy Belongs To You</h2>
            </div>
            <p className="text-xs text-blue-100 leading-relaxed">
              CampusKey collects only essential information required to facilitate direct student accommodation matching, secure M-PESA payments, and landlord verification in Mombasa. We never sell your personal data to third parties.
            </p>
          </div>

          {/* Content Sections */}
          <div className="space-y-8 text-sm leading-relaxed text-gray-600">
            {/* Section 1 */}
            <section className="card p-6 sm:p-8 space-y-3">
              <h2 className="font-poppins font-bold text-lg text-gray-900 flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-600" /> 1. Information We Collect
              </h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-gray-800">Student Account Data:</strong> Full name, email address, phone number, course of study, and funding context (HELB/Self-funded).
                </li>
                <li>
                  <strong className="text-gray-800">Partner Account Data:</strong> Company name, contact person name, business phone number, business license number, and property images.
                </li>
                <li>
                  <strong className="text-gray-800">Transaction & Payment Logs:</strong> M-PESA transaction reference numbers, amounts, and dates for billing reconciliation.
                </li>
              </ul>
            </section>

            {/* Section 2 */}
            <section className="card p-6 sm:p-8 space-y-3">
              <h2 className="font-poppins font-bold text-lg text-gray-900 flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600" /> 2. How We Use Your Information
              </h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>To connect students with verified property partners upon expressing interest.</li>
                <li>To send transactional emails (verification tokens, password resets, booking updates) via Resend.</li>
                <li>To facilitate real-time chat notifications between students and property owners via WebSockets.</li>
                <li>To process M-PESA STK Push payments for administrative lead fees.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="card p-6 sm:p-8 space-y-3">
              <h2 className="font-poppins font-bold text-lg text-gray-900 flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-600" /> 3. Data Security & Storage
              </h2>
              <p>
                CampusKey employs industry-standard encryption protocols (TLS/SSL) for all browser interactions. User passwords are hashed using BCrypt. Property images are delivered securely via Cloudinary CDN, and authentication tokens are managed by NextAuth.js.
              </p>
            </section>

            {/* Section 4 */}
            <section className="card p-6 sm:p-8 space-y-3">
              <h2 className="font-poppins font-bold text-lg text-gray-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" /> 4. Your Rights Under Kenya Data Law
              </h2>
              <p>
                You have the right to inspect, update, or request the deletion of your personal account data at any time. To request account deletion or data retrieval, reach out to our privacy office:
              </p>
              <div className="pt-2 flex flex-col sm:flex-row gap-4 text-xs font-semibold">
                <a href="mailto:campusdive.org@gmail.com" className="flex items-center gap-2 text-primary-700 hover:underline">
                  <Mail className="w-4 h-4" /> campusdive.org@gmail.com
                </a>
                <span className="flex items-center gap-2 text-gray-700">
                  <Phone className="w-4 h-4 text-primary-600" /> +254 797 844 540
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
