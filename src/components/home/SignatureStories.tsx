'use client';

import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion as useFMReducedMotion,
} from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

/**
 * Signature Stories — a pinned horizontal-scroll section.
 *
 * Vertical scroll through a 500vh container translates the inner track
 * horizontally across the viewport. 5 cards, each roughly viewport-width,
 * framed in landscape with a gradient caption overlay.
 *
 * Honors `prefers-reduced-motion` by pinning the track.
 * Mobile receives a vertical stack via {@link SignatureStoriesMobile}.
 */
const stories = [
  {
    eyebrow: 'House Collection',
    title: 'Crafted in Cyprus',
    description:
      'Every Aquad\u2019or fragrance is composed from rare raw materials, distilled slowly, and aged to reveal its quiet confidence.',
    image: '/images/aquadour1.jpg',
    imagePosition: 'center 30%',
    accent: '#D4AF37',
    cta: { label: 'Explore the house', href: '/shop' },
  },
  {
    eyebrow: "Women's Fragrances",
    title: 'Timeless Elegance',
    description:
      'A curated library of florals, chypres and modern orientals \u2014 from quiet daytime whispers to unforgettable evening statements.',
    image: '/images/categories/women.webp',
    imagePosition: 'center',
    accent: '#E8C872',
    cta: { label: "Shop women's", href: '/shop/gender/women' },
  },
  {
    eyebrow: 'Bespoke Perfumery',
    title: 'Design Your Fragrance',
    description:
      'Choose your top, heart and base. A signature scent composed entirely around you, bottled in Cyprus and delivered to your door.',
    image: '/images/notes/middle-notes.jpg',
    imagePosition: 'center',
    accent: '#F0D573',
    cta: { label: 'Create yours', href: '/create-perfume' },
  },
  {
    eyebrow: "Men's Fragrances",
    title: 'Bold Character',
    description:
      'Leather, oud, smoke and spice \u2014 scents with presence and memory, built to leave a quiet impression long after you leave the room.',
    image: '/images/categories/men.jpg',
    imagePosition: 'center',
    accent: '#C9A227',
    cta: { label: "Shop men's", href: '/shop/gender/men' },
  },
  {
    eyebrow: 'Dubai Shop',
    title: 'Rare Imports',
    description:
      'Authentic Lattafa, Al Haramain and more \u2014 sourced directly and curated by our nose in Nicosia.',
    image: '/images/categories/niche.jpg',
    imagePosition: 'center',
    accent: '#B8941F',
    cta: { label: 'Browse Dubai', href: '/shop/lattafa' },
  },
];

