'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { focusRingLinkLight } from '@/lib/ui/focus';

const houses = [
  {
    name: 'Al Haramain',
    blurb: 'Heritage Arabian oud houses since 1970.',
    href: '/shop/al-haramain-originals',
  },
  {
    name: 'Xerjoff',
    blurb: 'Torino meets Dubai — haute parfumerie.',
    href: '/shop?brand=xerjoff',
  },
  {
    name: 'Niche Collection',
    blurb: 'Hand-picked, small-batch scents.',
    href: '/shop/niche',
  },
];

export default function CuratedHousesStrip() {
  return (
    <section className="container-wide py-8 md:py-12">
      <div className="grid gap-4 md:grid-cols-3 md:gap-6">
        {houses.map((h, i) => (
          <motion.div
            key={h.name}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: i * 0.08, duration: 0.5, ease: [0, 0, 0.2, 1] }}
          >
            <Link
              href={h.href}
              className={`group block rounded-lg border border-gold/15 bg-[#111111] p-6 md:p-7 transition-colors duration-200 hover:border-gold/60 ${focusRingLinkLight}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-playfair text-[22px] md:text-[24px] leading-tight text-gold">
                    {h.name}
                  </h3>
                  <p className="mt-2 text-[13px] md:text-[14px] text-white/70 leading-relaxed">
                    {h.blurb}
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-gold/60 group-hover:text-gold group-hover:translate-x-0.5 transition-all duration-200 shrink-0 mt-1" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
