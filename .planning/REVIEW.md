# Production Review — Aquad'or v3.0

**Date:** 2026-04-11
**Auditors:** 4 parallel agents (Security, Performance, Reliability, Code Quality)

## CRITICAL (Deploy Blockers)

| # | Category | Issue | File:Line | Fix |
|---|----------|-------|-----------|-----|
| 1 | **Code Quality** | Custom perfume 100ml pricing is €49.99 in pricing.ts but should be €199.00 (webhook uses €199.00) | `src/lib/perfume/pricing.ts:17` | Change `return 49.99` → `return 199.00` |
| 2 | **Code Quality** | Payment API also uses wrong 100ml price (4999 cents = €49.99) | `src/app/api/create-perfume/payment/route.ts:42` | Import `calculatePrice()` from pricing module |
| 3 | **Security** | DOMPurify dynamic import race condition — HTML renders before sanitization completes | `src/components/blog/BlogContent.tsx:12-16`, `src/components/products/RichDescription.tsx` | Use static import, not dynamic |

## HIGH

| # | Category | Issue | File:Line | Fix |
|---|----------|-------|-----------|-----|
| 4 | Security | 18 npm vulnerabilities (2 critical, 6 high) | `package.json` | Run `npm audit fix` |
| 5 | Reliability | Webhook order persistence has no retry logic — orphaned payments if Supabase down | `src/app/api/webhooks/stripe/route.ts:469` | Add exponential backoff retry |
| 6 | Reliability | No uptime monitoring configured | - | Set up Vercel Cron + health check |
| 7 | Performance | Framer Motion (~150KB) loaded on every page via 95 files | Multiple | Consider code-splitting heavy animation components |
| 8 | Code Quality | Stripe webhook tests failing (15+ tests) — mock setup incomplete | `src/app/api/webhooks/stripe/__tests__/route.test.ts` | Fix mock integration |

## MEDIUM

| # | Category | Issue | Fix |
|---|----------|-------|-----|
| 9 | Performance | Blog ISR revalidation too aggressive (60s → should be 3600s) | Increase revalidate in blog pages |
| 10 | Performance | 95 instances of inline `style={{}}` objects | Move to CSS classes |
| 11 | Reliability | Inconsistent Sentry logging — some routes use console.error only | Replace with Sentry.captureException |
| 12 | Reliability | Custom perfume webhook metadata not validated | Add validation for volume/composition |
| 13 | Code Quality | Large files: create-perfume (979 LOC), ProductForm (568 LOC) | Extract sub-components |
| 14 | Code Quality | Several untyped fetch responses (ChatWidget, SearchBar, CheckoutButton) | Add type assertions |
| 15 | Performance | Some Image components missing `sizes` attribute | Add responsive sizes |

## LOW

| # | Category | Issue | Fix |
|---|----------|-------|-----|
| 16 | Performance | Missing preconnect to OpenRouter, Vercel Analytics | Add preconnect hints |
| 17 | Code Quality | 3D Scene.tsx uses `as any` for Three.js controls | Create typed wrapper |
| 18 | Code Quality | Unnecessary JSON.parse(JSON.stringify()) for cloning | Use structuredClone |
| 19 | Reliability | Health check doesn't verify Supabase connectivity | Add DB ping to /api/health |

## What's Already Good

- **Auth**: Server-side admin verification, middleware protection, RLS on all tables
- **Payments**: Server-side price validation, Stripe webhook signature verification, idempotent orders
- **Cart**: Zod schema validation on hydration, corruption recovery, localStorage persistence
- **Security headers**: Comprehensive CSP, HSTS, X-Frame-Options, Permissions-Policy
- **Rate limiting**: All sensitive endpoints protected (checkout, contact, payment, AI)
- **Error boundaries**: 3 levels (global, route, admin)
- **Data fetching**: Promise.all for parallel queries, request-level caching, no N+1

## Score: 72/100

- Security: 80/100 (strong except DOMPurify race + npm vulns)
- Performance: 65/100 (Framer Motion bundle, inline styles)
- Reliability: 70/100 (good error handling, missing retry + monitoring)
- Code Quality: 72/100 (strict TS, but pricing bug + test failures)

## Verdict

**3 CRITICAL issues must be fixed before shipping.** All are straightforward fixes (pricing values, DOMPurify import). After those, the site is production-ready.
