---
date: 2026-05-08
mode: perf+ui+backend
critical: 0
high: 5
medium: 14
low: 14
status: needs_attention
---

# Optimization Report — v4.0 Pre-Plan

**Project:** aquador (Aquad'or Cyprus) | **Mode:** --perf --ui --backend | **Date:** 2026-05-08
**Live:** https://www.aquadorcy.com (v3.9 shipped) | **Stack:** Next.js 14.2.35, React 18, Supabase, Stripe

## Summary

v3.9 left the codebase in solid shape — RLS hardened, no critical security holes, design system consistent, rate limiting wired on hot paths. The next round of gains is concentrated in **bundle weight (duplicate animation libs), LCP (hero video), client-boundary hoisting (CartProvider in layout), and SEO/a11y polish**. No critical blockers; 5 HIGH items are all 1-3hr fixes.

Design rubric: Typography 4 · Color 5 · Spacing 5 · States 4 · Responsiveness 4 · A11y 3 → **4.2/5 overall**.

## High Priority

| # | Dimension | Finding | Location | Fix |
|---|-----------|---------|----------|-----|
| H1 | Security | Next.js 14.2.35 has 5 DoS CVEs (Image Optimizer, RSC smuggling, postcss XSS) | `package.json:next` | Bump to latest 14.2.x patch covering all advisories, OR upgrade to Next 16 (breaking) |
| H2 | DevEx | TypeScript binary missing from `node_modules/` — `npm run type-check` fails | `package.json` declares `typescript: ^5` | `npm install` then add CI smoke test for `tsc --version` |
| H3 | Perf/Bundle | Both `framer-motion` AND `motion` in deps; all 79 imports already use `motion/react` | `package.json:44-48` | `npm uninstall framer-motion` (~40-60KB gzipped saved) |
| H4 | Perf/LCP | 5.3MB hero video loads eagerly with `preload="metadata"` | `src/components/home/Hero.tsx:31-48` | Transcode to VP9/720p ~1.5MB WebM, serve as first `<source>`, add `fetchpriority="low"` |
| H5 | Architecture | CartProvider + SiteFrame force entire layout into client boundary | `src/app/layout.tsx:7-8`, `SiteFrame.tsx:4` | Extract `ClientShell` wrapper; keep `layout.tsx` as RSC for streaming |

## Medium Priority

| # | Dimension | Finding | Location | Fix |
|---|-----------|---------|----------|-----|
| M1 | Perf | 7 concurrent `useScroll` hooks on homepage (ScrollFade ×5 + Categories + FeaturedProducts + SignatureStories + Hero3DScroll + CreateSection) | homepage components | Single `ScrollProgressProvider`, derive child progress via offset math |
| M2 | Perf | Blog post page waterfall: `getPostCategory` → then `Promise.all` | `src/app/blog/[slug]/page.tsx:78-84` | Skip category prefetch (post already contains it) or wrap related posts in Suspense |
| M3 | Perf | 772-line `create-perfume/page.tsx` shipped as one client chunk | `src/app/create-perfume/page.tsx:1` | Split steps via `dynamic()`; lazy-load fragranceDatabase + Stripe step |
| M4 | Bundle | 21 `any` type usages across src/ | various | Replace with `unknown` + type guards or proper interfaces |
| M5 | Bundle | 5 console.log calls in performance instrumentation leak to prod | `src/lib/performance/metrics.ts:31,54`; `animation-budget.tsx:170,181,286` | Gate behind `NODE_ENV === 'development'` or use Sentry breadcrumbs |
| M6 | Architecture | Large monolithic files: reorder (629), admin/categories (567), admin/ProductForm (563) | listed | Extract co-located sub-components |
| M7 | Architecture | 69% client-component ratio (126/182 .tsx) — RSC under-utilized | codebase-wide | Audit `'use client'` — push boundary to leaf interactive components |
| M8 | A11y | Navbar `<nav>` not wrapped in `<header>` landmark | `src/components/layout/Navbar.tsx:131` | Wrap outer div in `<header>` |
| M9 | Typography | 112 instances of `text-[10px]` below WCAG-recommended size | various, e.g. `create-perfume/page.tsx:227` | Raise to `text-xs` (12px), keep `tracking-wider` for eyebrow effect |
| M10 | A11y | Auto-advance after 650ms in create-perfume with no undo | `src/app/create-perfume/page.tsx:114` | Add Undo toast OR extend to 1500ms with progress indicator OR disable on `prefers-reduced-motion` |
| M11 | UI/'use client' | 5 pure presentational components needlessly client-side: Skeleton, AnimatedLink, RelatedProductsSkeleton, CustomersTable, Canvas3DBoundary | listed | Remove `'use client'` directive |
| M12 | Backend | `admin/orders/route.ts` uses bare `.select()` post-insert | `src/app/api/admin/orders/route.ts:96` | Explicit column list |
| M13 | Backend | `session-details` route exposes order PII to anyone with cs_ session ID for 24h | `src/app/api/checkout/session-details/route.ts:82-96` | Tie lookup to checkout-scoped cookie or one-time token |
| M14 | UX | Reorder page fakes submit with 2s setTimeout — no real backend | `src/app/reorder/page.tsx:179` | Wire to `/api/reorder` with real error states |

## Low Priority

| # | Dimension | Finding | Location | Fix |
|---|-----------|---------|----------|-----|
| L1 | Typography | Poppins uses `display: "optional"` — body text can permanently fall back to system | `src/app/layout.tsx:20` | Change to `display: "swap"` |
| L2 | Animation | `bounce: 0.4` spring feels dated for luxury brand | `src/app/reorder/page.tsx:205` | `stiffness: 400, damping: 25` |
| L3 | Perf | 12 `will-change` declarations, 2 in `globals.css` static | `globals.css:412,423` + components | Remove static; component-level guards already exist |
| L4 | Backend | `blog/categories` + `blog/featured` lack rate limiting | listed | Add `checkRateLimit(request, 'search')` |
| L5 | Backend | `live-chat/session/[id]` GET lacks rate limiting | `src/app/api/live-chat/session/[id]/route.ts:16` | Add new `live_chat` limiter |
| L6 | Backend | Rate limit silently no-ops when Upstash unconfigured | `src/lib/rate-limit.ts:143-145` | Startup warn log when `isConfigured === false` |
| L7 | Observability | No `sentry.client.config.ts` — browser JS errors not captured | (file missing) | Create with `sendDefaultPii: false` |
| L8 | Migrations | `20260224_manual_orders.sql` adds constraint without `IF NOT EXISTS` | `supabase/migrations/20260224_manual_orders.sql:13` | Wrap in `DO $$ … EXCEPTION` block |
| L9 | Code | 1 TODO comment in src/ | grep | Resolve or convert to issue |
| L10 | Perf | 289 sequential awaits outside Promise.all (most likely intentional) | various | Spot-audit hot data-fetch paths |
| L11 | UX | Reorder success bounce animation | `src/app/reorder/page.tsx:205` | Reduce bounce |
| L12 | DevEx | No `.next/` build output to inspect bundle | — | Run `npm run build` separately for analysis |
| L13 | Code | Some `as any` casts in tests | tests | Acceptable in tests; no fix |
| L14 | Backend | `is_admin()` includes `service_role` bypass (intentional) | migration | No action — sound for threat model |

## Verified Clean

- DOMPurify guards all 3 `dangerouslySetInnerHTML` sites
- service_role isolated to server-only files
- No `.env` tracked in git
- 0 empty catch blocks
- 0 raw `<img>` tags (all use `next/image` with `sizes`)
- All RLS policies present and check `auth.uid()` correctly
- Live chat v3.9 lockdown verified (commit 233e299)
- Stripe webhook signature-verified + idempotent
- Email sends idempotent (DB dedup)
- Skip link + focus rings + reduced-motion all present
- All 72 motion imports use unified `motion/react` package

## Top 5 Wins (highest ROI)

1. **`npm uninstall framer-motion`** — 5 min · 40-60KB bundle reduction (H3)
2. **Transcode hero video to VP9/720p** — 30 min · LCP -2-3s on mobile (H4)
3. **Extract ClientShell from layout.tsx** — 1 hr · FCP -200-400ms, unlocks RSC streaming (H5)
4. **Single ScrollProgressProvider for homepage** — 2 hr · eliminates 6 redundant scroll listeners (M1)
5. **Raise text-[10px] → text-xs across 112 sites** — global find-replace · readability win on mobile (M9)

## Estimated Lighthouse Delta

| Metric | Current (est.) | After Top 5 |
|--------|---------------:|------------:|
| Performance | 65-72 (mobile) | 80-88 |
| FCP | ~2.2s | ~1.6s |
| LCP | ~4.5s | ~2.5s |
| TBT | ~350ms | ~250ms |
| First Load JS | ~200KB | ~145KB |

## Verdict

**Status: needs_attention** (5 HIGH, no CRITICAL). Site is production-stable; gains are concentrated in bundle/LCP/RSC. Recommended next step: feed into a v4.0 phase plan + `/qualia-optimize --fix` for the LOW/MEDIUM auto-applicable items.
