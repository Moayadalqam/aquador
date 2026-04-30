'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, ChevronDown } from 'lucide-react';
import CartIcon from '@/components/cart/CartIcon';
import { SearchBar } from '@/components/search';
import Image from 'next/image';
import type { NavItem } from '@/types';

const navLinks: NavItem[] = [
  { label: 'Dubai Shop', href: '/shop', children: [
    { label: 'All Dubai Fragrances', href: '/shop' },
    { label: 'Al Haramain', href: '/shop/al-haramain-originals' },
    { label: 'Xerjoff', href: '/shop?brand=xerjoff' },
  ]},
  { label: 'Men', href: '/shop/men' },
  { label: 'Women', href: '/shop/women' },
  { label: 'Niche', href: '/shop/niche' },
  { label: 'Lattafa Originals', href: '/shop/lattafa' },
  { label: 'Create Your Own', href: '/create-perfume' },
  { label: 'Re-Order', href: '/reorder' },
  { label: 'Contact', href: '/contact' },
];

const leftLinks = navLinks.slice(0, 4);
const rightLinks = navLinks.slice(4);

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [blurIntensity, setBlurIntensity] = useState(0);
  const [expandedMobile, setExpandedMobile] = useState<string | null>(null);
  const ticking = useRef(false);
  const lastIsScrolled = useRef(false);
  const lastBlurBucket = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(() => {
          const y = window.scrollY;
          const scrolled = y > 60;
          // Bucket blur intensity into ~10 steps to avoid per-pixel state updates
          const blur = Math.min(1, y / 120);
          const blurBucket = Math.round(blur * 10);

          if (scrolled !== lastIsScrolled.current || blurBucket !== lastBlurBucket.current) {
            lastIsScrolled.current = scrolled;
            lastBlurBucket.current = blurBucket;
            setIsScrolled(scrolled);
            setBlurIntensity(blur);
          }
          ticking.current = false;
        });
        ticking.current = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileOpen]);

  useEffect(() => {
    setIsMobileOpen(false);
    setIsSearchOpen(false);
    setExpandedMobile(null);
  }, [pathname]);

  // Dismiss mobile menu on Escape key
  useEffect(() => {
    if (!isMobileOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileOpen(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isMobileOpen]);

  const isHome = pathname === '/';
  const useLightText = isHome && !isScrolled;

  const checkActive = (href: string) => {
    // Gender-specific routes
    if (href === '/shop/men') return pathname === '/shop/men' || pathname.startsWith('/shop/men/');
    if (href === '/shop/women') return pathname === '/shop/women' || pathname.startsWith('/shop/women/');
    // Niche
    if (href === '/shop/niche') return pathname === '/shop/niche' || pathname.startsWith('/shop/niche/');
    // Lattafa Originals
    if (href === '/shop/lattafa') return pathname === '/shop/lattafa' || pathname.startsWith('/shop/lattafa/');
    // Dubai Shop: activate on /shop or /shop/* but NOT gender, lattafa, or niche
    if (href === '/shop') {
      return (pathname === '/shop' || pathname.startsWith('/shop/'))
        && !pathname.startsWith('/shop/men')
        && !pathname.startsWith('/shop/women')
        && !pathname.startsWith('/shop/unisex')
        && !pathname.startsWith('/shop/lattafa')
        && !pathname.startsWith('/shop/niche');
    }
    // Create Your Own
    if (href === '/create-perfume') return pathname.startsWith('/create-perfume');
    // Default
    return pathname === href || (href !== '/' && pathname.startsWith(href));
  };

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="fixed left-0 right-0 z-50 top-0 pt-1"
        style={{
          background: isHome && !isScrolled
            ? `rgba(0, 0, 0, ${blurIntensity * 0.3})`
            : 'rgba(250, 250, 248, 0.96)',
          backdropFilter: isScrolled || !isHome ? `blur(${20 + blurIntensity * 4}px) saturate(180%)` : `blur(${blurIntensity * 8}px)`,
          WebkitBackdropFilter: isScrolled || !isHome ? `blur(${20 + blurIntensity * 4}px) saturate(180%)` : `blur(${blurIntensity * 8}px)`,
          boxShadow: isScrolled ? '0 1px 0 rgba(212,175,55,0.08), 0 4px 24px rgba(0,0,0,0.04)' : 'none',
          transition: 'background 0.5s ease, box-shadow 0.5s ease',
        }}
      >
        <nav className="container-wide" aria-label="Primary">
          {/* Taller nav for more spacious feel */}
          <div className="relative flex items-center justify-between h-[80px] md:h-[96px]">

            {/* Left: Hamburger (mobile) + Left nav links (desktop) */}
            <div className="flex items-center h-full">
              <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className={`xl:hidden min-h-[44px] min-w-[44px] flex items-center justify-center hover:text-gold transition-colors duration-300 -ml-3 ${useLightText ? 'text-white' : 'text-black/80'}`}
                aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMobileOpen}
              >
                <div className="w-[20px] h-3.5 flex flex-col justify-between">
                  <span className={`block h-px bg-current transition-all duration-500 origin-center ${
                    isMobileOpen ? 'rotate-45 translate-y-[6px]' : ''
                  }`} />
                  <span className={`block h-px bg-current transition-all duration-300 ${
                    isMobileOpen ? 'opacity-0 scale-x-0' : ''
                  }`} />
                  <span className={`block h-px bg-current transition-all duration-500 origin-center ${
                    isMobileOpen ? '-rotate-45 -translate-y-[6px]' : ''
                  }`} />
                </div>
              </button>

              <div className="hidden xl:flex items-center h-full">
                {leftLinks.map((link) => (
                  <DesktopNavLink key={link.label} item={link} active={checkActive(link.href)} lightText={useLightText} />
                ))}
              </div>
            </div>

            {/* Center: Logo */}
            <Link
              href="/"
              className="absolute left-1/2 -translate-x-1/2 z-10"
            >
              <Image src="/aquador-logo.png" alt="Aquad'or" width={160} height={160} className="h-[68px] sm:h-[80px] xl:h-[84px] 2xl:h-[92px] w-auto" priority />
            </Link>

            {/* Right: Right nav links (desktop) + Icons */}
            <div className="flex items-center h-full">
              <div className="hidden xl:flex items-center h-full">
                {rightLinks.map((link) => (
                  <DesktopNavLink key={link.label} item={link} active={checkActive(link.href)} lightText={useLightText} />
                ))}
              </div>

              {/* Separator — desktop only */}
              <div className={`hidden xl:block w-px h-5 mx-4 ${useLightText ? 'bg-white/15' : 'bg-black/[0.07]'}`} />

              {/* Search toggle */}
              <button
                onClick={() => setIsSearchOpen(prev => !prev)}
                className={`min-h-[44px] min-w-[44px] flex items-center justify-center hover:text-gold transition-colors duration-300 ${useLightText ? 'text-white/80' : 'text-black/70'}`}
                aria-label={isSearchOpen ? 'Close search' : 'Open search'}
              >
                <AnimatePresence mode="wait">
                  {isSearchOpen ? (
                    <motion.div key="x" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }} transition={{ duration: 0.15 }}>
                      <X className="w-[17px] h-[17px]" />
                    </motion.div>
                  ) : (
                    <motion.div key="s" initial={{ opacity: 0, rotate: 90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: -90 }} transition={{ duration: 0.15 }}>
                      <Search className="w-[17px] h-[17px]" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>

              <CartIcon className={useLightText ? 'text-white/80' : 'text-black/70'} />
            </div>
          </div>
        </nav>

        {/* Search panel */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-visible border-t border-gold/10"
              style={{ background: 'rgba(250, 250, 248, 0.97)', backdropFilter: 'blur(24px)' }}
            >
              <div className="container-wide py-5 relative z-[60]">
                <div className="max-w-lg mx-auto">
                  <SearchBar variant="navbar" placeholder="Search our collection..." />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Gold bottom border */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px z-0 transition-opacity duration-500"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.25) 50%, transparent 100%)',
            opacity: isScrolled ? 1 : isHome ? blurIntensity * 0.6 : 1,
          }}
        />
      </motion.header>

      {/* Mobile full-screen overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 xl:hidden"
          >
            <div className="absolute inset-0 bg-[#FAFAF8]/[0.99]">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(212,175,55,0.025)_0%,transparent_60%)]" />
            </div>

            <div className="relative h-full flex flex-col pt-[80px] pb-8 px-8 sm:px-12 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="mb-10"
              >
                <SearchBar variant="shop" placeholder="Search fragrances..." />
              </motion.div>

              <nav className="flex-1">
                <ul className="space-y-0">
                  {navLinks.map((link, i) => (
                    <motion.li
                      key={link.label}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.04, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    >
                      {link.children ? (
                        <>
                          <button
                            type="button"
                            onClick={() => setExpandedMobile(expandedMobile === link.label ? null : link.label)}
                            className={`flex items-center gap-4 py-3.5 w-full border-b border-black/[0.04] transition-colors duration-300 cursor-pointer ${
                              checkActive(link.href) ? 'text-gold' : 'text-black/60 active:text-gold'
                            }`}
                          >
                            {checkActive(link.href) ? (
                              <span className="w-6 h-px bg-gold flex-shrink-0" />
                            ) : (
                              <span className="w-6 h-px flex-shrink-0" />
                            )}
                            <span className="font-playfair text-[21px] sm:text-2xl tracking-wide">
                              {link.label}
                            </span>
                            <ChevronDown
                              className={`w-4 h-4 ml-auto mr-2 transition-transform duration-200 ${
                                expandedMobile === link.label ? 'rotate-180' : ''
                              }`}
                            />
                          </button>
                          <AnimatePresence>
                            {expandedMobile === link.label && (
                              <motion.ul
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                                className="overflow-hidden"
                              >
                                {link.children.map((child) => (
                                  <li key={child.href}>
                                    <Link
                                      href={child.href}
                                      onClick={() => setIsMobileOpen(false)}
                                      className={`flex items-center gap-4 py-2.5 pl-10 border-b border-black/[0.02] transition-colors duration-300 ${
                                        pathname === child.href ? 'text-gold' : 'text-black/50 active:text-gold'
                                      }`}
                                    >
                                      <span className="font-playfair text-[18px] sm:text-xl tracking-wide">
                                        {child.label}
                                      </span>
                                    </Link>
                                  </li>
                                ))}
                              </motion.ul>
                            )}
                          </AnimatePresence>
                        </>
                      ) : (
                        <Link
                          href={link.href}
                          onClick={() => setIsMobileOpen(false)}
                          aria-current={checkActive(link.href) ? 'page' : undefined}
                          className={`flex items-center gap-4 py-3.5 border-b border-black/[0.04] transition-colors duration-300 ${
                            checkActive(link.href) ? 'text-gold' : 'text-black/60 active:text-gold'
                          }`}
                        >
                          {checkActive(link.href) ? (
                            <span className="w-6 h-px bg-gold flex-shrink-0" />
                          ) : (
                            <span className="w-6 h-px flex-shrink-0" />
                          )}
                          <span className="font-playfair text-[21px] sm:text-2xl tracking-wide">
                            {link.label}
                          </span>
                        </Link>
                      )}
                    </motion.li>
                  ))}
                </ul>
              </nav>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55, duration: 0.4 }}
                className="mt-auto pt-7 text-[8px] uppercase tracking-[0.35em] text-gray-400 font-light"
              >
                Scent of Luxury
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function DesktopNavLink({ item, active, lightText }: { item: NavItem; active: boolean; lightText: boolean }) {
  if (item.children) {
    return (
      <div className="relative group h-full">
        <Link href={item.href} aria-current={active ? 'page' : undefined} aria-haspopup="true" aria-expanded={false} className="relative h-full flex items-center justify-center px-4 xl:px-5">
          <span className={`text-[10.5px] xl:text-[11px] uppercase tracking-[0.16em] font-light transition-colors duration-300 whitespace-nowrap leading-none flex items-center gap-1 ${
            active ? 'text-gold' : lightText ? 'text-white/75 group-hover:text-white' : 'text-black/65 group-hover:text-black'
          }`}>
            {item.label}
            <ChevronDown className="w-3 h-3" />
          </span>
          {active ? (
            <motion.span
              layoutId="navActive"
              className="absolute bottom-0 left-4 right-4 xl:left-5 xl:right-5 h-px bg-gold"
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            />
          ) : (
            <span className="absolute bottom-0 left-4 right-4 xl:left-5 xl:right-5 h-px bg-gold/40 scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-left" />
          )}
        </Link>
        {/* Dropdown */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 min-w-[200px] py-3 px-1 bg-white/[0.98] backdrop-blur-sm shadow-lg border border-gold/10 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-200">
          {item.children.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              className="block px-4 py-2 text-[11px] uppercase tracking-[0.14em] text-neutral-700 hover:text-gold transition-colors cursor-pointer"
            >
              {child.label}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Link href={item.href} aria-current={active ? 'page' : undefined} className="relative h-full flex items-center justify-center px-4 xl:px-5 group">
      <span className={`text-[10.5px] xl:text-[11px] uppercase tracking-[0.16em] font-light transition-colors duration-300 whitespace-nowrap leading-none ${
        active ? 'text-gold' : lightText ? 'text-white/75 group-hover:text-white' : 'text-black/65 group-hover:text-black'
      }`}>
        {item.label}
      </span>
      {active ? (
        <motion.span
          layoutId="navActive"
          className="absolute bottom-0 left-4 right-4 xl:left-5 xl:right-5 h-px bg-gold"
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        />
      ) : (
        <span className="absolute bottom-0 left-4 right-4 xl:left-5 xl:right-5 h-px bg-gold/40 scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-left" />
      )}
    </Link>
  );
}
