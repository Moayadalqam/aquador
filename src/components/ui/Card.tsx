'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/utils';
import type { ReactNode } from 'react';

interface ProductCardProps {
  id: string;
  name: string;
  brand?: string;
  price: number;
  salePrice?: number;
  image: string;
  size?: string;
  className?: string;
  aspectRatio?: 'square' | 'portrait';
  index?: number;
}

export function ProductCard({
  id,
  name,
  brand,
  price,
  salePrice,
  image,
  size,
  className,
  aspectRatio = 'square',
  index = 0,
}: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.3) }}
    >
      <Link
        href={`/products/${id}`}
        className={cn('group block product-card', className)}
      >
        {/* Image */}
        <div
          className={cn(
            'relative overflow-hidden',
            aspectRatio === 'square' ? 'aspect-square' : 'aspect-[4/5]'
          )}
        >
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          {salePrice && salePrice < price && (
            <span className="absolute top-4 left-4 bg-gold text-black text-[10px] uppercase tracking-wider px-3 py-1.5 font-medium">
              Sale
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-5 bg-white">
          {brand && <p className="label-micro mb-2">{brand}</p>}
          <h3 className="text-base font-playfair text-gray-900 group-hover:text-gold-dark transition-colors mb-3 line-clamp-1">
            {name}
          </h3>

          {/* Price section */}
          <div className="pt-3 border-t border-gray-100">
            <p className="label-micro mb-1">Price</p>
            <div className="flex items-end justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-playfair text-gray-900 font-light">
                  {formatPrice(salePrice || price)}
                </span>
                {salePrice && salePrice < price && (
                  <span className="text-sm text-gray-400 line-through">
                    {formatPrice(price)}
                  </span>
                )}
              </div>
              {size && (
                <span className="text-[10px] text-gray-500 uppercase tracking-wider">
                  {size}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({ children, className, hover = false }: GlassCardProps) {
  return (
    <div
      className={cn(
        hover ? 'glass-card-hover' : 'glass-card',
        className
      )}
    >
      {children}
    </div>
  );
}

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  index?: number;
}

export function FeatureCard({ icon, title, description, index = 0 }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="text-center p-6"
    >
      <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-xl font-playfair text-white mb-3">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </motion.div>
  );
}

interface InfoCardProps {
  icon: ReactNode;
  title: string;
  details: string[];
  index?: number;
}

export function InfoCard({ icon, title, details, index = 0 }: InfoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 + index * 0.1 }}
      className="glass-card p-6"
    >
      <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-white font-semibold mb-2">{title}</h3>
      {details.map((detail, i) => (
        <p key={i} className="text-gray-400 text-sm">
          {detail}
        </p>
      ))}
    </motion.div>
  );
}
