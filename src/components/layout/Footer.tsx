'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, ArrowUpRight } from 'lucide-react';

const shopLinks = [
  { label: "Women's", href: '/shop/women' },
  { label: "Men's", href: '/shop/men' },
  { label: 'Niche', href: '/shop/niche' },
  { label: 'Create Your Own', href: '/create-perfume' },
];

const companyLinks = [
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog' },
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

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="container-wide py-12 md:py-14"
      >
        {/* Main grid — logo left, links right */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-6 items-start">

          {/* Logo + tagline — compact */}
          <div className="md:col-span-3 flex flex-col items-center md:items-start">
            <Link href="/" className="inline-block mb-3">
              <Image
                src="/aquador.webp"
                alt="Aquad'or"
                width={400}
                height={120}
                className="h-16 md:h-20 w-auto object-contain"
              />
            </Link>
            <p className="text-white/40 text-xs font-playfair italic">
              Where Luxury Meets Distinction
            </p>
            {/* Social */}
            <div className="flex gap-3 mt-4">
              <a href="https://instagram.com/aquadorcy" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-gold text-xs uppercase tracking-wider transition-colors" aria-label="Instagram">IG</a>
              <span className="text-white/15">|</span>
              <a href="https://facebook.com/aquadorcy" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-gold text-xs uppercase tracking-wider transition-colors" aria-label="Facebook">FB</a>
            </div>
          </div>

          {/* Shop links */}
          <div className="md:col-span-2">
            <h3 className="text-[9px] uppercase tracking-[0.25em] text-gold/50 mb-4">Shop</h3>
            <ul className="space-y-2.5">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/60 hover:text-white transition-colors text-[13px]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div className="md:col-span-2">
            <h3 className="text-[9px] uppercase tracking-[0.25em] text-gold/50 mb-4">Company</h3>
            <ul className="space-y-2.5">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/60 hover:text-white transition-colors text-[13px]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact — compact */}
          <div className="md:col-span-5 md:text-right">
            <h3 className="text-[9px] uppercase tracking-[0.25em] text-gold/50 mb-4">Contact</h3>
            <div className="space-y-2.5 text-[13px]">
              <div className="flex items-center md:justify-end gap-2 text-white/60">
                <MapPin className="w-3 h-3 text-gold/40 flex-shrink-0" />
                Ledra 145, Nicosia, Cyprus
              </div>
              <a href="tel:99980809" className="flex items-center md:justify-end gap-2 text-white/60 hover:text-white transition-colors">
                <Phone className="w-3 h-3 text-gold/40 flex-shrink-0" />
                +357 99 980809
              </a>
              <a href="mailto:info@aquadorcy.com" className="flex items-center md:justify-end gap-2 text-white/60 hover:text-white transition-colors">
                <Mail className="w-3 h-3 text-gold/40 flex-shrink-0" />
                info@aquadorcy.com
              </a>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bottom bar — single row */}
      <div className="border-t border-white/[0.06]">
        <div className="container-wide py-5 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-white/30 text-[10px] tracking-[0.08em]">
            &copy; {new Date().getFullYear()} Aquad&apos;or Cyprus
          </p>
          <p className="text-white/30 text-[10px] tracking-[0.08em]">
            Designed and Developed by{' '}
            <a
              href="https://qualiasolutions.net"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold/50 hover:text-gold transition-colors inline-flex items-center gap-0.5"
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
