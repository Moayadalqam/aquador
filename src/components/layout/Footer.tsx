'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Instagram, Facebook, Mail, Phone, MapPin } from 'lucide-react';

const footerLinks = {
  shop: [
    { label: "Women's", href: '/shop/women' },
    { label: "Men's", href: '/shop/men' },
    { label: 'Niche', href: '/shop/niche' },
    { label: 'Create Your Own', href: '/create-perfume' },
  ],
  company: [
    { label: 'About', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contact' },
    { label: 'Shipping', href: '/shipping' },
    { label: 'Terms', href: '/terms' },
    { label: 'Privacy', href: '/privacy' },
  ],
};

export default function Footer() {
  return (
    <footer className="relative bg-gold-ambient-subtle border-t border-gold/5">
      <div className="container-wide section-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-5">
            <Link href="/" className="inline-block">
              <Image
                src="/aquador.webp"
                alt="Aquad'or"
                width={200}
                height={80}
                className="h-16 w-auto object-contain"
              />
            </Link>
            <p className="text-gray-500 text-xs leading-relaxed max-w-[200px]">
              Where Luxury Meets Distinction.
            </p>
            <div className="flex gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 text-gray-500 hover:text-gold transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 text-gray-500 hover:text-gold transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="label-micro-gold mb-5">Shop</h3>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-500 hover:text-white transition-colors text-xs"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="label-micro-gold mb-5">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-500 hover:text-white transition-colors text-xs"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="label-micro-gold mb-5">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-gray-500 text-xs">
                <MapPin className="w-3.5 h-3.5 text-gold/70 flex-shrink-0 mt-0.5" />
                <span>Ledra 145<br />Nicosia, Cyprus</span>
              </li>
              <li>
                <a
                  href="tel:99980809"
                  className="flex items-center gap-3 text-gray-500 hover:text-white transition-colors text-xs"
                >
                  <Phone className="w-3.5 h-3.5 text-gold/70" />
                  +357 99 980809
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@aquadorcy.com"
                  className="flex items-center gap-3 text-gray-500 hover:text-white transition-colors text-xs"
                >
                  <Mail className="w-3.5 h-3.5 text-gold/70" />
                  info@aquadorcy.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 pt-6 border-t border-gold/5 flex flex-col sm:flex-row justify-between items-center gap-3"
        >
          <p className="text-gray-600 text-[10px] tracking-wide">
            © {new Date().getFullYear()} Aquad&apos;or Cyprus
          </p>
          <p className="text-gray-600 text-[10px] tracking-wide">
            by{' '}
            <a
              href="https://qualiasolutions.net"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold/70 hover:text-gold transition-colors"
            >
              Qualia Solutions
            </a>
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
