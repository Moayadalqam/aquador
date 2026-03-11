'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { categories } from '@/lib/categories';
import { hoverVariants, tapVariants } from '@/lib/animations/micro-interactions';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { AnimatedSection, AnimatedSectionItem } from '@/components/ui/AnimatedSection';
import { useRef } from 'react';

// Balanced editorial layout:
//  Desktop: feature (left, tall) + 2x2 grid (right) — all tiles visible, capped at ~90vh
//  Tablet: 2-col grid
//  Mobile: 2x2 compact grid

export default function Categories() {
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  // Parallax offsets for category images — subtle depth
  const y1 = useTransform(scrollYProgress, [0, 1], ['-5%', '5%']);
  const y2 = useTransform(scrollYProgress, [0, 1], ['-3%', '3%']);

  const cardHover = reducedMotion ? { scale: 1.01 } : hoverVariants.lift;
  const cardTap = reducedMotion ? { scale: 0.98 } : tapVariants.shrink;

  const [feature, ...rest] = categories;

  return (
    <section ref={sectionRef} className="bg-gold-ambient-subtle overflow-hidden">
      <div className="py-0">
        <AnimatedSection variant="stagger" staggerDelay={0.08}>
          {/* Desktop: feature left + 2x2 right grid, capped at 90vh */}
          <div
            className="hidden md:grid gap-1"
            style={{
              gridTemplateColumns: '1fr 1fr',
              maxHeight: '90vh',
              height: 'clamp(500px, 75vh, 850px)',
            }}
          >
            {/* Feature tile — left half, full height */}
            <AnimatedSectionItem>
              <motion.div
                whileHover={cardHover}
                whileTap={cardTap}
                className="h-full"
              >
                <Link
                  href={`/shop/${feature.slug}`}
                  className="group block relative overflow-hidden bg-gray-200 h-full"
                >
                  <motion.div
                    className={`absolute inset-0 ${feature.contain ? 'bg-[#1a1a1a]' : ''}`}
                    style={{ y: reducedMotion ? 0 : y1 }}
                  >
                    <Image
                      src={feature.image}
                      alt={feature.name}
                      fill
                      className={`transition-all duration-1000 group-hover:scale-105 filter grayscale-[15%] brightness-[0.65] group-hover:grayscale-0 group-hover:brightness-80 ${feature.contain ? 'object-contain p-10' : 'object-cover'}`}
                      sizes="(max-width: 1024px) 50vw, 50vw"
                      priority
                    />
                  </motion.div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent transition-all duration-700 group-hover:from-black/75" />

                  {/* Editorial label top */}
                  <div className="absolute top-6 left-6 z-10">
                    <span className="text-[9px] uppercase tracking-[0.25em] text-gold/60 font-light">Featured</span>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-7 md:p-8 z-10">
                    <h3 className="font-playfair text-2xl md:text-3xl lg:text-4xl text-white mb-2 leading-tight">
                      {feature.name}
                    </h3>
                    <p className="text-xs text-gray-400 tracking-wide mb-6 transition-colors duration-300 group-hover:text-gray-300">
                      {feature.description}
                    </p>
                    <span className="inline-flex items-center gap-2.5 text-gold text-[10px] uppercase tracking-[0.2em] border-b border-gold/0 group-hover:border-gold/40 pb-1 transition-all duration-500">
                      Explore Collection
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </div>
                  <div className="absolute inset-0 border border-gold/0 transition-all duration-700 group-hover:border-gold/20" />
                </Link>
              </motion.div>
            </AnimatedSectionItem>

            {/* Right half — 2x2 sub-grid for 3 tiles (last spans 2 cols) */}
            <div className="grid grid-cols-2 grid-rows-2 gap-1 h-full">
              {rest.map((category, index) => (
                <AnimatedSectionItem
                  key={category.id}
                  className={index === rest.length - 1 && rest.length % 2 !== 0 ? 'col-span-2' : ''}
                >
                  <motion.div
                    whileHover={cardHover}
                    whileTap={cardTap}
                    className="h-full"
                  >
                    <Link
                      href={`/shop/${category.slug}`}
                      className="group block relative overflow-hidden bg-gray-200 h-full"
                    >
                      <motion.div
                        className={`absolute inset-0 ${category.contain ? 'bg-[#1a1a1a]' : ''}`}
                        style={{ y: reducedMotion ? 0 : y2 }}
                      >
                        <Image
                          src={category.image}
                          alt={category.name}
                          fill
                          className={`transition-all duration-700 group-hover:scale-108 filter grayscale-[20%] brightness-[0.65] group-hover:grayscale-0 group-hover:brightness-80 ${category.contain ? 'object-contain p-6' : 'object-cover'}`}
                          sizes="(max-width: 1024px) 50vw, 25vw"
                        />
                      </motion.div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent transition-all duration-500 group-hover:from-black/75" />

                      <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 z-10">
                        <h3 className="font-playfair text-lg md:text-xl text-white mb-1">
                          {category.name}
                        </h3>
                        <p className="text-[11px] text-gray-400 tracking-wide mb-3 transition-colors duration-300 group-hover:text-gray-300 line-clamp-1">
                          {category.description}
                        </p>
                        <span className="inline-flex items-center gap-2 text-gold text-[9px] uppercase tracking-[0.15em] opacity-50 md:opacity-0 md:-translate-x-1 transition-all duration-300 md:group-hover:opacity-100 md:group-hover:translate-x-0">
                          Explore
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                      <div className="absolute inset-0 border border-gold/0 transition-all duration-500 group-hover:border-gold/25" />
                    </Link>
                  </motion.div>
                </AnimatedSectionItem>
              ))}
            </div>
          </div>

          {/* Mobile: 2x2 compact grid */}
          <div className="md:hidden grid grid-cols-2 gap-0.5">
            {categories.map((category) => (
              <AnimatedSectionItem key={category.id}>
                <motion.div whileHover={cardHover} whileTap={cardTap}>
                  <Link
                    href={`/shop/${category.slug}`}
                    className="group block relative aspect-[3/4] overflow-hidden bg-gray-200"
                  >
                    <div className={`absolute inset-0 ${category.contain ? 'bg-[#1a1a1a]' : ''}`}>
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        className={`transition-all duration-700 group-hover:scale-110 filter grayscale-[20%] brightness-[0.65] group-hover:brightness-80 ${category.contain ? 'object-contain p-6' : 'object-cover'}`}
                        sizes="50vw"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                      <h3 className="font-playfair text-base text-white mb-0.5 line-clamp-1">
                        {category.name}
                      </h3>
                      <p className="text-[10px] text-gray-400 tracking-wide line-clamp-1">
                        {category.description}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              </AnimatedSectionItem>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
