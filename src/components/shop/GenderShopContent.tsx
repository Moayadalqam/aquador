'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import { useState, useCallback, useMemo } from 'react';
import { SearchBar } from '@/components/search';
import { PageHero } from '@/components/ui/Section';
import { ProductCard } from '@/components/ui/ProductCard';
import { gridLayoutTransition, gridItemVariants } from '@/lib/animations/filter-transitions';
import type { Product } from '@/lib/supabase/types';

interface GenderShopContentProps {
  gender: string;
  genderLabel: string;
  products: Product[];
}

const GENDER_SUBTITLES: Record<string, string> = {
  men: 'Bold, refined scents crafted for the modern gentleman',
  women: 'Elegant, captivating fragrances for the discerning woman',
  unisex: 'Versatile fragrances that transcend boundaries',
};

export default function GenderShopContent({ gender, genderLabel, products }: GenderShopContentProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

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

  const isEmpty = products.length === 0;

  return (
    <div className="min-h-screen bg-gold-ambient">
      <PageHero
        title={genderLabel}
        subtitle={GENDER_SUBTITLES[gender] || 'Luxury fragrances from Dubai'}
        titleVariant="gold"
      />

      {isEmpty ? (
        <section className="section">
          <div className="container-wide">
            <motion.div
              className="max-w-lg mx-auto text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-16 h-16 rounded-full border border-gold/30 bg-gold/5 flex items-center justify-center mx-auto mb-6">
                <svg className="w-7 h-7 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-playfair text-black mb-3">Coming Soon</h2>
              <p className="text-gray-600 text-sm mb-8">
                We&apos;re curating an exclusive selection for this collection. Check back soon or explore our other collections.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 text-gold text-xs uppercase tracking-[0.2em] hover:text-gold-light transition-colors cursor-pointer"
              >
                &larr; Browse All Products
              </Link>
            </motion.div>
          </div>
        </section>
      ) : (
        <>
          <section className="container-wide py-6 md:py-8">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="max-w-md mx-auto"
            >
              <SearchBar
                variant="shop"
                placeholder={`Search ${genderLabel.toLowerCase()}...`}
                onSearch={handleSearch}
              />
            </motion.div>

            {searchQuery.length >= 2 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center gap-3 mt-4"
              >
                <p className="text-xs text-gray-500">
                  {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''} for &quot;{searchQuery}&quot;
                </p>
                <button
                  onClick={clearSearch}
                  className="text-xs text-gold/70 hover:text-gold transition-colors cursor-pointer"
                >
                  Clear
                </button>
              </motion.div>
            )}
          </section>

          <section className="container-wide pb-16 md:pb-20">
            <motion.div
              initial="hidden"
              animate="visible"
              transition={{ staggerChildren: 0.03, delayChildren: 0.1 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
            >
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  variants={gridItemVariants}
                  layout
                  transition={gridLayoutTransition}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>

            {filteredProducts.length === 0 && searchQuery.length >= 2 && (
              <div className="text-center py-20">
                <p className="text-gray-500 text-sm mb-4">
                  No products found for &quot;{searchQuery}&quot; in {genderLabel.toLowerCase()}.
                </p>
                <button
                  onClick={clearSearch}
                  className="text-gold text-sm hover:text-gold/80 transition-colors cursor-pointer"
                >
                  Clear search
                </button>
              </div>
            )}
          </section>

          <section className="container-wide pb-12 md:pb-16 text-center">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-gold/70 text-xs uppercase tracking-[0.2em] hover:text-gold transition-colors cursor-pointer"
            >
              &larr; Browse All Collections
            </Link>
          </section>
        </>
      )}
    </div>
  );
}
