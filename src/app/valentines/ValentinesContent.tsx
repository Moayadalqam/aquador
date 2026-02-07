'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Gift, Sparkles, Shield, Truck, ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import { formatPrice } from '@/lib/currency';
import { VALENTINE_GIFT_SET } from '@/lib/gift-sets';

const curatedPicks = [
  {
    id: 'cashmere-dubai-oud-designed-by-aquad-or',
    name: 'Cashmere Dubai Oud',
    description: 'Warm oud, saffron, rose — a romantic classic',
    image: 'https://images.squarespace-cdn.com/content/v1/66901f0f8865462c0ac066ba/5fe1792c-5739-46d9-a806-34a780162d02/image_Pippit_202507021156+%2871%29.jpeg',
    price: 29.99,
  },
  {
    id: 'gold-yellow-vanilla-dubai-designed-by-aquad-or',
    name: 'Gold Yellow Vanilla Dubai',
    description: 'White oud, vanilla, amber — sweet and sensual',
    image: 'https://images.squarespace-cdn.com/content/v1/66901f0f8865462c0ac066ba/6bddd6ad-23c7-4e77-b083-4c5a8514982b/image_Pippit_202507021156+%2870%29.jpeg',
    price: 29.99,
  },
  {
    id: 'pure-musk',
    name: 'Pure Musk',
    description: 'Crisp, clean, and elegantly delicate',
    image: 'https://images.squarespace-cdn.com/content/v1/66901f0f8865462c0ac066ba/7a9e1322-8d20-42d3-97c1-e32b1938dab3/image_Pippit_202506301816+%2875%29.jfif',
    price: 29.99,
  },
  {
    id: 'sandal-musk',
    name: 'Sandal Musk',
    description: 'Soft sandalwood meets warm musk',
    image: 'https://images.squarespace-cdn.com/content/v1/66901f0f8865462c0ac066ba/8d56c3a6-bb47-4599-8bd4-9228c6f5fb4c/image_Pippit_202506100640+%282%29.jfif',
    price: 29.99,
  },
  {
    id: 'signature-designed-by-aquad-or',
    name: 'Signature',
    description: 'Bergamot, leather, oud — bold and refined',
    image: 'https://images.squarespace-cdn.com/content/v1/66901f0f8865462c0ac066ba/0f189844-f05b-4b5f-983c-dd952cc40bed/image_Pippit_202507021156+%2872%29.jpeg',
    price: 29.99,
  },
  {
    id: 'troodos-designed-by-aquad-or',
    name: 'Troodos',
    description: 'Rose, saffron, honey — inspired by Cyprus',
    image: 'https://images.squarespace-cdn.com/content/v1/66901f0f8865462c0ac066ba/22d0891f-e502-40e6-975e-3bdba9341d4f/image_Pippit_202507021156+%2864%29.jpeg',
    price: 29.99,
  },
];

const trustSignals = [
  { icon: Gift, title: 'Premium Packaging', description: 'Gift-ready presentation' },
  { icon: Truck, title: 'Free Delivery', description: 'Across Cyprus' },
  { icon: Shield, title: 'Authentic Scents', description: 'Crafted in Cyprus' },
  { icon: Sparkles, title: 'Personal Touch', description: 'Choose your own pairing' },
];

