import { LuxuryHeroSkeleton, LuxurySkeleton } from '@/components/ui/LuxurySkeleton';

export default function AboutLoading() {
  return (
    <div className="min-h-screen bg-gold-ambient">
      {/* Hero skeleton */}
      <LuxuryHeroSkeleton />

      {/* Story section skeleton */}
      <section className="section">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Text block */}
            <div className="space-y-4">
              <LuxurySkeleton className="h-8 w-3/4" />
              <LuxurySkeleton className="h-4 w-full" />
              <LuxurySkeleton className="h-4 w-5/6" />
              <LuxurySkeleton className="h-4 w-full" />
              <LuxurySkeleton className="h-4 w-4/5" />
            </div>
            {/* Image block */}
            <LuxurySkeleton className="aspect-[4/5] lg:aspect-square w-full" />
          </div>
        </div>
      </section>

      {/* Values section skeleton */}
      <section className="section bg-gold-ambient-dark">
        <div className="container-wide">
          <div className="text-center mb-10 space-y-3">
            <LuxurySkeleton className="h-8 w-40 mx-auto" />
            <LuxurySkeleton className="h-4 w-64 mx-auto" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3 p-5 border border-gold/10">
                <LuxurySkeleton className="h-10 w-10 rounded-full" />
                <LuxurySkeleton className="h-5 w-24" />
                <LuxurySkeleton className="h-3 w-full" />
                <LuxurySkeleton className="h-3 w-4/5" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
