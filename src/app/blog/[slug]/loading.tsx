import { LuxurySkeleton } from '@/components/ui/LuxurySkeleton';

/**
 * Loading skeleton for individual blog post pages.
 * Matches BlogPostContent layout: breadcrumb, metadata row, title, author, article body.
 */
export default function BlogPostLoading() {
  return (
    <div className="min-h-screen bg-gold-ambient">
      <div className="px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex gap-8 max-w-7xl mx-auto">
          {/* Main content area */}
          <div className="min-w-0 flex-1 max-w-3xl">
            {/* Breadcrumb skeleton */}
            <nav
              className="flex items-center gap-2 pt-32 md:pt-40 lg:pt-44 mb-8"
              aria-label="Loading breadcrumb"
            >
              <LuxurySkeleton className="h-3 w-10" />
              <span className="text-gray-300">/</span>
              <LuxurySkeleton className="h-3 w-8" />
              <span className="text-gray-300">/</span>
              <LuxurySkeleton className="h-3 w-32" />
            </nav>

            {/* Header skeleton */}
            <header className="mb-12">
              {/* Category & meta row */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <LuxurySkeleton className="h-5 w-20" />
                <LuxurySkeleton className="h-4 w-24" />
                <LuxurySkeleton className="h-4 w-20" />
              </div>

              {/* Title skeleton - large, two lines */}
              <div className="space-y-3 mb-8">
                <LuxurySkeleton className="h-10 sm:h-12 md:h-14 w-full" />
                <LuxurySkeleton className="h-10 sm:h-12 md:h-14 w-3/4" />
              </div>

              {/* Author skeleton */}
              <div className="flex items-center pb-8 border-b border-gold/10">
                <div className="flex items-center gap-3">
                  <LuxurySkeleton className="h-10 w-10 !rounded-full" />
                  <div className="space-y-1.5">
                    <LuxurySkeleton className="h-4 w-28" />
                    <LuxurySkeleton className="h-3 w-20" />
                  </div>
                </div>
              </div>
            </header>

            {/* Article body skeleton - varying width lines */}
            <article className="space-y-4" aria-hidden="true">
              <LuxurySkeleton className="h-4 w-full" />
              <LuxurySkeleton className="h-4 w-11/12" />
              <LuxurySkeleton className="h-4 w-full" />
              <LuxurySkeleton className="h-4 w-4/5" />
              <LuxurySkeleton className="h-4 w-full" />
              <LuxurySkeleton className="h-4 w-9/12" />

              {/* Paragraph break */}
              <div className="h-4" />

              <LuxurySkeleton className="h-4 w-full" />
              <LuxurySkeleton className="h-4 w-10/12" />
              <LuxurySkeleton className="h-4 w-full" />
              <LuxurySkeleton className="h-4 w-3/4" />
              <LuxurySkeleton className="h-4 w-full" />
              <LuxurySkeleton className="h-4 w-5/6" />
            </article>
          </div>
        </div>
      </div>
    </div>
  );
}
