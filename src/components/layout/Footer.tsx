'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Mail, Phone, MapPin, ArrowUpRight, ShieldCheck, Gem, Truck, Clock } from 'lucide-react';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { fadeInUp } from '@/lib/animations/scroll-animations';

const shopLinks = [
  { label: 'Women', href: '/shop/gender/women' },
  { label: 'Men', href: '/shop/gender/men' },
  { label: 'Unisex', href: '/shop/gender/unisex' },
  { label: 'Lattafa Originals', href: '/shop/lattafa' },
  { label: 'Dubai Shop', href: '/shop' },
  { label: 'Create Your Fragrance', href: '/create-perfume' },
];

const companyLinks = [
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Shipping', href: '/shipping' },
  { label: 'Terms', href: '/terms' },
  { label: 'Privacy', href: '/privacy' },
];

const trustBadges = [
  { icon: ShieldCheck, label: 'Secure Payment' },
  { icon: Truck, label: 'Island-Wide Delivery' },
  { icon: Gem, label: 'Premium Quality' },
  { icon: Clock, label: 'Curated Since 2018' },
];

export default function Footer() {
  return (
    <footer className="relative bg-[#FAFAF8] text-black">
      {/* Top gold hairline */}
      <div className="h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

      <AnimatedSection
        variant="stagger"
        staggerDelay={0.08}
        threshold={0.2}
        className="container-wide py-16 md:py-20"
      >
        {/* Four-column grid — balanced, no empty gaps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-x-8 gap-y-12">

          {/* Brand column */}
          <motion.div
            variants={fadeInUp}
            className="lg:col-span-4 sm:col-span-2 flex flex-col"
          >
            <Link href="/" className="inline-block mb-4 w-fit">
              <Image
                src="/aquador.webp"
                alt="Aquad'or"
                width={160}
                height={48}
                className="h-10 md:h-11 w-auto"
              />
            </Link>
            <p className="text-gold-dark text-xs font-playfair italic tracking-wide">
              Scent of Luxury
            </p>
            <p className="text-black/65 text-[13px] leading-[1.7] mt-4 max-w-[280px]">
              Premium &amp; niche fragrances curated in Nicosia, Cyprus since 2018.
              Every scent tells a story.
            </p>

            {/* Social */}
            <div className="flex gap-3 mt-6">
              <a
                href="https://instagram.com/aquadorcy"
                target="_blank"
                rel="noopener noreferrer"
                className="group min-h-[44px] min-w-[44px] h-11 w-11 flex items-center justify-center rounded-full border border-black/10 text-black/60 hover:text-gold-dark hover:border-gold hover:bg-gold/[0.08] transition-all duration-200"
                aria-label="Instagram"
              >
                <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="5" />
                  <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
                </svg>
              </a>
              <a
                href="https://facebook.com/aquadorcy"
                target="_blank"
                rel="noopener noreferrer"
                className="group min-h-[44px] min-w-[44px] h-11 w-11 flex items-center justify-center rounded-full border border-black/10 text-black/60 hover:text-gold-dark hover:border-gold hover:bg-gold/[0.08] transition-all duration-200"
                aria-label="Facebook"
              >
                <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a
                href="mailto:info@aquadorcy.com"
                className="group min-h-[44px] min-w-[44px] h-11 w-11 flex items-center justify-center rounded-full border border-black/10 text-black/60 hover:text-gold-dark hover:border-gold hover:bg-gold/[0.08] transition-all duration-200"
                aria-label="Email"
              >
                <Mail className="w-[18px] h-[18px]" strokeWidth={1.5} />
              </a>
            </div>
          </motion.div>

          <nav aria-label="Footer" style={{ display: 'contents' }}>
            {/* Shop */}
            <motion.div variants={fadeInUp} className="lg:col-span-2">
              <h3 className="text-[11px] uppercase tracking-[0.25em] text-gold-dark mb-5 font-semibold">
                Shop
              </h3>
              <ul className="space-y-3">
                {shopLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center text-black/70 hover:text-black transition-colors text-[13px] py-0.5"
                    >
                      <span className="inline-block w-0 overflow-hidden group-hover:w-3 transition-[width] duration-200 text-gold-dark">
                        →
                      </span>
                      <span className="group-hover:translate-x-1 transition-transform duration-200">
                        {link.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Company */}
            <motion.div variants={fadeInUp} className="lg:col-span-2">
              <h3 className="text-[11px] uppercase tracking-[0.25em] text-gold-dark mb-5 font-semibold">
                Company
              </h3>
              <ul className="space-y-3">
                {companyLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center text-black/70 hover:text-black transition-colors text-[13px] py-0.5"
                    >
                      <span className="inline-block w-0 overflow-hidden group-hover:w-3 transition-[width] duration-200 text-gold-dark">
                        →
                      </span>
                      <span className="group-hover:translate-x-1 transition-transform duration-200">
                        {link.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </nav>

          {/* Contact */}
          <motion.div variants={fadeInUp} className="lg:col-span-4 sm:col-span-2">
            <h3 className="text-[11px] uppercase tracking-[0.25em] text-gold-dark mb-5 font-semibold">
              Visit &amp; Contact
            </h3>
            <ul className="space-y-4 text-[13px]">
              <li>
                <a
                  href="https://maps.google.com/?q=Ledra+145,+Nicosia,+Cyprus"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-3 text-black/75 hover:text-black transition-colors"
                >
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-black/10 text-gold-dark group-hover:border-gold group-hover:bg-gold/[0.08] transition-colors">
                    <MapPin className="w-3.5 h-3.5" strokeWidth={1.75} />
                  </span>
                  <span className="leading-[1.55] pt-1">
                    Ledra 145,<br />Nicosia, Cyprus
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+35799980809"
                  className="group flex items-center gap-3 text-black/75 hover:text-black transition-colors"
                >
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-black/10 text-gold-dark group-hover:border-gold group-hover:bg-gold/[0.08] transition-colors">
                    <Phone className="w-3.5 h-3.5" strokeWidth={1.75} />
                  </span>
                  +357 99 980 809
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@aquadorcy.com"
                  className="group flex items-center gap-3 text-black/75 hover:text-black transition-colors"
                >
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-black/10 text-gold-dark group-hover:border-gold group-hover:bg-gold/[0.08] transition-colors">
                    <Mail className="w-3.5 h-3.5" strokeWidth={1.75} />
                  </span>
                  info@aquadorcy.com
                </a>
              </li>
              <li className="pt-2">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-black/50">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/80 animate-pulse" />
                  Mon – Sat · 10:00 – 20:00
                </div>
              </li>
            </ul>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* Trust badges row */}
      <div className="border-t border-black/[0.08]">
        <div className="container-wide py-7">
          <ul className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {trustBadges.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.18em] text-black/55"
              >
                <Icon className="w-3.5 h-3.5 text-gold-dark flex-shrink-0" strokeWidth={1.75} />
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-black/[0.08]">
        <div className="container-wide py-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-black/55 text-[11px] tracking-[0.08em]">
            &copy; {new Date().getFullYear()} Aquad&apos;or Cyprus · All rights reserved
          </p>
          <p className="text-black/50 text-[11px] tracking-[0.08em]">
            Designed &amp; Developed by{' '}
            <a
              href="https://qualiasolutions.net"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-dark hover:text-gold transition-colors inline-flex items-center gap-0.5 font-medium"
            >
              Qualia Solutions
              <ArrowUpRight className="w-2.5 h-2.5" />
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
