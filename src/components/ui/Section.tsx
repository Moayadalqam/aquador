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
}: SectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  const content = (
    <section
      id={id}
      ref={ref}
      className={cn(backgrounds[background], sizes[size], className)}
    >
      <div className="container-wide">{children}</div>
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
}

export function SectionHeader({
  title,
  subtitle,
  titleVariant = 'white',
  align = 'center',
  className,
}: SectionHeaderProps) {
  return (
    <motion.div
      className={cn(
        'mb-12 md:mb-16',
        align === 'center' && 'text-center',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <h2
        className={cn(
          'text-3xl md:text-4xl lg:text-5xl font-playfair mb-4 tracking-wide',
          titleVariant === 'white' ? 'text-white' : 'text-gradient-gold'
        )}
      >
        {title}
      </h2>
      {align === 'center' && <div className="w-16 h-px bg-gold mx-auto mb-5" />}
      {subtitle && (
        <p className={cn(
          'text-gray-400 text-base md:text-lg tracking-wide',
          align === 'center' && 'max-w-xl mx-auto'
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
}

export function PageHero({
  title,
  subtitle,
  titleVariant = 'gold',
  backgroundImage,
  className,
}: PageHeroProps) {
  return (
    <section className={cn('relative pt-32 pb-16 overflow-hidden', className)}>
      {backgroundImage && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: `url('${backgroundImage}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-dark via-dark/90 to-dark" />
        </>
      )}
      {!backgroundImage && (
        <div className="absolute inset-0 bg-gradient-to-b from-gold/5 to-transparent" />
      )}
      <div className="container-wide relative z-10">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1
            className={cn(
              'text-4xl sm:text-5xl md:text-6xl font-playfair mb-6',
              titleVariant === 'gold' ? 'text-gradient-gold' : 'text-white'
            )}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
