import { Metadata } from 'next';
import Link from 'next/link';
import { getProductsByBrand } from '@/lib/products';
import LattafaContent from './LattafaContent';

export const metadata: Metadata = {
  title: "Lattafa Collection | Aquad'or",
  description: 'Discover our premium Lattafa Perfumes collection - authentic Arabian fragrances crafted with the finest ingredients.',
  openGraph: {
    title: "Lattafa Collection | Aquad'or",
    description: 'Discover our premium Lattafa Perfumes collection - authentic Arabian fragrances crafted with the finest ingredients.',
  },
};

export default function LattafaPage() {
  const products = getProductsByBrand('Lattafa');

  if (products.length === 0) {
    return (
      <div className="pt-32 pb-16 min-h-screen bg-dark text-center">
        <h1 className="text-4xl font-playfair text-white">No products found</h1>
        <p className="text-gray-400 mt-4">Lattafa collection is currently empty.</p>
        <Link href="/shop" className="text-gold mt-4 inline-block">
          &larr; Back to Shop
        </Link>
      </div>
    );
  }

  return <LattafaContent products={products} />;
}
