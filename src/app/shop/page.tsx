import { Metadata } from 'next';
import { Suspense } from 'react';
import { getAllProducts, categories } from '@/lib/supabase/product-service';
import { buildCollectionPage, buildBreadcrumbList } from '@/lib/seo/listing-schema';
import JsonLd from '@/components/seo/JsonLd';
import ShopContent from './ShopContent';

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Dubai Shop | Aquad'or Cyprus — Luxury Fragrances",
  description: "Dubai's finest fragrance houses — Al Haramain, Xerjoff, and curated niche scents. Free shipping in Cyprus over €50.",
  openGraph: {
    title: "Dubai Shop | Aquad'or Cyprus",
    description: "Browse our curated Dubai collection of luxury perfumes and niche fragrances.",
    url: 'https://aquadorcy.com/shop',
    images: [{ url: '/aquador-logo.png', width: 800, height: 600, alt: "Aquad'or Perfume Collection" }],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Dubai Shop | Aquad'or Cyprus",
    description: "Browse our curated Dubai collection of luxury perfumes and niche fragrances.",
    images: ['/aquador-logo.png'],
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

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Do you ship across Cyprus?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes — free shipping anywhere in Cyprus on orders over €50. Standard delivery is 3–7 business days.',
        },
      },
      {
        '@type': 'Question',
        name: 'Are these original perfumes?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Every fragrance we sell is 100% authentic and sourced directly from authorised distributors. This includes Al Haramain, Lattafa, Xerjoff and Victoria’s Secret originals.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I choose between Eau de Parfum and Eau de Toilette?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Eau de Parfum has a higher fragrance-oil concentration (typically 15–20%) and lasts 6–8 hours. Eau de Toilette is lighter (5–15%) and lasts 3–5 hours — great for daytime or warm weather.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I return a perfume after opening it?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'For hygiene reasons, opened fragrances cannot be returned. Unopened items in their original packaging can be returned within 14 days. Contact us at info@aquadorcy.com to arrange a return.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do you offer custom blended perfumes?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes — our Create Your Perfume builder lets you compose a three-layer signature scent (top, heart, base notes) at our Nicosia atelier. Available in 50ml (€29.99) or 100ml (€199).',
        },
      },
    ],
  };

  return (
    <>
      <JsonLd schema={breadcrumbSchema} />
      <JsonLd schema={collectionSchema} />
      <JsonLd schema={faqSchema} />
      <Suspense fallback={<div className="pt-32 md:pt-40 lg:pt-44 pb-20 bg-white min-h-screen" />}>
        <ShopContent products={products} categories={categories} />
      </Suspense>
    </>
  );
}
