import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Aquad'or | Luxury Perfumes Cyprus",
  description: "Where Luxury Meets Distinction. Discover our curated collection of high-end and niche perfumes, or create your own signature fragrance at Aquad'or Cyprus.",
  keywords: ["perfume", "luxury fragrance", "Cyprus", "Nicosia", "custom perfume", "niche perfume", "Aquador"],
  authors: [{ name: "Aquad'or" }],
  openGraph: {
    title: "Aquad'or | Luxury Perfumes Cyprus",
    description: "Where Luxury Meets Distinction. Discover our curated collection of high-end and niche perfumes.",
    type: "website",
    locale: "en_US",
    siteName: "Aquad'or",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aquad'or | Luxury Perfumes Cyprus",
    description: "Where Luxury Meets Distinction. Discover our curated collection of high-end and niche perfumes.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
