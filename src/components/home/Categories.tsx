'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { categories } from '@/lib/products';

export default function Categories() {
  return (
    <section className="py-2 bg-gold-ambient-subtle">
      <div className="container-wide">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-0.5">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link
                href={`/shop/${category.slug}`}
                className="group block relative aspect-[3/4] md:aspect-[2/3] lg:h-[480px] overflow-hidden bg-dark-light"
              >
                {/* Image */}
                <div className="absolute inset-0">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover transition-all duration-700 group-hover:scale-105 filter grayscale-[20%] brightness-[0.7] group-hover:grayscale-0 group-hover:brightness-90"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  />
                </div>

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

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

                {/* Subtle border on hover */}
                <div className="absolute inset-0 border border-gold/0 transition-all duration-500 group-hover:border-gold/20" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
