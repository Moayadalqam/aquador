'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('skeleton', className)} />;
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white overflow-hidden">
      {/* Image skeleton */}
      <Skeleton className="aspect-square w-full" />
      {/* Content skeleton */}
      <div className="p-5 space-y-3">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-5 w-3/4" />
        <div className="pt-3 border-t border-gray-100">
          <Skeleton className="h-3 w-12 mb-2" />
          <div className="flex justify-between">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function TextSkeleton({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn('h-4', i === lines - 1 ? 'w-2/3' : 'w-full')}
        />
      ))}
    </div>
  );
}

export function PageLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gold-ambient pt-32 pb-16">
      <div className="container-wide">
        {/* Hero skeleton */}
        <div className="text-center mb-16">
          <Skeleton className="h-12 w-64 mx-auto mb-4" />
          <Skeleton className="h-px w-16 mx-auto mb-5" />
          <Skeleton className="h-5 w-96 mx-auto" />
        </div>
        {/* Content skeleton */}
        <ProductGridSkeleton count={8} />
      </div>
    </div>
  );
}

export function SpinnerLoader({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  };

  return (
    <div
      className={cn(
        'rounded-full border-gold border-t-transparent animate-spin',
        sizes[size],
        className
      )}
    />
  );
}

export function FullPageLoader() {
  return (
    <div className="min-h-screen bg-gold-ambient flex items-center justify-center">
      <SpinnerLoader size="lg" />
    </div>
  );
}
