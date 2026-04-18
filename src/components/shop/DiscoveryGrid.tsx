/**
 * DiscoveryGrid Component
 *
 * Product grid with progressive disclosure and staggered entrance animations.
 * Products load progressively as the user scrolls into the viewport.
 *
 * Performance: IntersectionObserver with 200px rootMargin reveals rows of 4
 * on scroll. First 8 products visible immediately.
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ProductCard } from '@/components/ui/ProductCard';
import { staggerItemVariants } from '@/lib/animations/discovery-animations';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { Product } from '@/lib/supabase/types';

export interface DiscoveryGridProps {
  products: Product[];
  /** Number of cards to load with priority (default: 4) */
  priority?: number;
  className?: string;
}

export function DiscoveryGrid({ products, priority = 4, className = '' }: DiscoveryGridProps) {
  const reducedMotion = useReducedMotion();
  // Show first 8 products immediately, progressively reveal more
  const [visibleCount, setVisibleCount] = useState(8);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (reducedMotion || visibleCount >= products.length) {
      if (visibleCount < products.length) {
        setVisibleCount(products.length);
      }
      return;
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && visibleCount < products.length) {
            setVisibleCount((prev) => Math.min(prev + 4, products.length));
          }
        });
      },
      {
        rootMargin: '200px',
        threshold: 0,
      }
    );

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [visibleCount, products.length, reducedMotion]);

  const itemVariants = reducedMotion ? {} : staggerItemVariants;

  return (
    <div className={className}>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
        {products.slice(0, visibleCount).map((product, index) => (
          <motion.div
            key={product.id}
            variants={itemVariants}
            initial={index >= 8 ? 'hidden' : 'visible'}
            animate="visible"
            style={!reducedMotion && index >= 8 ? { animationDelay: `${(index % 4) * 60}ms` } : undefined}
          >
            <ProductCard
              product={product}
              priority={index < priority}
            />
          </motion.div>
        ))}
      </div>

      {/* Sentinel element for IntersectionObserver */}
      {visibleCount < products.length && (
        <div ref={sentinelRef} className="h-px w-full" aria-hidden="true" />
      )}
    </div>
  );
}
