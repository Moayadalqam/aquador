import { Metadata } from 'next';
import Link from 'next/link';
import { getProductsByCategory } from '@/lib/supabase/product-service';
import { buildCollectionPage, buildBreadcrumbList, jsonLdScript } from '@/lib/seo/listing-schema';
import LattafaContent from './LattafaContent';

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Lattafa Originals Perfumes",
  description: 'Discover our original Lattafa Perfumes collection - authentic Arabian fragrances crafted with the finest ingredients. Shop online at Aquad\'or Cyprus.',
  openGraph: {
    title: "Lattafa Originals Perfumes | Aquad'or Cyprus",
    description: 'Authentic Arabian fragrances crafted with the finest ingredients. Original Lattafa Perfumes collection.',
    url: 'https://aquadorcy.com/shop/lattafa',
    images: [{ url: '/aquador.webp', width: 800, height: 600, alt: 'Lattafa Originals Perfumes' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Lattafa Originals Perfumes | Aquad'or Cyprus",
    description: 'Authentic Arabian fragrances. Original Lattafa Perfumes collection.',
    images: ['/aquador.webp'],
  },
  alternates: {
    canonical: 'https://aquadorcy.com/shop/lattafa',
  },
};

export default async function LattafaPage() {
  const supabaseProducts = await getProductsByCategory('lattafa-original');

  // Transform Supabase products to match the LegacyProduct interface
  const products = supabaseProducts.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: Number(p.price),
    salePrice: p.sale_price ? Number(p.sale_price) : undefined,
    category: p.category as 'men' | 'women' | 'niche' | 'essence-oil' | 'body-lotion' | 'lattafa-original' | 'al-haramain-originals' | 'victorias-secret-originals',
    productType: p.product_type as 'perfume' | 'essence-oil' | 'body-lotion',
    size: p.size,
    image: p.image,
    inStock: p.in_stock ?? true,
    brand: p.brand ?? undefined,
    gender: p.gender ?? undefined,
    tags: p.tags ?? undefined,
  }));

  if (products.length === 0) {
    return (
      <div className="pt-32 md:pt-40 lg:pt-44 pb-16 min-h-screen bg-dark text-center">
        <h1 className="text-4xl font-playfair text-black">No products found</h1>
        <p className="text-gray-400 mt-4">Lattafa Originals collection is currently empty.</p>
        <Link href="/shop" className="text-gold mt-4 inline-block">
          &larr; Back to Shop
        </Link>
      </div>
    );
  }

  const breadcrumbSchema = buildBreadcrumbList([
    { name: 'Home', url: 'https://aquadorcy.com' },
    { name: 'Shop', url: 'https://aquadorcy.com/shop' },
    { name: 'Lattafa Originals', url: 'https://aquadorcy.com/shop/lattafa' },
  ]);

  const collectionSchema = buildCollectionPage({
    name: 'Lattafa Originals Perfumes',
    description: "Authentic Arabian fragrances crafted with the finest ingredients. Original Lattafa Perfumes collection at Aquad'or Cyprus.",
    url: 'https://aquadorcy.com/shop/lattafa',
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
      <LattafaContent products={products} />
    </>
  );
}
