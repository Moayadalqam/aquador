export default function ShopLoading() {
  return (
    <main className="min-h-screen bg-dark pt-28 pb-16">
      {/* Hero skeleton */}
      <div className="relative py-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="h-12 w-64 bg-dark-lighter rounded animate-pulse mx-auto mb-4" />
          <div className="h-6 w-96 bg-dark-lighter rounded animate-pulse mx-auto" />
        </div>
      </div>

      {/* Search and filters skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="h-12 w-full sm:w-80 bg-dark-lighter rounded animate-pulse" />
          <div className="flex gap-2">
            <div className="h-10 w-24 bg-dark-lighter rounded-full animate-pulse" />
            <div className="h-10 w-24 bg-dark-lighter rounded-full animate-pulse" />
            <div className="h-10 w-24 bg-dark-lighter rounded-full animate-pulse" />
          </div>
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
