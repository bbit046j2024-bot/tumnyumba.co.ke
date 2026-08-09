import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Phone, Mail, MapPin, Send } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with CampusKey Mombasa. Reach out to our team for support, partnership enquiries, or listing help.",
  alternates: { canonical: "https://campuskey.co.ke/contact" },
  openGraph: {
    title: "Contact CampusKey Mombasa",
    description:
      "Reach out to our team for support, partnership enquiries, or listing help.",
    url: "https://campuskey.co.ke/contact",
  },
};



export default function ContactPage() {
  return (
    <div className="min-h-screen bg-bg">
      <Navbar />

      <section className="bg-hero-gradient pt-32 pb-20 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="font-poppins font-bold text-4xl sm:text-5xl mb-4">Contact Us</h1>
          <p className="text-primary-100 text-lg sm:text-xl max-w-2xl mx-auto">
            Have questions or need support? We&apos;re here to help students and property partners.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="space-y-6">
            <div className="card p-6 flex items-start gap-4">
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-primary-700 flex-shrink-0">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-poppins font-bold text-gray-900">Phone Support</h3>
                <p className="text-sm text-gray-500 mt-1">+254 700 123 456</p>
                <p className="text-xs text-gray-400 mt-0.5">Mon–Fri: 8am – 6pm</p>
              </div>
            </div>

            <div className="card p-6 flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-700 flex-shrink-0">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-poppins font-bold text-gray-900">Email Us</h3>
                <a href="mailto:hello@campuskey.co.ke" className="text-sm text-primary-700 hover:underline mt-1 block">
                  hello@campuskey.co.ke
                </a>
              </div>
            </div>

            <div className="card p-6 flex items-start gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-700 flex-shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-poppins font-bold text-gray-900">Office Location</h3>
                <p className="text-sm text-gray-500 mt-1">Mombasa, Kenya (Near TUM Main Campus)</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 card p-8">
            <h2 className="font-poppins font-bold text-2xl text-gray-900 mb-6">Send Us a Message</h2>
            <form className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="input-label">Your Name</label>
                  <input type="text" className="input" placeholder="Full name" required />
                </div>
                <div>
                  <label className="input-label">Email Address</label>
                  <input type="email" className="input" placeholder="you@example.com" required />
                </div>
              </div>
              <div>
                <label className="input-label">Subject</label>
                <input type="text" className="input" placeholder="e.g. Housing Inquiry / Partnership" required />
              </div>
              <div>
                <label className="input-label">Message</label>
                <textarea rows={5} className="input resize-none" placeholder="Write your message here..." required />
              </div>
              <button type="submit" className="btn-primary py-3.5 px-8">
                <Send className="w-4 h-4" /> Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
