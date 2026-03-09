'use client';

import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useSwipeGesture } from '@/hooks/useSwipeGesture';
import type { Category } from '@/types';

interface SwipeableProductGridProps {
  categories: Category[];
  currentCategorySlug: string;
  children: React.ReactNode;
}

export function SwipeableProductGrid({
  categories,
  currentCategorySlug,
  children,
}: SwipeableProductGridProps) {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  // Detect if this is a mobile/touch device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Find current category index
  const currentIndex = categories.findIndex((cat) => cat.slug === currentCategorySlug);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < categories.length - 1;

  // Get adjacent category names for hints
  const previousCategory = hasPrevious ? categories[currentIndex - 1] : null;
  const nextCategory = hasNext ? categories[currentIndex + 1] : null;

  const handleSwipeLeft = () => {
    if (hasNext && nextCategory) {
      router.push(`/shop/${nextCategory.slug}`);
    }
  };

  const handleSwipeRight = () => {
    if (hasPrevious && previousCategory) {
      router.push(`/shop/${previousCategory.slug}`);
    }
  };

  const { ref, isSwiping, swipeDirection, swipeProgress } = useSwipeGesture({
    threshold: 50,
    velocityThreshold: 300,
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    enabled: isMobile,
  });

  // Calculate translation during swipe (max 40px)
  const translateX = isSwiping
    ? swipeDirection === 'right'
      ? Math.min(swipeProgress * 40, 40)
      : -Math.min(swipeProgress * 40, 40)
    : 0;

  return (
    <div ref={ref} className="relative">
      {/* Swipe visual feedback */}
      <AnimatePresence>
        {isSwiping && isMobile && (
          <>
            {/* Edge indicators */}
            {swipeDirection === 'right' && hasPrevious && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: swipeProgress }}
                exit={{ opacity: 0 }}
                className="fixed left-0 top-0 bottom-0 w-0.5 bg-gold z-50 pointer-events-none"
                style={{ height: '100vh' }}
              />
            )}
            {swipeDirection === 'left' && hasNext && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: swipeProgress }}
                exit={{ opacity: 0 }}
                className="fixed right-0 top-0 bottom-0 w-0.5 bg-gold z-50 pointer-events-none"
                style={{ height: '100vh' }}
              />
            )}
          </>
        )}
      </AnimatePresence>

      {/* Category hints */}
      {isMobile && (
        <>
          {hasPrevious && previousCategory && (
            <div className="fixed left-2 top-1/2 -translate-y-1/2 z-40 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: isSwiping && swipeDirection === 'right' ? 0.6 : 0.3, x: 0 }}
                className="text-[9px] uppercase tracking-[0.15em] text-gold/60 whitespace-nowrap"
              >
                &larr; {previousCategory.name.replace("'s Collection", '')}
              </motion.div>
            </div>
          )}
          {hasNext && nextCategory && (
            <div className="fixed right-2 top-1/2 -translate-y-1/2 z-40 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: isSwiping && swipeDirection === 'left' ? 0.6 : 0.3, x: 0 }}
                className="text-[9px] uppercase tracking-[0.15em] text-gold/60 whitespace-nowrap"
              >
                {nextCategory.name.replace("'s Collection", '')} &rarr;
              </motion.div>
            </div>
          )}
        </>
      )}

      {/* Content with swipe translation */}
      <motion.div
        animate={{ x: translateX }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
