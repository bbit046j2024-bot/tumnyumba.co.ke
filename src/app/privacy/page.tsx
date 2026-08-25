import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ShieldCheck, Lock, Eye, Database, Phone, Mail, UserCheck, KeyRound, Bell, Building2 } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | CampusKey Mombasa",
  description: "Privacy Policy and Data Protection declaration for CampusKey student accommodation platform.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-bg text-gray-800 flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <div className="space-y-8">
          {/* Header */}
          <div className="border-b border-gray-200 pb-8 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-4 border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-[#1F6B4A]" /> Data Protection &amp; Privacy Governance
            </div>
            <h1 className="font-poppins font-extrabold text-3xl sm:text-4xl text-gray-900 tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-gray-500 text-sm mt-2">
              Last updated: August 2026 • Compliant with the Kenya Data Protection Act, 2019 (ODPC).
            </p>
          </div>

          {/* Highlights Box */}
          <div className="p-6 bg-gradient-to-r from-[#0E3B2E] to-[#1F6B4A] rounded-2xl text-white space-y-3 shadow-lg">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-yellow-300" />
              <h2 className="font-poppins font-bold text-lg text-yellow-300">Privacy-First Architecture</h2>
            </div>
            <p className="text-xs text-emerald-100 leading-relaxed">
              CampusKey collects only minimal, essential information necessary to facilitate safe student housing discovery, verified landlord &amp; agency connections, semester tenancy tracking, and secure M-PESA transactions in Mombasa. We do not sell or monetize your personal data.
            </p>
          </div>

          {/* Content Sections */}
          <div className="space-y-6 text-sm leading-relaxed text-gray-600">
            {/* Section 1 */}
            <section className="card p-6 sm:p-8 space-y-4 bg-white border border-gray-100 rounded-2xl shadow-xs">
              <h2 className="font-poppins font-bold text-lg text-gray-900 flex items-center gap-2">
                <Database className="w-5 h-5 text-[#1F6B4A]" /> 1. Information We Collect
              </h2>
              <p>
                We adhere to the principle of data minimization. The categories of personal data we collect depend on whether you use CampusKey as a Student or as a Landlord / Property Agency:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-gray-900 text-xs uppercase tracking-wide">
                    <UserCheck className="w-4 h-4 text-blue-600" /> A. For Students
                  </div>
                  <ul className="list-disc pl-4 text-xs space-y-1 text-gray-600">
                    <li><strong>Account Credentials:</strong> Full name, verified email address, phone number (for M-Pesa &amp; landlord contact), and hashed password.</li>
                    <li><strong>Area Alert Subscriptions:</strong> Names of preferred neighborhoods (e.g. Tudor, Nyali, Mshomoroni) selected for new listing alerts.</li>
                    <li><strong>Tenancy Records:</strong> Verification status of assigned campus accommodation for the active academic semester.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-gray-900 text-xs uppercase tracking-wide">
                    <Building2 className="w-4 h-4 text-[#1F6B4A]" /> B. For Landlords &amp; Agencies
                  </div>
                  <ul className="list-disc pl-4 text-xs space-y-1 text-gray-600">
                    <li><strong>Business &amp; Owner Profile:</strong> Full name, registered company/agency name, business permit URL, license number, and verified contact phone.</li>
                    <li><strong>Property Details:</strong> Title, category, location/area coordinates, pricing, deposit, room capacities, and photos.</li>
                    <li><strong>Payout Credentials:</strong> Designated M-Pesa phone number or encrypted direct Paybill credentials for rent/lead payouts.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section className="card p-6 sm:p-8 space-y-4 bg-white border border-gray-100 rounded-2xl shadow-xs">
              <h2 className="font-poppins font-bold text-lg text-gray-900 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#1F6B4A]" /> 2. Tenancy &amp; Occupancy Data Policy
              </h2>
              <p>
                To prevent stale listings and guarantee that taken houses are reflected accurately:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-gray-800">Minimal Tenant Identification:</strong> Landlords and property agencies record occupancy using only the tenant&apos;s full name, phone number, and email. No invasive academic or financial dossiers are collected or stored.
                </li>
                <li>
                  <strong className="text-gray-800">Student vs. Non-Student Flexibility:</strong> If a tenant is not a university student, landlords can toggle off academic verification constraints while preserving lease expiration tracking.
                </li>
                <li>
                  <strong className="text-gray-800">Automated Expiry &amp; Relisting Reminders:</strong> We retain tenancy end dates to send automated email reminders at the end of the academic semester or lease term, allowing landlords to re-list vacant rooms in one click.
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="card p-6 sm:p-8 space-y-4 bg-white border border-gray-100 rounded-2xl shadow-xs">
              <h2 className="font-poppins font-bold text-lg text-gray-900 flex items-center gap-2">
                <Eye className="w-5 h-5 text-[#1F6B4A]" /> 3. How We Use Your Data
              </h2>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Housing Matching:</strong> Releasing landlord contact details to students who express interest, and notifying landlords of student bookings.</li>
                <li><strong>Area Listing Notifications:</strong> Dispatching real-time email alerts to students when newly verified listings match their subscribed areas.</li>
                <li><strong>Secure M-PESA Processing:</strong> Initiating Safaricom STK Push transactions for platform fees and rent/deposit disbursements.</li>
                <li><strong>Moderation &amp; Safety:</strong> Preventing duplicate listings, blocking phone spam in public descriptions, and vetting landlord identity before public verification.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section className="card p-6 sm:p-8 space-y-4 bg-white border border-gray-100 rounded-2xl shadow-xs">
              <h2 className="font-poppins font-bold text-lg text-gray-900 flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#1F6B4A]" /> 4. Data Security &amp; Encryption
              </h2>
              <p>
                We implement robust administrative and technical safeguards:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>All web sessions are encrypted using TLS 1.3 / HTTPS.</li>
                <li>User passwords are protected using salted BCrypt hashing.</li>
                <li>Landlord direct Daraja M-Pesa secrets are stored as AES-256-GCM encrypted binary blobs.</li>
                <li>Media assets and property images are served securely via Cloudinary CDN.</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section className="card p-6 sm:p-8 space-y-4 bg-white border border-gray-100 rounded-2xl shadow-xs">
              <h2 className="font-poppins font-bold text-lg text-gray-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#1F6B4A]" /> 5. Your Rights Under Kenyan Law
              </h2>
              <p>
                Pursuant to the Kenya Data Protection Act 2019, you retain full rights to access, rectify, or request the deletion of your personal data, as well as the right to unsubscribe from area listing alerts at any time via your profile.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row gap-4 text-xs font-semibold">
                <a href="mailto:campusdive.org@gmail.com" className="flex items-center gap-2 text-[#1F6B4A] hover:underline">
                  <Mail className="w-4 h-4" /> campusdive.org@gmail.com
                </a>
                <span className="flex items-center gap-2 text-gray-700">
                  <Phone className="w-4 h-4 text-[#1F6B4A]" /> +254 797 844 540
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
