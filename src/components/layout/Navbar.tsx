'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { CartIcon } from '@/components/cart';
import { SearchBar } from '@/components/search';
import { navLinkVariants } from '@/lib/animations/page-transitions';

const navLinks = [
  { label: 'Lattafa Originals', href: '/shop/lattafa' },
  { label: 'Shop', href: '/shop' },
  { label: 'Create Your Own', href: '/create-perfume' },
  { label: 'Re-Order', href: '/reorder' },
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
];

export default function Navbar() {
  const pathname = usePathname();
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
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-black/98 backdrop-blur-xl border-b border-gold/10'
          : 'bg-gradient-to-b from-black/80 via-black/50 to-transparent'
      }`}
    >
      <nav className="container-wide">
        <div className="flex items-center justify-between h-[var(--nav-height-mobile)] md:h-[var(--nav-height)]">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center">
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="relative group"
            >
              <Image
                src="/aquador.webp"
                alt="Aquad'or"
                width={400}
                height={120}
                className="h-20 sm:h-24 md:h-28 lg:h-32 w-auto object-contain transition-all duration-300 group-hover:drop-shadow-[0_0_20px_rgba(212,175,55,0.25)]"
                priority
              />
            </motion.div>
          </Link>

          {/* Desktop Navigation + Search */}
          <div className="hidden lg:flex items-center gap-5 xl:gap-7">
            {navLinks.map((link) => {
              const isActive = pathname === link.href ||
                (link.href !== '/' && pathname.startsWith(link.href));

              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className="relative text-[11px] xl:text-xs font-normal uppercase tracking-[0.15em] py-2 group whitespace-nowrap"
                >
                  <motion.span
                    variants={navLinkVariants}
                    initial="idle"
                    whileHover="hover"
                    className={`block transition-colors duration-300 ${
                      isActive ? 'text-gold' : 'text-gray-300 group-hover:text-gold'
                    }`}
                  >
                    {link.label}
                  </motion.span>

                  {/* Active indicator with shared layout animation */}
                  {isActive && (
                    <motion.span
                      layoutId="activeNav"
                      className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-gold to-gold-light"
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                    />
                  )}

                  {/* Hover underline (only when not active) */}
                  {!isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-gold to-gold-light scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  )}
                </Link>
              );
            })}
            <SearchBar variant="navbar" />
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            <CartIcon />

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden min-h-[44px] min-w-[44px] p-2 -mr-1 text-gray-300 hover:text-gold transition-colors flex items-center justify-center"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
              transition={{ duration: 0.25 }}
              className="lg:hidden overflow-hidden border-t border-gold/10 bg-black/98"
            >
              <div className="py-4 space-y-0.5">
                {/* Mobile Search Bar */}
                <div className="pb-3 px-1">
                  <SearchBar variant="shop" placeholder="Search fragrances..." />
                </div>

                {navLinks.map((link, index) => {
                  const isActive = pathname === link.href ||
                    (link.href !== '/' && pathname.startsWith(link.href));

                  return (
                    <motion.div
                      key={link.label}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.04 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className={`block min-h-[44px] py-3 px-1 text-sm font-light uppercase tracking-[0.15em] hover:pl-3 transition-all duration-200 border-b border-gold/5 flex items-center ${
                          isActive
                            ? 'text-gold font-normal'
                            : 'text-gray-300 hover:text-gold'
                        }`}
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Gold accent line */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-px"
        initial={{ opacity: 0 }}
        animate={{ opacity: isScrolled ? 0 : 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="w-full h-full bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
      </motion.div>
    </motion.header>
  );
}
