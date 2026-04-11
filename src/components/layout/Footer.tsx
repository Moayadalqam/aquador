'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import AquadorLogo from '@/components/ui/AquadorLogo';
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
              <AquadorLogo size="sm" className="h-10 md:h-12 w-auto" />
            </Link>
            <p className="text-white/40 text-xs font-playfair italic">
              Scent of Luxury
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
