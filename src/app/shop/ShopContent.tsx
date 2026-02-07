'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Heart, ArrowRight } from 'lucide-react';
import { SearchBar } from '@/components/search';
import { PageHero } from '@/components/ui/Section';
import { VALENTINE_GIFT_SET } from '@/lib/gift-sets';
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

      {/* Featured Gift Set */}
      <section className="container-wide pb-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#1a0a0a] to-dark border border-gold/10"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_right,rgba(212,175,55,0.06),transparent_70%)]" />
          <Link href="/gift-set/valentine" className="group flex flex-col sm:flex-row items-center gap-6 p-6 sm:p-8 relative z-10">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={VALENTINE_GIFT_SET.image}
                alt={VALENTINE_GIFT_SET.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="112px"
              />
              <div className="absolute top-1.5 left-1.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-black/60 backdrop-blur-sm border border-gold/30 rounded-full text-gold text-[8px] uppercase tracking-[0.15em]">
                  <Heart className="w-2 h-2 fill-gold" />
                  {VALENTINE_GIFT_SET.badge}
                </span>
              </div>
            </div>
            <div className="text-center sm:text-left flex-1">
              <p className="text-gold/60 text-[10px] uppercase tracking-[0.2em] mb-1">{VALENTINE_GIFT_SET.badge}</p>
              <h3 className="text-lg sm:text-xl font-playfair text-white mb-1 group-hover:text-gold transition-colors">
                {VALENTINE_GIFT_SET.name}
              </h3>
              <p className="text-gray-400 text-xs leading-relaxed mb-2 max-w-md">
                {VALENTINE_GIFT_SET.shortDescription}
              </p>
              <span className="text-gold font-playfair text-lg">{formatPrice(VALENTINE_GIFT_SET.price)}</span>
            </div>
            <div className="flex-shrink-0">
              <span className="inline-flex items-center gap-2 text-gold text-xs font-medium group-hover:gap-3 transition-all">
                Shop Now <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </Link>
        </motion.div>
      </section>

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
          className="flex flex-col items-center gap-5"
        >
          {/* Category filters */}
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`btn-filter ${selectedCategory === null ? 'btn-filter-active' : 'btn-filter-inactive'}`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`btn-filter ${selectedCategory === cat.id ? 'btn-filter-active' : 'btn-filter-inactive'}`}
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.02, 0.2) }}
            >
              <Link href={`/products/${product.id}`} className="group block product-card">
                {/* Image */}
                <div className="relative aspect-[3/4] overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                  {product.sale_price && (
                    <span className="absolute top-3 left-3 bg-gold text-black text-[9px] uppercase tracking-wider px-2 py-1 font-medium">
                      Sale
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

                  {/* Price */}
                  <div className="pt-2 border-t border-gray-100">
                    <div className="flex items-baseline justify-between">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base font-playfair text-gray-900">
                          {formatPrice(product.sale_price || product.price)}
                        </span>
                        {product.sale_price && (
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
        </div>

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
