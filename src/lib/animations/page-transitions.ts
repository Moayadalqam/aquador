import type { Variants } from 'motion/react'

/**
 * Page Transition Animation System
 *
 * Optimized for Next.js App Router with focus on perceived performance.
 * Uses opacity-only transitions to prevent layout shift during navigation.
 */

/**
 * Main page transition with smooth fade
 * - Opacity-only (no y-axis movement to prevent layout shift)
 * - 300ms enter, 200ms exit for optimal perceived performance
 * - Custom cubic-bezier easing matching globals.css --ease-out-expo
 */
export const pageTransitionVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeIn' }
  }
}

/**
 * Reduced motion variant for accessibility
 * - Faster timing (100ms enter, 50ms exit)
 * - Respects user's prefers-reduced-motion preference
 */
export const pageTransitionReducedMotion: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.1 } },
  exit: { opacity: 0, transition: { duration: 0.05 } }
}

/**
 * Active navigation indicator animation
 * - Smooth underline/indicator that follows active link
 * - Use with Framer Motion layoutId for shared layout animations
 */
export const navIndicatorVariants: Variants = {
  initial: { scaleX: 0, opacity: 0 },
  animate: {
    scaleX: 1,
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  exit: {
    scaleX: 0,
    opacity: 0,
    transition: { duration: 0.2 }
  }
}

/**
 * Navigation link hover state
 * - Subtle lift effect on hover
 * - Enhances tactile feedback for navigation
 */
export const navLinkVariants: Variants = {
  idle: { y: 0 },
  hover: {
    y: -2,
    transition: { duration: 0.2, ease: 'easeOut' }
  }
}

/**
 * Navigation configuration for shared settings
 */
export const navTransitionConfig = {
  /**
   * Duration for active indicator movement between links
   */
  indicatorDuration: 0.3,

  /**
   * Duration for link hover effects
   */
  hoverDuration: 0.2,

  /**
   * Easing function for smooth transitions
   */
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number]
} as const
