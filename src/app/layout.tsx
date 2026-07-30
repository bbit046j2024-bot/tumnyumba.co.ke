import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TUM Nyumba — Find. Live. Belong.",
  description:
    "The most trusted student housing platform for TUM Mombasa students. Find verified, affordable rentals near campus.",
  keywords: ["TUM housing", "student housing Mombasa", "TUM Mombasa rentals", "verified student accommodation"],
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "TUM Nyumba — Find. Live. Belong.",
    description: "Safe. Affordable. Verified. We connect TUM students to trusted rentals near campus.",
    url: "https://tumnyumba.co.ke",
    siteName: "TUM Nyumba",
    images: [{ url: "/logo.png", width: 1200, height: 630 }],
    locale: "en_KE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TUM Nyumba",
    description: "Find verified student housing near TUM Mombasa",
    images: ["/logo.png"],
  },
  metadataBase: new URL("https://tumnyumba.co.ke"),
};

import AuthProvider from "@/components/providers/AuthProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
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
