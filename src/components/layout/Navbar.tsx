'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { CartIcon } from '@/components/cart';
import { SearchBar } from '@/components/search';

const navLinks = [
  { label: 'Lattafa', href: '/shop/lattafa' },
  { label: 'Dubaishop', href: '/shop' },
  { label: 'Create your own', href: '/create' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const ticking = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 50);
          ticking.current = false;
        });
        ticking.current = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
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
      <nav className="w-full px-4 sm:px-8 lg:px-16 xl:px-24">
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
                width={360}
                height={128}
                className="h-32 w-auto object-contain transition-all duration-300 group-hover:drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]"
                priority
              />
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="relative text-[13px] font-medium uppercase tracking-[0.08em] text-gray-200 hover:text-gold transition-colors duration-300 py-2 group whitespace-nowrap"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </Link>
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-6">
            {/* Search Bar - Desktop */}
            <div className="hidden lg:block">
              <SearchBar variant="navbar" />
            </div>

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
                {/* Mobile Search Bar */}
                <div className="px-4 pb-4">
                  <SearchBar variant="shop" placeholder="Search fragrances..." />
                </div>

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
