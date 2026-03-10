import { LuxuryHeroSkeleton, LuxurySkeleton } from '@/components/ui/LuxurySkeleton';

export default function CreatePerfumeLoading() {
  return (
    <div className="min-h-screen bg-gold-ambient">
      {/* Hero skeleton */}
      <LuxuryHeroSkeleton />

      {/* Builder skeleton */}
      <section className="section">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            {/* 3D preview area */}
            <div className="space-y-4">
              <LuxurySkeleton className="aspect-square w-full rounded-lg" />
              <div className="flex gap-2 justify-center">
                <LuxurySkeleton className="h-8 w-24" />
                <LuxurySkeleton className="h-8 w-24" />
              </div>
            </div>

            {/* Note selector skeleton */}
            <div className="space-y-6">
              {/* Category tabs */}
              <div className="flex gap-2 flex-wrap">
                {Array.from({ length: 5 }).map((_, i) => (
                  <LuxurySkeleton key={i} className="h-9 w-20" />
                ))}
              </div>

              {/* Note sections */}
              {['Top Notes', 'Heart Notes', 'Base Notes'].map((label) => (
                <div key={label} className="space-y-3">
                  <LuxurySkeleton className="h-5 w-28" />
                  <div className="grid grid-cols-3 gap-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <LuxurySkeleton key={i} className="h-16 w-full rounded-lg" />
                    ))}
                  </div>
                </div>
              ))}

              {/* Volume + CTA */}
              <div className="flex gap-3">
                <LuxurySkeleton className="h-10 w-28" />
                <LuxurySkeleton className="h-10 w-28" />
              </div>
              <LuxurySkeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
