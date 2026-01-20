'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Instagram, Facebook, Mail, Phone, MapPin } from 'lucide-react';

const footerLinks = {
  shop: [
    { label: "Women's Collection", href: '/shop/women' },
    { label: "Men's Collection", href: '/shop/men' },
    { label: 'Niche Collection', href: '/shop/niche' },
    { label: 'Create Your Own', href: '/create' },
  ],
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Shipping & Returns', href: '/shipping' },
  ],
  legal: [
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' },
  ],
};

export default function Footer() {
  return (
    <footer className="relative bg-dark-light border-t border-gold/10">
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <Link href="/" className="inline-block">
              <span className="text-3xl font-playfair font-semibold text-gradient-gold">
                AQUAD&apos;OR
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Where Luxury Meets Distinction. Crafting exceptional fragrances that tell your unique story.
            </p>
            <div className="flex gap-4">
              <motion.a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, color: '#D4AF37' }}
                className="p-2 text-gray-400 hover:text-gold transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </motion.a>
              <motion.a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, color: '#D4AF37' }}
                className="p-2 text-gray-400 hover:text-gold transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </motion.a>
            </div>
          </motion.div>

          {/* Shop Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-gold font-semibold uppercase tracking-wider mb-6">Shop</h3>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-gold transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Company Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-gold font-semibold uppercase tracking-wider mb-6">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-gold transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-gold transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-gold font-semibold uppercase tracking-wider mb-6">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-gray-400 text-sm">
                <MapPin className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                <span>Ledra 145, 1011<br />Nicosia, Cyprus</span>
              </li>
              <li>
                <a
                  href="tel:99980809"
                  className="flex items-center gap-3 text-gray-400 hover:text-gold transition-colors text-sm"
                >
                  <Phone className="w-5 h-5 text-gold" />
                  +357 99 980809
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@aquadorcy.com"
                  className="flex items-center gap-3 text-gray-400 hover:text-gold transition-colors text-sm"
                >
                  <Mail className="w-5 h-5 text-gold" />
                  info@aquadorcy.com
                </a>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-16 pt-8 border-t border-gold/10 flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Aquad&apos;or Cyprus. All rights reserved.
          </p>
          <p className="text-gray-600 text-xs">
            Crafted with passion in Nicosia
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
