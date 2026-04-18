---
phase: 32
milestone: v3.9
date: 2026-04-18
author: OWNER (Fawzi)
findings_addressed: 45 / 58
tsc: clean
lint: clean (pre-existing warnings only)
build: clean (88.4 kB shared First Load JS)
---

# Phase 32 — v3.9 Optimization Fixes

Shipped all 7 CRITICAL and 14 HIGH findings from the v3.9 OPTIMIZE pass, plus 18 MEDIUM and 6 LOW items. Executed as one sequential prep task (framer-motion migration) + 4 parallel builder agents with strict file ownership to avoid merge conflicts.

## Summary

- **45 findings fixed** (7 critical, 14 high, 18 medium, 6 low)
- **13 deferred** (mostly LOW polish + M6 Poppins + L13 ChatWidget supabase + L16 large-file refactor — all explicitly scoped out)
- **130 files touched** (82 via motion migration, 48 via builders)
- **2 new Supabase migrations** (live chat lockdown + gift_set policy drop)
- **4 new API routes** (/api/live-chat/session, /api/live-chat/session/[id], /api/live-chat/send, plus notify hardened)
- **5 static pages** converted from client → RSC wrappers
- **1 component deleted** (WelcomeSplash — 3s LCP blocker)

## Fixed in this phase

### CRITICAL (7/7)

| # | Finding | Fix |
|---|---------|-----|
| C1 | Live chat anon SELECT `USING(true)` | New migration drops permissive policy, replaces with `USING(false)`. All visitor reads flow through `/api/live-chat/session/[id]?secret=...`. |
| C2 | Live chat INSERT allows injection | Anon INSERT now `WITH CHECK (false)`. Sends flow through `/api/live-chat/send` with server-validated secret. |
| C3 | session_secret dead code | UPDATE policy now `USING (false)`. Secret generated with `crypto.randomBytes(32)`, returned on session create, stored in localStorage. |
| C4 | 82 files imported from `framer-motion` | Global replace → `motion/react`. `motion` package installed. `optimizePackageImports` updated. |
| C5 | Admin dashboard fetched all orders | Split into 3 parallel queries: count-only, total-only, recent 5. |
| C6 | WelcomeSplash blocked LCP for 3s | Deleted entirely. Hero video is the brand moment. |
| C7 | CartItem X button overlapping other items | Added `relative` to parent motion.div. |

### HIGH (14/14)

| # | Finding | Fix |
|---|---------|-----|
| H1 | Admin inputs had no WCAG focus ring | New `src/lib/ui/focus.ts` utility (`focusRingInput`, `focusRingLink`, `focusRingLinkLight`). Applied across ProductForm, BlogEditor, all 6 admin pages. |
| H2 | create-perfume focus-ring `gold/20` invisible | Replaced with `focus-visible:ring-gold/60`. |
| H3 | ChatWidget focus rings | Applied `focusRingInput` equivalent; migrated to new API-route-based pattern. |
| H4 | SearchBar `outline-none` fragility | Replaced with `outline-0`. |
| H5 | create-perfume duplicate `<h1>` | Checkout step → `<h2>`. |
| H6 | PageTransition unmounted tree on every nav | Component is now a pass-through `{children}`. |
| H7 | `select('*')` in 4 places | Explicit column lists in AdminShell, blog slug route, admin customers, admin orders. |
| H8 | DOMPurify statically imported client-side | Dynamic `await import('dompurify')` inside effect. |
| H9 | 3D `<Environment preset="city" />` fetched ~1-2MB HDRI | Removed Environment; `AccumulativeShadows frames` 100 → 40. |
| H10 | Hero video no preload hint | `preload="metadata"` + `aria-hidden="true"` added. (Re-encode deferred — needs ffmpeg pipeline.) |
| H11 | Blog post page waterfall | `cache()` + lightweight category query + `Promise.all`. |
| H12 | Blog POST/PUT/DELETE no rate limit | `checkRateLimit('admin')` on all 3 handlers. |
| H13 | Admin orders POST no rate limit | `checkRateLimit('admin')` added. |
| H14 | Unvalidated /notify sessionId + blog GET params | Zod schemas: `{ sessionId: z.string().uuid() }` on notify; full `blogListQuerySchema` with bounded limit/page. |

