import { Variants, Transition } from 'framer-motion'

// Category theme colors for visual effects
export const categoryThemes = {
  floral: { primary: '#FF6B9D', glow: 'rgba(255,107,157,0.3)' },
  fruity: { primary: '#FFD700', glow: 'rgba(255,215,0,0.3)' },
  woody: { primary: '#8B7355', glow: 'rgba(139,115,85,0.3)' },
  oriental: { primary: '#D4AF37', glow: 'rgba(212,175,55,0.3)' },
  gourmand: { primary: '#AF6E4D', glow: 'rgba(175,110,77,0.3)' },
} as const

// Shared spring transitions
export const springTransition: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
}

export const gentleSpring: Transition = {
  type: 'spring',
  stiffness: 200,
  damping: 25,
}

export const quickSpring: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 30,
}

// Page-level animation variants
export const pageVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.5, ease: 'easeOut' }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.3, ease: 'easeIn' }
  },
}

// Header animation
export const headerVariants: Variants = {
  initial: { opacity: 0, y: -30 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }
  },
}

// Staggered container for children
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

export const staggerFast: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.3,
    },
  },
}

// Progress tabs animation
export const tabVariants: Variants = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: gentleSpring,
  },
  hover: {
    scale: 1.02,
    transition: quickSpring,
  },
  tap: { scale: 0.98 },
}

// Active tab indicator
export const activeIndicatorVariants: Variants = {
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
  },
}

// Note card animations
export const noteCardVariants: Variants = {
  initial: { opacity: 0, y: 20, scale: 0.9 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: gentleSpring,
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.2 }
  },
  hover: {
    scale: 1.05,
    y: -4,
    transition: quickSpring,
  },
  tap: { scale: 0.95 },
  selected: {
    scale: 1.02,
    transition: springTransition,
  },
}

// Category tab animations
export const categoryTabVariants: Variants = {
  initial: { opacity: 0, x: -10 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  hover: {
    y: -2,
    transition: quickSpring,
  },
  tap: { scale: 0.95 },
}

// Pyramid layer animations
export const pyramidLayerVariants: Variants = {
  initial: { opacity: 0, scaleY: 0 },
  animate: {
    opacity: 1,
    scaleY: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  },
  filled: {
    scale: 1.02,
    transition: springTransition,
  },
  active: {
    boxShadow: '0 0 30px var(--glow-color, rgba(212,175,55,0.4))',
    transition: { duration: 0.3 }
  },
}

// Composition summary animations
export const summaryRowVariants: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: gentleSpring,
  },
  filled: {
    x: 0,
    opacity: 1,
    transition: springTransition,
  },
}

// Form animations
export const formVariants: Variants = {
  initial: { opacity: 0, y: 30 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.3 }
  },
}

// Button animations
export const buttonVariants: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: gentleSpring,
  },
  hover: {
    scale: 1.03,
    boxShadow: '0 0 25px rgba(212,175,55,0.4)',
    transition: quickSpring,
  },
  tap: { scale: 0.97 },
  disabled: {
    opacity: 0.5,
    scale: 1,
  },
}

// Floating particle animation (for decorative effects)
export const floatingParticleVariants: Variants = {
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
}

// Glow pulse animation
export const glowPulseVariants: Variants = {
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
}

// Shimmer animation for borders
export const shimmerVariants: Variants = {
  initial: { backgroundPosition: '200% 0' },
  animate: {
    backgroundPosition: ['-200% 0', '200% 0'],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'linear',
    },
  },
}

// Fade in with scale
export const fadeInScaleVariants: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
  },
}

// Slide up fade
export const slideUpFadeVariants: Variants = {
  initial: { opacity: 0, y: 30 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  },
  exit: {
    opacity: 0,
    y: 20,
    transition: { duration: 0.3 }
  },
}
