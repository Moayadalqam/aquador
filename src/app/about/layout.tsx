import { Metadata } from 'next';
import { aboutPageSchema } from '@/lib/seo/page-schemas';
import JsonLd from '@/components/seo/JsonLd';

export const metadata: Metadata = {
  title: "About Us | Aquad'or - Luxury Perfume House in Cyprus",
  description: "Discover the story behind Aquad'or, Cyprus's premier luxury fragrance house in Nicosia. Curated niche perfumes and personalized consultations since day one.",
  openGraph: {
    title: "About Us | Aquad'or Cyprus",
    description: "Cyprus's premier luxury fragrance house in Nicosia. Curated niche perfumes and personalized consultations.",
    url: 'https://aquadorcy.com/about',
    images: [{ url: '/aquador-logo.png', width: 800, height: 600, alt: "About Aquad'or" }],
  },
  twitter: {
    card: 'summary_large_image',
    title: "About Us | Aquad'or Cyprus",
    description: "Cyprus's premier luxury fragrance house in Nicosia.",
    images: ['/aquador-logo.png'],
  },
  alternates: {
    canonical: 'https://aquadorcy.com/about',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd schema={aboutPageSchema} />
      {children}
    </>
  );
}
