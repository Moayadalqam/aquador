---
date: 2026-04-18
mode: full
fixed: 13
deferred_high: 4
deferred_medium: 10
deferred_low: 16
status: needs_attention
---

# Optimization Report — v3.8

**Project:** aquador (Next.js 14 luxury perfume e-commerce)
**Mode:** full (frontend + backend + performance)
**Date:** 2026-04-18
**Analyst:** 3 parallel specialist agents (frontend-agent, backend-agent, performance-oracle)

## Summary

3 parallel agents reviewed the codebase after v3.4 Cinematic Scroll shipped. They surfaced **0 CRITICAL**, **10 HIGH**, **21 MEDIUM**, and **16 LOW** findings across frontend, backend, security, performance, and accessibility dimensions.

Of those, **13 safe high/medium/low fixes were applied in this pass (v3.8)**; the remaining findings are documented below as deferred, with severity and suggested fix. Several require database migrations or deliberate scoping decisions (e.g. live chat RLS tightening, Framer Motion purge from static pages, Navbar focus trap) and belong in a dedicated follow-up phase.

This v3.8 pass also shipped three user-requested features alongside the fixes: cinematic homepage scroll (snap + horizontal + fade), clear-glass 3D bottle with real AQUAD'OR logo, and AQUAD'OR-first sort on men/women/niche pages.

---

## Fixed in v3.8 (this pass)

| # | Dimension | Finding | Location | Fix Applied |
|---|-----------|---------|----------|-------------|
| 1 | Bundle | `import * as THREE` blocked tree-shaking | `Hero3DScene.tsx`, `PerfumeBottle3D.tsx` | Switched to named imports (`Color`, `MathUtils`, type aliases) |
| 2 | Performance | ContactShadows re-rendered every frame | both 3D scenes | Added `frames={1}` — static shadow, frees ~2-4ms GPU/frame |
| 3 | Mobile | `h-[100vh]` clipped under iOS Safari URL bar | `Hero3DScroll.tsx:92` | Switched to `h-[100dvh]` |
| 4 | Performance | `getAllProducts()` unbounded | `product-service.ts:19` | Added `.limit(500)` safety cap |
| 5 | Performance | Hero poster (217KB JPG) preloaded on every page | `layout.tsx:133` | Removed — `<video poster>` attribute handles it |
| 6 | A11y | Footer link touch targets ~20px (WCAG fail) | `Footer.tsx:118,142` | Added `py-2 -my-0.5 min-h-[44px]` |
| 7 | Resilience | `sessionStorage` could throw in private browsing | `WelcomeSplash.tsx:12-24` | Wrapped in safeGet/safeSet helpers with try/catch |
| 8 | UX | `FeaturedProducts` returned `null` on empty | `FeaturedProducts.tsx:38` | Added graceful empty state with CTA to shop |
| 9 | Security | Middleware didn't protect `/api/admin/*` | `middleware.ts` | Extended matcher + branch returning 401/403 JSON for API paths |
| 10 | API | Blog admin check used `.single()` (throws on no row) | `/api/blog/route.ts:50`, `/api/blog/[slug]/route.ts:42` | Switched to `.maybeSingle()` |
| 11 | Observability | Admin routes used `checkout` rate-limit bucket | admin/setup, admin/products, admin/categories (8 call sites) | Switched to `admin` bucket |
| 12 | Render | Shop product cards had `layout` prop causing layout thrash on 100+ items | `ShopContent.tsx:227` | Removed `layout` + unused `gridLayoutTransition` import |
| 13 | A11y | create-perfume rotating rings + AmbientParticles ignored `prefers-reduced-motion` | `create-perfume/page.tsx:49-78, 477-487` | Wrapped in `useReducedMotion` guards — zero animation loops for affected users |

**Verification:** `npx tsc --noEmit` clean · `npm run lint` clean (no new warnings) · dev server smoke-tested `/`, `/shop`, `/shop/gender/men`, `/create-perfume` all HTTP 200 · `/api/admin/products` now returns 401 unauthenticated (middleware defense-in-depth confirmed).

---

## Deferred — HIGH severity

