export default function ProductLoading() {
  return (
    <main className="min-h-screen bg-dark pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb skeleton */}
        <div className="mb-8">
          <div className="h-4 w-24 bg-dark-lighter rounded animate-pulse" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Image skeleton */}
          <div className="aspect-square bg-dark-lighter rounded-2xl animate-pulse" />

          {/* Content skeleton */}
          <div className="space-y-6">
            {/* Brand */}
            <div className="h-3 w-32 bg-dark-lighter rounded animate-pulse" />

            {/* Title */}
            <div className="space-y-2">
              <div className="h-8 w-3/4 bg-dark-lighter rounded animate-pulse" />
              <div className="h-8 w-1/2 bg-dark-lighter rounded animate-pulse" />
            </div>

            {/* Price */}
            <div className="h-10 w-28 bg-dark-lighter rounded animate-pulse" />

            {/* Details */}
            <div className="flex gap-4">
              <div className="h-10 w-32 bg-dark-lighter rounded-full animate-pulse" />
              <div className="h-10 w-24 bg-dark-lighter rounded-full animate-pulse" />
              <div className="h-10 w-28 bg-dark-lighter rounded-full animate-pulse" />
            </div>

            {/* Description */}
            <div className="pt-4 border-t border-gold/10 space-y-3">
              <div className="h-4 w-24 bg-dark-lighter rounded animate-pulse" />
              <div className="h-4 w-full bg-dark-lighter rounded animate-pulse" />
              <div className="h-4 w-full bg-dark-lighter rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-dark-lighter rounded animate-pulse" />
            </div>

            {/* Quantity selector */}
            <div className="flex items-center gap-4">
              <div className="h-4 w-16 bg-dark-lighter rounded animate-pulse" />
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-dark-lighter rounded-full animate-pulse" />
                <div className="w-12 h-6 bg-dark-lighter rounded animate-pulse" />
                <div className="w-10 h-10 bg-dark-lighter rounded-full animate-pulse" />
              </div>
            </div>

            {/* Add to cart button */}
            <div className="h-14 w-full bg-dark-lighter rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </main>
  );
}
