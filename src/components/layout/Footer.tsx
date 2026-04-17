'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Mail, Phone, MapPin, ArrowUpRight, Truck, ShieldCheck, Gem } from 'lucide-react';
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

export default function Footer() {
  return (
    <footer className="relative bg-[#0a0a0a]">
      {/* Top gold line */}
      <div className="h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      <AnimatedSection
        variant="stagger"
        staggerDelay={0.08}
        threshold={0.2}
        className="container-wide py-16 md:py-20"
      >
        {/* Main grid — logo left, links right */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 items-start">

          {/* Logo + tagline + brand story — compact */}
          <motion.div
            variants={fadeInUp}
            className="md:col-span-3 flex flex-col items-center md:items-start"
          >
            <Link href="/" className="inline-block mb-3">
              <Image src="/aquador.webp" alt="Aquad'or" width={160} height={48} className="h-10 md:h-12 w-auto" />
            </Link>
            <p className="text-white/40 text-xs font-playfair italic">
              Scent of Luxury
            </p>
            <p className="text-white/50 text-[13px] leading-relaxed mt-3 max-w-[240px] text-center md:text-left">
              Premium &amp; niche fragrances curated in Nicosia, Cyprus since 2018. Every scent tells a story.
            </p>
            {/* Social */}
            <div className="flex gap-4 mt-4">
              <a href="https://instagram.com/aquadorcy" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-gold transition-colors duration-200" aria-label="Instagram">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5"/>
                  <circle cx="12" cy="12" r="5"/>
                  <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/>
                </svg>
              </a>
              <a href="https://facebook.com/aquadorcy" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-gold transition-colors duration-200" aria-label="Facebook">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
            </div>
          </motion.div>

          <nav aria-label="Footer" style={{ display: 'contents' }}>
            {/* Shop links */}
            <motion.div variants={fadeInUp} className="md:col-span-2">
              <h3 className="text-[11px] uppercase tracking-[0.25em] text-gold-on-dark mb-5">Shop</h3>
              <ul className="space-y-3">
                {shopLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-white/70 hover:text-white transition-colors text-[13px]">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Company links */}
            <motion.div variants={fadeInUp} className="md:col-span-2">
              <h3 className="text-[11px] uppercase tracking-[0.25em] text-gold-on-dark mb-5">Company</h3>
              <ul className="space-y-3">
                {companyLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-white/70 hover:text-white transition-colors text-[13px]">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </nav>

          {/* Contact — compact */}
          <motion.div variants={fadeInUp} className="md:col-span-5 md:text-right">
            <h3 className="text-[11px] uppercase tracking-[0.25em] text-gold-on-dark mb-5">Contact</h3>
            <div className="space-y-3.5 text-[13px]">
              <div className="flex items-center md:justify-end gap-2 text-white/70">
                <MapPin className="w-3 h-3 text-gold-on-dark flex-shrink-0" />
                Ledra 145, Nicosia, Cyprus
              </div>
              <a href="tel:99980809" className="flex items-center md:justify-end gap-2 text-white/70 hover:text-white transition-colors">
                <Phone className="w-3 h-3 text-gold-on-dark flex-shrink-0" />
                +357 99 980809
              </a>
              <a href="mailto:info@aquadorcy.com" className="flex items-center md:justify-end gap-2 text-white/70 hover:text-white transition-colors">
                <Mail className="w-3 h-3 text-gold-on-dark flex-shrink-0" />
                info@aquadorcy.com
              </a>
            </div>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* Trust badges row */}
      <div className="py-8 border-t border-white/[0.06]">
        <div className="container-wide flex items-center justify-center gap-6">
          <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.15em] text-white/40">
            <Truck className="w-3.5 h-3.5" />
            Free Shipping
          </span>
          <span className="text-white/20" aria-hidden="true">&middot;</span>
          <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.15em] text-white/40">
            <ShieldCheck className="w-3.5 h-3.5" />
            Secure Payment
          </span>
          <span className="text-white/20" aria-hidden="true">&middot;</span>
          <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.15em] text-white/40">
            <Gem className="w-3.5 h-3.5" />
            Premium Quality
          </span>
        </div>
      </div>

      {/* Bottom bar — single row */}
      <div className="border-t border-white/[0.06]">
        <div className="container-wide py-6 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-white/50 text-[10px] tracking-[0.08em]">
            &copy; {new Date().getFullYear()} Aquad&apos;or Cyprus
          </p>
          <p className="text-white/40 text-[10px] tracking-[0.08em]">
            Designed and Developed by{' '}
            <a
              href="https://qualiasolutions.net"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-on-dark hover:text-gold transition-colors inline-flex items-center gap-0.5"
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
