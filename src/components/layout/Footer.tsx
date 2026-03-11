'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Instagram, Facebook, Mail, Phone, MapPin, ArrowUpRight } from 'lucide-react';

const footerLinks = {
  shop: [
    { label: "Women's Collection", href: '/shop/women' },
    { label: "Men's Collection", href: '/shop/men' },
    { label: 'Niche Collection', href: '/shop/niche' },
    { label: 'Create Your Own', href: '/create-perfume' },
  ],
  company: [
    { label: 'About', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contact' },
    { label: 'Shipping', href: '/shipping' },
    { label: 'Terms and Conditions', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' },
  ],
};

export default function Footer() {
  return (
    <footer className="relative bg-[#0a0a0a] overflow-hidden">
      {/* Ambient gold glow — top */}
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{
          height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.3) 40%, rgba(212,175,55,0.15) 70%, transparent 100%)',
        }}
      />
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{
          height: '200px',
          background: 'radial-gradient(ellipse 80% 100% at 50% 0%, rgba(212,175,55,0.04) 0%, transparent 70%)',
        }}
      />

      <div className="container-wide">
        {/* Main footer content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="pt-16 md:pt-20 pb-12 md:pb-16"
        >
          {/* Logo centered at top */}
          <div className="flex flex-col items-center text-center mb-14">
            <Link href="/" className="inline-block mb-5">
              <Image
                src="/aquador.webp"
                alt="Aquad'or"
                width={600}
                height={180}
                className="h-32 sm:h-40 md:h-48 w-auto object-contain"
              />
            </Link>

            <p className="text-white/80 text-sm leading-relaxed font-playfair italic mb-2">
              Where Luxury Meets Distinction.
            </p>

            <p className="text-white/50 text-xs leading-relaxed max-w-[320px]">
              Cyprus&apos;s premier destination for luxury and niche fragrances. Based in Nicosia.
            </p>

            {/* Social links */}
            <div className="flex gap-2 mt-5">
              <a
                href="https://instagram.com/aquadorcy"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 text-white/60 hover:text-gold border border-white/10 hover:border-gold/30 rounded-full transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com/aquadorcy"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 text-white/60 hover:text-gold border border-white/10 hover:border-gold/30 rounded-full transition-all duration-300"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links grid — centered under logo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 lg:gap-12 text-center">

            {/* Shop Links */}
            <div>
              <h3 className="text-[9px] uppercase tracking-[0.25em] text-gold/60 mb-6">Shop</h3>
              <ul className="space-y-3.5">
                {footerLinks.shop.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-white/70 hover:text-white transition-colors duration-300 text-[13px]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="text-[9px] uppercase tracking-[0.25em] text-gold/60 mb-6">Company</h3>
              <ul className="space-y-3.5">
                {footerLinks.company.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-white/70 hover:text-white transition-colors duration-300 text-[13px]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-[9px] uppercase tracking-[0.25em] text-gold/60 mb-6">Find Us</h3>
              <ul className="space-y-4">
                <li className="flex items-center justify-center gap-3 text-white/70 text-[13px]">
                  <MapPin className="w-3.5 h-3.5 text-gold/50 flex-shrink-0" />
                  <span>Ledra 145, Nicosia, Cyprus</span>
                </li>
                <li className="flex justify-center">
                  <a
                    href="tel:99980809"
                    className="flex items-center gap-3 text-white/70 hover:text-white transition-colors duration-300 text-[13px]"
                  >
                    <Phone className="w-3.5 h-3.5 text-gold/50 flex-shrink-0" />
                    +357 99 980809
                  </a>
                </li>
                <li className="flex justify-center">
                  <a
                    href="mailto:info@aquadorcy.com"
                    className="flex items-center gap-3 text-white/70 hover:text-white transition-colors duration-300 text-[13px]"
                  >
                    <Mail className="w-3.5 h-3.5 text-gold/50 flex-shrink-0" />
                    info@aquadorcy.com
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Bottom bar */}
        <div className="border-t border-white/[0.06] py-6 flex flex-col items-center gap-3">
          <p className="text-white/50 text-[10px] tracking-[0.1em]">
            &copy; {new Date().getFullYear()} Aquad&apos;or Cyprus. All rights reserved.
          </p>
          <p className="text-white/40 text-[10px] tracking-[0.08em]">
            Designed and Developed by{' '}
            <a
              href="https://qualiasolutions.net"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold/60 hover:text-gold transition-colors duration-300 inline-flex items-center gap-1"
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
