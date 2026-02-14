import type { Metadata, Viewport } from "next";
import { Playfair_Display, Poppins } from "next/font/google";
import dynamic from "next/dynamic";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { CartProvider, CartDrawer } from "@/components/cart";
import CookieConsent from "@/components/ui/CookieConsent";
import { AbortErrorSuppressor } from "@/components/providers/ErrorBoundary";
import ValentineHearts from "@/components/seasonal/ValentineHearts";
import VisitorTracker from "@/components/VisitorTracker";

const ChatWidget = dynamic(() => import("@/components/ai/ChatWidget"), {
  ssr: false,
});

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
  title: {
    default: "Aquad'or | Luxury Perfumes & Niche Fragrances Cyprus",
    template: "%s | Aquad'or Cyprus",
  },
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
    title: "Aquad'or | Luxury Perfumes & Niche Fragrances Cyprus",
    description: "Where Luxury Meets Distinction. Discover our curated collection of high-end and niche perfumes.",
    type: "website",
    locale: "en_US",
    siteName: "Aquad'or",
    url: "https://aquadorcy.com",
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
    title: "Aquad'or | Luxury Perfumes & Niche Fragrances Cyprus",
    description: "Where Luxury Meets Distinction. Discover our curated collection of high-end and niche perfumes.",
    images: ["/aquador.webp"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large' as const,
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://aquadorcy.com',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://images.unsplash.com" />
      </head>
      <body className={`${poppins.variable} ${playfair.variable} antialiased`}>
        <AbortErrorSuppressor />
        <ValentineHearts />
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
        <VisitorTracker />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
