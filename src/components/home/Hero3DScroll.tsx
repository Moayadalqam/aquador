'use client';

import { useRef } from 'react';
import dynamic from 'next/dynamic';
import { motion, useScroll } from 'framer-motion';
import { useDeviceCapabilities } from '@/hooks/useDeviceCapabilities';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Canvas3DBoundary } from '@/components/3d/Canvas3DBoundary';

const Hero3DScene = dynamic(() => import('./Hero3DScene'), {
  ssr: false,
  loading: () => <Hero3DFallback />,
});

/**
 * Static fallback for mobile / low-end devices / reduced-motion.
 * Renders a layered gold glow effect using CSS only.
 */
function Hero3DFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
      {/* Outer soft glow */}
      <div
        className="absolute w-[320px] h-[400px] rounded-full opacity-40 blur-3xl"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(212,175,55,0.3) 0%, rgba(184,134,11,0.1) 40%, transparent 70%)',
        }}
      />
      {/* Inner concentrated glow */}
      <div
        className="absolute w-[180px] h-[240px] rounded-full opacity-50 blur-xl"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(255,215,0,0.25) 0%, transparent 60%)',
        }}
      />
      {/* Simulated bottle silhouette */}
      <div className="relative w-[60px] h-[140px] flex flex-col items-center">
        {/* Cap */}
        <div
          className="w-[22px] h-[18px] rounded-sm mb-[2px]"
          style={{
            background: 'linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%)',
            boxShadow: '0 -2px 8px rgba(255,215,0,0.15)',
          }}
        />
        {/* Neck */}
        <div
          className="w-[14px] h-[16px]"
          style={{
            background: 'linear-gradient(180deg, #B8860B 0%, #D4AF37 100%)',
          }}
        />
        {/* Body */}
        <div
          className="w-[44px] h-[90px] rounded-[22px]"
          style={{
            background: 'linear-gradient(135deg, #B8860B 0%, #D4AF37 30%, #FFD700 50%, #D4AF37 70%, #B8860B 100%)',
            boxShadow: '0 0 40px rgba(212,175,55,0.2), inset 0 0 20px rgba(255,215,0,0.1)',
          }}
        />
      </div>
    </div>
  );
}

/**
 * Scroll-driven 3D showcase section for the homepage.
 *
 * - Desktop: renders an interactive R3F scene with a gold perfume bottle
 *   that rotates and scales as the user scrolls through the section.
 * - Mobile / low-end / reduced-motion: renders a beautiful CSS-only fallback.
 *
 * The 3D scene is dynamic-imported to avoid bloating the initial JS bundle.
 */
export default function Hero3DScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { supports3D } = useDeviceCapabilities();
  const reducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const show3D = supports3D && !reducedMotion;

  return (
    <section
      ref={containerRef}
      className="relative h-[100dvh] overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #0a0a0a 0%, #111111 40%, #0d0d0d 70%, #0a0a0a 100%)',
      }}
      aria-label="Aquad'or signature collection showcase"
    >
      {/* Ambient gold atmospheric glow -- always rendered */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(184,134,11,0.15) 0%, transparent 70%)',
        }}
      />

      {/* Horizontal gold line accents */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

      {/* 3D Scene or CSS fallback — Canvas3DBoundary catches runtime R3F errors */}
      {show3D ? (
        <Canvas3DBoundary label="Hero3DScene" fallback={<Hero3DFallback />}>
          <Hero3DScene scrollYProgress={scrollYProgress} />
        </Canvas3DBoundary>
      ) : (
        <Hero3DFallback />
      )}

      {/* Foreground text overlay */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, ease: [0, 0, 0.2, 1] }}
          className="max-w-3xl"
        >
          {/* Eyebrow */}
          <p className="text-[11px] sm:text-[13px] tracking-[0.32em] uppercase text-gold/70 font-light mb-4">
            Crafted in Cyprus
          </p>

          {/* Main heading */}
          <h2
            className="font-playfair leading-[1.05] tracking-tight"
            style={{
              fontSize: 'clamp(2rem, 1rem + 3vw, 4.5rem)',
              background: 'linear-gradient(135deg, #FFF8DC 0%, #FFD700 40%, #D4AF37 70%, #B8941F 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 2px 40px rgba(212,175,55,0.2))',
            }}
          >
            The Signature Collection
          </h2>

          {/* Separator */}
          <div className="flex items-center justify-center gap-3 my-5 md:my-6">
            <div className="w-10 h-px bg-gradient-to-r from-transparent to-gold/30" />
            <div className="w-1 h-1 rounded-full bg-gold/50" />
            <div className="w-10 h-px bg-gradient-to-l from-transparent to-gold/30" />
          </div>

          {/* Description */}
          <p className="text-white/60 text-[14px] sm:text-[16px] max-w-lg mx-auto leading-relaxed">
            Every bottle tells a story &mdash; discover our curated world of bespoke fragrances, handcrafted for those who seek the extraordinary.
          </p>
        </motion.div>
      </div>

      {/* Bottom vignette for seamless transition */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none" />
      {/* Top vignette for seamless transition from Hero */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black to-transparent pointer-events-none" />
    </section>
  );
}
