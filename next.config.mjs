import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance budgets (enforced in CI/production builds)
  // - First Load JS: < 200KB (currently ~180KB)
  // - Largest Contentful Paint: < 2.5s
  // - Cumulative Layout Shift: < 0.1
  // - Interaction to Next Paint: < 200ms
  //
  // Animation performance targets:
  // - All animations: 60fps (16.67ms per frame)
  // - Parallax scroll: < 5ms per frame
  // - Micro-interactions: < 150ms total duration
  // - Page transitions: < 300ms total duration

  experimental: {
    optimizePackageImports: ['motion', 'framer-motion', 'lucide-react', 'three', '@react-three/drei'],
  },

  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 86400,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      // NOTE: Kept for ~100 product images stored in Supabase DB that reference Squarespace CDN.
      // Hero video + Lattafa category image migrated off Squarespace in v3.2 (P29 T4).
      // Full product image migration tracked as future work.
      {
        protocol: 'https',
        hostname: 'images.squarespace-cdn.com',
      },
    ],
  },
  // CSP connect-src notes:
  // - openrouter.ai: AI fragrance assistant proxy (added v3.2 — allows future client-side move)
  // Server-side only (no CSP entry needed, documented for reference):
  // - api.resend.com: transactional email via Resend (contact form, order confirmations)
  // - graph.facebook.com: WhatsApp notifications via Meta Cloud API
  async redirects() {
    return [
      // Old gender URLs were /shop/gender/{men|women|unisex}; flattened to /shop/{gender} in v3.3.
      {
        source: '/shop/gender/:gender(men|women|unisex)',
        destination: '/shop/:gender',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; img-src 'self' https: data: blob:; script-src 'self' 'unsafe-inline' https://vercel.live https://*.vercel.live https://js.stripe.com https://*.sentry.io; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; frame-src https://www.google.com https://js.stripe.com https://vercel.live; media-src 'self' https://*.supabase.co; connect-src 'self' https://api.stripe.com https://openrouter.ai https://vercel.live https://*.vercel.app wss://ws-us3.pusher.com https://*.sentry.io https://*.supabase.co wss://*.supabase.co;",
          },
        ],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "qualia-solutions",

  project: "aquador",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