export default function ValentinesContent() {
  return (
    <main className="min-h-screen bg-dark">
      {/* Hero */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a0808] via-dark to-dark" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.06),transparent_60%)]" />

        <div className="container-wide relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-gold/60 text-xs uppercase tracking-[0.3em] mb-6">
              Aquad&apos;or Cyprus
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-playfair text-white mb-6">
              Valentine&apos;s Day Gifts
              <br />
              <span className="text-gradient-gold">in Cyprus</span>
            </h1>
            <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
              Surprise someone special with a luxury fragrance from Aquad&apos;or.
              Handcrafted in Cyprus, delivered with care.
            </p>
            <Link href="/gift-set/valentine">
              <Button size="lg" className="min-w-[240px]">
                <Heart className="w-4 h-4 mr-2 fill-current" />
                Shop the Gift Set
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Gift Set */}
      <section className="py-20 md:py-28">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <div className="relative aspect-square max-w-lg mx-auto rounded-2xl overflow-hidden">
                <Image
                  src={VALENTINE_GIFT_SET.image}
                  alt={VALENTINE_GIFT_SET.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 45vw"
                />
                <div className="absolute top-5 left-5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black/60 backdrop-blur-sm border border-gold/30 rounded-full text-gold text-[10px] uppercase tracking-[0.2em]">
                    <Heart className="w-3 h-3 fill-gold" />
                    {VALENTINE_GIFT_SET.badge}
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="space-y-6"
            >
              <p className="text-gold/60 text-xs uppercase tracking-[0.2em]">
                {VALENTINE_GIFT_SET.badge}
              </p>
              <h2 className="text-3xl md:text-4xl font-playfair text-white">
                {VALENTINE_GIFT_SET.name}
              </h2>
              <p className="text-white/80 leading-relaxed italic mb-2">
                {VALENTINE_GIFT_SET.shortDescription}
              </p>
              <p className="text-gray-400 leading-relaxed">
                {VALENTINE_GIFT_SET.description}
              </p>
              <ul className="space-y-2">
                {VALENTINE_GIFT_SET.includes.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-gray-400 text-sm">
                    <span className="w-1 h-1 rounded-full bg-gold/60" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-2xl font-playfair text-gold">
                {formatPrice(VALENTINE_GIFT_SET.price)}
              </p>
              <Link href="/gift-set/valentine">
                <Button size="lg">
                  Choose Your Pairing
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Curated Picks */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-dark via-dark-lighter/20 to-dark">
        <div className="container-wide">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-playfair text-white mb-4">
              Curated for Romance
            </h2>
            <div className="w-12 h-px bg-gold/40 mx-auto mb-4" />
            <p className="text-gray-400 max-w-lg mx-auto">
              Our most-loved fragrances, perfect for gifting this Valentine&apos;s Day.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {curatedPicks.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
              >
                <Link
                  href={`/products/${product.id}`}
                  className="group block rounded-xl overflow-hidden bg-dark-lighter border border-gold/5 hover:border-gold/20 transition-colors"
                >
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 50vw, 33vw"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-white group-hover:text-gold transition-colors mb-1 line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-500 mb-2 line-clamp-1">
                      {product.description}
                    </p>
                    <p className="text-sm font-playfair text-gold">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Create Your Own CTA */}
      <section className="py-20 md:py-24">
        <div className="container-wide">
          <motion.div
            className="text-center max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Sparkles className="w-8 h-8 text-gold/40 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-playfair text-white mb-4">
              Create Something Truly Unique
            </h2>
            <p className="text-gray-400 mb-8 leading-relaxed">
              Design a one-of-a-kind fragrance with our custom perfume builder.
              Choose your top, heart, and base notes to craft a scent as unique as your love story.
            </p>
            <Link href="/create-perfume">
              <Button variant="outline" size="lg" className="min-w-[220px]">
                Build a Custom Perfume
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="py-16 border-t border-gold/5">
        <div className="container-wide">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {trustSignals.map((signal, index) => (
              <motion.div
                key={signal.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 rounded-full border border-gold/20 bg-gold/5 flex items-center justify-center mx-auto mb-3">
                  <signal.icon className="w-5 h-5 text-gold" />
                </div>
                <h3 className="text-white text-sm font-medium mb-1">{signal.title}</h3>
                <p className="text-gray-500 text-xs">{signal.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Link */}
      <section className="py-16 border-t border-gold/5">
        <div className="container-wide text-center">
          <p className="text-gray-500 text-sm mb-3">Looking for inspiration?</p>
          <Link
            href="/blog/10-best-perfumes-gift-valentine-cyprus-2026"
            className="inline-flex items-center gap-2 text-gold hover:text-gold-light transition-colors text-sm"
          >
            10 Best Perfumes to Gift Your Valentine in Cyprus
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
