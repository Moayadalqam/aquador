'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

type Review = {
  name: string;
  text: string;
  rating: number;
  when: string;
};

const reviews: Review[] = [
  {
    name: 'Aleksandar Mihajlović',
    text: 'I just want to say thank you and give the biggest recognition on support, service and patience. There are no shops like this in Cyprus and it is a hidden gem for sure. Will come back for more, for sure!',
    rating: 5,
    when: 'a year ago',
  },
  {
    name: 'Nifesi-Maria Love',
    text: 'Mahmoud and Marina were extremely helpful and patient. We spent over an hour in the shop trying to find the perfect fragrance, we received the same level of service from start to finish.',
    rating: 5,
    when: 'a year ago',
  },
  {
    name: 'Andrei-Cosmin Popa',
    text: "As a fragrance enthusiast, I would say AquaD'or is the best perfumery in Cyprus in regard to the quality, perfume oils concentration, and ease of communication.",
    rating: 5,
    when: '2 years ago',
  },
  {
    name: 'Katja Frommelt',
    text: 'So in love with this shop. Friendly staff, the owner is an expert, and our perfumes are fantastic. They were created for us, what we like, what is our type. Highly recommend.',
    rating: 5,
    when: 'a year ago',
  },
  {
    name: 'Osama Alsaqqal',
    text: 'I am truly impressed with this perfume store. Their collection is exceptional, offering a wide variety of high-quality fragrances at fair prices.',
    rating: 5,
    when: '7 months ago',
  },
  {
    name: 'Ahmet Guner',
    text: 'I got Lattafa Khanjar and it is original. I also got Lattafa Atlas and they made the Atlas perfume for me, it is perfect.',
    rating: 5,
    when: '7 months ago',
  },
  {
    name: 'Joselle Smith',
    text: 'Excellent customer service. Mario helped us choose the best fragrances based on what we were looking for and was very patient. Definitely stop by their store in Nicosia.',
    rating: 5,
    when: '2 years ago',
  },
  {
    name: 'Danielle Aquila',
    text: 'Such an awesome place to stumble upon. Amazing custom scents and beautiful bottling. Everything was reasonably priced. The staff was super friendly. Highly recommend.',
    rating: 5,
    when: '2 years ago',
  },
  {
    name: 'Aileen K',
    text: 'Great place to get customised scents. You can try multiple scents made from scent profiles you like, or just from a list of branded fragrances, at a fraction of the price.',
    rating: 5,
    when: '2 years ago',
  },
  {
    name: 'Norm P.',
    text: "The staff were very helpful during our recent visit. We spent quite some time trying to find the 'perfect fragrance' and received the same level of service from start to finish. Terrific service.",
    rating: 4,
    when: '7 months ago',
  },
  {
    name: 'Dunno',
    text: 'Amazing perfume shop. They have all the French perfume oils and also Arabic style oils like different types of ouds and musks. Their prices are very decent when you consider import.',
    rating: 5,
    when: '3 years ago',
  },
  {
    name: 'Eleni Z.',
    text: 'Wonderful service and wonderful fragrances. Thank you so much for helping me find my scent.',
    rating: 5,
    when: 'a month ago',
  },
];

const ROTATE_MS = 6500;

export default function ReviewsSlideshow() {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const next = useCallback(() => setIndex((i) => (i + 1) % reviews.length), []);
  const prev = useCallback(() => setIndex((i) => (i - 1 + reviews.length) % reviews.length), []);
  const goTo = useCallback((i: number) => setIndex(i), []);

  useEffect(() => {
    if (isPaused) return;
    const id = window.setInterval(next, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [isPaused, next]);

  const review = reviews[index];

  return (
    <section
      aria-label="Customer reviews from Google"
      className="border-b border-[#17130d]/10 bg-[#f8f3ea]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container-wide py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-[auto_1fr_auto] md:items-center">
          {/* Aggregate score column */}
          <div className="flex items-center gap-5 md:flex-col md:items-start md:border-r md:border-[#17130d]/10 md:pr-10">
            <div>
              <p className="font-playfair text-5xl leading-none text-[#17130d] md:text-6xl">5.0</p>
              <div className="mt-2 flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-[#d7b45d] text-[#d7b45d]" strokeWidth={1.5} />
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-[#9c7b2c]">Google Reviews</p>
              <p className="mt-1 text-[11px] text-[#6c5735]">{reviews.length}+ verified visitors</p>
              <a
                href="https://www.google.com/search?q=Aquador+Cyprus+Nicosia+reviews"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block transition-opacity hover:opacity-80"
                aria-label="See our Google verified reviews"
              >
                <Image
                  src="/images/google-verified-reviews.png"
                  alt="Google Verified Reviews — 5 stars"
                  width={140}
                  height={70}
                  className="h-auto w-[140px]"
                />
              </a>
            </div>
          </div>

          {/* Carousel */}
          <div className="min-h-[200px] md:min-h-[170px] md:px-8">
            <AnimatePresence mode="wait">
              <motion.figure
                key={index}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="mb-3 flex items-center gap-1">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-[#d7b45d] text-[#d7b45d]" strokeWidth={1.5} />
                  ))}
                  {Array.from({ length: 5 - review.rating }).map((_, i) => (
                    <Star key={`e-${i}`} className="h-3 w-3 text-[#d7b45d]/30" strokeWidth={1.5} />
                  ))}
                </div>
                <blockquote className="font-playfair text-lg italic leading-snug text-[#3b3021] md:text-xl">
                  &ldquo;{review.text}&rdquo;
                </blockquote>
                <figcaption className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.22em] text-[#8a7044]">
                  <span className="text-[#17130d]">{review.name}</span>
                  <span aria-hidden="true">&middot;</span>
                  <span>Google Review</span>
                  <span aria-hidden="true">&middot;</span>
                  <span>{review.when}</span>
                </figcaption>
              </motion.figure>
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 md:flex-col md:gap-3 md:border-l md:border-[#17130d]/10 md:pl-10">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={prev}
                aria-label="Previous review"
                className="flex h-9 w-9 items-center justify-center border border-[#17130d]/15 text-[#17130d] transition hover:border-[#d7b45d] hover:text-[#9c7b2c]"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Next review"
                className="flex h-9 w-9 items-center justify-center border border-[#17130d]/15 text-[#17130d] transition hover:border-[#d7b45d] hover:text-[#9c7b2c]"
              >
                <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
            <div className="hidden items-center gap-1.5 md:flex" role="tablist" aria-label="Select review">
              {reviews.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Go to review ${i + 1}`}
                  onClick={() => goTo(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index ? 'w-5 bg-[#d7b45d]' : 'w-1.5 bg-[#17130d]/15 hover:bg-[#17130d]/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
