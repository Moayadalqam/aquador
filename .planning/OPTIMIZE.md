---
date: 2026-04-18
mode: full
critical: 7
high: 14
medium: 20
low: 17
status: needs_attention
---

# Optimization Report — v3.9

**Project:** aquador (Next.js 14 luxury perfume e-commerce)
**Mode:** full (frontend + backend + performance)
**Date:** 2026-04-18
**Analysts:** 3 parallel specialist agents (frontend, backend, performance-oracle) + manual synthesis

Prior pass (v3.8, 13 fixed + 30 deferred) archived to `.planning/reports/OPTIMIZE-v3.8-2026-04-18.md`.

## Summary

This run surfaced **7 CRITICAL**, **14 HIGH**, **20 MEDIUM**, and **17 LOW** findings. Several CRITICAL items are carry-overs from v3.8 (live chat RLS, framer-motion import path) that were deferred and remain unfixed; this report confirms they are still present and adds new findings the prior pass missed (WelcomeSplash LCP block, admin dashboard unbounded query, SiteFrame `'use client'` barrel, CartItem position bug, session_secret dead code).

Five systemic patterns stand out:

1. **Framer Motion entry point** — 82 files import from `framer-motion` instead of `motion/react`. Single find-replace unlocks tree-shaking (~15-25KB gzipped).
2. **Focus ring inconsistency** — ~15 files rely on border colour shifts or `ring-gold/20` (invisible) as the sole focus indicator. Fails WCAG 2.4.7 across admin, create-perfume, reorder, ChatWidget, SearchBar, maintenance, CuratedHousesStrip.
3. **Live chat RLS** — three interlocking CRITICAL findings. Anon `SELECT USING (true)` + permissive INSERT + dead `session_secret` column mean any visitor can enumerate sessions and inject messages.
4. **`'use client'` leakage** — SiteFrame plus 5 static marketing pages (about/contact/terms/shipping/privacy) are client components purely for framer-motion scroll animations, shipping ~30-50KB of needless JS.
5. **Unbounded admin queries** — `/admin` dashboard fetches every order row on every load; customers/orders search fires a query per keystroke.

---

## CRITICAL

| # | Dimension | Finding | Location | Fix |
|---|-----------|---------|----------|-----|
| C1 | Security | Live chat anon SELECT `USING (true)` allows any visitor to enumerate every session including `session_secret` column. Confirmed still present. | `supabase/migrations/20260417_enable_rls_live_chat.sql:31-36` | Route visitor session reads through a server API that validates `session_secret`, then tighten anon SELECT to `USING (false)`. Rewrites `useLiveChatSession` + `live-chat/notify`. |
| C2 | Security | Live chat INSERT policy only checks session existence, not ownership. Combined with C1, any anon user can inject messages into any live conversation (phishing, impersonation). | `supabase/migrations/20260417_enable_rls_live_chat.sql:97-104` | Require API call with session_secret for inserts; set anon INSERT policy to `USING (false)` and expose `/api/live-chat/send` that validates the secret. |
| C3 | Security | `session_secret` column was added (v3.8) but ChatWidget never reads/sends it and UPDATE policy checks `session_secret IS NOT NULL` (always true since NOT NULL DEFAULT). Any anon user can UPDATE any session's admin_id/status. | `supabase/migrations/20260417_live_chat_session_secret.sql:37-43`; `src/components/ai/ChatWidget.tsx` (0 refs) | Return secret on session creation, store in localStorage, send as header, compare in policy via RPC. Or drop the column and enforce UPDATE `USING (false)`. |
| C4 | Bundle | 82 files import from `framer-motion` instead of `motion/react`, blocking the canonical tree-shake entry point. Estimated 15-25KB gzip overhead. | 82 files (`rg "from ['\"]framer-motion['\"]" src`) | Single repo-wide replace `from 'framer-motion'` → `from 'motion/react'`. API surface identical for every feature used. |
| C5 | Performance | `/admin` dashboard calls `supabase.from('orders').select(...).order(...)` with no limit, then `.reduce()`s for revenue. O(n) memory + network; at 10k orders → 5MB+ transfer. | `src/app/admin/page.tsx:56` | Split into 3 queries: `count:'exact', head:true` for totalOrders, `select('total')` for revenue (or Postgres RPC `sum(total)`), `select(...).limit(5)` for recent. |
| C6 | Performance / UX | `WelcomeSplash` mounts `z-[9999]` for 3s on first visit, covering hero + all interactive content. Destroys LCP (~+3s) and INP. | `src/components/ui/WelcomeSplash.tsx:36` | Remove entirely (hero video is the brand moment) OR reduce to ≤1.2s + `pointer-events-none` during fade so LCP measures the real content beneath. |
| C7 | UX | CartItem remove button is `absolute top-4 right-4` but parent `motion.div` has no `relative` — anchors to nearest positioned ancestor (the drawer), overlapping other cart items. | `src/components/cart/CartItem.tsx:37` | Add `relative` to the parent motion.div className. |

