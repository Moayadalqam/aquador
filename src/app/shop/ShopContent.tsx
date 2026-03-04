'use client';

import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { SearchBar } from '@/components/search';
import { PageHero } from '@/components/ui/Section';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { ProductCard } from '@/components/ui/ProductCard';
import { fadeInUp } from '@/lib/animations/scroll-animations';
import type { Product } from '@/lib/supabase/types';
import type { Category } from '@/types';

interface ShopContentProps {
  products: Product[];
  categories: Category[];
}

export default function ShopContent({ products, categories }: ShopContentProps) {
  const searchParams = useSearchParams();
  const urlSearchQuery = searchParams.get('search') || '';

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(urlSearchQuery);

  useEffect(() => {
    setSearchQuery(urlSearchQuery);
  }, [urlSearchQuery]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedCategory(null);
    setSelectedType(null);
    setSearchQuery('');
  }, []);

  const filteredProducts = useMemo(() => {
    let result = products;

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
      if (selectedType && product.product_type !== selectedType) return false;
      return true;
    });
  }, [products, searchQuery, selectedCategory, selectedType]);

  const hasActiveFilters = selectedCategory || selectedType || searchQuery.length >= 2;

  return (
    <div className="min-h-screen bg-gold-ambient">
      {/* Hero */}
      <PageHero
        title="Our Collections"
        subtitle="Discover our curated selection of premium fragrances"
        titleVariant="white"
      />

      {/* Search and Filters */}
      <section className="container-wide pb-10">
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
          {/* Category filters */}
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2.5 min-h-[44px] rounded-lg text-sm font-medium tracking-wide uppercase transition-all ${
                selectedCategory === null
                  ? 'bg-gold-500 text-dark shadow-lg shadow-gold-500/20'
                  : 'bg-dark-lighter border border-gold-500/20 text-gray-300 hover:border-gold-500/40 hover:text-white'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2.5 min-h-[44px] rounded-lg text-sm font-medium tracking-wide uppercase transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-gold-500 text-dark shadow-lg shadow-gold-500/20'
                    : 'bg-dark-lighter border border-gold-500/20 text-gray-300 hover:border-gold-500/40 hover:text-white'
                }`}
              >
                {cat.name.replace("'s Collection", '')}
              </button>
            ))}
          </div>

          {/* Type filters */}
          <div className="flex flex-wrap justify-center gap-1">
            {['All Types', 'perfume', 'essence-oil', 'body-lotion'].map((type) => {
              const isAll = type === 'All Types';
              const isActive = isAll ? selectedType === null : selectedType === type;
              return (
                <button
                  key={type}
                  onClick={() => setSelectedType(isAll ? null : type)}
                  className={`px-3 py-1 text-[10px] uppercase tracking-[0.12em] transition-all ${
                    isActive
                      ? 'text-gold'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {type.replace('-', ' ')}
                </button>
              );
            })}
          </div>
        </motion.div>

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
      <section className="container-wide pb-20">
        <AnimatedSection variant="stagger" staggerDelay={0.1} key={filteredProducts.length}>
          <div className="card-grid">
            {filteredProducts.map((product, i) => (
              <motion.div
                key={product.id}
                variants={fadeInUp}
              >
                <ProductCard product={product} priority={i < 4} />
              </motion.div>
            ))}
          </div>
        </AnimatedSection>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-sm mb-4">
              No products found.
            </p>
            <button
              onClick={clearFilters}
              className="text-gold text-sm hover:text-gold/80 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