### MEDIUM (18/20)

M1 error theme, M2 CartDrawer close 44px, M3 CartDrawer footer buttons 44px, M4 CategoryContent focus ring, M5 reorder focus ring, M7 FeaturedProducts memo, M8 SignatureStories lazy sizing, M10 ScrollProgress gated on /admin+/checkout, M11 admin search debounce, M12 Navbar threshold-based state, M14 5 static pages → RSC, M15 CategoryContent reuses ProductCard, M16 ChatWidget boxShadow CSS keyframe + reduced-motion, M17 `.maybeSingle()` across 5 call sites, M18 blog public client for cacheable reads, M19 session-details Zod, M20 gift_set drop migration.

**Deferred:** M6 Poppins `display: swap` (owned by 32-03 layout.tsx scope but builder skipped to avoid cross-plan layout churn), M13 SiteFrame RSC split (builder flagged as complexity-not-worth-the-savings given SiteFrame children are all client anyway).

### LOW (6/17)

L1 not-found theme, L2 Footer icons 44px, L3 Hero video `aria-hidden`, L5 CuratedHousesStrip focus, L6 Maintenance input focus, L7 DiscoveryGrid grid flatten, L8 cart barrel split, L9 session-details Cache-Control, L10 FeaturedProducts priority cap, L11 Google Fonts preconnect removed, L12 mobile stories lazy, L14 search error Cache-Control.

**Deferred** (LOW-only polish, not blocking): L4 FeaturedProducts link id-vs-slug (needs DB verification), L13 ChatWidget module-scope supabase (moot — ChatWidget was rewritten to use API routes, no longer module-scope), L15 `decrement_gift_set_stock` security definer (documentation-only), L16 large-file refactors (webhook 517, ProductForm 562, reorder 629 — scope-creep for a fix phase), L17 ChatWidget data-layer extract (already resolved by 32-01 API-route rewrite).

## Verification

- `npx tsc --noEmit` — clean (0 errors)
- `npm run lint` — clean (3 pre-existing warnings in files not touched: global-error, OptimizedImage, useKeyboardControls)
- `npm run build` — clean; First Load JS shared 88.4 kB; all 4 new `/api/live-chat/*` routes present; 5 static pages RSC-rendered
- Dev server smoke (port 3001):
  - `GET /` → 200
  - `GET /shop` → 200
  - `GET /create-perfume` → 200
  - `GET /blog` → 200
  - `GET /admin/login` → 200
  - `GET /about`, `/contact` → 200 (RSC wrappers working)
  - `GET /api/admin/products` unauth → **401** (middleware still guards)
  - `POST /api/live-chat/session` no body → **400** with Zod error (validation works)
  - `GET /api/blog?limit=invalid` → **400** with Zod error (new H14 fix confirmed)
  - `GET /api/search?q=chanel` → 200

## Migrations to apply in production

Two new SQL migrations need to ship before the ChatWidget rewrite is activated:

1. `supabase/migrations/20260418_live_chat_lockdown.sql` — drops permissive anon policies on live chat tables, enforces server-only writes.
2. `supabase/migrations/20260418_drop_gift_set_permissive_policy.sql` — drops redundant permissive `USING(true)` policy on `gift_set_inventory`.

Apply order: any order (independent migrations).

## What's next

After deploy:
- **Validate live chat**: open chat widget on production, verify session create + message send + receive work via new API routes.
- **Measure LCP**: run Lighthouse on `aquadorcy.com`/ before and after to confirm WelcomeSplash removal + preconnect cleanup delivers ~2s improvement.
- **Admin dashboard**: verify dashboard loads quickly (should be sub-300ms now).
- **Optional follow-up phase 33** for the 13 deferred items if any become priority.
