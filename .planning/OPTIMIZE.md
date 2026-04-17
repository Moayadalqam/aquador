---
date: 2026-04-17 02:05
mode: full
critical: 2
high: 10
medium: 11
low: 8
status: needs_attention
---

# Optimization Report

**Project:** aquador | **Mode:** full | **Date:** 2026-04-17
**Scope:** post-v3.1 optimization sweep across frontend, backend, performance, architecture

## Summary

Three parallel specialist agents (frontend, backend, performance) plus an architecture synthesizer analyzed the codebase against the v3.1 baseline. Two true **CRITICAL** issues surface — both security-shaped: one allows checkout of deactivated products, the other leaks unpublished blog drafts. Ten **HIGH** findings cluster around five root causes (incomplete App Router conventions, live-chat feature hygiene, AI assistant gaps, dead-code bloat, and AnimationBudgetProvider scope). The codebase is structurally sound post-v3.1 — most issues are cleanups and edge-case hardening, not architectural debt.

## Critical Issues

| # | Dimension | Finding | Location | Fix |
|---|-----------|---------|----------|-----|
| 1 | Backend Security | `getProductsByIds` lacks `is_active` filter → checkout can purchase deactivated products | `src/lib/supabase/product-service.ts:55-70` used by `src/lib/validation/cart.ts:64` | Add `is_active` check in `validateCartPrices` (not in the helper — webhook legitimately needs inactive lookup). Reject inactive items with clear error. |
| 2 | Backend Security | `/api/blog/[slug]` GET has no `status = 'published'` filter or auth gate → draft posts readable by slug | `src/app/api/blog/[slug]/route.ts:30-35` | Default to `.eq('status', 'published')` for anon requests; allow drafts only for authenticated admin via existing `admin_users` check. |

## High Priority

| # | Dimension | Finding | Location | Fix |
|---|-----------|---------|----------|-----|
| 3 | Backend Security | `/api/admin/setup` relies solely on env flag + timing-safe secret, no rate limiting, not behind middleware auth | `src/app/api/admin/setup/route.ts:39`, `src/middleware.ts:21-67` | Add `checkRateLimit(request, 'checkout')` at top of POST + PUT handlers. Verify `ADMIN_SETUP_COMPLETE=true` in Vercel env. |
| 4 | Backend Security | `live_chat_sessions` + `live_chat_messages` tables have no RLS migration but are client-queried | tables missing from `supabase/migrations/20260302_enable_rls_all_tables.sql` | New migration: enable RLS; visitor-owned sessions readable/writable by `visitor_id`; admin reads all via `is_admin()`. |
| 5 | Performance | Product page sequential data fetch (`getProductBySlug` → `getRelatedProducts`) blocks TTFB | `src/app/products/[slug]/page.tsx:77-84` | Wrap `RelatedProducts` in `<Suspense>` so main product renders immediately, related streams in after. |
| 6 | Performance | `/shop` forced dynamic by server-side `searchParams` access — defeats `revalidate = 1800` | `src/app/shop/page.tsx:30-36` | Remove `searchParams` server-side; move filtering entirely to `ShopContent` (client) which already uses `useSearchParams()`. Server fetches `getAllProducts()` only. |
| 7 | Performance | `AnimationBudgetProvider` runs `requestAnimationFrame` continuously on every page (mounted in root layout) | `src/lib/performance/animation-budget.tsx:145-176`, `src/app/layout.tsx:144` | Scope provider to pages with heavy animation (home, `/create-perfume`, shop) OR stop RAF after initial 3-5s measurement + restart on navigation. |
| 8 | Performance | No `pg_trgm` index for product ILIKE search on `name`/`description`/`brand` | `src/lib/supabase/product-service.ts:196-211` vs `supabase/migrations/20260303_add_performance_indexes.sql` | New migration: `CREATE EXTENSION pg_trgm; CREATE INDEX idx_products_search_trgm ON products USING GIN ((name \|\| ' ' \|\| COALESCE(brand, '')) gin_trgm_ops);` |
| 9 | Frontend | Missing `loading.tsx` on `/blog/[slug]` and `/shop/gender/[gender]` — blank flash on ISR cache miss | route dirs | Create route-segment loading files using existing `LuxurySkeleton` pattern. |
| 10 | Frontend / Bundle | Dead code: `src/lib/animations/variants.ts` (413 lines, 0 imports) + `src/components/3d/CustomPerfumeBottle.tsx` (orphan) + unused `@stripe/stripe-js` package | package.json, two orphan files | Delete both files, `npm uninstall @stripe/stripe-js @react-three/gltfjsx`, re-run tsc + build to verify. |
| 11 | Backend Reliability | AI assistant fetch to OpenRouter has no timeout — can hang 30s | `src/app/api/ai-assistant/route.ts:113-127` | Replace raw `fetch` with existing `fetchWithTimeout({ timeout: 15000 })` from `@/lib/api-utils`. |
| 12 | Architecture | 3D subsystem loads full Three.js + R3F + drei (~600KB) even on unsupported devices — `supports3D` check runs after dynamic import | `src/components/3d/ProductViewer.tsx:8`, `src/components/products/ProductGallery.tsx:12-22` | Move `useDeviceCapabilities` up to `ProductGallery`; only render `<ProductViewer>` when `show3D && supports3D`. |

