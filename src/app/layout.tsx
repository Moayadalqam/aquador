import type { Metadata } from "next";
import { Playfair_Display, Poppins } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { CartProvider, CartDrawer } from "@/components/cart";
import CookieConsent from "@/components/ui/CookieConsent";
import { AbortErrorSuppressor } from "@/components/providers/ErrorBoundary";
import ChatWidget from "@/components/ai/ChatWidget";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
  weight: ["200", "300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://aquadorcy.com'),
  title: "Aquad'or | Luxury Perfumes Cyprus",
  description: "Where Luxury Meets Distinction. Discover our curated collection of high-end and niche perfumes, or create your own signature fragrance at Aquad'or Cyprus.",
  keywords: ["perfume", "luxury fragrance", "Cyprus", "Nicosia", "custom perfume", "niche perfume", "Aquador"],
  authors: [{ name: "Aquad'or" }],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon.png", sizes: "192x192", type: "image/png" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "Aquad'or | Luxury Perfumes Cyprus",
    description: "Where Luxury Meets Distinction. Discover our curated collection of high-end and niche perfumes.",
    type: "website",
    locale: "en_US",
    siteName: "Aquad'or",
    images: [
      {
        url: "/aquador.webp",
        width: 800,
        height: 600,
        alt: "Aquad'or Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Aquad'or | Luxury Perfumes Cyprus",
    description: "Where Luxury Meets Distinction. Discover our curated collection of high-end and niche perfumes.",
    images: ["/aquador.webp"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${playfair.variable} antialiased`}>
        <AbortErrorSuppressor />
        <CartProvider>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
          <CartDrawer />
          <CookieConsent />
          <ChatWidget />
        </CartProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
