'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/currency';
import type { LegacyProduct } from '@/types';

interface RelatedProductsProps {
  products: LegacyProduct[];
}

export default function RelatedProducts({ products }: RelatedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section className="mt-20 pt-12 border-t border-gold/10">
      <h2 className="text-2xl md:text-3xl font-playfair text-white mb-8 text-center">
        You May Also Like
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link
              href={`/products/${product.id}`}
              className="group block bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1"
            >
              {/* Image */}
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>

              {/* Content */}
              <div className="p-4">
                {product.brand && (
                  <p className="text-[10px] text-gray-500 uppercase tracking-[0.15em] mb-1">
                    {product.brand}
                  </p>
                )}
                <h3 className="text-sm font-playfair text-gray-900 group-hover:text-gold-dark transition-colors line-clamp-2 mb-2">
                  {product.name}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-base font-playfair text-gray-900">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-xs text-gray-500">{product.size}</span>
                </div>
              </div>

              {/* Gold border animation */}
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
