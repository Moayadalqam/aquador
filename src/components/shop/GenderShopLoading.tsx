import {
  LuxuryHeroSkeleton,
  LuxuryProductGridSkeleton,
  LuxurySkeleton,
} from '@/components/ui/LuxurySkeleton';

export default function GenderShopLoading() {
  return (
    <div className="min-h-screen bg-gold-ambient">
      <LuxuryHeroSkeleton />

      <section className="container-wide py-6 md:py-8">
        <div className="max-w-md mx-auto">
          <LuxurySkeleton className="h-12 w-full" />
        </div>
      </section>

      <section className="container-wide pb-16 md:pb-20">
        <LuxuryProductGridSkeleton count={12} />
      </section>
    </div>
  );
}
