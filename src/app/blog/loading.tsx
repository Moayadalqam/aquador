export default function BlogLoading() {
  return (
    <div className="min-h-screen bg-gold-ambient">
      {/* Hero Skeleton */}
      <section className="relative pt-32 pb-16">
        <div className="container-wide">
          <div className="max-w-4xl mx-auto text-center">
            <div className="skeleton h-4 w-32 mx-auto mb-4" />
            <div className="skeleton h-12 w-80 mx-auto mb-6" />
            <div className="skeleton h-5 w-96 mx-auto" />
          </div>
        </div>
      </section>

      {/* Grid Skeleton */}
      <section className="section-sm">
        <div className="container-wide">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="product-card">
                <div className="skeleton aspect-[3/4]" />
                <div className="p-4 bg-white">
                  <div className="skeleton h-3 w-20 mb-2" />
                  <div className="skeleton h-4 w-full mb-2" />
                  <div className="pt-2 border-t border-gray-100">
                    <div className="skeleton h-3 w-32" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