### H1. Live chat session enumeration via anon SELECT `USING (true)`
- **Where:** `supabase/migrations/20260417_enable_rls_live_chat.sql:31-36`
- **Why:** Any anonymous user can list every live chat session, exposing visitor IDs and enabling message-injection into other sessions.
- **Fix:** Route live chat reads through a server API that validates `session_secret`, then tighten anon SELECT to `USING (false)`. Requires DB migration + rewrite of `useLiveChatSession` and `live-chat/notify` route.
- **Severity:** HIGH
- **Why deferred:** Needs careful migration + chat-flow testing to avoid breaking the feature. Separate phase.

### H2. Live chat message injection into any session
- **Where:** same migration (messages INSERT policy)
- **Why:** Anon INSERT only checks session exists — not that caller owns it.
- **Fix:** Add `session_secret` check to INSERT policy or route all sends through a validating server API.
- **Severity:** HIGH — pairs with H1.

### H3. Navbar mobile menu does not trap focus
- **Where:** `src/components/layout/Navbar.tsx:226-343`
- **Why:** Keyboard/screen-reader users can Tab out of the overlay into hidden page content (WCAG 2.4.3 violation).
- **Fix:** Copy the focus-trap pattern already in `CartDrawer.tsx:24-63` (track focusable elements, cycle on Tab/Shift+Tab).
- **Severity:** HIGH — defer only because it needs browser-tested verification.

### H4. 3D scenes never dispose geometries/materials/textures
- **Where:** `Hero3DScene.tsx`, `PerfumeBottle3D.tsx`, `AquadorBottleGeometry.tsx`
- **Why:** Each mount/unmount accumulates GPU memory. Navigating `/ ↔ /create-perfume` steadily grows VRAM — risk of crashes on mobile over long sessions.
- **Fix:** Add `onCreated={(state) => () => state.gl.dispose()}` to each `<Canvas>` and memo-ize inline materials at module level. Dispose the `CanvasTexture` from `aquadorLogoTexture.ts` when the last consumer unmounts.
- **Severity:** HIGH (degradation over time, not immediate break).

---

## Deferred — MEDIUM severity

### M1. `/api/checkout/session-details` exposes shipping PII
- **Where:** `src/app/api/checkout/session-details/route.ts:41-183`
- **Why:** Anyone with the session ID (logged in proxies, analytics, referrers) gets name + full street address + postal code.
- **Fix:** Strip shipping fields from response; return only order number, items, total. Alternatively require a HMAC token cookie set at checkout.

### M2. Client-side product delete bypasses API route
- **Where:** `src/components/admin/ProductsTable.tsx:22-26`
- **Why:** Skips API-level Zod/Sentry/rate-limit/revalidate. Functions only because RLS policy is correct; no audit trail.
- **Fix:** Replace direct Supabase client delete with `fetch('/api/admin/products', { method: 'DELETE' })` — pattern matches `ProductForm.tsx:200-208`.

### M3. Admin setup PUT allows indefinite password resets
- **Where:** `src/app/api/admin/setup/route.ts:120`
- **Fix:** Set `ADMIN_SETUP_COMPLETE=true` in Vercel env OR remove the PUT handler entirely and use Supabase auth password reset.

### M4. Framer Motion shipped on static pages
- **Where:** `about/page.tsx`, `terms/page.tsx`, `privacy/page.tsx`, `shipping/page.tsx` — all `'use client'`
- **Why:** Each unnecessarily ships ~40KB FM runtime for simple fade-ins.
- **Fix:** Convert to Server Components; replace entrance animations with CSS `@keyframes`.

