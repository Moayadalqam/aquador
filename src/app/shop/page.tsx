import { Metadata } from 'next';
import { Suspense } from 'react';
import { getAllProducts, categories } from '@/lib/supabase/product-service';
import ShopContent from './ShopContent';

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Dubai Shop | Aquad'or Cyprus — Luxury Fragrances",
  description: "Browse our curated Dubai collection of luxury perfumes, niche fragrances, and exclusive scents. Free shipping on orders over €50 in Cyprus.",
  openGraph: {
    title: "Dubai Shop | Aquad'or Cyprus",
    description: "Browse our curated Dubai collection of luxury perfumes and niche fragrances.",
    url: 'https://aquadorcy.com/shop',
    images: [{ url: '/aquador.webp', width: 800, height: 600, alt: "Aquad'or Perfume Collection" }],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Dubai Shop | Aquad'or Cyprus",
    description: "Browse our curated Dubai collection of luxury perfumes and niche fragrances.",
    images: ['/aquador.webp'],
  },
  alternates: {
    canonical: 'https://aquadorcy.com/shop',
  },
};

export default async function ShopPage() {
  const allProducts = await getAllProducts();

  // Dubai Shop excludes Lattafa products (they have their own dedicated page)
  const products = allProducts.filter(p => p.category !== 'lattafa-original');

  return (
    <Suspense fallback={<div className="pt-32 md:pt-40 lg:pt-44 pb-20 bg-white min-h-screen" />}>
      <ShopContent products={products} categories={categories} />
    </Suspense>
  );
}
