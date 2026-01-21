'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { getFeaturedProducts } from '@/lib/products';
import { formatPrice } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

export default function FeaturedProducts() {
  const products = getFeaturedProducts();

  return (
    <section className="py-28 bg-gold-ambient">
      <div className="w-full px-4 sm:px-8 lg:px-16 xl:px-24">
        {/* Section header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-playfair font-light text-white mb-5 tracking-wide">
            Featured Collections
          </h2>
          <div className="w-16 h-px bg-gold mx-auto mb-6" />
          <p className="text-gray-400 text-base max-w-xl mx-auto tracking-wide">
            Discover our most beloved fragrances, crafted with the finest ingredients.
          </p>
        </motion.div>

        {/* Products grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Link href={`/products/${product.id}`} className="group block">
                <div className="relative bg-white overflow-hidden transition-all duration-500 hover:-translate-y-1">
                  {/* Image - 1:1 aspect ratio */}
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-6 bg-white">
                    {product.brand && (
                      <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-2">
                        {product.brand}
                      </p>
                    )}
                    <h3 className="text-lg font-playfair text-gray-900 group-hover:text-gold-dark transition-colors mb-3 line-clamp-1">
                      {product.name}
                    </h3>

                    {/* Price section with serif font */}
                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] mb-1">Price</p>
                      <div className="flex items-end justify-between">
                        <span className="text-2xl font-playfair text-gray-900 font-light">
                          {formatPrice(product.price)}
                        </span>
                        <span className="text-xs text-gray-500 uppercase tracking-wider">
                          {product.size}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Gold border animation on hover */}
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* View all link */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
        >
          <Link
            href="/shop"
            className="inline-flex items-center gap-3 text-gold hover:text-gold-light transition-colors text-sm uppercase tracking-[0.2em] group"
          >
            View All Products
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
