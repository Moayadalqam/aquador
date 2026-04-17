'use client'

import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import {
  pageTransitionVariants,
  pageTransitionReducedMotion
} from '@/lib/animations/page-transitions'
import { trackCinematicEngagement } from '@/lib/analytics/performance-monitor'

/**
 * PageTransition Provider
 *
 * Wraps page content with smooth fade transitions on route changes.
 * Respects user's reduced motion preferences for accessibility.
 *
 * Implementation notes:
 * - Uses usePathname() to detect route changes
 * - AnimatePresence with mode="popLayout" allows new page to render immediately while old page exits
 * - initial={false} prevents animation on first load (faster perceived performance)
 * - Detects prefers-reduced-motion and switches to faster variants
 *
 * @example
 * ```tsx
 * <PageTransition>
 *   {children}
 * </PageTransition>
 * ```
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const transitionStartRef = useRef<number>(0)

  // Detect reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mq.matches)

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Select appropriate transition variant based on user preference
  const variants = prefersReducedMotion
    ? pageTransitionReducedMotion
    : pageTransitionVariants

  const handleAnimationStart = () => {
    transitionStartRef.current = performance.now()
    trackCinematicEngagement('page_transition', 'view', 0)
  }

  const handleAnimationComplete = () => {
    const duration = performance.now() - transitionStartRef.current
    trackCinematicEngagement('page_transition', 'complete', duration)
  }

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.div
        key={pathname}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        onAnimationStart={handleAnimationStart}
        onAnimationComplete={handleAnimationComplete}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
