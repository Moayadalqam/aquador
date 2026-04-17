'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useRef } from 'react';
import Button from '@/components/ui/Button';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const stages: {
  title: string;
  description: string;
  image: string;
  accent: string;
}[] = [
  {
    title: 'Top Notes',
    description:
      'The first impression of a fragrance, top notes are light, volatile molecules that evaporate within 15-30 minutes. They create the opening burst \u2014 think citrus zest, fresh herbs, and crisp spices \u2014 drawing you into the scent before gracefully fading.',
    image: 'https://i.ibb.co/HfY2jbSH/1.jpg',
    accent: 'The Opening',
  },
  {
    title: 'Middle Notes',
    description:
      'Emerging as top notes fade, the heart reveals itself over 1-4 hours. These balanced, rounded accords \u2014 florals, aromatics, soft spices \u2014 form the true character of the fragrance and define its personality.',
    image: 'https://i.ibb.co/xSqkdDL6/image-Cap-Cut-Commerce-Pro-202502202047.jpg',
    accent: 'The Character',
  },
  {
    title: 'Base Notes',
    description:
      'The foundation that lingers for 6-24 hours, base notes are rich, heavy molecules that anchor everything above. Warm woods, deep musks, amber, and resins create the lasting memory others notice long after you have left.',
    image: 'https://i.ibb.co/M5PhxzZm/image-Cap-Cut-Commerce-Pro-202502202047-1.jpg',
    accent: 'The Memory',
  },
];

export default function CreateSection() {
  const sectionRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);

  return (
    <section ref={sectionRef} className="relative section-lg overflow-hidden bg-[#0a0a0a]">
      {/* Subtle gold ambient background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 100% 60% at 50% 100%, rgba(212,175,55,0.05) 0%, transparent 60%)',
        }}
      />

      {/* Top gold rule */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      <div className="container-wide relative z-10">
        {/* Section header — left-aligned for editorial asymmetry */}
        <AnimatedSection variant="fadeInUp" className="mb-14 md:mb-20">
          <div className="max-w-2xl">
            <motion.p
              className="eyebrow text-gold-on-dark mb-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6 }}
            >
              Bespoke Perfumery
            </motion.p>
            <motion.h2
              className="font-playfair text-3xl md:text-4xl lg:text-5xl text-gradient-gold mb-5 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              Create Your Signature
            </motion.h2>
            <div className="w-12 h-px bg-gold mb-5" />
            <motion.p
              className="text-gray-400 text-base md:text-lg leading-relaxed"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              Design a perfume that&apos;s uniquely yours. Select from our premium notes and craft your personal masterpiece.
            </motion.p>
          </div>
        </AnimatedSection>

        {/* Stages — cinematic 1→2→3 reveal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0.5 md:gap-0 mb-14 md:mb-20">
          {stages.map((stage, index) => (
            <motion.div
              key={stage.title}
              initial={{ opacity: 0, clipPath: 'inset(100% 0 0 0)' }}
              whileInView={{ opacity: 1, clipPath: 'inset(0% 0 0 0)' }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{
                duration: 1,
                delay: index * 0.3,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <div className="group relative overflow-hidden bg-[#111] border border-white/5 hover:border-gold/25 transition-all duration-700 cursor-default">
                {/* Full image background with parallax */}
                <div className="relative aspect-[3/4] md:aspect-[4/5] overflow-hidden">
                  <motion.div
                    className="absolute inset-0"
                    style={{ y: reducedMotion ? 0 : bgY, scale: 1.15 }}
                  >
                    <Image
                      src={stage.image}
                      alt={stage.title}
                      fill
                      className="object-cover transition-all duration-1000 group-hover:scale-105 filter brightness-[0.80] group-hover:brightness-[1]"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </motion.div>
                  {/* Gradient from bottom */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent group-hover:via-black/10 transition-all duration-700" />

                  {/* Accent label — slide in */}
                  <motion.div
                    className="absolute top-6 left-6 z-10"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{
                      duration: 0.6,
                      delay: index * 0.3 + 0.5,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    <span className="text-[11px] sm:text-xs uppercase tracking-[0.2em] text-gold-on-dark">{stage.accent}</span>
                  </motion.div>

                  {/* Content — staggered bottom reveal */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                    <motion.h3
                      className="font-playfair text-xl md:text-2xl text-white mb-2 transition-colors duration-300 group-hover:text-gold/90"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{
                        duration: 0.6,
                        delay: index * 0.3 + 0.6,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    >
                      {stage.title}
                    </motion.h3>
                    <motion.p
                      className="text-gray-300 text-sm leading-relaxed transition-colors duration-500 group-hover:text-gray-200"
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{
                        duration: 0.6,
                        delay: index * 0.3 + 0.75,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    >
                      {stage.description}
                    </motion.p>
                  </div>
                </div>

                {/* Gold bottom line reveal on hover */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gold/0 group-hover:bg-gold/40 transition-colors duration-700" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA — centered */}
        <AnimatedSection variant="fadeInUp" delay={0.2} className="text-center">
          <Link href="/create-perfume">
            <Button size="lg" className="min-w-[200px]">
              Start Creating
            </Button>
          </Link>
        </AnimatedSection>
      </div>

      {/* Bottom gold rule */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
    </section>
  );
}
