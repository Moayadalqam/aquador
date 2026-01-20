'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { categories } from '@/lib/products';

export default function Categories() {
  return (
    <section className="py-4 bg-dark">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <Link href={`/shop/${category.slug}`} className="group block relative h-[500px] overflow-hidden bg-dark-light">
                {/* Image */}
                <div className="absolute inset-0">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover transition-all duration-700 group-hover:scale-110 filter grayscale-[30%] brightness-75 group-hover:grayscale-0 group-hover:brightness-100"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-all duration-500 group-hover:from-black/80" />

                {/* Content */}
                <motion.div
                  className="absolute bottom-0 left-0 right-0 p-8 z-10"
                  initial={{ y: 20 }}
                  whileHover={{ y: 0 }}
                >
                  <h2 className="font-playfair text-3xl text-white mb-2">
                    {category.name}
                  </h2>
                  <p className="text-sm text-gray-300 tracking-wide mb-6 transition-all duration-500 group-hover:text-gold-light">
                    {category.description}
                  </p>
                  <motion.span
                    className="inline-flex items-center gap-2 text-white text-sm uppercase tracking-widest opacity-0 -translate-x-4 transition-all duration-500 group-hover:opacity-100 group-hover:translate-x-0"
                  >
                    Explore
                    <ArrowRight className="w-4 h-4" />
                  </motion.span>
                </motion.div>

                {/* Hover border effect */}
                <div className="absolute inset-0 border-2 border-transparent transition-all duration-500 group-hover:border-gold/30" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
