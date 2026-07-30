import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import {
  ShieldAlert, Lightbulb, MapPin, KeyRound, CheckCircle2, DollarSign, Users, AlertTriangle, ArrowRight, HeartHandshake
} from "lucide-react";

const tips = [
  {
    icon: ShieldAlert,
    title: "1. Never Pay Before Physical Inspection",
    color: "bg-red-50 text-red-600 border-red-100",
    desc: "Scammers often ask for 'viewing fees' or advance booking deposits via M-Pesa before showing the house. Never send money until you physically walk into the house, verify the keys, and meet the verified landlord.",
  },
  {
    icon: MapPin,
    title: "2. Understand Student Neighborhoods",
    color: "bg-emerald-50 text-emerald-700 border-emerald-100",
    desc: "Tudor and Tononoka are walking distance to campus (5-15 mins). Buxton and Mikindani offer affordable options with quick matatu access. Choose a location based on your class schedule and night study habits.",
  },
  {
    icon: DollarSign,
    title: "3. Clarify Extra Monthly Utility Bills",
    color: "bg-blue-50 text-blue-600 border-blue-100",
    desc: "Ask the landlord if rent includes water and electricity (token vs flat rate), garbage collection fees (usually KSh 150-300), and Wi-Fi costs. Get all utility terms documented in writing.",
  },
  {
    icon: KeyRound,
    title: "4. Inspect Water & Security First Hand",
    color: "bg-amber-50 text-amber-700 border-amber-100",
    desc: "Mombasa can experience water rationing. Check if the building has borehole water or elevated storage tanks. Ensure the main gates are locked at night and streetlights work along your route.",
  },
  {
    icon: Users,
    title: "5. Consider Room Sharing Wisely",
    color: "bg-purple-50 text-purple-700 border-purple-100",
    desc: "Sharing a 1-Bedroom or 2-Bedroom with a classmate can cut your rent and deposit in half. Agree on study hours, guest policies, and bill splitting before moving in together.",
  },
  {
    icon: CheckCircle2,
    title: "6. Always Get a Signed Lease Agreement & Receipt",
    color: "bg-indigo-50 text-indigo-700 border-indigo-100",
    desc: "When paying deposit and first month's rent, insist on a signed tenancy agreement and official payment receipt (M-Pesa transaction reference or physical receipt).",
  },
];

const RedFlags = [
  "Landlord refuses to meet in person or insists on talking via WhatsApp calls only.",
  "Price is suspiciously low (e.g. KSh 3,000 for a luxury 1-Bedroom in Nyali).",
  "Demanding 'urgent' deposit because 'another student is waiting with cash'.",
  "Photos look like hotel rooms or generic stock images.",
];

export default function StudentTipsPage() {
  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950 text-white pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold text-primary-200">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            Essential Guide for TUM Students
          </div>
          <h1 className="font-poppins text-3xl sm:text-4xl font-bold tracking-tight">
            Smart & Safe House Hunting Tips
          </h1>
          <p className="text-primary-200 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about finding affordable rentals, avoiding housing scams, inspecting utilities, and settling in safely around TUM Mombasa.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full space-y-12">
        {/* Tips Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tips.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="card p-6 border border-gray-200/80 hover:shadow-lg transition-all space-y-3"
              >
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border ${item.color}`}>
                  <Icon className="w-5.5 h-5.5" />
                </div>
                <h3 className="font-poppins font-bold text-gray-900 text-base">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Red Flags Warning Box */}
        <div className="card p-8 bg-red-50/70 border-2 border-red-200 space-y-4">
          <div className="flex items-center gap-3 text-red-800">
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-md">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-poppins font-bold text-lg">Warning: Common Rental Red Flags</h3>
              <p className="text-xs text-red-600 font-medium">If you spot any of these, stop and report to TUM Nyumba Support immediately.</p>
            </div>
          </div>
          <ul className="space-y-2.5 pt-2">
            {RedFlags.map((flag, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-red-900 font-medium">
                <span className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                <span>{flag}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Call to Action */}
        <div className="card p-8 bg-gradient-to-r from-primary-900 to-primary-800 text-white text-center space-y-4">
          <HeartHandshake className="w-10 h-10 text-emerald-400 mx-auto" />
          <div className="space-y-1">
            <h3 className="font-poppins font-bold text-xl">Ready to Find Your Dream Student Room?</h3>
            <p className="text-primary-200 text-xs sm:text-sm max-w-md mx-auto">
              All properties listed on TUM Nyumba are physically verified to keep you safe from scams.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/listings"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm px-6 py-3 rounded-xl shadow-lg transition-all"
            >
              Browse Verified Homes <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
