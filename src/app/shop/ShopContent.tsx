'use client';

import { motion, AnimatePresence } from 'motion/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { trackFilterChange } from '@/lib/analytics/product-engagement';
import { SearchBar } from '@/components/search';
import { PageHero } from '@/components/ui/Section';
import { ProductCard } from '@/components/ui/ProductCard';
import { AnimatedFilterBar } from '@/components/shop/AnimatedFilterBar';
import { AnimationBudgetProvider } from '@/lib/performance/animation-budget';
import {
  gridItemVariants,
  FILTER_TIMING,
} from '@/lib/animations/filter-transitions';
import { DiscoveryGrid } from '@/components/shop/DiscoveryGrid';
import DubaiShopHero from '@/components/shop/DubaiShopHero';
import CuratedHousesStrip from '@/components/shop/CuratedHousesStrip';
import type { Product } from '@/lib/supabase/types';
import type { Category } from '@/types';

interface ShopContentProps {
  products: Product[];
  categories: Category[];
  isSearchMode?: boolean;
}

export default function ShopContent({ products, categories, isSearchMode = false }: ShopContentProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlSearchQuery = searchParams.get('search') || '';
  const brandFilter = searchParams.get('brand') || '';

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(urlSearchQuery);

  // Prevents tracking on initial URL param load — only track user-initiated changes
  const isInitializedRef = useRef(false);
  useEffect(() => {
    isInitializedRef.current = true;
  }, []);

  useEffect(() => {
    setSearchQuery(urlSearchQuery);
  }, [urlSearchQuery]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleCategoryChange = useCallback((category: string | null) => {
    setSelectedCategory(category);
    if (!isInitializedRef.current || category === null) return;
    // Deferred to next tick so filteredProducts reflects the new filter value
    // We'll track via useEffect on filteredProducts instead
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedCategory(null);
    setSearchQuery('');
  }, []);

  const filteredProducts = useMemo(() => {
    let result = products;

    // Brand filter from URL query param (e.g., ?brand=xerjoff)
    if (brandFilter) {
      const brandLower = brandFilter.toLowerCase();
      result = result.filter(
        (p) => p.brand?.toLowerCase() === brandLower
      );
    }

    if (searchQuery.trim().length >= 2) {
      const lowercaseQuery = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(lowercaseQuery) ||
          p.description.toLowerCase().includes(lowercaseQuery) ||
          p.brand?.toLowerCase().includes(lowercaseQuery)
      );
    }

    return result.filter((product) => {
      if (selectedCategory && product.category !== selectedCategory) return false;
      return true;
    });
  }, [products, searchQuery, selectedCategory, brandFilter]);

  // Track filter changes after state updates — guards against initial URL param load
  useEffect(() => {
    if (!isInitializedRef.current || selectedCategory === null) return;
    trackFilterChange('category', selectedCategory, filteredProducts.length);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  useEffect(() => {
    if (!isInitializedRef.current || searchQuery.trim().length < 2) return;
    trackFilterChange('search', searchQuery, filteredProducts.length);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const clearBrandFilter = useCallback(() => {
    router.push('/shop');
  }, [router]);

  const hasActiveFilters = selectedCategory || searchQuery.length >= 2 || !!brandFilter;

  return (
    <AnimationBudgetProvider>
      <div className="min-h-screen bg-gold-ambient">
        {/* Hero */}
        {isSearchMode && urlSearchQuery ? (
          <PageHero
            title="Search Results"
            subtitle={`Showing results for '${urlSearchQuery}'`}
            titleVariant="white"
          />
        ) : (
          <DubaiShopHero
            title="Dubai Shop"
            subtitle="A curated selection of fragrances from Al Haramain, Xerjoff and the niche houses defining contemporary Middle Eastern perfumery."
            eyebrow="From Dubai, with luxury"
          />
        )}

        {/* Curated houses strip — only on the default Dubai Shop view */}
        {!isSearchMode && !hasActiveFilters && <CuratedHousesStrip />}

        {/* Search and Filters */}
        <section className="container-wide pb-8 md:pb-10">
          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-md mx-auto mb-8"
          >
            <SearchBar
              variant="shop"
              placeholder="Search fragrances..."
              onSearch={handleSearch}
            />
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex flex-col items-center gap-[var(--spacing-md)]"
          >
            {/* Category filters — hidden in search mode since results span all categories */}
            {!isSearchMode && (
              <AnimatedFilterBar
                filters={categories.map((cat) => ({
                  id: cat.id,
                  label: cat.name.replace("'s Collection", ''),
                }))}
                activeFilter={selectedCategory}
                onFilterChange={handleCategoryChange}
              />
            )}

          </motion.div>

          {/* Active brand filter pill */}
          {brandFilter && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center mt-6"
            >
              <span className="inline-flex items-center gap-2 bg-gold/10 text-gold border border-gold/20 px-3 py-1 rounded-full text-sm">
                <span>Showing: {brandFilter.charAt(0).toUpperCase() + brandFilter.slice(1)}</span>
                <button
                  onClick={clearBrandFilter}
                  className="ml-1 hover:text-gold/80 transition-colors cursor-pointer"
                  aria-label={`Clear ${brandFilter} brand filter`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden="true">
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </button>
              </span>
            </motion.div>
          )}

          {/* Results count */}
          {hasActiveFilters && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center gap-3 mt-6"
            >
              <p className="text-xs text-gray-500">
                {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''}
                {searchQuery.length >= 2 && <span> for &quot;{searchQuery}&quot;</span>}
              </p>
              <button
                onClick={clearFilters}
                className="text-xs text-gold/70 hover:text-gold transition-colors"
              >
                Clear
              </button>
            </motion.div>
          )}
        </section>

        {/* Products Grid */}
        <section className="container-wide pb-16 md:pb-20">
          {hasActiveFilters ? (
            <AnimatePresence mode="popLayout">
              <motion.div
                key={`${selectedCategory}-${searchQuery}-${brandFilter}`}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ staggerChildren: FILTER_TIMING.stagger, delayChildren: 0.1 }}
                className="card-grid"
              >
                {filteredProducts.map((product, i) => (
                  <motion.div
                    key={product.id}
                    variants={gridItemVariants}
                  >
                    <ProductCard product={product} priority={i < 4} />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          ) : (
            <DiscoveryGrid products={filteredProducts} priority={4} />
          )}

          {filteredProducts.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-lg mx-auto text-center py-20"
            >
              <div className="w-16 h-16 rounded-full border border-gold/30 bg-gold/5 flex items-center justify-center mx-auto mb-6">
                <svg className="w-7 h-7 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <h2 className="text-2xl font-playfair text-black mb-3">No Results Found</h2>
              <p className="text-gray-600 text-sm mb-8">
                We couldn&apos;t find any fragrances matching your filters. Try adjusting your search or browse our full collection.
              </p>
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 text-gold text-xs uppercase tracking-[0.2em] hover:text-gold-light transition-colors cursor-pointer"
              >
                &larr; Clear All Filters
              </button>
            </motion.div>
          )}
        </section>
      </div>
    </AnimationBudgetProvider>
  );
}
