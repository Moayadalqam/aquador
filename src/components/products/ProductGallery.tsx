'use client';

import { useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductGalleryProps {
  mainImage: string;
  images: string[];
  name: string;
  inStock: boolean;
}

export default function ProductGallery({ mainImage, images, name, inStock }: ProductGalleryProps) {
  const allImages = [mainImage, ...images];
  const hasMultiple = allImages.length > 1;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const touchStartX = useRef(0);

  const goTo = useCallback((index: number) => {
    setDirection(index > selectedIndex ? 1 : -1);
    setSelectedIndex(index);
  }, [selectedIndex]);

  const goNext = useCallback(() => {
    if (selectedIndex < allImages.length - 1) {
      setDirection(1);
      setSelectedIndex(prev => prev + 1);
    }
  }, [selectedIndex, allImages.length]);

  const goPrev = useCallback(() => {
    if (selectedIndex > 0) {
      setDirection(-1);
      setSelectedIndex(prev => prev - 1);
    }
  }, [selectedIndex]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
  };

  const variants = {
    enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
  };

  return (
    <div>
      {/* Main image */}
      <div
        className="relative aspect-square overflow-hidden rounded-2xl bg-white"
        onTouchStart={hasMultiple ? handleTouchStart : undefined}
        onTouchEnd={hasMultiple ? handleTouchEnd : undefined}
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={selectedIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            <Image
              src={allImages[selectedIndex]}
              alt={`${name}${hasMultiple ? ` - Image ${selectedIndex + 1}` : ''}`}
              fill
              className="object-cover"
              priority={selectedIndex === 0}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </motion.div>
        </AnimatePresence>

        {/* Out of stock overlay */}
        {!inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
            <span className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium">
              Out of Stock
            </span>
          </div>
        )}

        {/* Arrow buttons (desktop) */}
        {hasMultiple && (
          <>
            <button
              onClick={goPrev}
              disabled={selectedIndex === 0}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition-colors disabled:opacity-0 hidden sm:flex"
              aria-label="Previous image"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <button
              onClick={goNext}
              disabled={selectedIndex === allImages.length - 1}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition-colors disabled:opacity-0 hidden sm:flex"
              aria-label="Next image"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </>
        )}
      </div>

      {/* Thumbnails (desktop) */}
      {hasMultiple && (
        <div className="hidden sm:flex gap-3 mt-4 overflow-x-auto pb-1">
          {allImages.map((img, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden transition-all duration-200 ${
                i === selectedIndex
                  ? 'ring-2 ring-gold ring-offset-2 ring-offset-dark'
                  : 'opacity-60 hover:opacity-100'
              }`}
              aria-label={`View image ${i + 1}`}
            >
              <Image
                src={img}
                alt={`${name} thumbnail ${i + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Dots (mobile) */}
      {hasMultiple && (
        <div className="flex sm:hidden justify-center gap-2 mt-4">
          {allImages.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                i === selectedIndex ? 'bg-gold w-4' : 'bg-gold/30'
              }`}
              aria-label={`Go to image ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
