'use client';

import Script from 'next/script';
import { motion } from 'motion/react';
import { Star } from 'lucide-react';

const ELFSIGHT_APP_ID = 'b423096c-0a2a-40a3-8928-598832164e0c';

export default function ReviewsSlideshow() {
  return (
    <section
      aria-label="Customer reviews from Google"
      className="border-b border-[#17130d]/10 bg-[#f8f3ea]"
    >
      <div className="container-wide py-14 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mb-10 max-w-2xl text-center md:mb-12"
        >
          <p className="mb-3 text-[11px] uppercase tracking-[0.32em] text-[#9c7b2c]">
            Google Reviews
          </p>
          <h2 className="font-playfair text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.1] tracking-normal text-[#17130d]">
            Loved by Cyprus
          </h2>
          <div className="mt-5 flex items-center justify-center gap-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className="h-4 w-4 fill-[#d7b45d] text-[#d7b45d]"
                strokeWidth={1.5}
              />
            ))}
            <span className="ml-2 font-playfair text-sm text-[#3b3021]">
              5.0 · verified Google reviews
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto min-h-[260px] max-w-6xl"
        >
          {/* Skeleton — visible until Elfsight platform.js renders the widget */}
          <div className="absolute inset-0 grid grid-cols-1 gap-4 md:grid-cols-3" aria-hidden="true">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="overflow-hidden border border-[#17130d]/8 bg-white/60 p-6"
              >
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((__, j) => (
                    <Star key={j} className="h-3 w-3 text-[#d7b45d]/35" strokeWidth={1.5} />
                  ))}
                </div>
                <div className="mt-4 space-y-2">
                  <div className="h-2.5 w-full animate-pulse rounded bg-[#17130d]/8" />
                  <div className="h-2.5 w-[88%] animate-pulse rounded bg-[#17130d]/8" />
                  <div className="h-2.5 w-[72%] animate-pulse rounded bg-[#17130d]/8" />
                </div>
                <div className="mt-6 h-2 w-24 animate-pulse rounded bg-[#17130d]/12" />
              </div>
            ))}
          </div>

          <Script
            src="https://elfsightcdn.com/platform.js"
            strategy="lazyOnload"
          />
          <div
            className={`relative elfsight-app-${ELFSIGHT_APP_ID}`}
            data-elfsight-app-lazy
          />
        </motion.div>
      </div>
    </section>
  );
}
