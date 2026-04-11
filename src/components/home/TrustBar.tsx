'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Package, Truck, Award } from 'lucide-react';

const trustStats = [
  {
    icon: Package,
    value: '200+',
    label: 'Fragrances',
  },
  {
    icon: Truck,
    value: 'Free',
    label: 'Shipping Cyprus',
  },
  {
    icon: Award,
    value: 'Since 2018',
    label: 'Established',
  },
] as const;

export default function TrustBar() {
  const prefersReducedMotion = useReducedMotion();

  const decelerate: [number, number, number, number] = [0, 0, 0.2, 1];

  const fadeInVariants = prefersReducedMotion
    ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 16 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: decelerate },
        },
      };

  const staggerContainer = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.1,
      },
    },
  };

  return (
    <section
      className="w-full bg-gold-ambient-subtle"
      aria-label="Trust and social proof"
    >
      <div className="container-wide py-12 md:py-16">
        {/* Row 1: Trust Stats */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-y-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {trustStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                className="flex items-center"
                variants={fadeInVariants}
              >
                {/* Separator before 2nd and 3rd items */}
                {index > 0 && (
                  <div
                    className="hidden sm:block w-px h-8 bg-gold/20 mx-8 md:mx-12"
                    aria-hidden="true"
                  />
                )}
                <div className="flex flex-col items-center text-center px-6 sm:px-0">
                  <Icon
                    className="w-5 h-5 text-gold-400 mb-2"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  <span className="font-playfair text-2xl md:text-3xl text-gold-accessible leading-none">
                    {stat.value}
                  </span>
                  <span className="text-[11px] uppercase tracking-[0.15em] text-gray-500 mt-1">
                    {stat.label}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Gold divider */}
        <div
          className="w-16 h-px bg-gold/20 mx-auto my-8 md:my-10"
          aria-hidden="true"
        />

        {/* Row 2: Testimonial */}
        <motion.div
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
          whileInView={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, delay: 0.2, ease: decelerate }}
        >
          <figure className="max-w-xl mx-auto text-center">
            <blockquote>
              <p className="font-playfair italic text-base md:text-lg text-gray-500 leading-relaxed">
                &ldquo;The most exquisite fragrance selection in Nicosia. Absolutely premium quality.&rdquo;
              </p>
            </blockquote>
            <figcaption className="mt-4 text-[11px] uppercase tracking-[0.15em] text-gray-400">
              &mdash; Verified Customer
            </figcaption>
          </figure>
        </motion.div>
      </div>
    </section>
  );
}
