import { Metadata } from 'next';
import { Suspense } from 'react';
import { getAllProducts, categories } from '@/lib/supabase/product-service';
import { buildCollectionPage, buildBreadcrumbList, jsonLdScript } from '@/lib/seo/listing-schema';
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

export default async function ShopPage() {
  const products = await getAllProducts();

  const breadcrumbSchema = buildBreadcrumbList([
    { name: 'Home', url: 'https://aquadorcy.com' },
    { name: 'Shop', url: 'https://aquadorcy.com/shop' },
  ]);

  const collectionSchema = buildCollectionPage({
    name: 'Dubai Shop',
    description: "Curated Dubai fragrances — Al Haramain, Xerjoff, and niche scents. Free shipping in Cyprus over €50.",
    url: 'https://aquadorcy.com/shop',
    items: products.map(p => ({
      name: p.name,
      slug: p.id,
      image: p.image,
    })),
    itemUrlPrefix: '/products',
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(collectionSchema) }}
      />
      <Suspense fallback={<div className="pt-32 md:pt-40 lg:pt-44 pb-20 bg-white min-h-screen" />}>
        <ShopContent products={products} categories={categories} />
      </Suspense>
    </>
  );
}
