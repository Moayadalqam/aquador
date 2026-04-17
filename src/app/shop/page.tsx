import { Metadata } from 'next';
import { Suspense } from 'react';
import { getAllProducts, categories } from '@/lib/supabase/product-service';
import ShopContent from './ShopContent';

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Dubai Shop | Aquad'or Cyprus — Luxury Fragrances",
  description: "Dubai's finest fragrance houses — Al Haramain, Xerjoff, and curated niche scents. Free shipping in Cyprus over €50.",
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

interface ShopPageProps {
  searchParams: { search?: string; brand?: string };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const allProducts = await getAllProducts();

  const searchQuery = searchParams.search?.trim() || '';
  const isSearchMode = searchQuery.length > 0;

  // Search mode: show all active perfume products (cross-category) so Lattafa etc. appear in results
  // Normal mode: Dubai Shop only — exclude Lattafa (own page) and non-perfume types
  const products = isSearchMode
    ? allProducts.filter(p => p.product_type === 'perfume')
    : allProducts.filter(p => p.category !== 'lattafa-original' && p.product_type === 'perfume');

  return (
    <Suspense fallback={<div className="pt-32 md:pt-40 lg:pt-44 pb-20 bg-white min-h-screen" />}>
      <ShopContent products={products} categories={categories} isSearchMode={isSearchMode} />
    </Suspense>
  );
}