export default function SignatureStories() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useFMReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  // 5 cards → track width 500% of viewport → pan from 0 to -(n-1)/n = -80%.
  const shift = useTransform(scrollYProgress, [0.05, 0.95], ['0%', '-80%']);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.35, 0.85, 0.35]);

  return (
    <section
      ref={sectionRef}
      aria-label="Signature stories"
      // 500vh gives a comfortable horizontal pan for 5 cards.
      className="relative hidden md:block h-[500vh] bg-[#0a0a0a]"
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Ambient gold glow */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: prefersReduced ? 0.4 : glowOpacity,
            background:
              'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(212,175,55,0.18) 0%, transparent 70%)',
          }}
          aria-hidden="true"
        />

        {/* Section header */}
        <motion.div
          className="absolute top-16 left-1/2 -translate-x-1/2 z-20 text-center px-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.9, ease: [0, 0, 0.2, 1] }}
        >
          <p className="eyebrow text-gold/70 mb-3">Scroll to explore</p>
          <h2
            className="font-playfair tracking-tight leading-[1.05]"
            style={{
              fontSize: 'clamp(2rem, 1rem + 3vw, 3.5rem)',
              background:
                'linear-gradient(135deg, #FFF8DC 0%, #FFD700 40%, #D4AF37 70%, #B8941F 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 2px 40px rgba(212,175,55,0.25))',
            }}
          >
            Signature Stories
          </h2>
        </motion.div>

        {/* Horizontal track — track is 500% of viewport, each card is 20% of track */}
        <motion.div
          className="flex h-full items-center gap-8 lg:gap-12 px-[5vw] pt-40 pb-16"
          style={{
            x: prefersReduced ? '0%' : shift,
            width: '500%',
            willChange: 'transform',
          }}
        >
          {stories.map((story, idx) => (
            <article
              key={story.title}
              // Each card ≈ viewport width minus gap. 20% of 500vw track = 100vw per card.
              className="relative flex-shrink-0 w-[calc(20%-3rem)] h-[72vh] rounded-2xl overflow-hidden group"
              style={{
                boxShadow:
                  '0 40px 120px -40px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.04), inset 0 0 0 1px rgba(212,175,55,0.08)',
              }}
            >
              {/* Landscape background image */}
              <motion.div
                className="absolute inset-0"
                initial={{ scale: 1.08 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: false, amount: 0.5 }}
                transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
              >
                <Image
                  src={story.image}
                  alt={story.title}
                  fill
                  className="object-cover"
                  style={{ objectPosition: story.imagePosition }}
                  sizes="100vw"
                  priority={idx === 0}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/10" />
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  style={{
                    background: `radial-gradient(ellipse at 40% 70%, ${story.accent}1F 0%, transparent 65%)`,
                  }}
                />
              </motion.div>

              {/* Caption — editorial bottom-left, max-width so it reads like a poster */}
              <div className="relative z-10 h-full flex flex-col justify-end p-10 lg:p-14">
                <p
                  className="text-[11px] lg:text-xs tracking-[0.28em] uppercase font-light mb-5"
                  style={{ color: story.accent }}
                >
                  {story.eyebrow}
                </p>
                <h3
                  className="font-playfair text-white leading-[1.05] mb-5"
                  style={{ fontSize: 'clamp(2rem, 1.25rem + 2vw, 3.25rem)' }}
                >
                  {story.title}
                </h3>
                <div className="w-12 h-px bg-gold/60 mb-5" />
                <p className="text-white/75 text-sm lg:text-base leading-relaxed max-w-[42ch] mb-8">
                  {story.description}
                </p>
                <Link
                  href={story.cta.href}
                  className="inline-flex items-center gap-2 text-gold text-sm tracking-[0.2em] uppercase font-medium hover:gap-3 transition-all duration-300 w-fit"
                >
                  {story.cta.label}
                  <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>

              {/* Card index */}
              <div className="absolute top-8 right-10 z-10">
                <span
                  className="font-playfair italic text-white/25"
                  style={{ fontSize: 'clamp(1.75rem, 1rem + 1vw, 2.5rem)' }}
                >
                  0{idx + 1}
                </span>
              </div>
            </article>
          ))}
        </motion.div>

        {/* Scroll affordance hint */}
        <div className="absolute bottom-8 right-8 z-20 hidden lg:flex items-center gap-3 text-white/40 text-[11px] tracking-[0.24em] uppercase">
          <span>Scroll</span>
          <div className="w-10 h-px bg-white/30" />
        </div>
      </div>
    </section>
  );
}

/**
 * Mobile stack — vertical sequence for small screens.
 */
export function SignatureStoriesMobile() {
  return (
    <section
      aria-label="Signature stories"
      className="relative md:hidden bg-[#0a0a0a] py-16 overflow-hidden"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% 30%, rgba(212,175,55,0.12) 0%, transparent 70%)',
        }}
      />
      <div className="relative z-10 px-6 text-center mb-10">
        <p className="eyebrow text-gold/70 mb-3">Scroll to explore</p>
        <h2
          className="font-playfair tracking-tight leading-[1.1]"
          style={{
            fontSize: 'clamp(1.75rem, 1rem + 3vw, 2.5rem)',
            background: 'linear-gradient(135deg, #FFF8DC 0%, #FFD700 40%, #D4AF37 70%, #B8941F 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Signature Stories
        </h2>
      </div>

      <div className="relative z-10 flex flex-col gap-6 px-4">
        {stories.map((story, idx) => (
          <motion.article
            key={story.title}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.8, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="relative rounded-2xl overflow-hidden h-[62vh] min-h-[440px]"
            style={{
              boxShadow: '0 24px 60px -24px rgba(0,0,0,0.9), inset 0 0 0 1px rgba(212,175,55,0.08)',
            }}
          >
            <Image
              src={story.image}
              alt={story.title}
              fill
              className="object-cover"
              style={{ objectPosition: story.imagePosition }}
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            <div className="relative z-10 h-full flex flex-col justify-end p-8">
              <p
                className="text-[10px] tracking-[0.28em] uppercase font-light mb-3"
                style={{ color: story.accent }}
              >
                {story.eyebrow}
              </p>
              <h3
                className="font-playfair text-white leading-tight mb-3"
                style={{ fontSize: 'clamp(1.75rem, 1rem + 1vw, 2.25rem)' }}
              >
                {story.title}
              </h3>
              <div className="w-10 h-px bg-gold/60 mb-3" />
              <p className="text-white/75 text-sm leading-relaxed mb-5 max-w-[36ch]">
                {story.description}
              </p>
              <Link
                href={story.cta.href}
                className="inline-flex items-center gap-2 text-gold text-xs tracking-[0.2em] uppercase font-medium w-fit"
              >
                {story.cta.label}
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
