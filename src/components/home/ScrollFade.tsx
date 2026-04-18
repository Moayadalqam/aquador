'use client';

import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { useRef, type ReactNode } from 'react';

interface ScrollFadeProps {
  children: ReactNode;
  className?: string;
  /**
   * Distance (px) each section translates upward while fading in/out. Higher = more
   * dramatic parallax. Default keeps motion subtle so it composes with children.
   */
  distance?: number;
  /**
   * When false (default), the section also fades *out* as it exits the viewport.
   * Set true for final sections where you want the content to stay visible.
   */
  keepVisibleOnExit?: boolean;
}

/**
 * Drop-in wrapper that fades and lifts a section both as it enters AND as it
 * exits the viewport — tied to the user's scroll position so motion feels
 * cinematic rather than abrupt. Honors `prefers-reduced-motion` by holding
 * opacity at 1 and removing translate.
 */
export default function ScrollFade({
  children,
  className,
  distance = 60,
  keepVisibleOnExit = false,
}: ScrollFadeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 85%', 'end 15%'],
  });

  const opacity = useTransform(
    scrollYProgress,
    keepVisibleOnExit ? [0, 0.2, 1] : [0, 0.15, 0.85, 1],
    keepVisibleOnExit ? [0, 1, 1] : [0, 1, 1, 0.5]
  );
  const y = useTransform(scrollYProgress, [0, 0.5, 1], [distance, 0, -distance * 0.5]);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        opacity: prefersReduced ? 1 : opacity,
        y: prefersReduced ? 0 : y,
        willChange: prefersReduced ? 'auto' : 'transform, opacity',
      }}
    >
      {children}
    </motion.div>
  );
}
