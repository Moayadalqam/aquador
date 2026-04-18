/**
 * Cinematic Animation Library
 *
 * Provides dramatic, high-impact animations for hero sections, page transitions,
 * and progressive content reveals. All variants support performance-based simplification
 * and respect user's reduced motion preferences.
 *
 * @module animations/cinematic
 */

import type { Variants, Transition } from 'motion/react';
import { trackCinematicEngagement } from '@/lib/analytics/performance-monitor';

/**
 * Configuration constants for cinematic effects
 */
export const CINEMATIC_CONFIG = {
  /** Duration for section transitions (longer than page transitions for drama) */
  sectionTransitionDuration: 0.8,
  /** Stagger delay between sequentially revealed elements */
  revealDelay: 0.1,
  /** Cinematic easing curve (expo ease) for smooth, dramatic motion */
  cinematicEasing: [0.16, 1, 0.3, 1] as const,
  /** Mobile-optimized durations (faster for better perceived performance) */
  mobileDuration: 0.5,
  /** Threshold for reducing motion complexity */
  reducedMotionThreshold: typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false,
} as const;

/**
 * Base transition factory
 */
const createTransition = (
  duration: number,
  delay = 0,
  ease: number[] | readonly [0.16, 1, 0.3, 1] = CINEMATIC_CONFIG.cinematicEasing
): Transition => ({
  duration,
  delay,
  ease: ease as [number, number, number, number],
});

/**
 * Cinematic variants for hero entrances and major page sections
 */
export const cinematicVariants: Record<string, Variants> = {
  /**
   * Dramatic hero entrance with fade + scale
   * Use for: Hero sections, landing pages, major reveals
   */
  heroEntry: {
    initial: {
      opacity: 0,
      scale: 0.95,
    },
    animate: {
      opacity: 1,
      scale: 1,
      transition: createTransition(1.2, 0),
    },
    exit: {
      opacity: 0,
      scale: 0.98,
      transition: createTransition(0.6),
    },
  },

  /**
   * Section fade-in with subtle upward movement
   * Use for: Content sections, feature blocks
   */
  sectionFade: {
    initial: {
      opacity: 0,
      y: 40,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: createTransition(CINEMATIC_CONFIG.sectionTransitionDuration, 0.1),
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: createTransition(0.5),
    },
  },

  /**
   * Curtain reveal effect using clip-path
   * Use for: Dramatic product reveals, gallery openings
   */
  curtainReveal: {
    initial: {
      clipPath: 'inset(0 100% 0 0)',
    },
    animate: {
      clipPath: 'inset(0 0% 0 0)',
      transition: createTransition(1.0, 0.2),
    },
    exit: {
      clipPath: 'inset(0 0 0 100%)',
      transition: createTransition(0.8),
    },
  },

  /**
   * Zoom fade for emphasis
   * Use for: Product spotlights, CTAs, important announcements
   */
  zoomFade: {
    initial: {
      opacity: 0,
      scale: 0.9,
    },
    animate: {
      opacity: 1,
      scale: 1,
      transition: createTransition(0.7, 0),
    },
    exit: {
      opacity: 0,
      scale: 1.05,
      transition: createTransition(0.5),
    },
  },

  /**
   * Simplified fade-only variant for reduced motion / low performance
   * Use when: prefers-reduced-motion is enabled or performance is poor
   */
  simpleFade: {
    initial: {
      opacity: 0,
    },
    animate: {
      opacity: 1,
      transition: createTransition(0.4),
    },
    exit: {
      opacity: 0,
      transition: createTransition(0.3),
    },
  },
};

/**
 * Progressive reveal variants for sequential content disclosure
 */
export const revealVariants: Record<string, Variants> = {
  /**
   * Staggered fade-in for lists and grids
   * Use for: Product grids, feature lists, card collections
   */
  fadeInSequence: {
    initial: {
      opacity: 0,
      y: 20,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  },

  /**
   * Sequential slide-in from left
   * Use for: Feature lists, step-by-step guides
   */
  slideInFromLeft: {
    initial: {
      opacity: 0,
      x: -30,
    },
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  },

  /**
   * Pop-in effect for icon grids
   * Use for: Icon sets, benefit highlights, trust badges
   */
  scaleInSequence: {
    initial: {
      opacity: 0,
      scale: 0.8,
    },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.15,
      },
    },
  },
};

/**
 * Factory function for creating custom cinematic transitions
 *
 * @param type - Type of cinematic effect
 * @param options - Custom transition options
 * @returns Complete cinematic variant object
 *
 * @example
 * ```tsx
 * const customReveal = createCinematicTransition('fade-scale', {
 *   duration: 1.5,
 *   delay: 0.3,
 * });
 * ```
 */
