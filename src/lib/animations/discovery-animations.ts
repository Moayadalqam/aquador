/**
 * Discovery Animation Library
 *
 * Luxury animation variants for progressive disclosure and hover reveals.
 * Optimized for immersive product browsing with smooth, intentional timing.
 *
 * Design Philosophy:
 * - Hover reveals should feel like peeling back layers, not sudden jumps
 * - Progressive disclosure creates anticipation and guides attention
 * - Image zoom is subtle (1.06x) for luxury feel vs aggressive scaling
 *
 * Performance:
 * - All animations use GPU-accelerated properties (transform, opacity, filter)
 * - Timing optimized for 60fps smooth scrolling
 * - Reduced motion support for accessibility
 *
 * @module discovery-animations
 */

import type { Variants } from 'motion/react';

/**
 * Timing constants for discovery interactions
 *
 * Hover reveals are slower (350ms) than standard micro-interactions (200ms)
 * to create a more luxurious, intentional feel.
 */
export const DISCOVERY_TIMING = {
  /** Delay before hover reveal starts (prevents accidental triggers) */
  hoverDelay: 0.15,
  /** Duration of reveal animation */
  revealDuration: 0.35,
  /** Duration of exit animation (faster exit feels more responsive) */
  exitDuration: 0.2,
} as const;

/**
 * Luxury easing curve
 * Smooth acceleration and deceleration for refined feel
 */
const LUXURY_EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Hover Reveal Variants
 *
 * For overlays that appear on hover with smooth fade + slight upward motion.
 * Includes subtle blur on hidden state for depth.
 *
 * @example
 * ```tsx
 * <AnimatePresence>
 *   {isHovered && (
 *     <motion.div
 *       initial="hidden"
 *       animate="visible"
 *       exit="exit"
 *       variants={hoverRevealVariants}
 *     >
 *       Quick View Content
 *     </motion.div>
 *   )}
 * </AnimatePresence>
 * ```
 */
export const hoverRevealVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 8,
    filter: 'blur(4px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: DISCOVERY_TIMING.revealDuration,
      ease: LUXURY_EASE,
    },
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: {
      duration: DISCOVERY_TIMING.exitDuration,
    },
  },
};

/**
 * Progressive Disclosure Variants
 *
 * For content that expands/collapses with smooth height animation.
 * Used for revealing product rows on scroll.
 *
 * @example
 * ```tsx
 * <motion.div
 *   initial="collapsed"
 *   animate="expanded"
 *   variants={progressiveDisclosureVariants}
 * >
 *   Row of product cards
 * </motion.div>
 * ```
 */
export const progressiveDisclosureVariants: Variants = {
  collapsed: {
    height: 0,
    opacity: 0,
  },
  expanded: {
    height: 'auto',
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: LUXURY_EASE,
    },
  },
};

/**
 * Image Zoom Variants
 *
 * Subtle zoom (1.06x) for luxury feel on product images.
 * Slower timing (700ms) creates intentional, high-end experience.
 *
 * @example
 * ```tsx
 * <motion.div
 *   variants={imageZoomVariants}
 *   initial="rest"
 *   whileHover="hover"
 * >
 *   <ProductImage />
 * </motion.div>
 * ```
 */
export const imageZoomVariants: Variants = {
  rest: {
    scale: 1,
  },
  hover: {
    scale: 1.06,
    transition: {
      duration: 0.7,
      ease: LUXURY_EASE,
    },
  },
};

/**
 * Stagger Configuration for Progressive Reveals
 *
 * Used when revealing multiple elements (like product cards in a row)
 * with cascading timing.
 *
 * @example
 * ```tsx
 * <motion.div
 *   initial="hidden"
 *   animate="visible"
 *   variants={staggerContainerVariants}
 * >
 *   {items.map(item => (
 *     <motion.div key={item.id} variants={staggerItemVariants}>
 *       {item}
 *     </motion.div>
 *   ))}
 * </motion.div>
 * ```
 */
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const staggerItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: LUXURY_EASE,
    },
  },
};

/**
 * Reduced Motion Fallbacks
 *
 * Simplified variants for users with motion sensitivity.
 * Maintains functionality while removing complex animations.
 */
export const reducedMotionDiscoveryVariants = {
  /** Instant show without animation */
  show: {
    opacity: 1,
  },
  /** Instant hide without animation */
  hide: {
    opacity: 0,
  },
} as const;