## Medium Priority

| # | Dimension | Finding | Location | Fix |
|---|-----------|---------|----------|-----|
| 13 | Backend Reliability | No `revalidatePath`/`revalidateTag` anywhere in codebase after mutations | all `/api/blog/*` POST/PUT/DELETE, `/api/admin/orders` | Add `revalidatePath('/blog')` + `revalidatePath('/blog/${slug}')` after blog writes; same pattern for product/order mutations. |
| 14 | Backend Reliability | Customer upsert race condition on concurrent orders (read-then-write pattern) | `src/app/api/webhooks/stripe/route.ts:76-115`, `src/app/api/admin/orders/route.ts:107-145` | Use Supabase `upsert` with `onConflict: 'email'` OR RPC for atomic increment of `total_orders`/`total_spent`. |
| 15 | Backend Security | `/api/search` has no rate limiting — scraping + DB stress vector | `src/app/api/search/route.ts:5-37` | Add `search` limiter to `rate-limit.ts` (sliding window 20/min); `checkRateLimit(request, 'search')` at top of handler. |
| 16 | Backend Info Disclosure | `/api/health` leaks which 3rd-party services are configured (Stripe/Resend/Sentry booleans) | `src/app/api/health/route.ts:13-17` | Return only `{status, timestamp, version}` publicly. Gate the `checks` object behind admin auth if still needed. |
| 17 | Frontend A11y | `CheckoutForm` labels lack `htmlFor`/`id` linkage + `ChatWidget` inputs have no `aria-label` | `src/app/create-perfume/components/CheckoutForm.tsx:123-199`, `src/components/ai/ChatWidget.tsx:213,240` | Add matching `id`/`htmlFor` pairs in CheckoutForm. Add `aria-label` on ChatWidget inputs + send buttons. Messages container: `role="log"` + `aria-live="polite"`. |
| 18 | Frontend Reliability | Hero video + 1 category image load from Squarespace CDN (external dependency) | `src/components/home/Hero.tsx:40-41`, `src/lib/categories.ts:65` | Download both, upload to Supabase Storage or Vercel Blob, update URLs. Tighten `media-src` in CSP after migration. |
| 19 | Frontend | Missing `error.tsx` on dynamic route segments (`/blog/[slug]`, `/shop/[category]`, `/products/[slug]`, `/shop/gender/[gender]`) | missing files | Add contextual error pages with "Back to X" action. Highest priority: products + blog (highest traffic). |
| 20 | Performance | `PageTransition` `mode="wait"` adds 200-400ms per client-side navigation | `src/components/providers/PageTransition.tsx:62-74` | Switch to `mode="popLayout"` OR reduce exit duration to <100ms OR remove exit animation entirely (entrance-only). |
| 21 | Performance | `ChatWidget` creates Supabase client per mount + runs both polling (3s) AND Realtime subscriptions simultaneously (~40 queries/min) | `src/components/ai/ChatWidget.tsx:92, 98-121` | Lift Supabase client to shared singleton/context. Use Realtime as primary, polling only as fallback on Realtime error. Raise polling interval to 5-10s. |
| 22 | Architecture | 3 distinct JSON-LD serialization patterns coexist (`jsonLdScript()`, `safeStringify()`, raw `JSON.stringify().replace()`) | `src/lib/seo/listing-schema.ts`, `src/app/page.tsx`, `src/app/products/[slug]/page.tsx` et al | Consolidate to a single `<JsonLd schema={x}/>` server component or one unified helper. |
| 23 | Performance / AI | AI catalogue: 295 products inlined (~15KB), linear scan per request, only 13 hardcoded note keywords triggers catalogue context | `src/lib/ai/catalogue-data.ts`, `src/app/api/ai-assistant/route.ts:32, 93, 300-312` | Pre-build Map for O(1) keyword lookups. Expand keyword list OR pass catalogue summary (brands, price ranges) in SYSTEM_PROMPT so AI can recommend without keyword match. |

## Low Priority

