'use client';

import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { ParallaxSection } from '@/components/ui/ParallaxSection';
import { cinematicVariants, revealVariants } from '@/lib/animations/cinematic';
import { useAnimationBudget } from '@/lib/performance/animation-budget';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useState, useRef } from 'react';

export default function Hero() {
  const [videoError, setVideoError] = useState(false);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { amount: 0.1 });
  const { shouldUseSimplifiedAnimations } = useAnimationBudget();
  const reducedMotion = useReducedMotion();

  return (
    <motion.section
      className="relative min-h-screen flex flex-col overflow-hidden"
      variants={shouldUseSimplifiedAnimations ? cinematicVariants.simpleFade : cinematicVariants.heroEntry}
      initial="initial"
      animate="animate"
    >
      {/* Main Hero Content */}
      <div ref={sectionRef} className="relative flex-1 flex items-center justify-center pt-24">
        {/* Video Background */}
        <ParallaxSection speed={0.25} className="absolute inset-0 z-0">
          {!videoError ? (
            <video
              autoPlay
              muted
              loop
              playsInline
              poster="/images/aquadour1.jpg"
              className="absolute w-full h-full object-cover"
              style={{ filter: 'brightness(0.25) saturate(0.7) contrast(1.1)' }}
              onError={() => setVideoError(true)}
            >
              {/* Migrated from Squarespace CDN 2026-04-17 — original URL in git history */}
            <source
                src="/media/hero-luxury.mp4"
                type="video/mp4"
              />
            </video>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0d0d0d] to-black" />
          )}

          {/* Multi-layer gradient for cinematic depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black" />
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse 80% 60% at 50% 50%, transparent 40%, rgba(0,0,0,0.5) 100%)',
            }}
          />
        </ParallaxSection>

        {/* Ambient gold glow — slow-breathing center light */}
        <ParallaxSection speed={0.45} className="absolute inset-0 z-0 pointer-events-none gpu-accelerated">
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(212,175,55,0.04) 0%, transparent 70%)',
              filter: 'blur(40px)',
              willChange: isInView ? 'transform, opacity' : 'auto',
            }}
            animate={isInView && !reducedMotion ? {
              scale: [1, 1.08, 1],
              opacity: [0.6, 1, 0.6],
            } : { scale: 1, opacity: 0.8 }}
            transition={isInView && !reducedMotion ? {
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            } : { duration: 0 }}
          />
        </ParallaxSection>

        {/* Content — centered with generous vertical breathing room */}
        <motion.div
          className="relative z-10 text-center container-wide py-20 md:py-32 lg:py-40"
          variants={revealVariants.fadeInSequence}
          initial="initial"
          animate="animate"
        >
          {/* Eyebrow label */}
          <motion.p
            className="text-[11px] sm:text-xs uppercase tracking-[0.35em] text-gold-on-dark mb-8 font-light"
            variants={revealVariants.fadeInSequence}
          >
            Cyprus &nbsp;&bull;&nbsp; Since May 2018
          </motion.p>

          {/* Brand name — cinematic scale */}
          <motion.h1
            className="font-playfair font-normal mb-0 tracking-[0.18em] sm:tracking-[0.22em] py-2"
            aria-label="Aquad'or"
            style={{
              fontSize: 'clamp(3rem, 9vw, 6.5rem)',
              lineHeight: 1.15,
              background: 'linear-gradient(180deg, #FFF8DC 0%, #FFD700 35%, #D4AF37 65%, #B8960C 100%)',
              backgroundSize: '100% 100%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 2px 60px rgba(212, 175, 55, 0.25))',
            }}
            variants={revealVariants.fadeInSequence}
          >
            AQUAD&apos;OR
          </motion.h1>

          {/* Refined separator */}
          <motion.div
            className="relative flex items-center justify-center gap-3 my-8 md:my-10"
            variants={revealVariants.fadeInSequence}
          >
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-gold/40" />
            <div className="w-1.5 h-1.5 rounded-full bg-gold/60" />
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-gold/40" />
          </motion.div>

          {/* Tagline — refined hierarchy */}
          <motion.p
            className="text-[11px] sm:text-xs md:text-sm text-white/70 tracking-[0.28em] uppercase font-light mb-6 md:mb-8"
            variants={revealVariants.fadeInSequence}
          >
            Scent of Luxury
          </motion.p>

          {/* Value proposition */}
          <motion.p
            className="text-sm md:text-base text-white/60 tracking-wide mb-10"
            variants={revealVariants.fadeInSequence}
          >
            Premium &amp; Niche Fragrances in Cyprus | Free Shipping
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            variants={revealVariants.fadeInSequence}
          >
            <Link href="/shop">
              <Button size="lg" className="min-w-[200px]">
                Shop Now
              </Button>
            </Link>
            <Link href="/create-perfume">
              <Button variant="outline" size="lg" className="min-w-[200px]">
                Design Your Fragrance
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom vignette edge */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent z-[1]" />
    </motion.section>
  );
}
