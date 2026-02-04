'use client';

import { motion } from 'framer-motion';

export default function BlogHero() {
  return (
    <section className="relative pt-32 pb-16 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-gold/5 to-transparent" />
      <div className="container-wide relative z-10">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="label-micro-gold mb-4">The Fragrance Journal</p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-playfair mb-6 text-gradient-gold">
            The Art of Scent
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
            Stories, guides, and inspiration from the world of luxury fragrance
          </p>
        </motion.div>
      </div>
    </section>
  );
}
