import {
  LuxuryHeroSkeleton,
  LuxuryProductGridSkeleton,
  LuxurySkeleton,
} from '@/components/ui/LuxurySkeleton';

/**
 * Loading skeleton for gender collection pages.
 * Matches GenderContent layout: PageHero + search bar + product grid (2/3/4 columns).
 */
export default function GenderLoading() {
  return (
    <div className="min-h-screen bg-gold-ambient">
      {/* Hero skeleton matching PageHero shape */}
      <LuxuryHeroSkeleton />

      {/* Search bar skeleton */}
      <section className="container-wide py-6 md:py-8">
        <div className="max-w-md mx-auto">
          <LuxurySkeleton className="h-12 w-full" />
        </div>
      </section>

      {/* Product grid skeleton - 12 cards matching 2/3/4 column grid */}
      <section className="container-wide pb-16 md:pb-20">
        <LuxuryProductGridSkeleton count={12} />
      </section>
    </div>
  );
}
