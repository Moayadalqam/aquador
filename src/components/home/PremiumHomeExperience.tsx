'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { ArrowRight, Gem, Sparkles, Truck } from 'lucide-react';
import { useRef, useState } from 'react';
import Button from '@/components/ui/Button';
import { categories } from '@/lib/categories';
import { formatPrice } from '@/lib/utils';
import type { LegacyProduct } from '@/types';
import ReviewsSlideshow from '@/components/home/ReviewsSlideshow';

const FALLBACK_IMAGE = '/placeholder-product.svg';

const editorialStories = [
  {
    eyebrow: 'House Collection',
    title: 'Crafted in Cyprus',
    description:
      "Every Aquad'or fragrance is composed from rare raw materials, distilled slowly, and aged to reveal its quiet confidence.",
    image: '/images/aquadour1.jpg',
    href: '/shop',
    cta: 'Explore the house',
  },
  {
    eyebrow: "Women's Fragrances",
    title: 'Timeless Elegance',
    description:
      'A curated library of florals, chypres and modern orientals - from quiet daytime whispers to unforgettable evening statements.',
    image: '/images/categories/women.webp',
    href: '/shop/gender/women',
    cta: "Shop women's",
  },
  {
    eyebrow: 'Dubai Shop',
    title: 'Rare Imports',
    description:
      'Authentic Lattafa, Al Haramain and more - sourced directly and curated by our nose in Nicosia.',
    image: '/images/categories/niche.jpg',
    href: '/shop/lattafa',
    cta: 'Browse Dubai',
  },
];

const bespokeNotes = [
  {
    title: 'Top Notes',
    label: 'The Opening',
    description:
      'The first impression of a fragrance, top notes are light, volatile molecules that evaporate within 15-30 minutes.',
    image: '/images/notes/top-notes.jpg',
  },
  {
    title: 'Middle Notes',
    label: 'The Character',
    description:
      'Emerging as top notes fade, the heart reveals itself over 1-4 hours and forms the true character of the fragrance.',
    image: '/images/notes/middle-notes.jpg',
  },
  {
    title: 'Base Notes',
    label: 'The Memory',
    description:
      'The foundation that lingers for 6-24 hours, warm woods, deep musks, amber, and resins create the lasting memory.',
    image: '/images/notes/base-notes.jpg',
  },
];

interface PremiumHomeExperienceProps {
  aquadorProducts: LegacyProduct[];
  lattafaProducts: LegacyProduct[];
}

export default function PremiumHomeExperience({
  aquadorProducts,
  lattafaProducts,
}: PremiumHomeExperienceProps) {
  return (
    <div className="bg-[#f8f3ea] text-[#17130d]">
      <EditorialHero />
      <ReviewsSlideshow />
      <StoryGallery />
      <CollectionMap />
      <BespokeSection />
      <ProductShelf
        products={aquadorProducts}
        eyebrow="House Collection"
        title="Featured Aquad'or Perfumes"
        subtitle="Our signature collection, crafted exclusively for Aquad'or."
      />
      <ProductShelf
        products={lattafaProducts}
        eyebrow="Lattafa Collection"
        title="Best-Selling Lattafa Originals"
        subtitle="Authentic Lattafa perfumes, curated and imported directly."
        tone="warm"
      />
    </div>
  );
}

