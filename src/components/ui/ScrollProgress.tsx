'use client';

import { motion, useScroll, useSpring } from 'motion/react';
import { usePathname } from 'next/navigation';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * ScrollProgress - Gold scroll progress indicator
 *
 * A subtle 2px gold gradient bar fixed at the top of the viewport that fills
 * as the user scrolls down the page. Hidden on admin and checkout routes
 * where it serves no purpose.
 */
export default function ScrollProgress() {
  const reducedMotion = useReducedMotion();
  const pathname = usePathname();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  if (reducedMotion) return null;
  if (pathname.startsWith('/admin') || pathname.startsWith('/checkout')) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#D4AF37] via-[#FFD700] to-[#D4AF37] origin-left z-[100] pointer-events-none"
      style={{ scaleX }}
      aria-hidden="true"
    />
  );
}
