'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import { formatPrice } from '@/lib/currency';
import { VALENTINE_GIFT_SET } from '@/lib/gift-sets';

export default function ValentineGiftSection() {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a0a0a] via-dark to-dark" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.04),transparent_70%)]" />

      <div className="container-wide relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.7 }}
            className="relative order-2 lg:order-1"
          >
            <div className="relative aspect-[4/5] max-w-md mx-auto rounded-2xl overflow-hidden">
              <Image
                src={VALENTINE_GIFT_SET.image}
                alt={VALENTINE_GIFT_SET.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
              {/* Badge overlay */}
              <div className="absolute top-5 left-5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black/60 backdrop-blur-sm border border-gold/30 rounded-full text-gold text-[10px] uppercase tracking-[0.2em] font-medium">
                  <Heart className="w-3 h-3 fill-gold" />
                  {VALENTINE_GIFT_SET.badge}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="order-1 lg:order-2 text-center lg:text-left"
          >
            <p className="text-gold/60 text-xs uppercase tracking-[0.25em] mb-4">
              {VALENTINE_GIFT_SET.badge}
            </p>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-playfair text-white mb-3">
              {VALENTINE_GIFT_SET.name}
            </h2>

            <div className="w-12 h-px bg-gold/40 mx-auto lg:mx-0 my-5" />

            <p className="text-gray-400 text-base md:text-lg leading-relaxed mb-6 max-w-lg mx-auto lg:mx-0">
              {VALENTINE_GIFT_SET.description}
            </p>

            <p className="text-2xl font-playfair text-gold mb-8">
              {formatPrice(VALENTINE_GIFT_SET.price)}
            </p>

            <Link href="/gift-set/valentine">
              <Button size="lg" className="min-w-[220px]">
                Discover the Set
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
