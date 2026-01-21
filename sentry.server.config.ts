import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Performance Monitoring
  tracesSampleRate: 1.0,

  // Only send errors in production
  enabled: process.env.NODE_ENV === "production",

  // Set environment
  environment: process.env.NODE_ENV,

  // Filter out expected errors
  ignoreErrors: [
    // Stripe webhook signature failures (handled gracefully)
    "Invalid signature",
    // Rate limit responses (not actual errors)
    "Rate limit exceeded",
  ],
});
