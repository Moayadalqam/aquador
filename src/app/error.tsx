'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Home, RefreshCw } from 'lucide-react';
import * as Sentry from '@sentry/nextjs';
import Button from '@/components/ui/Button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full border border-gold/30 flex items-center justify-center">
            <span className="text-5xl">!</span>
          </div>
          <h1 className="text-4xl font-playfair text-gradient-gold mb-4">
            Something Went Wrong
          </h1>
          <p className="text-gray-400">
            We apologize for the inconvenience. An unexpected error has occurred.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={reset}>
            <RefreshCw className="w-5 h-5 mr-2" />
            Try Again
          </Button>
          <Link href="/">
            <Button variant="outline">
              <Home className="w-5 h-5 mr-2" />
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