## HIGH

| # | Dimension | Finding | Location | Fix |
|---|-----------|---------|----------|-----|
| H1 | A11y (systemic) | Admin inputs use `focus:outline-none focus:border-gold` — border colour shift is not a WCAG focus indicator. Affects ~10 input groups in ProductForm + BlogEditor + every admin page. | `src/components/admin/ProductForm.tsx:248,271,284,306,320,385,459,475,491,506`; `BlogEditor.tsx`; `admin/settings`, `admin/login`, `admin/categories`, `admin/orders/new`, `admin/customers`, `admin/products` | Define a shared `focusRingInput` utility: `focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-1 focus-visible:ring-offset-gray-900`. |
| H2 | A11y | create-perfume inputs use `focus:ring-gold/20` (20% opacity on white = invisible). | `src/app/create-perfume/page.tsx:640, 702` | `focus-visible:ring-2 focus-visible:ring-gold/60`. |
| H3 | A11y | ChatWidget inputs rely only on border colour shift. | `src/components/ai/ChatWidget.tsx:249, 276` | Add `focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-1`. |
| H4 | A11y | SearchBar uses `border-none outline-none` base then `focus-visible:ring-2` — ring may not render in older browsers without `:focus-visible`. | `src/components/search/SearchBar.tsx:139` | Replace `outline-none` with `outline-0`. |
| H5 | A11y | create-perfume has two `<h1>` (intro + checkout steps). WCAG 1.3.1 violation. | `src/app/create-perfume/page.tsx:232, 573` | Change checkout step to `<h2>`. |
| H6 | Performance | `PageTransition` wraps every route with `AnimatePresence mode="popLayout" key={pathname}` — full unmount/remount on every navigation. Breaks partial render/streaming, +200-400ms INP. | `src/components/providers/PageTransition.tsx:62-75` | Remove. App Router has native route transitions; use CSS `view-transition-name` or opacity-only fade without key-based remount. |
| H7 | Performance | `select('*')` still used in 4 places after v3.8: AdminShell auth, blog slug GET, admin customers list, admin orders list. | `src/components/admin/AdminShell.tsx:78`; `src/app/api/blog/[slug]/route.ts:48`; `src/app/admin/customers/page.tsx:24`; `src/app/admin/orders/page.tsx:37` | Explicit columns. AdminShell → `select('id, role')`. Blog slug → `BLOG_POST_COLUMNS`. Customers/orders → only what the table renders. |
| H8 | Bundle | DOMPurify statically imported on RichDescription + BlogContent → ~15KB gzipped on product/blog routes even when content is plain text. | `src/components/products/RichDescription.tsx:4`; `src/components/blog/BlogContent.tsx:4` | Dynamic import inside effect when HTML detected, or sanitize server-side so client never loads DOMPurify. |
| H9 | Bundle | `<Environment preset="city" />` in 3D `Lighting.tsx` fetches ~1-2MB HDRI from drei CDN at runtime. | `src/components/3d/Lighting.tsx:1` | Self-host compressed `.hdr`/`.exr` under `/public/hdri/`, use `<Environment files="/hdri/studio.hdr" />`. Reduce `AccumulativeShadows frames` 100 → 30-40. |
| H10 | Performance | Hero video 5.3MB MP4 with no `preload="none"`, no WebM/AV1 variant, autoplays during the 3s WelcomeSplash window. | `public/media/hero-luxury.mp4`; `src/components/home/Hero.tsx:34-46` | `preload="metadata"`, add WebM/AV1 ~2MB as first `<source>`, compress MP4 further (1080p CRF 28 → ~2-3MB). |
| H11 | Performance | Blog post page waterfall: `getBlogPostBySlug(slug)` awaits, then `post.category` feeds related fetch. +50ms at ISR boundary. | `src/app/blog/[slug]/page.tsx:58-68` | Wrap with `cache()`; fetch category lightly first, then `Promise.all` the full post + related queries. |
| H12 | Security | Blog POST (`/api/blog`) and PUT/DELETE (`/api/blog/[slug]`) have no rate limiting — every other admin mutation does. | `src/app/api/blog/route.ts:98`; `src/app/api/blog/[slug]/route.ts:75, 141` | Add `await checkRateLimit(request, 'admin')` at each handler. |
| H13 | Security | `/api/admin/orders` POST has no rate limiting. | `src/app/api/admin/orders/route.ts:33` | Add `checkRateLimit(request, 'admin')` guard. |
| H14 | Security | `/api/live-chat/notify` and blog GET accept unvalidated params. sessionId flows into WhatsApp/email bodies; `limit` is unbounded. | `src/app/api/live-chat/notify/route.ts:90`; `src/app/api/blog/route.ts:28-32` | Zod. notify: `z.object({ sessionId: z.string().uuid() })`. Blog: bounded page, `z.coerce.number().int().min(1).max(50).default(9)` for limit, enum for status. |

