// This file configures the initialization of Sentry on the client (browser).
// The config you add here will be used whenever a user loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://e0374a8fc276105db08c2d4bf2c35796@o4510184257814528.ingest.de.sentry.io/4510965152743504",

  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1,

  // GDPR Compliance: Disable sending PII (email addresses, IP addresses, cookies)
  sendDefaultPii: false,

  // Replay disabled — no session replay to keep PII surface minimal
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,

  // Filter noisy / non-actionable errors before they're sent
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
    'Non-Error promise rejection captured',
    // Browser extensions
    /extension\//,
    /^chrome-extension:/,
    /^moz-extension:/,
    // Network noise
    'Network request failed',
    'Failed to fetch',
    'Load failed',
    // User-aborted navigations (handled by AbortErrorSuppressor)
    'AbortError',
    'The operation was aborted',
  ],
});
