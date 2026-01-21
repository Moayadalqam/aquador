export default function CheckoutSuccessLoading() {
  return (
    <main className="min-h-screen bg-dark pt-32 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Success icon skeleton */}
        <div className="w-24 h-24 bg-dark-lighter rounded-full animate-pulse mx-auto mb-8" />

        {/* Title skeleton */}
        <div className="h-10 w-64 bg-dark-lighter rounded animate-pulse mx-auto mb-4" />

        {/* Subtitle skeleton */}
        <div className="h-6 w-96 bg-dark-lighter rounded animate-pulse mx-auto mb-2" />
        <div className="h-6 w-72 bg-dark-lighter rounded animate-pulse mx-auto mb-8" />

        {/* Order details skeleton */}
        <div className="bg-dark-lighter/50 rounded-2xl p-8 mb-8 space-y-4">
          <div className="h-6 w-40 bg-dark-lighter rounded animate-pulse mx-auto" />
          <div className="h-4 w-48 bg-dark-lighter rounded animate-pulse mx-auto" />
          <div className="h-4 w-32 bg-dark-lighter rounded animate-pulse mx-auto" />
        </div>

        {/* Button skeleton */}
        <div className="h-14 w-48 bg-dark-lighter rounded-full animate-pulse mx-auto" />
      </div>
    </main>
  );
}
