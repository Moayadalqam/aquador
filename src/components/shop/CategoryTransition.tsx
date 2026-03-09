'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

const EXPO_EASE = [0.22, 1, 0.36, 1] as const;

interface CategoryTransitionProps {
  categorySlug: string;
  children: ReactNode;
}

/**
 * CategoryTransition Component
 *
 * Wrapper for category page transitions with AnimatePresence.
 * Provides smooth fade + slide animation when navigating between categories.
 *
 * Entry: fade in + slide up
 * Exit: fade out + slide up (fast)
 */
export function CategoryTransition({ categorySlug, children }: CategoryTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={categorySlug}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{
          duration: 0.4,
          ease: EXPO_EASE,
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
