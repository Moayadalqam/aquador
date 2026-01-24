'use client';

import { useEffect } from 'react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console for debugging
    console.error('Admin Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-red-500/20 rounded-xl p-8 max-w-lg w-full text-center">
        <h2 className="text-2xl font-bold text-red-400 mb-4">Something went wrong</h2>
        <p className="text-gray-400 mb-2">Error: {error.message}</p>
        {error.digest && (
          <p className="text-gray-500 text-sm mb-4">Digest: {error.digest}</p>
        )}
        <div className="flex gap-4 justify-center mt-6">
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-gold text-black font-medium rounded-lg hover:bg-amber-500 transition-colors"
          >
            Try again
          </button>
          <a
            href="/admin/login"
            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
}
