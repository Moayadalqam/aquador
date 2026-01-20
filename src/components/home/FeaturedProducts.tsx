'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { getFeaturedProducts } from '@/lib/products';
import { formatPrice } from '@/lib/utils';

export default function FeaturedProducts() {
  const products = getFeaturedProducts();

  return (
    <section className="py-24 bg-gradient-to-b from-dark-light to-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-playfair font-light text-white mb-4">
            Featured Collections
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Discover our most beloved fragrances, crafted with the finest ingredients from around the world.
          </p>
        </motion.div>

        {/* Products grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Link href={`/shop/${product.category}/${product.id}`} className="group block">
                <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                  {/* Image */}
                  <div className="relative h-72 overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-playfair text-gray-900 group-hover:text-gold-dark transition-colors">
                        {product.name}
                      </h3>
                      {product.brand && (
                        <span className="text-xs text-gray-500 uppercase tracking-wider">
                          {product.brand}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-gold-dark">
                        {formatPrice(product.price)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {product.size}
                      </span>
                    </div>
                  </div>

                  {/* Hover CTA */}
                  <motion.div
                    className="absolute bottom-6 left-6 right-6 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500"
                  >
                    <span className="text-gold-dark text-sm font-medium">
                      View Details →
                    </span>
                  </motion.div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* View all link */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
        >
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-gold hover:text-gold-light transition-colors text-lg"
          >
            View All Products
            <span className="text-xl">→</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
