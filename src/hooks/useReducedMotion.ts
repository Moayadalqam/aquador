'use client';

import { useEffect, useState } from 'react';

/**
 * Detects and respects the user's prefers-reduced-motion setting
 *
 * Returns true if the user has requested reduced motion in their OS settings.
 * This allows us to disable animations for users who experience motion sickness
 * or have accessibility needs.
 *
 * Updates automatically if the user changes their preference while the app is running.
 *
 * @returns {boolean} true if motion should be reduced, false otherwise
 *
 * @example
 * ```tsx
 * function AnimatedComponent() {
 *   const reducedMotion = useReducedMotion();
 *
 *   return (
 *     <motion.div
 *       animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
 *     >
 *       Content
 *     </motion.div>
 *   );
 * }
 * ```
 */
export function useReducedMotion(): boolean {
  // Default to false (enable animations) for SSR
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Check if browser supports matchMedia
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    // Create media query
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Set initial value
    setReducedMotion(mediaQuery.matches);

    // Handler for changes
    const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
      setReducedMotion(event.matches);
    };

    // Listen for changes
    // Use addEventListener if available (modern browsers)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
    }

    // Cleanup
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  return reducedMotion;
}
