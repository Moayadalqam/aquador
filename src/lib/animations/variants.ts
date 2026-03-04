import { Variants, Transition } from 'framer-motion';

/**
 * Consolidated animation variants from existing codebase
 * Patterns extracted from Hero.tsx and motion.ts
 *
 * Use cases documented for each variant to guide implementation
 * Performance characteristics noted for mobile optimization
 */

// Easing from globals.css
const EXPO_EASE = [0.16, 1, 0.3, 1] as const;

/**
 * SPRING CONFIGURATIONS
 * Match patterns from create-perfume/motion.ts
 */

export const springTransition: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
};

export const gentleSpring: Transition = {
  type: 'spring',
  stiffness: 200,
  damping: 25,
};

export const quickSpring: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 30,
};

/**
 * TIMING CONSTANTS
 * Aligned with CSS custom properties from globals.css
 */

export const DURATION = {
  fast: 0.15,    // --duration-fast (150ms)
  base: 0.3,     // --duration-base (300ms)
  slow: 0.5,     // --duration-slow (500ms)
  slower: 0.7,   // --duration-slower (700ms)
} as const;

/**
 * FADE ANIMATIONS
 * Simple opacity transitions - lowest performance cost
 */

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.3, ease: 'easeIn' },
  },
};

export const fadeInFast: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
};

/**
 * SLIDE ANIMATIONS
 * Vertical/horizontal movement with opacity
 * Use for section entrances, page transitions
 */

export const slideUp: Variants = {
  initial: { opacity: 0, y: 30 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EXPO_EASE },
  },
  exit: {
    opacity: 0,
    y: 20,
    transition: { duration: 0.3 },
  },
};

export const slideDown: Variants = {
  initial: { opacity: 0, y: -30 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EXPO_EASE },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.3 },
  },
};

export const slideLeft: Variants = {
  initial: { opacity: 0, x: 40 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: EXPO_EASE },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: { duration: 0.3 },
  },
};

export const slideRight: Variants = {
  initial: { opacity: 0, x: -40 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: EXPO_EASE },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: { duration: 0.3 },
  },
};

/**
 * SCALE ANIMATIONS
 * Subtle zoom effects - use sparingly
 * Can trigger GPU layers, monitor performance on mobile
 */

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: EXPO_EASE },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
};

export const scaleInBig: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: EXPO_EASE },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.3 },
  },
};

/**
 * DECORATIVE ANIMATIONS
 * Shimmer, pulse, floating effects
 * Use for ambient effects, loading states, decorative elements
 */

export const shimmer: Variants = {
  initial: { backgroundPosition: '200% 0' },
  animate: {
    backgroundPosition: ['-200% 0', '200% 0'],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

export const pulse: Variants = {
  initial: { opacity: 0.3 },
  animate: {
    opacity: [0.3, 0.6, 0.3],
    scale: [1, 1.02, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export const pulseGlow: Variants = {
  initial: { opacity: 0.3 },
  animate: {
    opacity: [0.3, 0.6, 0.3],
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

/**
 * FLOATING PARTICLE
 * For decorative ambient effects
 * Custom variant accepts index for staggered delays
 */

export const floatingParticle: Variants = {
  initial: { opacity: 0, y: 0 },
  animate: (custom: number) => ({
    opacity: [0, 0.5, 0],
    y: -100,
    x: Math.sin(custom) * 30,
    transition: {
      duration: 3 + custom * 0.5,
      repeat: Infinity,
      ease: 'easeOut',
      delay: custom * 0.2,
    },
  }),
};

/**
 * PAGE-LEVEL TRANSITIONS
 * For route changes and page loads
 */

export const pageTransition: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.3, ease: 'easeIn' },
  },
};

export const pageSlideUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EXPO_EASE },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.3 },
  },
};

/**
 * INTERACTIVE ELEMENTS
 * Hover, tap, and focus states
 * Use for buttons, cards, clickable elements
 */

export const hoverLift: Variants = {
  initial: { y: 0 },
  hover: {
    y: -4,
    transition: quickSpring,
  },
  tap: { scale: 0.98 },
};

export const hoverScale: Variants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.03,
    transition: quickSpring,
  },
  tap: { scale: 0.97 },
};

export const hoverGlow: Variants = {
  initial: { boxShadow: '0 0 0 rgba(212,175,55,0)' },
  hover: {
    boxShadow: '0 0 25px rgba(212,175,55,0.4)',
    transition: { duration: 0.3 },
  },
};

/**
 * STAGGER CONTAINERS
 * For animating lists and grids
 */

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export const staggerFast: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

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
 * MOBILE-OPTIMIZED VARIANTS
 * Reduced motion distance and faster timing
 * Use for complex layouts that might jank on mobile
 */

export const mobileOptimized = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { duration: 0.3 },
    },
  },
  slideUp: {
    initial: { opacity: 0, y: 15 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: EXPO_EASE },
    },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3, ease: EXPO_EASE },
    },
  },
} as const;

/**
 * CATEGORY THEME COLORS
 * From create-perfume/motion.ts - for visual effects
 */

export const categoryThemes = {
  floral: { primary: '#FF6B9D', glow: 'rgba(255,107,157,0.3)' },
  fruity: { primary: '#FFD700', glow: 'rgba(255,215,0,0.3)' },
  woody: { primary: '#8B7355', glow: 'rgba(139,115,85,0.3)' },
  oriental: { primary: '#D4AF37', glow: 'rgba(212,175,55,0.3)' },
  gourmand: { primary: '#AF6E4D', glow: 'rgba(175,110,77,0.3)' },
} as const;

/**
 * UTILITY: Get appropriate variant based on context
 * Returns mobile-optimized variant on small viewports
 */

export const getContextualVariant = (
  variantType: 'fadeIn' | 'slideUp' | 'scaleIn'
): Variants => {
  if (typeof window === 'undefined') {
    // SSR - return standard variant
    return { initial: { opacity: 0 }, animate: { opacity: 1 } };
  }

  const isMobile = window.innerWidth < 768;

  if (isMobile && mobileOptimized[variantType]) {
    return mobileOptimized[variantType];
  }

  // Return standard variant
  switch (variantType) {
    case 'fadeIn':
      return fadeIn;
    case 'slideUp':
      return slideUp;
    case 'scaleIn':
      return scaleIn;
    default:
      return fadeIn;
  }
};
