'use client';

import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { ParallaxSection } from '@/components/ui/ParallaxSection';
import { cinematicVariants, revealVariants } from '@/lib/animations/cinematic';
import { useAnimationBudget } from '@/lib/performance/animation-budget';
import { useState, useRef } from 'react';

export default function Hero() {
  const [videoError, setVideoError] = useState(false);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { amount: 0.1 });
  const { shouldUseSimplifiedAnimations } = useAnimationBudget();

  return (
    <motion.section
      className="relative min-h-screen flex flex-col overflow-hidden"
      variants={shouldUseSimplifiedAnimations ? cinematicVariants.simpleFade : cinematicVariants.heroEntry}
      initial="initial"
      animate="animate"
    >
      {/* Main Hero Content */}
      <div ref={sectionRef} className="relative flex-1 flex items-center justify-center pt-24">
        {/* Video Background - Slow parallax for depth */}
        <ParallaxSection speed={0.3} className="absolute inset-0 z-0">
          {!videoError ? (
            <video
              autoPlay
              muted
              loop
              playsInline
              className="absolute w-full h-full object-cover opacity-30"
              style={{ filter: 'brightness(0.4) saturate(0.8)' }}
              onError={() => setVideoError(true)}
            >
              <source
                src="https://static1.squarespace.com/static/66901f0f8865462c0ac066ba/t/6899a19131e4b55cddf56fb2/1754898858755/download+%2820%29.mp4"
                type="video/mp4"
              />
            </video>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-black via-dark-light to-black" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black" />
        </ParallaxSection>

        {/* Subtle ambient glow - Medium parallax layer */}
        <ParallaxSection speed={0.5} className="absolute inset-0 z-0 pointer-events-none">
          <motion.div
            className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-gold/[0.03] rounded-full blur-[100px]"
            animate={isInView ? {
              scale: [1, 1.1, 1],
              opacity: [0.5, 0.7, 0.5],
            } : {}}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </ParallaxSection>

        {/* Content */}
        <motion.div
          className="relative z-10 text-center container-wide py-16 md:py-24"
          variants={revealVariants.fadeInSequence}
          initial="initial"
          animate="animate"
        >
          {/* Brand name */}
          <motion.h1
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-playfair font-normal tracking-[0.15em] sm:tracking-[0.2em] mb-8"
            variants={revealVariants.fadeInSequence}
            style={{
              background: 'linear-gradient(90deg, #FFD700, #FFF8DC, #FFD700, #D4AF37, #FFD700)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 40px rgba(255, 215, 0, 0.2))',
            }}
          >
            AQUAD&apos;OR
          </motion.h1>

          {/* Separator line */}
          <motion.div
            className="relative w-24 h-px mx-auto mb-8"
            variants={revealVariants.fadeInSequence}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
          </motion.div>

          {/* Tagline */}
          <motion.p
            className="text-sm sm:text-base md:text-lg text-gray-400 tracking-[0.2em] sm:tracking-[0.25em] uppercase font-light mb-14"
            variants={revealVariants.fadeInSequence}
          >
            Where Luxury Meets Distinction
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            variants={revealVariants.fadeInSequence}
          >
            <Link href="/shop">
              <Button size="lg" className="min-w-[200px]">
                Explore Collection
              </Button>
            </Link>
            <Link href="/create-perfume">
              <Button variant="outline" size="lg" className="min-w-[200px]">
                Create Your Own
              </Button>
            </Link>
          </motion.div>
        </motion.div>

      </div>
    </motion.section>
  );
}
