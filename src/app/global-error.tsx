'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, backgroundColor: '#0a0a0a', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
        }}>
          <div style={{ textAlign: 'center', maxWidth: '400px' }}>
            <div style={{
              width: '96px',
              height: '96px',
              margin: '0 auto 24px',
              borderRadius: '50%',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <span style={{ fontSize: '48px' }}>!</span>
            </div>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: 'normal',
              marginBottom: '1rem',
              color: '#D4AF37',
            }}>
              Something Went Wrong
            </h1>
            <p style={{
              color: '#9ca3af',
              marginBottom: '2rem',
              lineHeight: 1.6,
            }}>
              We apologize for the inconvenience. A critical error has occurred.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={reset}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#D4AF37',
                  color: '#000',
                  border: 'none',
                  borderRadius: '9999px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Try Again
              </button>
              <a
                href="/"
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'transparent',
                  color: '#D4AF37',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  borderRadius: '9999px',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Go Home
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
