import { Metadata } from 'next';
import { Suspense } from 'react';
import { getAllProducts, categories } from '@/lib/supabase/product-service';
import ShopContent from './ShopContent';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Shop Luxury Perfumes | Aquad'or Cyprus Collection",
  description: "Browse our curated collection of luxury perfumes, niche fragrances, essence oils, and body lotions. Free shipping on orders over €100 in Cyprus.",
  openGraph: {
    title: "Shop Luxury Perfumes | Aquad'or Cyprus",
    description: "Browse our curated collection of luxury perfumes, niche fragrances, and essence oils.",
    url: 'https://aquadorcy.com/shop',
    images: [{ url: '/aquador.webp', width: 800, height: 600, alt: "Aquad'or Perfume Collection" }],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Shop Luxury Perfumes | Aquad'or Cyprus",
    description: "Browse our curated collection of luxury perfumes and niche fragrances.",
    images: ['/aquador.webp'],
  },
  alternates: {
    canonical: 'https://aquadorcy.com/shop',
  },
};

export default async function ShopPage() {
  const products = await getAllProducts();

  return (
    <Suspense fallback={<div className="pt-28 pb-20 bg-black min-h-screen" />}>
      <ShopContent products={products} categories={categories} />
    </Suspense>
  );
}
