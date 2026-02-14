import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Re-Order Your Custom Perfume | Aquad'or Cyprus",
  description: "Re-order your custom Aquad'or fragrance. Enter your formula or upload a photo to quickly reorder your signature perfume.",
  openGraph: {
    title: "Re-Order Your Custom Perfume | Aquad'or Cyprus",
    description: "Quickly reorder your custom Aquad'or fragrance with your existing formula.",
    url: 'https://aquadorcy.com/reorder',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Re-Order Your Custom Perfume | Aquad'or",
    description: "Quickly reorder your custom fragrance.",
    images: ['/aquador.webp'],
  },
  alternates: {
    canonical: 'https://aquadorcy.com/reorder',
  },
};

export default function ReorderLayout({ children }: { children: React.ReactNode }) {
  return children;
}
