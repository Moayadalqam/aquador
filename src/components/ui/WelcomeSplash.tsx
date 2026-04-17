'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WelcomeSplash() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const visited = sessionStorage.getItem('aquador_visited');
    if (visited === '1') return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Skip entirely for reduced-motion users
    if (prefersReducedMotion) {
      sessionStorage.setItem('aquador_visited', '1');
      return;
    }

    // Mark as visited immediately so refreshes/navigations don't replay
    sessionStorage.setItem('aquador_visited', '1');
    setShow(true);

    const timer = setTimeout(() => setShow(false), 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0a0a0a] pointer-events-none"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.3, ease: [0, 0, 0.2, 1] } }}
          role="presentation"
          aria-hidden="true"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 8 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              transition: { duration: 0.25, ease: [0, 0, 0.2, 1] },
            }}
            className="text-center"
          >
            {/* Gold SVG wordmark matching AquadorLogo but sized for splash */}
            <svg
              viewBox="0 0 220 44"
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 sm:h-16 w-auto mx-auto"
              style={{ filter: 'drop-shadow(0 0 24px rgba(212,175,55,0.35))' }}
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="splash-gold-gradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#D4AF37" />
                  <stop offset="50%" stopColor="#FFD700" />
                  <stop offset="100%" stopColor="#D4AF37" />
                </linearGradient>
              </defs>
              <text
                x="110"
                y="33"
                textAnchor="middle"
                fontFamily="Playfair Display, Georgia, serif"
                fontSize="32"
                fontWeight="600"
                letterSpacing="0.12em"
                fill="url(#splash-gold-gradient)"
              >
                AQUAD&apos;OR
              </text>
            </svg>

            {/* Animated gold divider line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{
                scaleX: 1,
                transition: { duration: 0.3, ease: [0, 0, 0.2, 1], delay: 0.1 },
              }}
              className="mt-4 h-px bg-gold/60 origin-center mx-auto"
              style={{ width: '120px' }}
            />

            {/* Tagline */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                transition: { duration: 0.2, ease: [0, 0, 0.2, 1], delay: 0.15 },
              }}
              className="mt-3 text-[11px] tracking-[0.32em] uppercase text-white/50 font-poppins"
            >
              Scent of Luxury
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
