"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { Search, ChevronDown, HelpCircle, ShieldCheck, CreditCard, Home, FileText, PhoneCall, Sparkles } from "lucide-react";

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    id: "1",
    category: "Getting Started",
    question: "What is TUM Nyumba?",
    answer: "TUM Nyumba is the official housing discovery platform designed specifically for Technical University of Mombasa (TUM) students. It connects students with physically verified landlords and partners offering safe, affordable, and quality rentals around campus (Tudor, Tononoka, Buxton, Kisauni, Mikindani, Nyali, etc.).",
  },
  {
    id: "2",
    category: "Getting Started",
    question: "Is TUM Nyumba free for students?",
    answer: "Yes! Browsing houses, contacting verified landlords, viewing location details, and expressing interest in properties on TUM Nyumba is completely free for all TUM students.",
  },
  {
    id: "3",
    category: "Safety & Verification",
    question: "How are properties verified on TUM Nyumba?",
    answer: "Our team physically visits each listed property to inspect security features (fencing, gates, night guards), verify water & electricity availability, confirm exact rent prices, and check the landlord's business permit and ownership documents before marking a property as VERIFIED.",
  },
  {
    id: "4",
    category: "Safety & Verification",
    question: "What should I do if a landlord asks for money before physical viewing?",
    answer: "NEVER pay any 'viewing fee' or advance deposit before physically inspecting the property and meeting the landlord/partner in person. All genuine TUM Nyumba partners allow free physical viewings.",
  },
  {
    id: "5",
    category: "House Hunting & Booking",
    question: "How do I express interest ('Take') in a house?",
    answer: "When viewing a house on TUM Nyumba, click the 'I'm Interested / Contact Landlord' button. If you are signed in, your contact details will be shared directly with the landlord, and you can chat with them directly on the platform or call them.",
  },
  {
    id: "6",
    category: "House Hunting & Booking",
    question: "What categories of rentals are available?",
    answer: "We support all student rental categories: Bedsitters, Single Rooms, 1 Bedroom, 2 Bedroom, 3 Bedroom, Studios, Hostels, Shared Rooms, and AirBnB/BNBs for short stays.",
  },
  {
    id: "7",
    category: "Payments & Rent",
    question: "How are rent and deposit payments handled?",
    answer: "Rent and deposit payments are made directly to the verified landlord or property partner after you inspect the unit and sign a lease agreement. We advise using traceable payment methods like M-Pesa Till/Paybill or direct bank transfers.",
  },
  {
    id: "8",
    category: "Payments & Rent",
    question: "What is the average rent around TUM Mombasa?",
    answer: "Single rooms start around KSh 2,500 - 4,500/month, Bedsitters range from KSh 4,500 - 9,000/month, and 1 Bedrooms range from KSh 9,000 - 15,000/month depending on location and amenities.",
  },
  {
    id: "9",
    category: "Partners & Landlords",
    question: "How can landlords list their properties on TUM Nyumba?",
    answer: "Landlords and property managers can click 'Partner With Us' in the menu, create a Partner Account, upload their business/national ID verification documents, and start listing student rentals once approved by the Admin team.",
  },
];

const categories = ["All", "Getting Started", "Safety & Verification", "House Hunting & Booking", "Payments & Rent", "Partners & Landlords"];

export default function FAQsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [openItem, setOpenItem] = useState<string | null>("1");

  const filteredFaqs = faqData.filter((item) => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch =
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleItem = (id: string) => {
    setOpenItem(openItem === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <Navbar />

      {/* Header */}
      <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950 text-white pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold text-primary-200">
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            Frequently Asked Questions
          </div>
          <h1 className="font-poppins text-3xl sm:text-4xl font-bold tracking-tight">
            How Can We Help You?
          </h1>
          <p className="text-primary-200 text-sm sm:text-base max-w-2xl mx-auto">
            Find answers to common questions about house hunting, physical verification, landlord safety, and moving in near TUM Mombasa.
          </p>

          {/* Search bar */}
          <div className="relative max-w-xl mx-auto mt-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for answers e.g. deposit, safety, bedsitter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white text-gray-900 text-sm placeholder-gray-400 shadow-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </section>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full space-y-8">
        {/* Category Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-primary-700 text-white shadow-md shadow-primary-700/20"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-primary-300 hover:bg-gray-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => {
              const isOpen = openItem === faq.id;
              return (
                <div
                  key={faq.id}
                  className="card overflow-hidden border border-gray-200/80 transition-all hover:border-primary-300"
                >
                  <button
                    onClick={() => toggleItem(faq.id)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-poppins font-semibold text-gray-900 text-sm sm:text-base focus:outline-none"
                  >
                    <span className="flex items-center gap-3">
                      <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-primary-700" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-gray-600 text-sm leading-relaxed border-t border-gray-100 bg-gray-50/50 animate-fade-in">
                      <p>{faq.answer}</p>
                      <div className="mt-3 flex items-center gap-2 text-xs text-primary-700 font-medium">
                        <span className="bg-primary-50 px-2.5 py-1 rounded-md border border-primary-100">
                          Category: {faq.category}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="card p-12 text-center text-gray-400 space-y-2">
              <HelpCircle className="w-10 h-10 mx-auto text-gray-300" />
              <p className="font-semibold text-gray-600">No matching questions found</p>
              <p className="text-xs">Try adjusting your search terms or category filter.</p>
            </div>
          )}
        </div>

        {/* Contact Callout */}
        <div className="card p-8 bg-gradient-to-r from-emerald-50 to-primary-50 border border-primary-100 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-700 text-white flex items-center justify-center mx-auto shadow-lg shadow-primary-700/20">
            <PhoneCall className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-poppins font-bold text-lg text-gray-900">Still Have Questions?</h3>
            <p className="text-gray-600 text-xs sm:text-sm max-w-md mx-auto">
              Our TUM student support team is ready to assist you in finding your ideal campus home.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link href="/contact" className="btn-primary text-xs px-5 py-2.5">
              Contact Support
            </Link>
            <a
              href="https://wa.me/254700123456"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-xs px-5 py-2.5 flex items-center gap-2 text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100"
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
