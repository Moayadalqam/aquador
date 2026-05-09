'use client';

import Script from 'next/script';
import { Star } from 'lucide-react';

const ELFSIGHT_APP_ID = 'b423096c-0a2a-40a3-8928-598832164e0c';

export default function ReviewsSlideshow() {
  return (
    <section
      aria-label="Customer reviews from Google"
      className="border-b border-[#17130d]/10 bg-[#f8f3ea]"
    >
      <div className="container-wide py-14 md:py-20">
        <div className="mx-auto mb-10 max-w-2xl text-center md:mb-12">
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
        </div>

        <div className="mx-auto max-w-6xl">
          <Script
            src="https://elfsightcdn.com/platform.js"
            strategy="lazyOnload"
          />
          <div
            className={`elfsight-app-${ELFSIGHT_APP_ID}`}
            data-elfsight-app-lazy
          />
        </div>
      </div>
    </section>
  );
}
