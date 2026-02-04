'use client';

import { motion } from 'framer-motion';

export default function ValentineBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="valentine-banner relative z-[60] text-center py-2 px-4"
    >
      <p className="text-[11px] md:text-xs tracking-[0.2em] uppercase font-poppins">
        <span className="text-gray-400">Valentine&apos;s Season</span>
        <span className="mx-2 text-gold/40">|</span>
        <span className="text-gold/70">Gift the Art of Fragrance</span>
        <span className="mx-2 text-gold/40">&#x2764;</span>
      </p>
    </motion.div>
  );
}
