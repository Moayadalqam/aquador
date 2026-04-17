'use client';

import { motion, useScroll, useSpring } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * ScrollProgress - Gold scroll progress indicator
 *
 * A subtle 2px gold gradient bar fixed at the top of the viewport that fills
 * as the user scrolls down the page. Purely decorative visual enhancement.
 *
 * Features:
 * - Spring-based smoothing for fluid feel
 * - Respects prefers-reduced-motion (hidden when active)
 * - Pointer-events disabled so it never blocks interaction
 * - z-100 to sit above all content but below modals
 */
export default function ScrollProgress() {
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Don't render for users who prefer reduced motion
  if (reducedMotion) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#D4AF37] via-[#FFD700] to-[#D4AF37] origin-left z-[100] pointer-events-none"
      style={{ scaleX }}
      aria-hidden="true"
    />
  );
}
