'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { products, categories } from '@/lib/products';
import { searchProducts } from '@/lib/product-service';
import { formatPrice } from '@/lib/utils';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { SearchBar } from '@/components/search';

function ShopContent() {
  const searchParams = useSearchParams();
  const urlSearchQuery = searchParams.get('search') || '';

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(urlSearchQuery);

  // Sync with URL search param
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

  // Filter products based on search query, category, and type
  const filteredProducts = (() => {
    let result = products;

    // Apply search filter first
    if (searchQuery.trim().length >= 2) {
      result = searchProducts(searchQuery);
    }

    // Then apply category and type filters
    return result.filter((product) => {
      if (selectedCategory && product.category !== selectedCategory) return false;
      if (selectedType && product.productType !== selectedType) return false;
      return true;
    });
  })();

  const hasActiveFilters = selectedCategory || selectedType || searchQuery.length >= 2;

  return (
    <div className="pt-28 pb-20 bg-gold-ambient min-h-screen">
      {/* Hero */}
      <section className="relative py-16 overflow-hidden">
        <div className="w-full px-4 sm:px-8 lg:px-16 xl:px-24 text-center relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-playfair text-white mb-4 tracking-wide"
          >
            Our Collections
          </motion.h1>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 64 }}
            transition={{ delay: 0.2 }}
            className="h-px bg-gold mx-auto mb-5"
          />
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-base text-gray-400 max-w-xl mx-auto tracking-wide"
          >
            Discover our curated selection of premium fragrances
          </motion.p>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="w-full px-4 sm:px-8 lg:px-16 xl:px-24 mb-16">
        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="max-w-xl mx-auto mb-8"
        >
          <SearchBar
            variant="shop"
            placeholder="Search by name, brand, or description..."
            onSearch={handleSearch}
          />
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-4 justify-center"
        >
          {/* Category filters */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-6 py-2.5 text-sm uppercase tracking-[0.15em] transition-all duration-300 ${
                selectedCategory === null
                  ? 'bg-gold text-black'
                  : 'bg-transparent text-gray-400 hover:text-gold border border-gold/30 hover:border-gold'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-6 py-2.5 text-sm uppercase tracking-[0.15em] transition-all duration-300 ${
                  selectedCategory === cat.id
                    ? 'bg-gold text-black'
                    : 'bg-transparent text-gray-400 hover:text-gold border border-gold/30 hover:border-gold'
                }`}
              >
                {cat.name.replace("'s Collection", '')}
              </button>
            ))}
          </div>

          {/* Type filters */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedType(null)}
              className={`px-4 py-1.5 text-xs uppercase tracking-[0.15em] transition-all duration-300 ${
                selectedType === null
                  ? 'text-gold border-b-2 border-gold'
                  : 'text-gray-500 hover:text-gold border-b-2 border-transparent'
              }`}
            >
              All Types
            </button>
            {['perfume', 'essence-oil', 'body-lotion'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-1.5 text-xs uppercase tracking-[0.15em] transition-all duration-300 ${
                  selectedType === type
                    ? 'text-gold border-b-2 border-gold'
                    : 'text-gray-500 hover:text-gold border-b-2 border-transparent'
                }`}
              >
                {type.replace('-', ' ')}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Active filters summary */}
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-4 mt-6"
          >
            <p className="text-sm text-gray-400">
              Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
              {searchQuery.length >= 2 && (
                <span> for &quot;{searchQuery}&quot;</span>
              )}
            </p>
            <button
              onClick={clearFilters}
              className="text-sm text-gold hover:text-gold/80 transition-colors"
            >
              Clear all filters
            </button>
          </motion.div>
        )}
      </section>

      {/* Products Grid */}
      <section className="w-full px-4 sm:px-8 lg:px-16 xl:px-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.03, 0.3) }}
            >
              <Link
                href={`/products/${product.id}`}
                className="group block bg-white overflow-hidden transition-all duration-500 hover:-translate-y-1"
              >
                {/* Image - 4:5 aspect ratio for better viewport fit */}
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  {product.salePrice && (
                    <span className="absolute top-4 left-4 bg-gold text-black text-[10px] uppercase tracking-wider px-3 py-1.5 font-medium">
                      Sale
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 bg-white">
                  {product.brand && (
                    <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-2">
                      {product.brand}
                    </p>
                  )}
                  <h3 className="text-base font-playfair text-gray-900 group-hover:text-gold-dark transition-colors mb-3 line-clamp-1">
                    {product.name}
                  </h3>

                  {/* Price section */}
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] mb-1">Price</p>
                    <div className="flex items-end justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-playfair text-gray-900 font-light">
                          {formatPrice(product.salePrice || product.price)}
                        </span>
                        {product.salePrice && (
                          <span className="text-sm text-gray-400 line-through">
                            {formatPrice(product.price)}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider">
                        {product.size}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Gold border animation on hover */}
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </Link>
            </motion.div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-24">
            <p className="text-gray-400 text-base tracking-wide mb-4">
              No products found matching your criteria.
            </p>
            <button
              onClick={clearFilters}
              className="text-gold hover:text-gold/80 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="pt-28 pb-20 bg-black min-h-screen" />}>
      <ShopContent />
    </Suspense>
  );
}
