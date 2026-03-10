import { LuxuryHeroSkeleton, LuxurySkeleton } from '@/components/ui/LuxurySkeleton';

export default function ContactLoading() {
  return (
    <div className="min-h-screen bg-gold-ambient">
      {/* Hero skeleton */}
      <LuxuryHeroSkeleton />

      {/* Contact content skeleton */}
      <section className="section-sm">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            {/* Form skeleton */}
            <div className="glass-card p-8 space-y-5">
              <LuxurySkeleton className="h-7 w-56" />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <LuxurySkeleton className="h-3 w-12" />
                  <LuxurySkeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <LuxurySkeleton className="h-3 w-12" />
                  <LuxurySkeleton className="h-10 w-full" />
                </div>
              </div>
              <div className="space-y-2">
                <LuxurySkeleton className="h-3 w-20" />
                <LuxurySkeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <LuxurySkeleton className="h-3 w-16" />
                <LuxurySkeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <LuxurySkeleton className="h-3 w-16" />
                <LuxurySkeleton className="h-28 w-full" />
              </div>
              <LuxurySkeleton className="h-12 w-full" />
            </div>

            {/* Info skeleton */}
            <div className="space-y-8">
              <div>
                <LuxurySkeleton className="h-7 w-40 mb-6" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="glass-card p-5 space-y-2">
                      <LuxurySkeleton className="h-10 w-10 rounded-full" />
                      <LuxurySkeleton className="h-4 w-20" />
                      <LuxurySkeleton className="h-3 w-32" />
                    </div>
                  ))}
                </div>
              </div>
              {/* Map skeleton */}
              <LuxurySkeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