| # | Dimension | Finding | Location | Fix |
|---|-----------|---------|----------|-----|
| 24 | Frontend | ~40 hardcoded hex colors (`#D4AF37`, `#FFD700`, `#0a0a0a`) in create-perfume + 3D + OG components | `src/app/create-perfume/page.tsx:25-29,100-110,502,814`, `src/components/3d/PerfumeBottle.tsx:33,44,54`, `src/app/api/og/route.tsx:16-25` | Inline `style` gradient blocks → CSS custom properties from globals.css. Keep OG/SVG hex (no Tailwind in ImageResponse). |
| 25 | Frontend / Bundle | `optimizePackageImports` in `next.config.mjs` misses `three` + `@react-three/drei` | `next.config.mjs:18` | Add both to the array. |
| 26 | Backend Observability | Inconsistent error logging: 12 `console.error` calls without `Sentry.captureException` or `formatApiError` | `search/route.ts:29`, `heartbeat/route.ts:59`, `health/route.ts:27`, `blog/*`, `admin/setup/route.ts:100,155` | Replace raw `console.error` + error-message response with `Sentry.captureException(error)` + `formatApiError(error, '...')` pattern used in checkout/webhook. |
| 27 | Backend Security | CSP `connect-src` missing `https://openrouter.ai` — latent misconfiguration if AI moves client-side | `next.config.mjs:85` | Add `https://openrouter.ai` to connect-src. No immediate impact (server-side call). |
| 28 | Performance | `FeaturedProducts` dynamic(ssr:true) is a no-op — same effect as static import | `src/app/page.tsx:8-10` | Change to static import OR flip to `ssr: false` + loading skeleton if deferred render was intended. |
| 29 | Performance | `itemCount` + `subtotal` in `CartProvider` not memoized (correctness, not perf) | `src/components/cart/CartProvider.tsx:187-188` | Wrap with `useMemo(..., [cart.items])`. |
| 30 | Backend Security | POST API routes missing `Cache-Control: no-store` (checkout, AI assistant) | `src/app/api/checkout/route.ts:112-114`, `src/app/api/ai-assistant/route.ts:142-144` | Set `Cache-Control: no-store, no-cache` on response headers. |
| 31 | Performance | No `LazyMotion` at root — would save ~15KB shared bundle but requires migrating 77 `motion.*` → `m.*` | `src/app/layout.tsx` (missing `LazyMotion`) | Future refactor. Wrap layout with `<LazyMotion features={domAnimation} strict>`. Migrate components gradually. |

## Dead Code Sweep (delete outright)

- `src/lib/animations/variants.ts` — 413 lines, zero imports
- `src/components/3d/CustomPerfumeBottle.tsx` — orphan, never imported
- `@stripe/stripe-js` in `package.json` dependencies — zero `loadStripe` / import references
- `@react-three/gltfjsx` in devDependencies — no GLTF files in repo, no usage found

## Severity Re-ranking Notes

- **Perf C1 → MEDIUM** (product page waterfall): `getProductBySlug` is `cache()`-wrapped; `generateMetadata` and page component deduplicate. Only `getRelatedProducts` is on the critical path.
- **Backend C2 → HIGH** (admin setup): Three defense layers exist (timing-safe secret, env flag, existing-admin check). Still HIGH due to stateless env gating + missing rate limit.
- **Backend H5 → CRITICAL** (`getProductsByIds` no is_active): Checkout security gate. Single-line fix, maximum impact — this is the real critical.

## Recommended Fix Ordering

### Quick wins (< 30 min each)
1. `is_active` filter in `validateCartPrices` (CRITICAL #1) — close checkout hole
2. `status='published'` filter on blog GET (CRITICAL #2) — close draft leak
3. Delete `variants.ts`, `CustomPerfumeBottle.tsx`, uninstall `@stripe/stripe-js` + `@react-three/gltfjsx` (HIGH #10)
4. Add `'three'`, `'@react-three/drei'` to `optimizePackageImports` + `openrouter.ai` to CSP (#25, #27)
5. `fetchWithTimeout` on AI assistant (HIGH #11)
6. Rate-limit `/api/admin/setup` + `/api/search` (#3, #15)
7. Strip `/api/health` service flags (#16)

### Medium effort (1–2h each)
8. Add `loading.tsx` + `error.tsx` to dynamic route segments (HIGH #9, MED #19)
9. Scope `AnimationBudgetProvider` or add idle detection (HIGH #7)
10. Move `/shop` `searchParams` to client — convert to static (HIGH #6)
11. Suspense-stream `RelatedProducts` (HIGH #5)
12. Consolidate JSON-LD emission pattern (MED #22)
13. Unify error logging (Sentry + formatApiError) across all API routes (LOW #26)

### Needs planning (half-day+)
14. Live chat hygiene bundle: RLS migration + single Supabase client + polling-as-fallback + a11y labels (HIGH #4 + MED #17, #21)
15. `revalidatePath`/`revalidateTag` sweep across all mutation endpoints (MED #13)
16. Customer upsert race condition fix (RPC or atomic upsert) (MED #14)
17. Gate 3D viewer on device capability before dynamic import (HIGH #12)
18. Migrate Hero video + category image off Squarespace CDN (MED #18)
19. `pg_trgm` search index migration (HIGH #8)
20. Expand AI assistant keyword map + build O(1) lookup (MED #23)
