export default function CheckoutCancelLoading() {
  return (
    <main className="min-h-screen bg-dark pt-32 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Icon skeleton */}
        <div className="w-24 h-24 bg-dark-lighter rounded-full animate-pulse mx-auto mb-8" />

        {/* Title skeleton */}
        <div className="h-10 w-56 bg-dark-lighter rounded animate-pulse mx-auto mb-4" />

        {/* Subtitle skeleton */}
        <div className="h-6 w-80 bg-dark-lighter rounded animate-pulse mx-auto mb-2" />
        <div className="h-6 w-64 bg-dark-lighter rounded animate-pulse mx-auto mb-8" />

        {/* Buttons skeleton */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <div className="h-14 w-40 bg-dark-lighter rounded-full animate-pulse" />
          <div className="h-14 w-40 bg-dark-lighter rounded-full animate-pulse" />
        </div>
      </div>
    </main>
  );
}
