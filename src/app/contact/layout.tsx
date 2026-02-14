import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Contact Us | Aquad'or - Visit Our Nicosia Boutique",
  description: "Get in touch with Aquad'or. Visit us at Ledra 145, Nicosia, Cyprus. Call +357 99 980809 or email info@aquadorcy.com for personalized fragrance consultations.",
  openGraph: {
    title: "Contact Aquad'or | Luxury Perfumes Cyprus",
    description: "Visit us at Ledra 145, Nicosia, Cyprus. Call +357 99 980809 for personalized fragrance consultations.",
    url: 'https://aquadorcy.com/contact',
    images: [{ url: '/aquador.webp', width: 800, height: 600, alt: "Contact Aquad'or" }],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Contact Aquad'or | Luxury Perfumes Cyprus",
    description: "Visit us at Ledra 145, Nicosia. Call +357 99 980809.",
    images: ['/aquador.webp'],
  },
  alternates: {
    canonical: 'https://aquadorcy.com/contact',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
