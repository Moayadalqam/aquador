'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useCallback, useMemo } from 'react';
import { SearchBar } from '@/components/search';
import { PageHero } from '@/components/ui/Section';
import { CategoryTransition } from '@/components/shop/CategoryTransition';
import { SwipeableProductGrid } from '@/components/shop/SwipeableProductGrid';
import { formatPrice } from '@/lib/utils';
import { gridLayoutTransition, gridItemVariants } from '@/lib/animations/filter-transitions';
import { categories as allCategories } from '@/lib/categories';
import type { Product } from '@/lib/supabase/types';
import type { Category } from '@/types';

const FALLBACK_IMAGE = '/placeholder-product.svg';

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

  const isEmpty = products.length === 0;

  return (
    <CategoryTransition categorySlug={category.slug}>
      <div className="min-h-screen bg-gold-ambient">
        <PageHero
          title={category.name}
          subtitle={category.description}
          backgroundImage={category.image}
          titleVariant="gold"
        />

      {/* Coming Soon state for empty categories */}
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
                <svg className="w-7 h-7 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-playfair text-white mb-3">Coming Soon</h2>
              <p className="text-gray-400 text-sm mb-8">
                We&apos;re curating an exclusive selection for this collection. Check back soon or explore our other categories.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 text-gold text-xs uppercase tracking-[0.2em] hover:text-gold-light transition-colors"
              >
                &larr; Browse All Products
              </Link>
            </motion.div>
          </div>
        </section>
      ) : (
        <>
          {/* Search Bar */}
          <section className="container-wide py-8">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="max-w-md mx-auto"
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
                className="flex items-center justify-center gap-3 mt-4"
              >
                <p className="text-xs text-gray-500">
                  {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''} for &quot;{searchQuery}&quot;
                </p>
                <button
                  onClick={clearSearch}
                  className="text-xs text-gold/70 hover:text-gold transition-colors"
                >
                  Clear
                </button>
              </motion.div>
            )}
          </section>

          {/* Products Grid */}
          <section className="container-wide pb-20">
            <SwipeableProductGrid
              categories={allCategories}
              currentCategorySlug={category.slug}
            >
              <motion.div
                initial="hidden"
                animate="visible"
                transition={{ staggerChildren: 0.03, delayChildren: 0.1 }}
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5"
              >
                {filteredProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    variants={gridItemVariants}
                    layout
                    transition={gridLayoutTransition}
                  >
                    <Link href={`/products/${product.id}`} className="group block product-card">
                      {/* Image */}
                      <div className="relative aspect-[3/4] overflow-hidden">
                        <Image
                          src={product.image || FALLBACK_IMAGE}
                          alt={product.name}
                          fill
                          className={`object-cover transition-transform duration-700 group-hover:scale-105 ${!(product.in_stock ?? true) ? 'opacity-60' : ''}`}
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
                        />
                        {product.sale_price && product.sale_price < product.price && (product.in_stock ?? true) && (
                          <span className="absolute top-3 left-3 bg-gold text-black text-[9px] uppercase tracking-wider px-2 py-1 font-medium">
                            Sale
                          </span>
                        )}
                        {!(product.in_stock ?? true) && (
                          <span className="absolute top-3 left-3 bg-gray-800 text-white text-[9px] uppercase tracking-wider px-2 py-1 font-medium">
                            Coming Soon
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4 bg-white">
                        {product.brand && (
                          <p className="label-micro mb-1.5 truncate">{product.brand}</p>
                        )}
                        <h3 className="text-sm font-playfair text-gray-900 group-hover:text-gold-dark transition-colors mb-2 line-clamp-1">
                          {product.name}
                        </h3>
                        <div className="pt-2 border-t border-gray-100">
                          <div className="flex items-baseline justify-between">
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-base font-playfair text-gray-900">
                                {formatPrice(product.sale_price || product.price)}
                              </span>
                              {product.sale_price && product.sale_price < product.price && (
                                <span className="text-xs text-gray-400 line-through">
                                  {formatPrice(product.price)}
                                </span>
                              )}
                            </div>
                            <span className="text-[9px] text-gray-400 uppercase">
                              {product.size}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </SwipeableProductGrid>

            {filteredProducts.length === 0 && (
              <div className="text-center py-20">
                <p className="text-gray-500 text-sm mb-4">
                  No products found for &quot;{searchQuery}&quot; in this category.
                </p>
                <button
                  onClick={clearSearch}
                  className="text-gold text-sm hover:text-gold/80 transition-colors"
                >
                  Clear search
                </button>
              </div>
            )}
          </section>
        </>
      )}
      </div>
    </CategoryTransition>
  );
}
