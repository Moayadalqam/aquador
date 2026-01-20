'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { products, categories } from '@/lib/products';
import { formatPrice } from '@/lib/utils';
import { useState } from 'react';

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const filteredProducts = products.filter((product) => {
    if (selectedCategory && product.category !== selectedCategory) return false;
    if (selectedType && product.productType !== selectedType) return false;
    return true;
  });

  return (
    <div className="pt-24 pb-16 bg-dark min-h-screen">
      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gold/5 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-playfair text-gradient-gold mb-6"
          >
            Our Collections
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-400 max-w-2xl mx-auto"
          >
            Discover our curated selection of premium fragrances
          </motion.p>
        </div>
      </section>

      {/* Filters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-4 justify-center"
        >
          {/* Category filters */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-6 py-2 rounded-full text-sm uppercase tracking-wider transition-all ${
                selectedCategory === null
                  ? 'bg-gold text-black'
                  : 'bg-dark-light text-gray-400 hover:text-gold border border-gold/20'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-6 py-2 rounded-full text-sm uppercase tracking-wider transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-gold text-black'
                    : 'bg-dark-light text-gray-400 hover:text-gold border border-gold/20'
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
              className={`px-4 py-1 rounded-full text-xs uppercase tracking-wider transition-all ${
                selectedType === null
                  ? 'bg-gold/20 text-gold border border-gold'
                  : 'text-gray-500 hover:text-gold border border-transparent'
              }`}
            >
              All Types
            </button>
            {['perfume', 'essence-oil', 'body-lotion'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-1 rounded-full text-xs uppercase tracking-wider transition-all ${
                  selectedType === type
                    ? 'bg-gold/20 text-gold border border-gold'
                    : 'text-gray-500 hover:text-gold border border-transparent'
                }`}
              >
                {type.replace('-', ' ')}
              </button>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={`/shop/${product.category}/${product.id}`}
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
                  {product.salePrice && (
                    <span className="absolute top-4 left-4 bg-red-500 text-white text-xs px-3 py-1 rounded-full">
                      Sale
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-playfair text-gray-900 group-hover:text-gold-dark transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                    <span className="text-xs text-gray-500 uppercase">{product.size}</span>
                  </div>
                  {product.brand && (
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                      {product.brand}
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-gold-dark">
                      {formatPrice(product.salePrice || product.price)}
                    </span>
                    {product.salePrice && (
                      <span className="text-sm text-gray-400 line-through">
                        {formatPrice(product.price)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No products found matching your criteria.</p>
          </div>
        )}
      </section>
    </div>
  );
}
