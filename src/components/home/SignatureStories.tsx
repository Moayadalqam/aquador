'use client';

import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion as useFMReducedMotion,
} from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

/**
 * Signature Stories — a pinned horizontal-scroll section.
 *
 * Cards are fixed-pixel width so images stay framed like editorial prints
 * rather than full-viewport billboards. The track slides by exactly the
 * measured overflow distance so the last card lines up with the right edge.
 */
const stories = [
  {
    eyebrow: 'House Collection',
    title: 'Crafted in Cyprus',
    description:
      'Every Aquad\u2019or fragrance is composed from rare raw materials, distilled slowly, and aged to reveal its quiet confidence.',
    image: '/images/aquadour1.jpg',
    accent: '#D4AF37',
    cta: { label: 'Explore the house', href: '/shop' },
  },
  {
    eyebrow: "Women's Fragrances",
    title: 'Timeless Elegance',
    description:
      'A curated library of florals, chypres and modern orientals — from quiet daytime whispers to unforgettable evening statements.',
    image: '/images/categories/women.webp',
    accent: '#E8C872',
    cta: { label: "Shop women's", href: '/shop/gender/women' },
  },
  {
    eyebrow: 'Bespoke Perfumery',
    title: 'Design Your Fragrance',
    description:
      'Choose your top, heart and base. A signature scent composed entirely around you, bottled in Cyprus and delivered to your door.',
    image: '/images/notes/top-notes.jpg',
    accent: '#F0D573',
    cta: { label: 'Create yours', href: '/create-perfume' },
  },
  {
    eyebrow: "Men's Fragrances",
    title: 'Bold Character',
    description:
      'Leather, oud, smoke and spice \u2014 scents with presence and memory, built to leave a quiet impression long after you leave the room.',
    image: '/images/categories/men.jpg',
    accent: '#C9A227',
    cta: { label: "Shop men's", href: '/shop/gender/men' },
  },
  {
    eyebrow: 'Dubai Shop',
    title: 'Rare Imports',
    description:
      'Authentic Lattafa, Al Haramain and more \u2014 sourced directly and curated by our nose in Nicosia.',
    image: '/images/categories/lattafa-original.jpeg',
    accent: '#B8941F',
    cta: { label: 'Browse Dubai', href: '/shop/lattafa' },
  },
];

// Card dimensions — fixed-pixel so framing feels editorial, not full-bleed.
const CARD_WIDTH = 360; // px
const CARD_HEIGHT = 520; // px
const CARD_GAP = 28; // px between cards
const TRACK_PADDING = 96; // px of breathing room either side

