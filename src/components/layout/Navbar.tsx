'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { CartIcon } from '@/components/cart';
import { SearchBar } from '@/components/search';

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
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const ticking = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 20);
          ticking.current = false;
        });
        ticking.current = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  const toggleSearch = useCallback(() => {
    setIsSearchOpen(prev => !prev);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isScrolled
            ? 'bg-black/95 backdrop-blur-2xl shadow-[0_1px_0_rgba(212,175,55,0.08)]'
            : 'bg-transparent'
        }`}
      >
        {/* Announcement Bar — only visible at top */}
        <AnimatePresence>
          {!isScrolled && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden border-b border-white/[0.04]"
            >
              <div className="container-wide flex items-center justify-center py-2">
                <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-gray-500 font-poppins font-light">
                  Complimentary shipping on orders over{' '}
                  <span className="text-gold">€100</span>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Navigation Bar */}
        <nav className="container-wide">
          <div className={`flex items-center justify-between transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isScrolled ? 'h-16' : 'h-20 md:h-24'
          }`}>
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 relative z-10">
              <Image
                src="/aquador.webp"
                alt="Aquad'or"
                width={400}
                height={120}
                className={`w-auto object-contain transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  isScrolled
                    ? 'h-10 sm:h-12'
                    : 'h-14 sm:h-16 md:h-20 lg:h-24'
                }`}
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1 xl:gap-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href ||
                  (link.href !== '/' && pathname.startsWith(link.href));

                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="relative px-3 xl:px-4 py-2 group"
                  >
                    <span
                      className={`text-[10.5px] xl:text-[11px] uppercase tracking-[0.18em] font-poppins font-light transition-colors duration-300 ${
                        isActive
                          ? 'text-gold'
                          : 'text-gray-400 group-hover:text-white'
                      }`}
                    >
                      {link.label}
                    </span>

                    {/* Active / hover indicator */}
                    {isActive ? (
                      <motion.span
                        layoutId="navIndicator"
                        className="absolute bottom-0 left-3 right-3 xl:left-4 xl:right-4 h-px bg-gold"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    ) : (
                      <span className="absolute bottom-0 left-3 right-3 xl:left-4 xl:right-4 h-px bg-gold/60 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1">
              {/* Search Toggle */}
              <button
                onClick={toggleSearch}
                className="relative min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-white transition-colors duration-300"
                aria-label={isSearchOpen ? 'Close search' : 'Open search'}
              >
                <AnimatePresence mode="wait">
                  {isSearchOpen ? (
                    <motion.div
                      key="close"
                      initial={{ opacity: 0, rotate: -90 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: 90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="w-[18px] h-[18px]" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="search"
                      initial={{ opacity: 0, rotate: 90 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: -90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Search className="w-[18px] h-[18px]" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>

              {/* Cart */}
              <CartIcon />

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="lg:hidden relative min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-white transition-colors duration-300"
                aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
              >
                <div className="w-5 h-4 flex flex-col justify-between">
                  <span className={`block h-px bg-current transition-all duration-500 origin-center ${
                    isMobileOpen ? 'rotate-45 translate-y-[7.5px]' : ''
                  }`} />
                  <span className={`block h-px bg-current transition-all duration-300 ${
                    isMobileOpen ? 'opacity-0 scale-x-0' : 'opacity-100'
                  }`} />
                  <span className={`block h-px bg-current transition-all duration-500 origin-center ${
                    isMobileOpen ? '-rotate-45 -translate-y-[7.5px]' : ''
                  }`} />
                </div>
              </button>
            </div>
          </div>
        </nav>

        {/* Search Overlay */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden border-t border-white/[0.04] bg-black/95 backdrop-blur-2xl"
            >
              <div className="container-wide py-6 md:py-8">
                <div className="max-w-2xl mx-auto">
                  <SearchBar variant="navbar" placeholder="Search our collection..." />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom gold accent — ultra subtle */}
        <div
          className={`absolute bottom-0 left-0 right-0 h-px transition-opacity duration-700 ${
            isScrolled ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="h-full bg-gradient-to-r from-transparent via-gold/15 to-transparent" />
        </div>
      </motion.header>

      {/* Mobile Full-Screen Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            {/* Background */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/[0.97]"
            >
              {/* Ambient gold glow */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_40%,rgba(212,175,55,0.03)_0%,transparent_70%)]" />
            </motion.div>

            {/* Navigation Content */}
            <div className="relative h-full flex flex-col pt-24 pb-10 px-8 sm:px-12 overflow-y-auto">
              {/* Mobile Search */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="mb-10"
              >
                <SearchBar variant="shop" placeholder="Search fragrances..." />
              </motion.div>

              {/* Nav Links — large editorial style */}
              <nav className="flex-1">
                <ul className="space-y-1">
                  {navLinks.map((link, i) => {
                    const isActive = pathname === link.href ||
                      (link.href !== '/' && pathname.startsWith(link.href));

                    return (
                      <motion.li
                        key={link.label}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: 0.15 + i * 0.06,
                          duration: 0.5,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      >
                        <Link
                          href={link.href}
                          onClick={() => setIsMobileOpen(false)}
                          className={`group flex items-center gap-4 py-3.5 transition-colors duration-300 ${
                            isActive ? 'text-gold' : 'text-white/80 active:text-gold'
                          }`}
                        >
                          {isActive && (
                            <span className="w-6 h-px bg-gold flex-shrink-0" />
                          )}
                          <span className="font-playfair text-2xl sm:text-3xl tracking-wide font-normal">
                            {link.label}
                          </span>
                        </Link>
                      </motion.li>
                    );
                  })}
                </ul>
              </nav>

              {/* Footer tagline */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="mt-auto pt-8 border-t border-white/[0.04]"
              >
                <p className="text-[10px] uppercase tracking-[0.3em] text-gray-600 font-poppins font-light">
                  Where Luxury Meets Distinction
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
