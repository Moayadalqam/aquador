'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { getProductsByCategory, categories } from '@/lib/products';
import { formatPrice } from '@/lib/utils';

export default function CategoryPage() {
  const params = useParams();
  const categorySlug = params.category as string;
  const category = categories.find((c) => c.slug === categorySlug);
  const products = getProductsByCategory(categorySlug);

  if (!category) {
    return (
      <div className="pt-32 pb-16 min-h-screen bg-dark text-center">
        <h1 className="text-4xl font-playfair text-white">Category not found</h1>
        <Link href="/shop" className="text-gold mt-4 inline-block">
          ← Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 bg-dark min-h-screen">
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={category.image}
            alt={category.name}
            fill
            className="object-cover opacity-30"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-dark/80 via-dark/90 to-dark" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Link
              href="/shop"
              className="inline-flex items-center text-gold/70 hover:text-gold mb-6 text-sm uppercase tracking-wider"
            >
              ← Back to Collections
            </Link>
            <h1 className="text-5xl md:text-6xl font-playfair text-gradient-gold mb-4">
              {category.name}
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              {category.description}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={`/products/${product.id}`}
                className="group block bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
              >
                {/* Image */}
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-lg font-playfair text-gray-900 group-hover:text-gold-dark transition-colors mb-1">
                    {product.name}
                  </h3>
                  {product.brand && (
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                      {product.brand}
                    </p>
                  )}
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gold-dark">
                      {formatPrice(product.price)}
                    </span>
                    <span className="text-xs text-gray-500">{product.size}</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No products found in this category.</p>
            <Link href="/shop" className="text-gold mt-4 inline-block">
              Browse all products
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
