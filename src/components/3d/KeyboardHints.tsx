'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const STORAGE_KEY = 'aquador_3d_hints_dismissed';

/**
 * Hint entry displayed in the overlay
 */
interface HintEntry {
  keys: string[];
  label: string;
}

const HINTS: HintEntry[] = [
  { keys: ['←', '→'], label: 'Rotate' },
  { keys: ['↑', '↓'], label: 'Tilt' },
  { keys: ['+', '−'], label: 'Zoom' },
  { keys: ['R'], label: 'Reset' },
];

/**
 * KeyboardHints — keyboard shortcut overlay for 3D scenes
 *
 * Auto-shows on the user's first visit to a page containing a 3D scene.
 * Dismissed automatically after 6 seconds or when the user clicks X / presses Escape.
 * Respects prefers-reduced-motion: transitions are instant when motion is reduced.
 *
 * Luxury gold aesthetic — consistent with Aquad'or design system (Phase 10 palette).
 *
 * @example
 * ```tsx
 * // Rendered as a DOM sibling to the Canvas inside Scene.tsx wrapper
 * <div className="relative">
 *   <Canvas>...</Canvas>
 *   <KeyboardHints />
 * </div>
 * ```
 */
export function KeyboardHints() {
  const reducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show only on first visit — sessionStorage so it reappears each browser session
    // but localStorage would make it appear only ever once. We use localStorage
    // to truly "dismiss forever" once the user has seen it.
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      setVisible(true);
    }
  }, []);

  // Auto-dismiss after 6 seconds
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => {
      setVisible(false);
    }, 6000);
    return () => clearTimeout(timer);
  }, [visible]);

  const dismiss = useCallback(() => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, '1');
  }, []);

  // Escape key dismissal
  useEffect(() => {
    if (!visible) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [visible, dismiss]);

  // Animation variants — instant when reducedMotion is active
  const overlayVariants = reducedMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        initial: { opacity: 0, y: 8, scale: 0.97 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 4, scale: 0.98 },
      };

  const transition = reducedMotion
    ? { duration: 0.1 }
    : { duration: 0.25, ease: [0.16, 1, 0.3, 1] as const };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="tooltip"
          aria-label="Keyboard shortcuts for 3D viewer"
          variants={overlayVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={transition}
          className="
            absolute bottom-4 right-4 z-10
            flex flex-col gap-2
            rounded-lg border border-[#D4AF37]/30
            bg-black/70 backdrop-blur-sm
            px-4 py-3
            text-sm
          "
          style={{ pointerEvents: 'auto' }}
        >
          {/* Header row */}
          <div className="flex items-center justify-between gap-6 mb-1">
            <span
              className="text-[#D4AF37] font-medium tracking-widest uppercase text-[10px]"
              style={{ fontFamily: 'var(--font-playfair, serif)' }}
            >
              Keyboard Controls
            </span>
            <button
              onClick={dismiss}
              aria-label="Dismiss keyboard hints"
              className="
                text-[#D4AF37]/60 hover:text-[#D4AF37]
                transition-colors duration-150
                leading-none text-base
                -mt-0.5
              "
            >
              ×
            </button>
          </div>

          {/* Hint rows */}
          <div className="flex flex-col gap-1.5">
            {HINTS.map(({ keys, label }) => (
              <div key={label} className="flex items-center gap-2">
                <div className="flex gap-1">
                  {keys.map(key => (
                    <kbd
                      key={key}
                      className="
                        inline-flex items-center justify-center
                        min-w-[22px] h-[22px] px-1
                        rounded border border-[#D4AF37]/40
                        bg-[#D4AF37]/10
                        text-[#D4AF37] text-[11px] font-mono font-medium
                        leading-none
                      "
                    >
                      {key}
                    </kbd>
                  ))}
                </div>
                <span className="text-white/70 text-[11px]">{label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
