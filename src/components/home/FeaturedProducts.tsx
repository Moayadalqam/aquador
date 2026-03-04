'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';
import { SectionHeader } from '@/components/ui/Section';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { fadeInUp } from '@/lib/animations/scroll-animations';
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
        <AnimatedSection variant="stagger" staggerDelay={0.1}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
            {products.map((product) => (
              <motion.div
                key={product.id}
                variants={fadeInUp}
              >
                <Link href={`/products/${product.id}`} className="group block product-card">
                {/* Image */}
                <div className="relative aspect-[3/4] overflow-hidden">
                  <Image
                    src={product.image || FALLBACK_IMAGE}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 33vw"
                    onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
                  />
                </div>

                {/* Content */}
                <div className="p-4 bg-white">
                  {product.brand && (
                    <p className="label-micro mb-1.5 truncate">{product.brand}</p>
                  )}
                  <h3 className="text-sm font-playfair text-gray-900 group-hover:text-gold-dark transition-colors mb-2 line-clamp-1">
                    {product.name}
                  </h3>

                  {/* Price section */}
                  <div className="pt-2 border-t border-gray-100">
                    <div className="flex items-baseline justify-between">
                      <span className="text-base font-playfair text-gray-900">
                        {formatPrice(product.price)}
                      </span>
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
        </AnimatedSection>

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
