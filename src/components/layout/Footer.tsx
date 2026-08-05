import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin, Globe } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0E3B2E] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/logo.png"
                alt="CampusKey Mombasa"
                width={160}
                height={44}
                className="h-10 w-auto object-contain brightness-200"
              />
              <div className="flex flex-col">
                <div className="flex items-center">
                  <span className="font-poppins font-bold text-xl text-white">Campus</span>
                  <span className="font-poppins font-bold text-xl text-[#3CB474] ml-0.5">Key</span>
                </div>
                <span className="text-[9px] font-bold tracking-widest text-[#3CB474] uppercase">
                  MOMBASA
                </span>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-6">
              The premier student housing platform in Mombasa. Safe. Affordable. Verified.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
                title="Website"
              >
                <Globe className="w-4 h-4 text-white" />
              </a>
              {/* WhatsApp */}
              <a
                href="https://wa.me/254700123456"
                className="w-9 h-9 bg-white/10 hover:bg-[#1F6B4A] rounded-lg flex items-center justify-center transition-colors"
                title="WhatsApp"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.122.549 4.116 1.512 5.855L0 24l6.322-1.497A11.949 11.949 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.006-1.37l-.358-.214-3.753.888.905-3.653-.233-.376A9.818 9.818 0 0 1 2.182 12C2.182 6.57 6.57 2.182 12 2.182c5.43 0 9.818 4.388 9.818 9.818 0 5.43-4.388 9.818-9.818 9.818z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-poppins font-semibold text-sm uppercase tracking-wider text-[#3CB474] mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: "Home", href: "/" },
                { label: "Listings", href: "/listings" },
                { label: "How It Works", href: "/how-it-works" },
                { label: "About Us", href: "/about" },
                { label: "Contact", href: "/contact" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-300 hover:text-white hover:underline transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Students */}
          <div>
            <h4 className="font-poppins font-semibold text-sm uppercase tracking-wider text-[#3CB474] mb-4">
              For Students
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: "Browse Homes", href: "/listings" },
                { label: "How It Works", href: "/how-it-works" },
                { label: "Student Tips", href: "/student-tips" },
                { label: "FAQs", href: "/faqs" },
                { label: "Register", href: "/auth/register/student" },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm text-gray-300 hover:text-white hover:underline transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-poppins font-semibold text-sm uppercase tracking-wider text-[#3CB474] mb-4">
              Contact Us
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-[#3CB474] mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-300">+254 797 844 540</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-[#3CB474] mt-0.5 flex-shrink-0" />
                <a href="mailto:campusdive.org@gmail.com" className="text-sm text-gray-300 hover:text-white transition-colors">
                  campusdive.org@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#3CB474] mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-300">Mombasa, Kenya</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-white/10 text-center">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} CampusKey Mombasa. All rights reserved. Find. Live. Belong.
          </p>
        </div>
      </div>
    </footer>
  );
}
