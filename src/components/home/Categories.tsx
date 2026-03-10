'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { categories } from '@/lib/categories';
import { hoverVariants, tapVariants } from '@/lib/animations/micro-interactions';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export default function Categories() {
  const reducedMotion = useReducedMotion();

  // Animation variants based on reduced motion preference
  const cardHover = reducedMotion ? { scale: 1.01 } : hoverVariants.lift;
  const cardTap = reducedMotion ? { scale: 0.98 } : tapVariants.shrink;

  return (
    <section className="py-2 bg-gold-ambient-subtle">
      <div className="container-wide">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-1">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              whileHover={cardHover}
              whileTap={cardTap}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link
                href={`/shop/${category.slug}`}
                className="group block relative aspect-[3/4] overflow-hidden bg-gray-200"
              >
                {/* Image */}
                <div className={`absolute inset-0 ${category.contain ? 'bg-[#1a1a1a]' : ''}`}>
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className={`transition-all duration-700 group-hover:scale-110 filter grayscale-[20%] brightness-[0.7] group-hover:grayscale-0 group-hover:brightness-90 ${category.contain ? 'object-contain p-6' : 'object-cover'}`}
                    sizes="(max-width: 1024px) 50vw, 25vw"
                  />
                </div>

                {/* Gradient overlay with hover enhancement */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-all duration-500 group-hover:from-black/80 group-hover:via-black/30" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 z-10">
                  <h2 className="font-playfair text-xl md:text-2xl text-white mb-1">
                    {category.name}
                  </h2>
                  <p className="text-xs text-gray-400 tracking-wide mb-4 line-clamp-2 transition-colors duration-300 group-hover:text-gray-300">
                    {category.description}
                  </p>
                  <span className="inline-flex items-center gap-2 text-gold text-[10px] uppercase tracking-[0.15em] opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                    Explore
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>

                {/* Subtle border and glow on hover */}
                <div className="absolute inset-0 border border-gold/0 transition-all duration-500 group-hover:border-gold/30 group-hover:shadow-lg group-hover:shadow-gold/10" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
