/**
 * ProductCard Component
 * Reusable luxury product card for consistent presentation across the site
 * Handles both LegacyProduct (camelCase) and Supabase Product (snake_case) formats
 */

'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { formatPrice } from '@/lib/currency';
import { ProductImage } from './ProductImage';
import { ProductQuickView } from '@/components/shop/ProductQuickView';
import { hoverVariants, tapVariants } from '@/lib/animations/micro-interactions';
import { imageZoomVariants } from '@/lib/animations/discovery-animations';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { preloadProduct } from '@/lib/preload/strategy';
import type { LegacyProduct } from '@/types';
import type { Product } from '@/lib/supabase/types';

interface ProductCardProps {
  product: LegacyProduct | Product;
  priority?: boolean;
  variant?: 'default' | 'compact';
}

export function ProductCard({ product, priority = false, variant = 'default' }: ProductCardProps) {
  const reducedMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);
  const [isTapRevealed, setIsTapRevealed] = useState(false);
  const cancelPreloadRef = useRef<(() => void) | null>(null);

  // Normalize property names to handle both LegacyProduct (camelCase) and Supabase Product (snake_case)
  const inStock = 'in_stock' in product ? product.in_stock : product.inStock;
  const salePrice = 'sale_price' in product ? product.sale_price : product.salePrice;

  // Determine if product is on sale (has sale price and is in stock)
  const isOnSale = !!salePrice && !!inStock;

  // Calculate final price to display
  const displayPrice = salePrice || product.price;

  // Variant-specific styles
  const isCompact = variant === 'compact';
  const padding = isCompact ? 'p-3 md:p-4' : 'p-4 md:p-5';
  const brandSize = isCompact ? 'text-[0.5625rem]' : 'text-[clamp(0.625rem,0.5625rem+0.3125vw,0.75rem)]';
  const nameSize = isCompact ? 'text-[0.875rem] md:text-[1rem]' : 'text-[clamp(1rem,0.875rem+0.625vw,1.25rem)]';
  const priceSize = isCompact ? 'text-[1rem] md:text-[1.125rem]' : 'text-[clamp(1.125rem,1rem+0.625vw,1.5rem)]';

  // Animation variants based on reduced motion preference
  const cardHover = reducedMotion ? { scale: 1.01 } : hoverVariants.lift;
  const cardTap = reducedMotion ? { scale: 0.98 } : tapVariants.shrink;

  return (
    <motion.div
      whileHover={cardHover}
      whileTap={cardTap}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className={!inStock ? 'opacity-75' : ''}
    >
      <Link
        href={`/products/${product.id}`}
        className={`group block bg-white border border-gray-800/20 hover:border-gray-800/40 rounded-2xl ${padding} shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/15 transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white`}
        aria-label={`View ${product.name}`}
        onMouseEnter={() => {
          setIsHovered(true);
          cancelPreloadRef.current = preloadProduct(String(product.id));
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          setIsTapRevealed(false);
          cancelPreloadRef.current?.();
          cancelPreloadRef.current = null;
        }}
        onClick={(e) => {
          // Mobile tap-to-reveal pattern: first tap shows overlay, second tap navigates
          // Only apply on touch devices (check if we have touch capability)
          if (window.matchMedia('(pointer: coarse)').matches) {
            if (!isTapRevealed) {
              e.preventDefault();
              setIsTapRevealed(true);
              setIsHovered(true);
            }
            // Second tap: allow default navigation
          }
        }}
      >
      {/* Product Image */}
      <div className="relative mb-3 md:mb-4 overflow-hidden rounded-xl aspect-square">
        <motion.div
          variants={reducedMotion ? {} : imageZoomVariants}
          initial="rest"
          animate={isHovered ? 'hover' : 'rest'}
          className="h-full"
        >
          <ProductImage
            src={product.image}
            alt={product.name}
            variant="card"
            priority={priority}
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* ProductQuickView Overlay - only show for Supabase Product type */}
        {'tags' in product && (
          <ProductQuickView
            product={product as Product}
            isVisible={isHovered}
            onClose={() => {
              setIsHovered(false);
              setIsTapRevealed(false);
            }}
          />
        )}

        {/* Hover overlay with subtle backdrop blur */}
        <motion.div
          className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ backdropFilter: 'blur(1px)' }}
        />

        {/* Sale Badge */}
        {isOnSale && (
          <div className="absolute top-3 right-3 bg-red-500/90 backdrop-blur-sm text-white text-[9px] md:text-[10px] uppercase tracking-wider px-2.5 py-1 font-medium rounded-full">
            Sale
          </div>
        )}

        {/* Out of Stock Overlay */}
        {!inStock && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center rounded-xl">
            <div className="bg-white/90 backdrop-blur-sm border border-gold-500/20 text-gold-500 text-xs uppercase tracking-wider px-4 py-2 font-medium rounded-full">
              Coming Soon
            </div>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="space-y-2 min-h-[7rem]">
        {/* Brand */}
        <p className={`${brandSize} tracking-[0.15em] uppercase text-gold-500 font-medium ${!product.brand ? 'invisible' : ''}`}>
          {product.brand || '\u00A0'}
        </p>

        {/* Product Name */}
        <h3 className={`${nameSize} font-playfair font-medium tracking-tight text-black line-clamp-2 group-hover:text-gold-400 transition-colors`}>
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-baseline gap-2 pt-1">
          <span className={`${priceSize} font-playfair font-medium text-gold-600`}>
            {formatPrice(displayPrice)}
          </span>
          {isOnSale && (
            <span className="text-sm text-gray-500 line-through">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {/* Size */}
        {product.size && (
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">
            {product.size}
          </p>
        )}
      </div>
      </Link>
    </motion.div>
  );
}
