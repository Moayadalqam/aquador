'use client';

import { useRef } from 'react';
import dynamic from 'next/dynamic';
import { motion, useScroll } from 'motion/react';
import { useDeviceCapabilities } from '@/hooks/useDeviceCapabilities';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Canvas3DBoundary } from '@/components/3d/Canvas3DBoundary';

const Hero3DSceneCrystal = dynamic(() => import('./Hero3DSceneCrystal'), {
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
      <div
        className="absolute w-[360px] h-[440px] rounded-full opacity-50 blur-3xl"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(212,175,55,0.35) 0%, rgba(184,134,11,0.12) 40%, transparent 70%)',
        }}
      />
      <div
        className="absolute w-[200px] h-[260px] rounded-full opacity-55 blur-2xl"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(255,215,0,0.28) 0%, transparent 60%)',
        }}
      />
      <div className="relative w-[68px] h-[160px] flex flex-col items-center">
        <div
          className="w-[26px] h-[20px] rounded-sm mb-[2px]"
          style={{
            background: 'linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%)',
            boxShadow: '0 -2px 10px rgba(255,215,0,0.18)',
          }}
        />
        <div
          className="w-[16px] h-[18px]"
          style={{ background: 'linear-gradient(180deg, #B8860B 0%, #D4AF37 100%)' }}
        />
        <div
          className="w-[50px] h-[100px] rounded-[24px]"
          style={{
            background:
              'linear-gradient(135deg, #B8860B 0%, #D4AF37 30%, #FFD700 50%, #D4AF37 70%, #B8860B 100%)',
            boxShadow:
              '0 0 50px rgba(212,175,55,0.25), inset 0 0 22px rgba(255,215,0,0.12)',
          }}
        />
      </div>
    </div>
  );
}

/**
 * Scroll-driven 3D showcase section for the homepage.
 *
 * Cinematic dark-luxe stage:
 *  - layered radial gradients evoking depth & velvet
 *  - volumetric spotlight cone from above
 *  - subtle film grain (CSS noise)
 *  - 3D crystal bottle with drifting gold motes
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
      className="relative h-[100dvh] overflow-hidden isolate"
      aria-label="Aquad'or signature collection showcase"
      style={{
        // Layered radial palette: deep cocoa core, blacker edges. Reads warmer than flat #0a0a0a.
        background:
          'radial-gradient(ellipse 70% 60% at 50% 35%, #2a1a08 0%, #170c04 38%, #0a0604 70%, #050302 100%)',
      }}
    >
      {/* Volumetric spotlight cone — narrow cool key from top behind the bottle */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-full pointer-events-none mix-blend-screen"
        style={{
          background:
            'radial-gradient(ellipse 28% 70% at 50% 8%, rgba(255,238,200,0.32) 0%, rgba(212,175,55,0.16) 18%, rgba(184,134,11,0.06) 38%, transparent 60%)',
          opacity: 0.95,
        }}
      />

      {/* Warm halo at the bottle's center mass */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 36% 30% at 50% 56%, rgba(212,175,55,0.18) 0%, transparent 70%)',
        }}
      />

      {/* Distant warm rim glow at horizon */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 40% at 50% 100%, rgba(184,134,11,0.18) 0%, transparent 65%)',
        }}
      />

      {/* Top hairline gold accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      {/* 3D Scene */}
      {show3D ? (
        <Canvas3DBoundary label="Hero3DSceneCrystal" fallback={<Hero3DFallback />}>
          <Hero3DSceneCrystal scrollYProgress={scrollYProgress} />
        </Canvas3DBoundary>
      ) : (
        <Hero3DFallback />
      )}

      {/* Film grain overlay — barely visible, adds analog texture */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-[0.07] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.6'/></svg>\")",
          backgroundSize: '220px 220px',
        }}
      />

      {/* Foreground text overlay — positioned to sit above the bottle base, not on it */}
      <div className="relative z-10 h-full flex flex-col items-center justify-end pb-[16vh] md:pb-[14vh] px-6 text-center pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.9, ease: [0, 0, 0.2, 1] }}
          className="max-w-3xl"
        >
          <p className="text-[11px] sm:text-[13px] tracking-[0.36em] uppercase text-gold/75 font-light mb-4">
            Crafted in Cyprus
          </p>

          <h2
            className="font-playfair leading-[1.05] tracking-tight"
            style={{
              fontSize: 'clamp(2rem, 1rem + 3vw, 4.5rem)',
              background:
                'linear-gradient(135deg, #FFF8DC 0%, #FFD700 40%, #D4AF37 70%, #B8941F 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 2px 40px rgba(212,175,55,0.25))',
            }}
          >
            The Signature Collection
          </h2>

          <div className="flex items-center justify-center gap-3 my-5 md:my-6">
            <div className="w-10 h-px bg-gradient-to-r from-transparent to-gold/35" />
            <div className="w-1 h-1 rounded-full bg-gold/60" />
            <div className="w-10 h-px bg-gradient-to-l from-transparent to-gold/35" />
          </div>

          <p className="text-white/60 text-[14px] sm:text-[16px] max-w-lg mx-auto leading-relaxed">
            Every bottle tells a story &mdash; discover our curated world of bespoke fragrances, handcrafted for those who seek the extraordinary.
          </p>
        </motion.div>
      </div>

      {/* Bottom transition fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#050302] to-transparent pointer-events-none z-[1]" />
      {/* Top transition fade */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black to-transparent pointer-events-none z-[1]" />
    </section>
  );
}