export function createCinematicTransition(
  type: 'fade' | 'fade-scale' | 'fade-slide' | 'clip-path',
  options: {
    duration?: number;
    delay?: number;
    scale?: number;
    y?: number;
    ease?: number[];
  } = {}
): Variants {
  const {
    duration = CINEMATIC_CONFIG.sectionTransitionDuration,
    delay = 0,
    scale = 0.95,
    y = 40,
    ease = CINEMATIC_CONFIG.cinematicEasing,
  } = options;

  const baseVariants: Record<typeof type, Variants> = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1, transition: createTransition(duration, delay, ease) },
      exit: { opacity: 0, transition: createTransition(duration * 0.6) },
    },
    'fade-scale': {
      initial: { opacity: 0, scale },
      animate: { opacity: 1, scale: 1, transition: createTransition(duration, delay, ease) },
      exit: { opacity: 0, scale: 1.02, transition: createTransition(duration * 0.6) },
    },
    'fade-slide': {
      initial: { opacity: 0, y },
      animate: { opacity: 1, y: 0, transition: createTransition(duration, delay, ease) },
      exit: { opacity: 0, y: -20, transition: createTransition(duration * 0.6) },
    },
    'clip-path': {
      initial: { clipPath: 'inset(0 100% 0 0)' },
      animate: { clipPath: 'inset(0 0% 0 0)', transition: createTransition(duration, delay, ease) },
      exit: { clipPath: 'inset(0 0 0 100%)', transition: createTransition(duration * 0.8) },
    },
  };

  return baseVariants[type];
}

/**
 * Calculate optimal stagger delay based on number of items
 * Prevents overly long sequences by reducing delay for larger sets
 *
 * @param itemCount - Number of items in the sequence
 * @returns Optimal stagger delay in seconds
 *
 * @example
 * ```tsx
 * const delay = getOptimalStaggerDelay(20); // 0.05s for 20 items
 * <motion.div transition={{ staggerChildren: delay }}>
 * ```
 */
export function getOptimalStaggerDelay(itemCount: number): number {
  if (itemCount <= 5) return 0.15;
  if (itemCount <= 10) return 0.1;
  if (itemCount <= 20) return 0.05;
  return 0.03; // Very short for large sets
}

/**
 * Mobile-optimized variants (faster durations)
 * Automatically applied on mobile devices for better perceived performance
 */
export const mobileVariants: Record<string, Variants> = {
  heroEntry: {
    initial: cinematicVariants.heroEntry.initial,
    animate: {
      ...cinematicVariants.heroEntry.animate,
      transition: createTransition(CINEMATIC_CONFIG.mobileDuration),
    },
  },
  sectionFade: {
    initial: cinematicVariants.sectionFade.initial,
    animate: {
      ...cinematicVariants.sectionFade.animate,
      transition: createTransition(CINEMATIC_CONFIG.mobileDuration),
    },
  },
};

// ---------------------------------------------------------------------------
// Tracked variant helper
// ---------------------------------------------------------------------------

/**
 * Wrap a Framer Motion Variants object with engagement tracking callbacks.
 *
 * The returned object is identical to the source variants but includes an
 * `onAnimationStart` / `onAnimationComplete` pair wired to Vercel Analytics
 * via trackCinematicEngagement. Components can spread this onto a motion
 * element alongside the base variants.
 *
 * @param name - Human-readable name used as the elementType in analytics
 * @param variants - Existing Framer Motion Variants to wrap
 * @returns Object with the original variants plus tracking callback props
 *
 * @example
 * ```tsx
 * const tracked = createTrackedCinematicVariant('parallax_section', cinematicVariants.sectionFade);
 *
 * <motion.section
 *   variants={tracked.variants}
 *   initial="initial"
 *   animate="animate"
 *   onAnimationStart={tracked.onAnimationStart}
 *   onAnimationComplete={tracked.onAnimationComplete}
 * />
 * ```
 */
export function createTrackedCinematicVariant(
  name: Parameters<typeof trackCinematicEngagement>[0],
  variants: Variants
): {
  variants: Variants;
  onAnimationStart: () => void;
  onAnimationComplete: () => void;
} {
  let startTime = 0;

  return {
    variants,
    onAnimationStart: () => {
      startTime = typeof performance !== 'undefined' ? performance.now() : 0;
      trackCinematicEngagement(name, 'view', 0);
    },
    onAnimationComplete: () => {
      const duration = typeof performance !== 'undefined'
        ? performance.now() - startTime
        : 0;
      trackCinematicEngagement(name, 'complete', duration);
    },
  };
}
