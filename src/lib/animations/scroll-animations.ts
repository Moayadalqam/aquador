import { Variants } from 'motion/react';
import { useEffect, useRef } from 'react';
import { trackScrollDepth, type ScrollDepthMilestone } from '@/lib/analytics/engagement-tracker';

/**
 * Scroll-triggered animation variants with mobile optimization
 *
 * Mobile-safe rules:
 * - No parallax scrolling on mobile (static transforms)
 * - No transform-3d unless necessary (avoids GPU layer issues)
 * - Reduced animation distance on mobile viewports
 * - Animations use --ease-out-expo from globals.css
 */

// Easing from globals.css
const EXPO_EASE = [0.16, 1, 0.3, 1] as const;

// Mobile detection helper (can be overridden per-component)
export const isMobileViewport = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
};

// Timing constants aligned with CSS custom properties
export const TIMING = {
  fast: 0.3,    // --duration-base (300ms)
  base: 0.5,    // --duration-slow (500ms)
  slow: 0.7,    // --duration-slower (700ms)
} as const;

// Spring configurations matching motion.ts patterns
export const SPRING_CONFIGS = {
  gentle: {
    type: 'spring' as const,
    stiffness: 200,
    damping: 25,
  },
  quick: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 30,
  },
  bouncy: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 30,
  },
} as const;

/**
 * Fade in from below - subtle vertical movement
 * Mobile: 20px movement, Desktop: 30px movement
 */
export const fadeInUp: Variants = {
  initial: {
    opacity: 0,
    y: 30,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: TIMING.base,
      ease: EXPO_EASE,
    },
  },
  exit: {
    opacity: 0,
    y: 20,
    transition: {
      duration: TIMING.fast,
      ease: EXPO_EASE,
    },
  },
};

/**
 * Fade in from above
 */
export const fadeInDown: Variants = {
  initial: {
    opacity: 0,
    y: -30,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: TIMING.base,
      ease: EXPO_EASE,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: TIMING.fast,
      ease: EXPO_EASE,
    },
  },
};

/**
 * Fade in from left
 */
export const fadeInLeft: Variants = {
  initial: {
    opacity: 0,
    x: -40,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: TIMING.base,
      ease: EXPO_EASE,
    },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: {
      duration: TIMING.fast,
      ease: EXPO_EASE,
    },
  },
};

/**
 * Fade in from right
 */
export const fadeInRight: Variants = {
  initial: {
    opacity: 0,
    x: 40,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: TIMING.base,
      ease: EXPO_EASE,
    },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: {
      duration: TIMING.fast,
      ease: EXPO_EASE,
    },
  },
};

/**
 * Fade in with scale - elegant entrance
 */
export const fadeInScale: Variants = {
  initial: {
    opacity: 0,
    scale: 0.9,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: TIMING.base,
      ease: EXPO_EASE,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: TIMING.fast,
      ease: EXPO_EASE,
    },
  },
};

/**
 * Stagger container - for grids and lists
 * Mobile: 50ms max delay, Desktop: 100ms delay
 *
 * @param delayChildren - Initial delay before children start (default: 0.2s)
 * @param staggerChildren - Delay between each child (default: 0.1s, 0.05s on mobile)
 */
export const staggerChildren = (
  delayChildren: number = 0.2,
  staggerChildren?: number
): Variants => {
  const isMobile = isMobileViewport();
  const stagger = staggerChildren ?? (isMobile ? 0.05 : 0.1);

  return {
    initial: {},
    animate: {
      transition: {
        staggerChildren: stagger,
        delayChildren,
      },
    },
  };
};

/**
 * Fast stagger - for rapid sequential animations
 */
export const staggerFast: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

/**
 * Slow stagger - for deliberate, elegant sequences
 */
export const staggerSlow: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

/**
 * Parallax variants - DISABLED on mobile for performance
 *
 * On mobile: returns static transform (no parallax)
 * On desktop: smooth parallax scrolling effect
 *
 * @param distance - Parallax distance in pixels (default: 50)
 */
export const parallaxVariants = (distance: number = 50): Variants => {
  const isMobile = isMobileViewport();

  if (isMobile) {
    // No parallax on mobile - static position
    return {
      initial: { y: 0 },
      animate: { y: 0 },
    };
  }

  return {
    initial: { y: 0 },
    animate: { y: -distance },
    exit: { y: 0 },
  };
};

/**
 * Slide and fade - combines movement with opacity
 */
export const slideUpFade: Variants = {
  initial: { opacity: 0, y: 30 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: TIMING.base,
      ease: EXPO_EASE,
    },
  },
  exit: {
    opacity: 0,
    y: 20,
    transition: {
      duration: TIMING.fast,
      ease: EXPO_EASE,
    },
  },
};

/**
 * Mobile-optimized variants - reduced distance and faster timing
 * Use this for complex layouts that might jank on mobile
 */
export const mobileOptimized = {
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: EXPO_EASE,
      },
    },
  },
  fadeInScale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: EXPO_EASE,
      },
    },
  },
} as const;

/**
 * Utility: Get appropriate variant based on viewport
 *
 * @param desktop - Desktop variant
 * @param mobile - Mobile variant (optional, uses mobileOptimized if not provided)
 */
export const getResponsiveVariant = (
  variantName: 'fadeInUp' | 'fadeInScale'
): Variants => {
  const isMobile = isMobileViewport();

  if (isMobile && mobileOptimized[variantName]) {
    return mobileOptimized[variantName];
  }

  // Return the standard variant
  switch (variantName) {
    case 'fadeInUp':
      return fadeInUp;
    case 'fadeInScale':
      return fadeInScale;
    default:
      return fadeInUp;
  }
};

// ─── Scroll Depth Tracking Hook ───────────────────────────────────────────────

const SCROLL_MILESTONES: ScrollDepthMilestone[] = [25, 50, 75, 100];
const SCROLL_DEDUP_KEY = 'aq_scroll_depth_';

/**
 * useScrollDepthTracking
 *
 * Tracks scroll depth milestones (25/50/75/100%) via Vercel Analytics.
 * Uses sessionStorage to prevent duplicate events within a session.
 * Safe to use in any page component — attaches/detaches cleanly on unmount.
 *
 * @example
 * ```tsx
 * function ProductPage() {
 *   useScrollDepthTracking();
 *   return <main>...</main>;
 * }
 * ```
 */
export function useScrollDepthTracking(): void {
  const firedRef = useRef<Set<ScrollDepthMilestone>>(new Set());

  useEffect(() => {
    const pagePath = window.location.pathname;
    const dedupPrefix = SCROLL_DEDUP_KEY + pagePath;

    // Restore already-fired milestones from sessionStorage
    SCROLL_MILESTONES.forEach(milestone => {
      try {
        if (sessionStorage.getItem(`${dedupPrefix}_${milestone}`)) {
          firedRef.current.add(milestone);
        }
      } catch {
        // sessionStorage unavailable — proceed without dedup
      }
    });

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;

      const pct = (scrollTop / docHeight) * 100;

      for (const milestone of SCROLL_MILESTONES) {
        if (pct >= milestone && !firedRef.current.has(milestone)) {
          firedRef.current.add(milestone);
          trackScrollDepth(milestone, pagePath);
          try {
            sessionStorage.setItem(`${dedupPrefix}_${milestone}`, '1');
          } catch {
            // sessionStorage unavailable — ignore
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
}
