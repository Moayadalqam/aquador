import { Metadata } from 'next';
import Link from 'next/link';
import { getProductsByCategory } from '@/lib/supabase/product-service';
import LattafaContent from './LattafaContent';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Lattafa Original | Aquad'or",
  description: 'Discover our original Lattafa Perfumes collection - authentic Arabian fragrances crafted with the finest ingredients.',
  openGraph: {
    title: "Lattafa Original | Aquad'or",
    description: 'Discover our original Lattafa Perfumes collection - authentic Arabian fragrances crafted with the finest ingredients.',
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
    category: p.category as 'men' | 'women' | 'niche' | 'essence-oil' | 'body-lotion' | 'lattafa-original',
    productType: p.product_type as 'perfume' | 'essence-oil' | 'body-lotion' | 'gift-set',
    size: p.size,
    image: p.image,
    inStock: p.in_stock ?? true,
    brand: p.brand ?? undefined,
    gender: p.gender ?? undefined,
    tags: p.tags ?? undefined,
  }));

  if (products.length === 0) {
    return (
      <div className="pt-32 pb-16 min-h-screen bg-dark text-center">
        <h1 className="text-4xl font-playfair text-white">No products found</h1>
        <p className="text-gray-400 mt-4">Lattafa Original collection is currently empty.</p>
        <Link href="/shop" className="text-gold mt-4 inline-block">
          &larr; Back to Shop
        </Link>
      </div>
    );
  }

  return <LattafaContent products={products} />;
}
