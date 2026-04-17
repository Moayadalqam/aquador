'use client';

import { LuxuryProductCardSkeleton } from '@/components/ui/LuxurySkeleton';

/**
 * Skeleton fallback for RelatedProducts section, matching
 * the exact layout of RelatedProducts.tsx (section wrapper,
 * heading, and 2-col / 4-col product grid with 4 cards).
 */
export default function RelatedProductsSkeleton() {
  return (
    <section className="mt-20 pt-12 border-t border-gray-300">
      {/* Heading placeholder matching the h2 in RelatedProducts */}
      <div className="flex justify-center mb-8">
        <div
          className="h-9 w-64 rounded"
          style={{
            background:
              'linear-gradient(90deg, oklch(0.94 0.005 85) 25%, oklch(0.94 0.005 85 / 0.95) 37.5%, oklch(0.78 0.11 85 / 0.08) 50%, oklch(0.94 0.005 85 / 0.95) 62.5%, oklch(0.94 0.005 85) 75%)',
            backgroundSize: '200% 100%',
            animation: 'luxuryShimmer 2s ease-in-out infinite',
          }}
        />
      </div>

      {/* 4-card grid matching RelatedProducts grid classes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} style={{ animationDelay: `${index * 0.1}s` }}>
            <LuxuryProductCardSkeleton />
          </div>
        ))}
      </div>

      {/* Inject the shimmer keyframe if not already present */}
      <style jsx global>{`
        @keyframes luxuryShimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </section>
  );
}
