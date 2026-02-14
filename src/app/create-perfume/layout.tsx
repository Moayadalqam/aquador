import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Create Your Own Perfume | Aquad'or Bespoke Fragrance Atelier",
  description: "Design your own custom perfume at Aquad'or Cyprus. Choose from floral, fruity, woody, oriental, and gourmand notes to create a signature fragrance uniquely yours.",
  openGraph: {
    title: "Create Your Own Perfume | Aquad'or Cyprus",
    description: "Design your own custom perfume. Choose from 5 fragrance families to create your signature scent.",
    url: 'https://aquadorcy.com/create-perfume',
    images: [{ url: '/aquador.webp', width: 800, height: 600, alt: "Create Your Own Perfume at Aquad'or" }],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Create Your Own Perfume | Aquad'or Cyprus",
    description: "Design your own custom perfume from 5 fragrance families.",
    images: ['/aquador.webp'],
  },
  alternates: {
    canonical: 'https://aquadorcy.com/create-perfume',
  },
};

export default function CreatePerfumeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
