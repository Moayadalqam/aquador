/**
 * ProductQuickView Component
 *
 * Overlay that appears on product card hover (desktop) or tap (mobile).
 * Reveals product details progressively without leaving the grid.
 *
 * Design: Absolute-positioned overlay with dark backdrop, gold accents
 * Interaction: Hover to reveal (desktop), tap to reveal (mobile)
 * Performance: GPU-accelerated animations, respects reduced motion
 */

'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { hoverRevealVariants, staggerContainerVariants, staggerItemVariants } from '@/lib/animations/discovery-animations';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { Product } from '@/lib/supabase/types';

interface ProductQuickViewProps {
  product: Product;
  isVisible: boolean;
  onClose?: () => void;
}

/**
 * Extract fragrance notes from product tags
 * Tags like "note-rose", "note-vanilla" become "Rose", "Vanilla"
 */
function extractFragranceNotes(tags: string[] | null): string[] {
  if (!tags) return [];

  return tags
    .filter(tag => tag.startsWith('note-'))
    .map(tag => {
      const note = tag.replace('note-', '');
      return note.charAt(0).toUpperCase() + note.slice(1);
    })
    .slice(0, 5); // Limit to 5 notes for compact display
}

/**
 * ProductQuickView
 *
 * Overlay component that reveals product information on hover/tap.
 * Positioned absolutely over the product card's image area.
 */
export function ProductQuickView({ product, isVisible, onClose }: ProductQuickViewProps) {
  const reducedMotion = useReducedMotion();

  const fragranceNotes = extractFragranceNotes(product.tags);
  const hasNotes = fragranceNotes.length > 0;

  // Strip HTML tags and truncate description to first 80 characters
  const plainDescription = product.description.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
  const truncatedDescription = plainDescription.length > 80
    ? plainDescription.slice(0, 80) + '...'
    : plainDescription;

  // If reduced motion, show/hide instantly without animation
  const variants = reducedMotion
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : hoverRevealVariants;

  const containerVariants = reducedMotion
    ? { hidden: {}, visible: {} }
    : staggerContainerVariants;

  const itemVariants = reducedMotion
    ? { hidden: {}, visible: {} }
    : staggerItemVariants;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={variants}
          className="absolute inset-0 z-10 flex flex-col justify-end rounded-xl pointer-events-none overflow-hidden"
          onMouseLeave={onClose}
        >
          {/* Gradient only at bottom — image stays visible */}
          <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/75 via-black/30 to-transparent rounded-b-xl" />
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="relative z-10 p-3 md:p-4 space-y-2"
          >
            {/* Product Description */}
            <motion.p
              variants={itemVariants}
              className="text-[11px] text-gray-300 line-clamp-2 leading-relaxed"
            >
              {truncatedDescription}
            </motion.p>

            {/* Fragrance Notes */}
            {hasNotes && (
              <motion.div variants={itemVariants} className="flex flex-wrap gap-1.5">
                {fragranceNotes.map((note) => (
                  <span
                    key={note}
                    className="text-[9px] px-2 py-0.5 bg-gold-500/10 border border-gold-500/30 text-gold-400 rounded-full uppercase tracking-wider font-medium"
                  >
                    {note}
                  </span>
                ))}
              </motion.div>
            )}

            {/* Quick View Button */}
            <motion.div variants={itemVariants}>
              <Link
                href={`/products/${product.id}`}
                className="inline-block pointer-events-auto text-[10px] md:text-[11px] px-3 py-1.5 border border-gold-500/50 hover:border-gold-500 text-gold-500 hover:text-gold-400 rounded-full uppercase tracking-wider font-medium transition-all duration-200 hover:bg-gold-500/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                onClick={(e) => {
                  // Don't prevent default - allow navigation
                  e.stopPropagation();
                }}
              >
                Quick View
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