## MEDIUM

| # | Dimension | Finding | Location | Fix |
|---|-----------|---------|----------|-----|
| M1 | UI | `error.tsx` uses `bg-black` while rest of site is cream `#FAFAF8`. | `src/app/error.tsx:21` | `bg-[#FAFAF8]`, `text-black`, `text-gray-600`. |
| M2 | A11y | CartDrawer close button `p-2` ≈ 36x36px. | `src/components/cart/CartDrawer.tsx:97-101` | `p-3` or `min-h-[44px] min-w-[44px]`. |
| M3 | A11y | CartDrawer "Clear Cart" / "Continue Shopping" ~20px tall touch. | `src/components/cart/CartDrawer.tsx:157-170` | `min-h-[44px] flex items-center`. |
| M4 | A11y | `CategoryContent` inline product card has no focus-visible ring. | `src/app/shop/[category]/CategoryContent.tsx:169` | `focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2`. |
| M5 | A11y | `reorder` inputs use `focus:ring-gold/20` (invisible). | `src/app/reorder/page.tsx:372, 387, 418` | `focus-visible:ring-2 focus-visible:ring-gold/60`. |
| M6 | Perf | Poppins loaded `display: 'optional'` — body text may never render in Poppins on slow connections. Playfair correctly uses `swap`. | `src/app/layout.tsx:20` | `display: 'swap'`. |
| M7 | Re-render | `FeaturedProducts` keeps `failedImages` Set in state → one failure re-renders all 6 cards. | `src/components/home/FeaturedProducts.tsx:67-135` | Extract memoised `<FeaturedProductCard>` with `failed: boolean` prop. |
| M8 | Perf | `SignatureStories` desktop renders 5 full-viewport images with `sizes="100vw"`. Both desktop + mobile variants sit in DOM; mobile still downloads desktop markup. | `src/components/home/SignatureStories.tsx:165-169`; `src/app/page.tsx:141-142` | Mark idx>0 images as `loading="lazy"`; scope `sizes` to md+ only. |
| M9 | Perf | `/shop` fetches up to 500 products as RSC payload. OK at 100, will pressure TTFB + mobile memory past 200. | `src/app/shop/page.tsx:31`; `ShopContent.tsx:63` | `content-visibility: auto` on grid cells now; server-side paginate past 200. |
| M10 | Perf | `ScrollProgress` global scroll listener runs on every route incl. admin/checkout. ~3-5ms/frame when combined with other handlers. | `src/components/ui/ScrollProgress.tsx:21`; `src/components/layout/SiteFrame.tsx:32` | Skip on admin + checkout routes via pathname check. |
| M11 | Perf | Admin customers + orders search fires query per keystroke. | `src/app/admin/customers/page.tsx:62`; `src/app/admin/orders/page.tsx:99` | 300ms debounce (pattern already in `SearchBar.tsx:49`). |
| M12 | Re-render | `Navbar` calls `setScrollY(window.scrollY)` in RAF — full navbar re-render per frame; only two derived booleans matter. | `src/components/layout/Navbar.tsx:46-56` | Derive `isScrolled` + `blurIntensity`, only `setState` on threshold crossings. Or CSS scroll-driven animations. |
| M13 | Arch / Bundle | `SiteFrame` is `'use client'` solely for `usePathname()`, forcing Navbar + Footer + ChatWidget client-side. | `src/components/layout/SiteFrame.tsx:1` | Extract admin-check/conditional into thin `<SiteChromeSwitch>` client component; keep rest RSC. |
| M14 | Arch / Bundle | 5 static pages are `'use client'` only to run framer-motion scroll animations. | `src/app/about/page.tsx`; `contact`, `terms`, `shipping`, `privacy` | Extract animated wrappers into small client components; keep pages as RSC. |
| M15 | UI Consistency | `CategoryContent` duplicates product-card markup instead of using `<ProductCard />`. Different hover/quick-view behaviour vs `/shop`. | `src/app/shop/[category]/CategoryContent.tsx:169-220` | Replace with `<ProductCard product={product} />`. |
| M16 | Perf | ChatWidget toggle button animates box-shadow `repeat: Infinity` — GPU cycles forever. | `src/components/ai/ChatWidget.tsx:203` | CSS keyframes + `prefers-reduced-motion` guard. |
| M17 | Security | `verifyAdmin()` helpers use `.single()` on admin_users lookup — throws PostgrestError for non-admins; handled but log pollution. Middleware uses `.maybeSingle()` correctly. | `src/app/api/admin/products/route.ts:78`; `admin/categories/route.ts:48`; `blog/route.ts:111`; `blog/[slug]/route.ts:92, 158` | `.single()` → `.maybeSingle()`. |
| M18 | Security / Perf | Blog public GET uses cookie-based server client → forces dynamic rendering even for published-only reads. | `src/app/api/blog/route.ts:35` | Use `createPublicClient()` when `statusFilter !== 'all'`. |
| M19 | Security | `/api/checkout/session-details` accepts `session_id` with only a null check. | `src/app/api/checkout/session-details/route.ts:48-54` | `z.string().startsWith('cs_').min(10).max(255)`. |
| M20 | Security | `gift_set_inventory` has TWO SELECT policies — the 2026-02-07 `USING (true)` was never dropped; the 2026-03-02 `USING (active = true)` added later. RLS permissive → `true` wins → inactive gift sets publicly visible. | `supabase/migrations/20260207110000_valentine_gift_set.sql:17-18` | New migration `DROP POLICY IF EXISTS "Allow public read gift_set_inventory" ON gift_set_inventory;`. |

