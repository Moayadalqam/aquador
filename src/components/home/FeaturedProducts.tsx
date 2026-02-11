'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';
import { SectionHeader } from '@/components/ui/Section';
import type { LegacyProduct } from '@/types';

const FALLBACK_IMAGE = '/placeholder-product.svg';

interface FeaturedProductsProps {
  products: LegacyProduct[];
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  return (
    <section className="section bg-gold-ambient">
      <div className="container-wide">
        <SectionHeader
          title="Featured Collections"
          subtitle="Discover our most beloved fragrances, crafted with the finest ingredients."
        />

        {/* Products grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
            >
              <Link href={`/products/${product.id}`} className="group block product-card">
                {/* Image */}
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={product.image || FALLBACK_IMAGE}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
                  />
                </div>

                {/* Content */}
                <div className="p-5 bg-white">
                  {product.brand && (
                    <p className="label-micro mb-2">{product.brand}</p>
                  )}
                  <h3 className="text-base font-playfair text-gray-900 group-hover:text-gold-dark transition-colors mb-3 line-clamp-1">
                    {product.name}
                  </h3>

                  {/* Price section */}
                  <div className="pt-3 border-t border-gray-100">
                    <p className="label-micro mb-1">Price</p>
                    <div className="flex items-end justify-between">
                      <span className="text-xl font-playfair text-gray-900 font-light">
                        {formatPrice(product.price)}
                      </span>
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider">
                        {product.size}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* View all link */}
        <motion.div
          className="text-center mt-12 md:mt-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <Link
            href="/shop"
            className="inline-flex items-center gap-3 text-gold hover:text-gold-light transition-colors text-xs uppercase tracking-[0.2em] group"
          >
            View All Products
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
