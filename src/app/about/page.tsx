import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ShieldCheck, Target, Heart, Award } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn how CampusKey Mombasa is eliminating student housing stress through technology, verification, and trusted local partnerships.",
  alternates: { canonical: "https://campuskey.co.ke/about" },
  openGraph: {
    title: "About CampusKey Mombasa",
    description:
      "Eliminating student housing stress through technology, verification, and trusted local partnerships.",
    url: "https://campuskey.co.ke/about",
  },
};



export default function AboutPage() {
  return (
    <div className="min-h-screen bg-bg">
      <Navbar />

      <section className="bg-hero-gradient pt-32 pb-20 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="font-poppins font-bold text-4xl sm:text-5xl mb-4">About CampusKey Mombasa</h1>
          <p className="text-primary-100 text-lg sm:text-xl max-w-2xl mx-auto">
            Eliminating student housing stress through technology, verification, and trusted local partnerships.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-16">
        <div className="card p-8 sm:p-12">
          <h2 className="font-poppins font-bold text-2xl text-gray-900 mb-4">Our Mission</h2>
          <p className="text-gray-600 text-base leading-relaxed mb-6">
            CampusKey Mombasa was founded to solve a major challenge faced by thousands of students in Mombasa every academic year: finding safe, affordable, and authentic off-campus rental housing.
          </p>
          <p className="text-gray-600 text-base leading-relaxed">
            By building a two-sided verified marketplace in partnership with local Mombasa property firms and student communities, we eliminate house-hunting scams, bogus agent fees, and endless door-to-door searching.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card p-6 text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4 text-primary-700">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-poppins font-bold text-lg text-gray-900 mb-2">Verification First</h3>
            <p className="text-gray-500 text-sm">Every listing on our platform undergoes verification to ensure genuine pricing and safety.</p>
          </div>

          <div className="card p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4 text-blue-700">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="font-poppins font-bold text-lg text-gray-900 mb-2">Affordable Rentals</h3>
            <p className="text-gray-500 text-sm">Tailored price ranges and filters designed specifically for student budgets (KSh 4,000–15,000).</p>
          </div>

          <div className="card p-6 text-center">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4 text-emerald-700">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-poppins font-bold text-lg text-gray-900 mb-2">Campus Partnership</h3>
            <p className="text-gray-500 text-sm">Backed by partnerships with local universities and student welfare organisations in Mombasa.</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