## LOW

| # | Dimension | Finding | Location | Fix |
|---|-----------|---------|----------|-----|
| L1 | UI | `not-found.tsx` uses `bg-white` not cream. | `src/app/not-found.tsx:7` | `bg-[#FAFAF8]`. |
| L2 | A11y | Footer contact icon circles `h-8 w-8` (32px). | `src/components/layout/Footer.tsx:171, 184, 195` | `h-10 w-10` or `min-h-[44px]` on parent `<a>`. |
| L3 | A11y | Hero video is decorative but lacks `aria-hidden="true"`. | `src/components/home/Hero.tsx:31-46` | Add `aria-hidden="true"`. |
| L4 | SEO | `FeaturedProducts` builds `/products/${product.id}` — verify `id` is the slug. Route expects slugs via `generateStaticParams`. | `src/components/home/FeaturedProducts.tsx:72` | Confirm id is slug, otherwise use `product.slug`. |
| L5 | A11y | `CuratedHousesStrip` sets `focus-visible:outline-none` without a visible replacement. | `src/components/shop/CuratedHousesStrip.tsx:39` | `focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2`. |
| L6 | A11y | `MaintenanceClient` password input has bare `outline-none`. | `src/app/maintenance/MaintenanceClient.tsx:49` | `focus-visible:ring-2 focus-visible:ring-gold`. |
| L7 | DOM | `DiscoveryGrid` nests grids inside full-span row wrappers that also apply the same grid — doubles grid containers. | `src/components/shop/DiscoveryGrid.tsx:102-119` | Flatten to a single grid; delay animation via index-based variants. |
| L8 | Bundle | `src/components/cart/index.ts` barrel re-exports CartDrawer/CheckoutButton/CartIcon — Navbar's `CartIcon` import evaluates all. | `src/components/cart/index.ts:1-5` | Import directly from source files. |
| L9 | Perf | `/api/checkout/session-details` has no Cache-Control; success page refetches on back/refresh. Data immutable after payment. | `src/app/api/checkout/session-details/route.ts:173` | `Cache-Control: private, max-age=3600`. |
| L10 | Perf | `FeaturedProducts priority={index < 3}` × 2 sections = 6 priority images, above browser preload slots; second (Lattafa) is below fold. | `src/components/home/FeaturedProducts.tsx:79` | `priorityCount` prop; only first section gets priority. |
| L11 | Perf | `<link rel="preconnect" href="https://fonts.googleapis.com">` is a no-op — `next/font/google` self-hosts at build. | `src/app/layout.tsx:112-113` | Remove both Google Fonts preconnects. Keep Supabase + Stripe. |
| L12 | Perf | `SignatureStoriesMobile` always in DOM; desktop downloads mobile-variant images via CSS hide. | `src/app/page.tsx:141-142` | `loading="lazy"` on mobile variant images. |
| L13 | Perf | `ChatWidget` creates module-scope Supabase client → WebSocket/realtime setup on every page even if chat never opened. | `src/components/ai/ChatWidget.tsx:10` | Lazy-init client only when `sessionId` is set. |
| L14 | Security | `/api/search` error responses (400, 500) have no `Cache-Control: no-store`. | `src/app/api/search/route.ts:17-19, 34-37` | Add `Cache-Control: no-store` on error paths. |
| L15 | Security | `decrement_gift_set_stock` is `SECURITY INVOKER`; if ever called by anon, would silently fail. | `supabase/migrations/20260207110000_valentine_gift_set.sql:33-50` | Document as service-role only, or `SECURITY DEFINER SET search_path = public` + `GRANT EXECUTE`. |
| L16 | Maintainability | Large files: webhook (517), ProductForm (562), reorder (629). | `src/app/api/webhooks/stripe/route.ts`; `src/components/admin/ProductForm.tsx`; `src/app/reorder/page.tsx` | Split webhook into `src/lib/orders/{persist,email/confirmation,email/notification}.ts`; split ProductForm into field-group subcomponents. |
| L17 | Arch | `ChatWidget` directly hits `live_chat_messages` via browser client; tight coupling breaks when C1-C3 are fixed. | `src/components/ai/ChatWidget.tsx` | Refactor in the C1-C3 fix phase — move data ops to `src/lib/live-chat/` + API route wrappers. |

