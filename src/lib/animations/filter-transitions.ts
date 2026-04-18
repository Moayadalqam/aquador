import { Variants, Transition } from 'motion/react';

/**
 * Filter Animation Library
 *
 * Smooth, luxury-timed animations for product filter interactions.
 * Matches Phase 12 EXPO_EASE for brand consistency.
 */

// Easing from scroll-animations.ts
const EXPO_EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Timing constants for filter animations
 * Fast, responsive feel for interactive elements
 */
export const FILTER_TIMING = {
  pill: 0.25,    // Active state transitions
  grid: 0.35,    // Grid reflow duration
  stagger: 0.03, // Delay between staggered items
} as const;

/**
 * Filter pill variants for AnimatePresence
 * Snappy spring animation with luxury shadow effect
 */
export const filterVariants: Variants = {
  inactive: {
    scale: 1,
    backgroundColor: 'rgba(212, 175, 55, 0)',
    borderColor: 'rgba(212, 175, 55, 0.2)',
    boxShadow: '0 0 0 rgba(212, 175, 55, 0)',
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25,
    },
  },
  active: {
    scale: 1,
    backgroundColor: 'rgba(212, 175, 55, 1)',
    borderColor: 'rgba(212, 175, 55, 1)',
    boxShadow: '0 10px 25px rgba(212, 175, 55, 0.2)',
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25,
    },
  },
};

/**
 * Grid layout transition for product cards
 * Smooth reflow without bounce when filters change
 */
export const gridLayoutTransition: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
};

/**
 * Grid item entry variants for staggered product reveal
 * Fade + slide pattern matching existing animations
 */
export const gridItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 15,
    scale: 0.97,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: EXPO_EASE,
    },
  },
};

/**
 * Grid item exit variants for quick removal
 * Fast exit to avoid delay when switching filters
 */
export const gridExitVariants: Variants = {
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.15,
      ease: EXPO_EASE,
    },
  },
};
