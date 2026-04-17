'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import ArabianPattern from './ArabianPattern';

interface DubaiShopHeroProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
}

export default function DubaiShopHero({
  title,
  subtitle,
  eyebrow,
}: DubaiShopHeroProps) {
  const reducedMotion = useReducedMotion();

  // Compose layered dark gold-on-black background in one inline style so
  // the hero reads as a cohesive atmosphere (base + radial + linear wash).
  const backgroundStyle: React.CSSProperties = {
    backgroundColor: '#0a0a0a',
    backgroundImage: [
      'radial-gradient(ellipse 70% 50% at 50% 40%, rgba(184,134,11,0.18) 0%, transparent 70%)',
      'linear-gradient(to bottom, rgba(212,175,55,0.04), transparent)',
    ].join(', '),
  };

  // Entry animation — gracefully collapses to a simple fade for users who
  // request reduced motion.
  const initial = reducedMotion ? { opacity: 0 } : { opacity: 0, y: 40 };
  const animate = reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 };

  return (
    <section
      className={cn(
        'relative overflow-hidden',
        'pt-32 md:pt-40 lg:pt-44 pb-20 md:pb-28',
      )}
      style={backgroundStyle}
    >
      {/* Full-bleed Arabian girih pattern — gold tinted via currentColor */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ color: 'rgba(212,175,55,0.8)' }}
        aria-hidden="true"
      >
        <ArabianPattern opacity={0.08} className="w-full h-full" />
      </div>

      {/* Top hairline accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      <div className="container-wide relative z-10">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={initial}
          animate={animate}
          transition={{
            duration: reducedMotion ? 0.3 : 0.9,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {eyebrow && (
            <motion.p
              className="eyebrow text-gold-accessible mb-6 uppercase tracking-[0.32em]"
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              transition={{ delay: reducedMotion ? 0 : 0.2, duration: 0.6 }}
            >
              {eyebrow}
            </motion.p>
          )}

          <h1
            className={cn(
              'font-playfair mb-7 leading-tight tracking-wide',
              'text-4xl sm:text-5xl md:text-6xl lg:text-7xl',
              'text-gradient-gold',
            )}
          >
            {title}
          </h1>

          {/* Decorative divider — two hairlines flanking a single dot */}
          <motion.div
            className="flex items-center justify-center gap-4 mb-7"
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scaleX: 0.5 }}
            animate={reducedMotion ? { opacity: 1 } : { opacity: 1, scaleX: 1 }}
            transition={{
              delay: reducedMotion ? 0 : 0.3,
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
            }}
            aria-hidden="true"
          >
            <span className="w-12 h-px bg-gold/40" />
            <span className="w-1.5 h-1.5 rounded-full bg-gold/80" />
            <span className="w-12 h-px bg-gold/40" />
          </motion.div>

          {subtitle && (
            <motion.p
              className="text-base md:text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed text-white/70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: reducedMotion ? 0 : 0.4, duration: 0.8 }}
            >
              {subtitle}
            </motion.p>
          )}
        </motion.div>
      </div>

      {/* Bottom decorative gold line */}
      <div className="absolute bottom-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
    </section>
  );
}
