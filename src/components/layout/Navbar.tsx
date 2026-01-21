'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown } from 'lucide-react';
import { CartIcon } from '@/components/cart';

const navLinks = [
  {
    label: 'Shop',
    href: '/shop',
    children: [
      { label: "Women's Collection", href: '/shop/women' },
      { label: "Men's Collection", href: '/shop/men' },
      { label: 'Niche Collection', href: '/shop/niche' },
    ],
  },
  { label: 'Create Your Own', href: '/create' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? 'bg-black/95 backdrop-blur-xl shadow-lg shadow-black/30' : 'bg-gradient-to-b from-black/80 to-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-24">
          {/* Logo - Larger and more prominent */}
          <Link href="/" className="flex items-center">
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="relative group"
            >
              <Image
                src="/aquador.webp"
                alt="Aquad'or"
                width={180}
                height={64}
                className="h-16 w-auto object-contain transition-all duration-300 group-hover:drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]"
                priority
              />
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-10">
            {navLinks.map((link) => (
              <div
                key={link.label}
                className="relative group"
                onMouseEnter={() => link.children && setActiveDropdown(link.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={link.href}
                  className="relative flex items-center gap-1 text-sm uppercase tracking-[0.2em] text-gray-200 hover:text-gold transition-colors duration-300 py-2"
                >
                  {link.label}
                  {link.children && <ChevronDown className="w-4 h-4" />}
                  {/* Gold underline animation */}
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </Link>

                {/* Dropdown */}
                <AnimatePresence>
                  {link.children && activeDropdown === link.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-4 w-56 bg-black/95 backdrop-blur-xl border border-gold/20 rounded-sm shadow-xl overflow-hidden"
                    >
                      {link.children.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href}
                          className="block px-5 py-4 text-sm text-gray-300 hover:text-gold hover:bg-gold/5 transition-all duration-300 border-b border-gold/10 last:border-b-0"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-6">
            <CartIcon />

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 text-gray-200 hover:text-gold transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden overflow-hidden border-t border-gold/20 bg-black/95"
            >
              <div className="py-6 space-y-1">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="block py-4 text-lg uppercase tracking-[0.15em] text-gray-200 hover:text-gold transition-colors border-b border-gold/10"
                    >
                      {link.label}
                    </Link>
                    {link.children && (
                      <div className="pl-6 bg-black/50">
                        {link.children.map((child) => (
                          <Link
                            key={child.label}
                            href={child.href}
                            onClick={() => setIsOpen(false)}
                            className="block py-3 text-sm text-gray-400 hover:text-gold transition-colors"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Gold accent line - always visible but more subtle */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
    </motion.header>
  );
}
