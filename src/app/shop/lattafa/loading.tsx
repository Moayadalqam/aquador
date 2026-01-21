export default function LattafaLoading() {
  return (
    <div className="pt-24 pb-16 bg-dark min-h-screen">
      {/* Hero Skeleton */}
      <section className="relative py-24">
        <div className="w-full px-4 sm:px-8 lg:px-16 xl:px-24 text-center">
          <div className="h-4 w-32 bg-gold/20 rounded mx-auto mb-6 animate-pulse" />
          <div className="h-12 w-80 bg-gold/20 rounded mx-auto mb-4 animate-pulse" />
          <div className="h-6 w-96 bg-gray-700 rounded mx-auto animate-pulse" />
        </div>
      </section>

      {/* Search Skeleton */}
      <section className="w-full px-4 sm:px-8 lg:px-16 xl:px-24 py-8">
        <div className="max-w-xl mx-auto">
          <div className="h-12 bg-gray-800 rounded-lg animate-pulse" />
        </div>
      </section>

      {/* Products Grid Skeleton */}
      <section className="w-full px-4 sm:px-8 lg:px-16 xl:px-24 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl overflow-hidden shadow-lg">
              <div className="aspect-[4/5] bg-gray-200 animate-pulse" />
              <div className="p-5 space-y-3">
                <div className="h-5 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="flex justify-between">
                  <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
