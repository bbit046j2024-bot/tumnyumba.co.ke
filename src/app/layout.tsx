import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "CampusKey Mombasa — Find. Live. Belong.",
    template: "%s | CampusKey Mombasa",
  },
  description:
    "The most trusted student housing platform in Mombasa. Find verified, affordable rentals near campus.",
  keywords: [
    "CampusKey",
    "CampusKey Mombasa",
    "student housing Mombasa",
    "Mombasa rentals",
    "verified student accommodation",
    "bedsitters near TUM",
    "student rooms Mombasa",
    "affordable housing Mombasa",
    "campuskey.co.ke",
  ],
  // ─── Google Search Console verification ──────────────────────────────────
  // Replace the value below with your actual code from:
  // https://search.google.com/search-console → Add Property → HTML tag method
  verification: {
    google: "c3a14be1f7c98c03",
  },
  // ─────────────────────────────────────────────────────────────────────────
  alternates: {
    canonical: "https://campuskey.co.ke",
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "CampusKey Mombasa — Find. Live. Belong.",
    description: "Safe. Affordable. Verified. Connecting students to trusted rentals near campus.",
    url: "https://campuskey.co.ke",
    siteName: "CampusKey Mombasa",
    images: [{ url: "/logo.png", width: 1200, height: 630, alt: "CampusKey Mombasa logo" }],
    locale: "en_KE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CampusKey Mombasa",
    description: "Find verified student housing in Mombasa",
    images: ["/logo.png"],
  },
  metadataBase: new URL("https://campuskey.co.ke"),
};

import AuthProvider from "@/components/providers/AuthProvider";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={cn("font-sans", geist.variable)}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-inter antialiased" suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
