'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductImage } from '@/components/ui/ProductImage';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { ZOOM_CONFIG } from '@/lib/image-utils';

const FALLBACK_IMAGE = '/placeholder-product.svg';

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
  const [isZoomed, setIsZoomed] = useState(false);
  const [_zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 }); // percentage
  const touchStartX = useRef(0);
  const initialPinchDistance = useRef<number | null>(null);

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

  const _handleImageClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
    setIsZoomed(!isZoomed);
  }, [isZoomed]);

  const _handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  }, [isZoomed]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch zoom
      const distance = Math.hypot(
        e.touches[1].clientX - e.touches[0].clientX,
        e.touches[1].clientY - e.touches[0].clientY
      );
      initialPinchDistance.current = distance;
    } else if (!isZoomed) {
      // Swipe navigation
      touchStartX.current = e.touches[0].clientX;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialPinchDistance.current !== null) {
      const distance = Math.hypot(
        e.touches[1].clientX - e.touches[0].clientX,
        e.touches[1].clientY - e.touches[0].clientY
      );
      const distanceChange = Math.abs(distance - initialPinchDistance.current);

      if (distanceChange > ZOOM_CONFIG.pinchThreshold) {
        setIsZoomed(distance > initialPinchDistance.current);
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (initialPinchDistance.current !== null) {
      initialPinchDistance.current = null;
      return;
    }

    if (!isZoomed && e.changedTouches.length === 1) {
      const diff = touchStartX.current - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) goNext();
        else goPrev();
      }
    }
  };

  // Reset zoom when image changes
  useEffect(() => {
    setIsZoomed(false);
  }, [selectedIndex]);

  // ESC key to exit zoom
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isZoomed) {
        setIsZoomed(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZoomed]);

  const variants = {
    enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
  };

  return (
    <div>
      {/* Main image */}
      <div
        className="relative aspect-square overflow-hidden rounded-3xl bg-white/95 backdrop-blur-md"
        onTouchStart={hasMultiple ? handleTouchStart : undefined}
        onTouchMove={hasMultiple ? handleTouchMove : undefined}
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
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="absolute inset-0 flex items-center justify-center transition-all duration-300 ease-out cursor-pointer"
          >
            <OptimizedImage
              src={allImages[selectedIndex] || FALLBACK_IMAGE}
              alt={`${name}${hasMultiple ? ` - Image ${selectedIndex + 1}` : ''}`}
              fill
              sizeType="full"
              quality={95}
              priority={selectedIndex === 0}
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>

        {/* Coming soon overlay */}
        {!inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
            <span className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium">
              Coming Soon
            </span>
          </div>
        )}

        {/* Arrow buttons (desktop) */}
        {hasMultiple && !isZoomed && (
          <>
            <button
              onClick={goPrev}
              disabled={selectedIndex === 0}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-gold/20 hover:text-gold transition-all duration-300 ease-out disabled:opacity-0 hidden sm:flex focus-visible:ring-2 focus-visible:ring-gold"
              aria-label="Previous image"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <button
              onClick={goNext}
              disabled={selectedIndex === allImages.length - 1}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-gold/20 hover:text-gold transition-all duration-300 ease-out disabled:opacity-0 hidden sm:flex focus-visible:ring-2 focus-visible:ring-gold"
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
            <motion.button
              key={i}
              onClick={() => goTo(i)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className={`relative w-[120px] h-[120px] min-w-[120px] flex-shrink-0 rounded-lg overflow-hidden transition-all duration-300 ease-out ${
                i === selectedIndex
                  ? 'ring-2 ring-gold-600 ring-offset-2 ring-offset-white'
                  : 'opacity-60 hover:opacity-100'
              } focus-visible:ring-2 focus-visible:ring-gold`}
              aria-label={`View image ${i + 1}`}
            >
              <ProductImage
                src={img || FALLBACK_IMAGE}
                alt={`${name} thumbnail ${i + 1}`}
                variant="thumbnail"
                className="object-cover"
              />
            </motion.button>
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
              className={`min-h-[44px] min-w-[44px] flex items-center justify-center transition-all duration-300 ease-out focus-visible:ring-2 focus-visible:ring-gold`}
              aria-label={`Go to image ${i + 1}`}
            >
              <span
                className={`block w-2 h-2 rounded-full transition-all duration-300 ${
                  i === selectedIndex ? 'bg-gold-500 w-4' : 'bg-gold-500/30'
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