---

## Cross-cutting patterns (for planning a fix phase)

**Single find-replace wins (~2h):**
- C4 (framer-motion → motion/react, 82 files)
- H12/H13 (rate limit on 4 admin routes)
- L11 (remove Google Fonts preconnect)
- M17 (`.single()` → `.maybeSingle()`, 5 call sites)

**Shared focus-ring utility (~2h):**
- H1, H2, H3, H4, M4, M5, L5, L6 all point to one utility. Define `focusRingInput` + `focusRingLink` fragments, swap in once.

**Live chat security phase (~4h):**
- C1 + C2 + C3 + L17 + ChatWidget rewrite. Migration + `/api/live-chat/session` + `/api/live-chat/send` + localStorage secret handling.

**Homepage LCP phase (~3h):**
- C6 (WelcomeSplash), H10 (hero video), L11, M8 (SignatureStories), L12.

**Admin perf phase (~3h):**
- C5 (dashboard unbounded), H7 (select(*)), M11 (debounce), M17 (maybeSingle).

**RSC boundary phase (~2h):**
- M13 (SiteFrame), M14 (5 static pages), L8 (cart barrel). ~30-50KB JS reduction.

---

## Verification plan (per finding class)

- **Security fixes** — Supabase `list_advisors` + manual `curl` with anon key to confirm `USING (false)` rejection.
- **Bundle fixes** — `npm run build` before/after; compare First Load JS.
- **A11y fixes** — keyboard-walk each affected form; `axe` on `/`, `/shop`, `/create-perfume`, `/admin`.
- **LCP fixes** — Lighthouse mobile throttled on `/`; target LCP < 2.5s.
- **Admin perf** — synthetic 1000-row orders table; dashboard TTFB before/after.

---

## Next command

Pick one:

1. **Create a fix phase** — insert `Phase 32: v3.9 Optimization Fixes` in ROADMAP.md with C1-C7 + H1-H14 as success criteria. Run `/qualia-plan 32`.
2. **Auto-fix LOW/MEDIUM only** — `/qualia-optimize --fix` (skips CRITICAL/HIGH; applies M6, M11, L1, L2, L3, L8, L11, L14, M17, etc.).
3. **Triage manually** — cherry-pick via `/qualia-quick`.

Report: `.planning/OPTIMIZE.md`
Prior pass: `.planning/reports/OPTIMIZE-v3.8-2026-04-18.md`

*Generated 2026-04-18 by 3 parallel specialist agents + synthesis pass.*
