'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function LoadingScreen() {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const delay = prefersReducedMotion ? 200 : 800;

    const timer = setTimeout(() => {
      setFadeOut(true);
    }, delay);

    // Remove from DOM after fade-out transition completes
    const removeTimer = setTimeout(() => {
      setVisible(false);
    }, delay + 500);

    return () => {
      clearTimeout(timer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0a0a0a] transition-opacity duration-500 ease-out ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-hidden="true"
    >
      {/* Logo with pulse animation */}
      <div className="loading-logo mb-8">
        <Image
          src="/aquador.webp"
          alt=""
          width={160}
          height={120}
          className="max-w-[160px] h-auto"
          priority
        />
      </div>

      {/* Progress bar */}
      <div className="h-[2px] w-48 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gold rounded-full ${
            fadeOut ? '' : 'loading-progress'
          }`}
          style={{ width: fadeOut ? '100%' : undefined }}
        />
      </div>

      <style jsx>{`
        .loading-logo {
          animation: logoPulse 1.5s ease-in-out infinite;
        }

        .loading-progress {
          animation: progressFill 800ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        @keyframes logoPulse {
          0%, 100% {
            opacity: 0.7;
            filter: brightness(1);
          }
          50% {
            opacity: 1;
            filter: brightness(1.3) drop-shadow(0 0 8px rgba(212, 175, 55, 0.4));
          }
        }

        @keyframes progressFill {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .loading-logo {
            animation: none;
            opacity: 1;
          }

          .loading-progress {
            animation: none;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
