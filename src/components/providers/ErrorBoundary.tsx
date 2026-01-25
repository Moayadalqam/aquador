'use client';

import { useEffect } from 'react';

/**
 * Suppresses harmless AbortErrors that occur during navigation.
 * These errors happen when fetch requests are cancelled due to:
 * - User navigating away before request completes
 * - React unmounting components with in-flight requests
 * - Next.js prefetch getting cancelled
 */
export function AbortErrorSuppressor() {
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Suppress AbortError - these are harmless navigation artifacts
      if (
        event.reason?.name === 'AbortError' ||
        event.reason?.message?.includes('signal is aborted') ||
        event.reason?.message?.includes('aborted')
      ) {
        event.preventDefault();
        return;
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return null;
}