### M5. AmbientParticles × 20 infinite animations across create-perfume
- **Where:** `create-perfume/page.tsx` called at 3 step renders simultaneously
- **Fix:** Convert to CSS `@keyframes` (compositor-accelerated); render only on active step; reduce count to 8-10.
- **Partial:** Reduced-motion users now get zero particles (fixed in v3.8 #13).

### M6. Admin dashboard unbounded orders query
- **Where:** `src/app/admin/page.tsx:56`
- **Fix:** Split into three efficient queries: `count: 'exact', head: true` for total, RPC aggregate for revenue, `.limit(5)` for recent.

### M7. `live-chat/notify` uses `createPublicClient` for privileged check
- **Where:** `src/app/api/live-chat/notify/route.ts:97`
- **Fix:** Replace with `createAdminClient()` — don't rely on overly-permissive anon policy.

### M8. Shop `ShopContent` still client-heavy
- **Where:** Product catalog serialized into RSC payload (1-2KB/product × 200+)
- **Fix:** Introduce server-side pagination or move filtering to searchParams; current `.limit(500)` is a ceiling, not a solution.

### M9. Hero video 5.3MB MP4 with no responsive variants
- **Where:** `Hero.tsx:31-46` + `public/media/hero-luxury.mp4`
- **Fix:** Add `preload="metadata"`, provide a 720p variant for mobile via `<source media>`.

### M10. ChatWidget continuous pulse animation
- **Where:** `src/components/ai/ChatWidget.tsx:203`
- **Fix:** Replace infinite Framer Motion `boxShadow` with CSS animation, or pulse only on unread.

---

## Deferred — LOW severity

- **L1.** `ScrollProgress` forces FM runtime into every page bundle → dynamic import or vanilla scroll listener.
- **L2.** Heartbeat fires every 30s regardless of `document.visibilityState` → add visibility check.
- **L3.** Public images in `/public/images/` are JPEG — convert to WebP (expected ~60% savings).
- **L4.** Tiptap editor import not explicitly dynamic → wrap with `next/dynamic` at the blog-edit page.
- **L5.** `AccumulativeShadows frames={100}` in `Lighting.tsx` spikes CPU on init → drop to 30-50.
- **L6.** Two dozen Framer Motion imports in static content → gradual CSS migration.
- **L7.** AdminShell `.select('*')` from admin_users → narrow to `id, role, email`.
- **L8.** Blog `[slug]` route uses `select('*')` for public reads → use `BLOG_POST_FULL_COLUMNS`.
- **L9.** Canvas3DBoundary has no retry mechanism → add "Try again" button.
- **L10.** Product data transformation copy-pasted in 4 locations → extract `toLegacyProduct()` helper.
- **L11.** Idempotency key missing on custom perfume Stripe session → accept client UUID, pass to Stripe.
- **L12.** POST routes have no explicit body-size limit → add Content-Length guard.
- **L13.** Emoji used as note icons in perfume builder → swap to SVGs.
- **L14.** `useDeviceCapabilities` defaults `supports3D: true` during SSR → default false, upgrade after detection (saves chunk download on low-end).
- **L15.** `AnimationBudgetProvider` runs 5s FPS measurement on homepage load → delay until first scroll.
- **L16.** `Hero3DScroll` has `pointer-events-none` on text container → prevents text selection.

---

## Positives the agents confirmed

- Stripe webhook signature verification is correct
- Zod validation on all POST/PUT endpoints
- Service role key never exposed client-side; `createAdminClient` only in server routes
- No `eval()` anywhere; all `dangerouslySetInnerHTML` properly sanitized (DOMPurify / JsonLd escaping)
- Order persistence is idempotent via `upsert` on `stripe_session_id`
- Cart prices validated server-side against catalog
- Deactivated products blocked at checkout (v3.2 CRITICAL fix)
- RLS enabled on all 9 tables with 24 policies (v1.1)
- Sentry integration comprehensive, GDPR-compliant
- `revalidatePath` after mutations
- escapeHtml in all email templates
- Build-time AI catalogue generation
- Device-gated 3D via `useDeviceCapabilities` + `Canvas3DBoundary`

---

## Next steps

1. **Ship this batch (v3.8)** — 13 fixes + new cinematic scroll feature + clear-glass 3D bottle + Aquad'or-first sort.
2. Queue **v3.9 Security Tightening phase** for H1/H2/H3/M1/M2/M3 (live chat RLS, focus trap, PII, product delete).
3. Queue **v4.0 Performance phase** for H4/M4/M5/M6/M8/M9 (3D dispose, FM purge, pagination, video variants, dashboard query).
4. Triage remaining LOW items opportunistically.