export default function SignatureStories() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useFMReducedMotion();
  const [shiftPx, setShiftPx] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  // Measure the overflow each time viewport size changes. Shift = how far the
  // track must translate so its right edge reaches the viewport's right edge.
  useEffect(() => {
    const compute = () => {
      if (!trackRef.current) return;
      const trackWidth = trackRef.current.scrollWidth;
      const viewportWidth = window.innerWidth;
      setShiftPx(Math.max(0, trackWidth - viewportWidth));
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, []);

  const x = useTransform(scrollYProgress, [0.05, 0.95], [0, -shiftPx]);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.35, 0.85, 0.35]);

  return (
    <section
      ref={sectionRef}
      aria-label="Signature stories"
      // 400vh gives the horizontal pan a comfortable scroll distance for 5 cards.
      className="relative hidden md:block h-[400vh] bg-[#0a0a0a]"
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: prefersReduced ? 0.4 : glowOpacity,
            background:
              'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(212,175,55,0.18) 0%, transparent 70%)',
          }}
          aria-hidden="true"
        />

        <motion.div
          className="absolute top-14 left-1/2 -translate-x-1/2 z-20 text-center px-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.9, ease: [0, 0, 0.2, 1] }}
        >
          <p className="eyebrow text-gold/70 mb-3">Scroll to explore</p>
          <h2
            className="font-playfair tracking-tight leading-[1.05]"
            style={{
              fontSize: 'clamp(1.75rem, 1rem + 2.4vw, 3rem)',
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

        {/* Horizontal track — fixed-pixel cards, measured shift */}
        <motion.div
          ref={trackRef}
          className="flex h-full items-center pt-44 pb-16"
          style={{
            x: prefersReduced ? 0 : x,
            width: 'max-content',
            paddingLeft: `${TRACK_PADDING}px`,
            paddingRight: `${TRACK_PADDING}px`,
            gap: `${CARD_GAP}px`,
            willChange: 'transform',
          }}
        >
          {stories.map((story, idx) => (
            <article
              key={story.title}
              className="relative flex-shrink-0 rounded-2xl overflow-hidden group bg-[#111]"
              style={{
                width: `${CARD_WIDTH}px`,
                height: `${CARD_HEIGHT}px`,
                boxShadow:
                  '0 30px 80px -30px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.05), inset 0 0 0 1px rgba(212,175,55,0.08)',
              }}
            >
              {/* Image panel — top portion of the card, contained by radius */}
              <div className="relative h-[300px] overflow-hidden">
                <motion.div
                  className="absolute inset-0"
                  initial={{ scale: 1.06 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: false, amount: 0.5 }}
                  transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Image
                    src={story.image}
                    alt={story.title}
                    fill
                    className="object-cover"
                    sizes="360px"
                    priority={idx === 0}
                  />
                </motion.div>
                {/* Soft bottom fade so the image blends into the caption area */}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#111] to-transparent" />
                {/* Hover accent glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  style={{
                    background: `radial-gradient(ellipse at 50% 80%, ${story.accent}22 0%, transparent 65%)`,
                  }}
                />
                {/* Card index — editorial touch */}
                <div className="absolute top-5 right-5 z-10">
                  <span
                    className="font-playfair italic text-white/30 text-2xl leading-none"
                  >
                    0{idx + 1}
                  </span>
                </div>
              </div>

              {/* Caption block — sits on the solid dark panel below the image */}
              <div className="relative px-7 pt-3 pb-7 flex flex-col">
                <p
                  className="text-[10px] tracking-[0.28em] uppercase font-light mb-3"
                  style={{ color: story.accent }}
                >
                  {story.eyebrow}
                </p>
                <h3 className="font-playfair text-white leading-tight mb-3 text-[22px]">
                  {story.title}
                </h3>
                <div className="w-8 h-px bg-gold/60 mb-3" />
                <p className="text-white/65 text-[13px] leading-relaxed mb-5">
                  {story.description}
                </p>
                <Link
                  href={story.cta.href}
                  className="inline-flex items-center gap-2 text-gold text-[11px] tracking-[0.2em] uppercase font-medium hover:gap-3 transition-all duration-300"
                >
                  {story.cta.label}
                  <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            </article>
          ))}
        </motion.div>

        {/* Scroll affordance hint — bottom-right */}
        <div className="absolute bottom-8 right-8 z-20 hidden lg:flex items-center gap-3 text-white/40 text-[11px] tracking-[0.24em] uppercase">
          <span>Scroll</span>
          <div className="w-10 h-px bg-white/30" />
        </div>
      </div>
    </section>
  );
}

/**
 * Mobile stack — same stories rendered as a vertical sequence so small-screen
 * users don't miss the content when horizontal scroll is disabled.
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
            className="relative rounded-2xl overflow-hidden bg-[#111]"
            style={{
              boxShadow: '0 24px 60px -24px rgba(0,0,0,0.9), inset 0 0 0 1px rgba(212,175,55,0.08)',
            }}
          >
            <div className="relative h-56 overflow-hidden">
              <Image
                src={story.image}
                alt={story.title}
                fill
                className="object-cover"
                sizes="100vw"
              />
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#111] to-transparent" />
            </div>
            <div className="px-6 py-6">
              <p
                className="text-[10px] tracking-[0.28em] uppercase font-light mb-3"
                style={{ color: story.accent }}
              >
                {story.eyebrow}
              </p>
              <h3 className="font-playfair text-white leading-tight mb-3 text-[20px]">
                {story.title}
              </h3>
              <div className="w-10 h-px bg-gold/60 mb-3" />
              <p className="text-white/70 text-sm leading-relaxed mb-5">{story.description}</p>
              <Link
                href={story.cta.href}
                className="inline-flex items-center gap-2 text-gold text-xs tracking-[0.18em] uppercase font-medium"
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
