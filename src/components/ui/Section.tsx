'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionProps {
  children: ReactNode;
  className?: string;
  background?: 'default' | 'subtle' | 'dark' | 'center' | 'top';
  size?: 'sm' | 'default' | 'lg';
  animate?: boolean;
  id?: string;
  contained?: boolean;
  noPadding?: boolean;
}

const backgrounds = {
  default: 'bg-gold-ambient',
  subtle: 'bg-gold-ambient-subtle',
  dark: 'bg-gold-ambient-dark',
  center: 'bg-gold-ambient-center',
  top: 'bg-gold-ambient-top',
};

const sizes = {
  sm: 'section-sm',
  default: 'section',
  lg: 'section-lg',
};

export function Section({
  children,
  className,
  background = 'default',
  size = 'default',
  animate = true,
  id,
  contained = false,
  noPadding = false,
}: SectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  const content = (
    <section
      id={id}
      ref={ref}
      className={cn(
        backgrounds[background],
        !noPadding && sizes[size],
        className
      )}
    >
      <div className={contained ? 'content-container' : 'container-wide'}>
        {children}
      </div>
    </section>
  );

  if (!animate) return content;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ duration: 0.6 }}
    >
      {content}
    </motion.div>
  );
}

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  titleVariant?: 'white' | 'gold';
  align?: 'center' | 'left';
  className?: string;
  eyebrow?: string;
}

export function SectionHeader({
  title,
  subtitle,
  titleVariant = 'white',
  align = 'center',
  className,
  eyebrow,
}: SectionHeaderProps) {
  return (
    <motion.div
      className={cn(
        'mb-14 md:mb-20',
        align === 'center' && 'text-center',
        className
      )}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      {eyebrow && (
        <p className={cn(
          'eyebrow text-gold-accessible mb-4',
          align === 'center' && 'mx-auto'
        )}>
          {eyebrow}
        </p>
      )}
      <h2
        className={cn(
          'font-playfair mb-5 tracking-wide leading-tight',
          'text-3xl md:text-4xl lg:text-[2.75rem]',
          titleVariant === 'white' ? 'text-black' : 'text-gradient-gold'
        )}
      >
        {title}
      </h2>
      {align === 'center' && (
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-8 h-px bg-gold/30" />
          <div className="w-16 h-px bg-gold" />
          <div className="w-8 h-px bg-gold/30" />
        </div>
      )}
      {align === 'left' && (
        <div className="w-12 h-px bg-gold mb-5" />
      )}
      {subtitle && (
        <p className={cn(
          'text-gray-400 text-base md:text-lg leading-relaxed',
          align === 'center' && 'max-w-2xl mx-auto'
        )}>
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}

interface PageHeroProps {
  title: string;
  subtitle?: string;
  titleVariant?: 'white' | 'gold';
  backgroundImage?: string;
  className?: string;
  eyebrow?: string;
}

export function PageHero({
  title,
  subtitle,
  titleVariant = 'gold',
  backgroundImage,
  className,
  eyebrow,
}: PageHeroProps) {
  return (
    <section className={cn('relative pt-24 md:pt-32 lg:pt-36 pb-14 md:pb-20 overflow-hidden', className)}>
      {backgroundImage && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center opacity-25 scale-105"
            style={{ backgroundImage: `url('${backgroundImage}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />
        </>
      )}
      {!backgroundImage && (
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-gold/[0.06] via-gold/[0.02] to-transparent" />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(212,175,55,0.07) 0%, transparent 70%)',
            }}
          />
        </>
      )}

      {/* Decorative gold line — top accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      <div className="container-wide relative z-10">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          {eyebrow && (
            <motion.p
              className="eyebrow text-gold-accessible mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              {eyebrow}
            </motion.p>
          )}
          <h1
            className={cn(
              'font-playfair mb-7 leading-tight',
              'text-4xl sm:text-5xl md:text-6xl lg:text-7xl',
              titleVariant === 'gold' ? 'text-gradient-gold' : 'text-black'
            )}
          >
            {title}
          </h1>

          {/* Refined separator */}
          <motion.div
            className="flex items-center justify-center gap-3 mb-7"
            initial={{ opacity: 0, scaleX: 0.5 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className={cn('w-8 h-px', backgroundImage ? 'bg-gold/30' : 'bg-gold/20')} />
            <div className={cn('w-16 h-px', backgroundImage ? 'bg-gold/80' : 'bg-gold')} />
            <div className={cn('w-8 h-px', backgroundImage ? 'bg-gold/30' : 'bg-gold/20')} />
          </motion.div>

          {subtitle && (
            <motion.p
              className={cn(
                'text-base md:text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed',
                backgroundImage ? 'text-white/70' : 'text-gray-500'
              )}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
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
