export default function CategoryLoading() {
  return (
    <main className="min-h-screen bg-dark pt-28 pb-16">
      {/* Hero skeleton */}
      <div className="relative py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="h-4 w-32 bg-dark-lighter rounded animate-pulse mx-auto mb-4" />
          <div className="h-12 w-72 bg-dark-lighter rounded animate-pulse mx-auto mb-4" />
          <div className="h-6 w-64 bg-dark-lighter rounded animate-pulse mx-auto" />
        </div>
      </div>

      {/* Filter bar skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex gap-4 items-center">
          <div className="h-10 w-32 bg-dark-lighter rounded-full animate-pulse" />
          <div className="h-10 w-32 bg-dark-lighter rounded-full animate-pulse" />
          <div className="h-6 w-24 bg-dark-lighter rounded animate-pulse ml-auto" />
        </div>
      </div>

      {/* Products grid skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="aspect-square bg-dark-lighter rounded-lg animate-pulse" />
              <div className="space-y-2">
                <div className="h-3 w-16 bg-dark-lighter rounded animate-pulse" />
                <div className="h-4 w-full bg-dark-lighter rounded animate-pulse" />
                <div className="h-5 w-20 bg-dark-lighter rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