function EditorialHero() {
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const [videoError, setVideoError] = useState(false);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', prefersReducedMotion ? '0%' : '8%']);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100svh] overflow-hidden border-b border-[#2a2115]/10 bg-[#17130d] text-[#f8f3ea]"
    >
      <div className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(90deg,rgba(248,243,234,.08)_1px,transparent_1px),linear-gradient(0deg,rgba(248,243,234,.06)_1px,transparent_1px)] [background-size:72px_72px]" />
      <div className="container-wide relative z-10 grid min-h-[100svh] items-center gap-10 pt-28 pb-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(560px,1.1fr)] lg:pt-32">
        <div className="max-w-[700px]">
          <p className="mb-5 text-[11px] font-light uppercase tracking-[0.34em] text-[#d7b45d]">
            Scent of Luxury
          </p>
          <h1 className="max-w-[720px] font-playfair text-[clamp(3.8rem,9vw,7.6rem)] leading-[0.86] tracking-normal text-[#fff9eb]">
            AQUAD&apos;OR
          </h1>
          <div className="mt-8 flex items-center gap-4">
            <span className="h-px w-16 bg-[#d7b45d]" />
            <span className="text-[11px] uppercase tracking-[0.24em] text-[#fff9eb]/55">
              Cyprus
            </span>
          </div>
          <p className="mt-8 max-w-[560px] text-base leading-[1.8] text-[#fff9eb]/72 md:text-lg">
            From Dubai to Cyprus. Premium &amp; niche fragrances, sourced direct and curated in
            Nicosia, or design your own signature scent at Aquad&apos;or.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href="/shop">
              <Button size="lg" className="w-full min-w-[190px] rounded-none bg-[#d7b45d] shadow-none hover:bg-[#f1d27a] sm:w-auto">
                Shop Now
              </Button>
            </Link>
            <Link href="/create-perfume">
              <Button
                variant="outline"
                size="lg"
                className="w-full min-w-[220px] rounded-none border-[#d7b45d]/70 text-[#f8f3ea] hover:bg-[#f8f3ea] hover:text-[#17130d] sm:w-auto"
              >
                Design Your Fragrance
              </Button>
            </Link>
          </div>
          <p className="mt-6 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-[#fff9eb]/65">
            <Truck className="h-3.5 w-3.5 text-[#d7b45d]" strokeWidth={1.5} />
            Free delivery in Cyprus on orders over &euro;35
          </p>
        </div>

        <motion.div
          style={{ y: imageY }}
          className="relative min-h-[520px] lg:min-h-[680px]"
        >
          <div className="absolute left-[8%] top-[4%] h-[76%] w-[76%] overflow-hidden border border-[#d7b45d]/25 bg-[#0e0b08] shadow-[0_40px_120px_rgba(0,0,0,.35)]">
            {!videoError ? (
              <video
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                poster="/images/aquadour1.jpg"
                onError={() => setVideoError(true)}
                className="h-full w-full object-cover opacity-90"
              >
                <source src="/media/hero-luxury.mp4" type="video/mp4" />
              </video>
            ) : (
              <Image
                src="/images/aquadour1.jpg"
                alt="Aquad'or perfume"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 90vw, 55vw"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#17130d]/75 via-transparent to-transparent" />
          </div>

          <div className="absolute bottom-[6%] right-0 w-[52%] border border-[#f8f3ea]/16 bg-[#f8f3ea] p-3 text-[#17130d] shadow-[0_28px_80px_rgba(0,0,0,.38)]">
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src="/images/493666209_1238713934924382_3231813128284470929_n.jpg"
                alt="Aquad'or fragrance display"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 50vw, 28vw"
              />
            </div>
            <div className="flex items-center justify-between gap-4 px-1 pt-3 text-[10px] uppercase tracking-[0.22em] text-[#6c5735]">
              <span>Ledras 145</span>
              <span>Nicosia</span>
            </div>
          </div>

          <div className="absolute right-[10%] top-[1%] hidden w-[200px] border border-[#d7b45d]/25 bg-[#17130d]/82 px-5 py-5 backdrop-blur md:block">
            <div className="flex items-center gap-2 text-[#d7b45d]">
              <Gem className="h-4 w-4" strokeWidth={1.5} />
              <span className="text-[10px] uppercase tracking-[0.22em]">Since 2018</span>
            </div>
            <p className="mt-3 font-playfair text-2xl leading-tight text-[#fff9eb]">From Dubai<br />to Cyprus</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function StoryGallery() {
  return (
    <section className="overflow-hidden bg-[#f0e6d6] py-16 md:py-24">
      <div className="container-wide">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-[11px] uppercase tracking-[0.32em] text-[#9c7b2c]">Signature Stories</p>
          <h2 className="font-playfair text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.05] tracking-normal text-[#17130d]">
            Luxury in every drop.
          </h2>
          <div className="mx-auto mt-6 h-px w-12 bg-[#d7b45d]" />
          <p className="mx-auto mt-6 max-w-[620px] text-base leading-[1.8] text-[#4b3d2b] md:text-lg">
            House-crafted scents, women&apos;s and men&apos;s fragrances, bespoke perfumery, and
            rare Dubai imports — gathered in one Nicosia atelier.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3 lg:mt-14">
          {editorialStories.map((story) => (
            <article
              key={story.title}
              className="group relative min-h-[480px] overflow-hidden border border-[#17130d]/10 bg-[#17130d]"
            >
              <Image
                src={story.image}
                alt={story.title}
                fill
                className="object-cover opacity-80 transition duration-700 group-hover:scale-[1.04] group-hover:opacity-95"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#17130d] via-[#17130d]/38 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-7 md:p-8">
                <p className="mb-4 text-[10px] uppercase tracking-[0.28em] text-[#d7b45d]">{story.eyebrow}</p>
                <h3 className="font-playfair text-3xl leading-tight tracking-normal text-[#fff9eb]">{story.title}</h3>
                <p className="mt-4 text-sm leading-[1.75] text-[#fff9eb]/72">{story.description}</p>
                <Link
                  href={story.href}
                  className="mt-7 inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-[#d7b45d] transition group-hover:gap-4"
                >
                  {story.cta}
                  <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function CollectionMap() {
  const [active, setActive] = useState(categories[0]);

  return (
    <section className="bg-[#17130d] py-20 text-[#f8f3ea] md:py-28">
      <div className="container-wide grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="mb-4 text-[11px] uppercase tracking-[0.32em] text-[#d7b45d]">Collections</p>
          <h2 className="font-playfair text-[clamp(2.6rem,7vw,6.2rem)] leading-[0.92] tracking-normal text-[#fff9eb]">
            Shop by character, origin, and mood.
          </h2>
          <p className="mt-8 max-w-[560px] text-base leading-[1.85] text-[#fff9eb]/68">
            Explore women&apos;s, men&apos;s, niche, Lattafa Originals, and Al Haramain Originals
            from the current Aquad&apos;or catalogue.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
          <nav className="grid gap-2 sm:grid-cols-2 lg:flex lg:flex-col" aria-label="Featured collections">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/shop/${category.slug}`}
                onMouseEnter={() => setActive(category)}
                onFocus={() => setActive(category)}
                className={`border px-5 py-4 text-left transition duration-300 ${
                  active.id === category.id
                    ? 'border-[#d7b45d] bg-[#d7b45d] text-[#17130d]'
                    : 'border-[#fff9eb]/12 text-[#fff9eb]/72 hover:border-[#d7b45d]/60 hover:text-[#fff9eb]'
                }`}
              >
                <span className="block font-playfair text-xl leading-tight tracking-normal">{category.name}</span>
                <span className="mt-2 block text-[10px] uppercase tracking-[0.18em] opacity-70">
                  {category.description}
                </span>
              </Link>
            ))}
          </nav>

          <motion.div
            key={active.id}
            initial={{ opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="relative min-h-[520px] overflow-hidden border border-[#fff9eb]/12"
          >
            <Image
              src={active.image}
              alt={active.name}
              fill
              className={`${active.contain ? 'object-contain p-12' : 'object-cover'} opacity-90`}
              sizes="(max-width: 1024px) 100vw, 55vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#17130d]/85 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 max-w-[520px] p-7 md:p-10">
              <p className="mb-3 text-[10px] uppercase tracking-[0.28em] text-[#d7b45d]">Selected Collection</p>
              <h3 className="font-playfair text-4xl leading-tight tracking-normal text-[#fff9eb]">{active.name}</h3>
              <p className="mt-3 text-sm leading-[1.75] text-[#fff9eb]/68">{active.description}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function BespokeSection() {
  return (
    <section className="overflow-hidden bg-[#f8f3ea] py-20 md:py-28">
      <div className="container-wide">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <p className="mb-4 text-[11px] uppercase tracking-[0.32em] text-[#9c7b2c]">Bespoke Perfumery</p>
            <h2 className="font-playfair text-[clamp(2.8rem,7vw,6.5rem)] leading-[0.9] tracking-normal text-[#17130d]">
              Create Your Signature
            </h2>
            <p className="mt-8 max-w-[540px] text-base leading-[1.85] text-[#4b3d2b]">
              Design a perfume that&apos;s uniquely yours. Select from our premium notes and craft
              your personal masterpiece.
            </p>
            <Link href="/create-perfume" className="mt-9 inline-flex">
              <Button size="lg" className="rounded-none bg-[#17130d] text-[#f8f3ea] shadow-none hover:bg-[#2a2115]">
                Start Creating
              </Button>
            </Link>
          </div>

          <div className="space-y-5">
            {bespokeNotes.map((note, index) => (
              <article
                key={note.title}
                className="group grid overflow-hidden border border-[#17130d]/10 bg-[#fffaf1] md:grid-cols-[240px_1fr]"
              >
                <div className="relative min-h-[240px] overflow-hidden">
                  <Image
                    src={note.image}
                    alt={note.title}
                    fill
                    className="object-cover transition duration-700 group-hover:scale-[1.05]"
                    sizes="(max-width: 768px) 100vw, 240px"
                  />
                </div>
                <div className="flex flex-col justify-between p-7 md:p-8">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-[#9c7b2c]">{note.label}</p>
                    <span className="font-playfair text-3xl italic text-[#17130d]/18">0{index + 1}</span>
                  </div>
                  <div className="mt-10">
                    <h3 className="font-playfair text-3xl tracking-normal text-[#17130d]">{note.title}</h3>
                    <p className="mt-4 max-w-[560px] text-sm leading-[1.8] text-[#4b3d2b]">{note.description}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductShelf({
  products,
  eyebrow,
  title,
  subtitle,
  tone = 'light',
}: {
  products: LegacyProduct[];
  eyebrow: string;
  title: string;
  subtitle: string;
  tone?: 'light' | 'warm';
}) {
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const isWarm = tone === 'warm';

  const handleImageError = (id: string) => {
    setFailedImages((current) => {
      const next = new Set(current);
      next.add(id);
      return next;
    });
  };

  return (
    <section className={`${isWarm ? 'bg-[#efe1ca]' : 'bg-[#fffaf1]'} py-20 md:py-28`}>
      <div className="container-wide">
        <div className="mb-12 grid gap-6 md:grid-cols-[minmax(0,0.9fr)_minmax(260px,0.55fr)] md:items-end">
          <div>
            <p className="mb-4 text-[11px] uppercase tracking-[0.32em] text-[#9c7b2c]">{eyebrow}</p>
            <h2 className="max-w-[880px] font-playfair text-[clamp(2.3rem,5vw,4.8rem)] leading-[0.96] tracking-normal text-[#17130d]">
              {title}
            </h2>
          </div>
          <p className="text-sm leading-[1.75] text-[#5c4a33] md:text-base">{subtitle}</p>
        </div>

        {products.length === 0 ? (
          <div className="border-y border-[#17130d]/10 py-14">
            <p className="font-playfair text-2xl text-[#17130d]">Our collection is being refreshed.</p>
            <Link
              href="/shop"
              className="mt-5 inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-[#9c7b2c]"
            >
              Browse the full shop
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-6">
            {products.map((product, index) => (
              <div
                key={product.id}
              >
                <Link href={`/products/${product.id}`} className="group block">
                  <div className="relative aspect-[4/5] overflow-hidden border border-[#17130d]/10 bg-[#f4eadb]">
                    <Image
                      src={failedImages.has(product.id) ? FALLBACK_IMAGE : product.image || FALLBACK_IMAGE}
                      alt={product.name}
                      fill
                      priority={index < 3}
                      onError={() => handleImageError(product.id)}
                      className="object-cover transition duration-700 group-hover:scale-[1.055]"
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 17vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#17130d]/18 to-transparent opacity-0 transition group-hover:opacity-100" />
                    {product.salePrice && (
                      <span className="absolute left-3 top-3 bg-[#17130d] px-2.5 py-1 text-[9px] uppercase tracking-[0.16em] text-[#f8f3ea]">
                        Sale
                      </span>
                    )}
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-[#9c7b2c]">
                      <Sparkles className="h-3 w-3" strokeWidth={1.5} />
                      <span>{product.brand || product.productType}</span>
                    </div>
                    <h3 className="mt-2 font-playfair text-lg leading-tight tracking-normal text-[#17130d] transition group-hover:text-[#9c7b2c]">
                      {product.name}
                    </h3>
                    <div className="mt-3 flex items-baseline justify-between gap-3 border-t border-[#17130d]/10 pt-3">
                      <span className="font-playfair text-lg text-[#17130d]">
                        {formatPrice(product.salePrice ?? product.price)}
                      </span>
                      {product.size && (
                        <span className="text-[10px] uppercase tracking-[0.16em] text-[#6c5735]/75">{product.size}</span>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
