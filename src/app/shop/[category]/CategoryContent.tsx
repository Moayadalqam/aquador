'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useCallback, useMemo } from 'react';
import { SearchBar } from '@/components/search';
import { formatPrice } from '@/lib/utils';
import type { Product, Category } from '@/types';

interface CategoryContentProps {
  category: Category;
  products: Product[];
}

export default function CategoryContent({ category, products }: CategoryContentProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  // Filter products based on search query
  const filteredProducts = useMemo(() => {
    if (searchQuery.trim().length < 2) {
      return products;
    }

    const lowercaseQuery = searchQuery.toLowerCase();
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(lowercaseQuery) ||
        product.description.toLowerCase().includes(lowercaseQuery) ||
        product.brand?.toLowerCase().includes(lowercaseQuery)
    );
  }, [products, searchQuery]);

  return (
    <div className="pt-24 pb-16 bg-gold-ambient min-h-screen">
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={category.image}
            alt={category.name}
            fill
            className="object-cover opacity-30"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-dark/80 via-dark/90 to-dark" />
        </div>
        <div className="w-full px-4 sm:px-8 lg:px-16 xl:px-24 text-center relative z-10">
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

      {/* Search Bar */}
      <section className="w-full px-4 sm:px-8 lg:px-16 xl:px-24 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-xl mx-auto"
        >
          <SearchBar
            variant="shop"
            placeholder={`Search in ${category.name}...`}
            onSearch={handleSearch}
          />
        </motion.div>

        {/* Search results summary */}
        {searchQuery.length >= 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-4 mt-4"
          >
            <p className="text-sm text-gray-400">
              Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} for &quot;{searchQuery}&quot;
            </p>
            <button
              onClick={clearSearch}
              className="text-sm text-gold hover:text-gold/80 transition-colors"
            >
              Clear search
            </button>
          </motion.div>
        )}
      </section>

      {/* Products Grid */}
      <section className="w-full px-4 sm:px-8 lg:px-16 xl:px-24 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.05, 0.3) }}
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

        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg mb-4">
              {searchQuery.length >= 2
                ? `No products found for "${searchQuery}" in this category.`
                : 'No products found in this category.'}
            </p>
            {searchQuery.length >= 2 ? (
              <button
                onClick={clearSearch}
                className="text-gold hover:text-gold/80 transition-colors"
              >
                Clear search
              </button>
            ) : (
              <Link href="/shop" className="text-gold">
                Browse all products
              </Link>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
