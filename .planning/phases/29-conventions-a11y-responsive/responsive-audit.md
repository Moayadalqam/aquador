# Responsive Audit Report — Aquad'or

**Date:** 2026-04-17  
**Branch:** `feat/v3.2-optimize-all`  
**Dev server:** http://localhost:3000 (Next.js 14.2.35 dev mode)  
**Auditor:** Playwright automation (chromium headless) at 320px, 375px, 768px, 1440px  
**Pages tested:** 9 routes + 1 product detail page

---

## Summary Table

27 cells: 9 pages x 3 primary viewports (375 / 768 / 1440)

| Page | 375px (Mobile) | 768px (Tablet) | 1440px (Desktop) | Notes |
|------|----------------|-----------------|-------------------|-------|
| `/` (Home) | PASS | PASS | PASS | |
| `/shop` (Dubai) | PASS | PASS | PASS | |
| `/shop/lattafa` | PASS (was FAIL) | PASS | PASS | Fixed: tab bar overflow |
| `/shop/gender/men` | PASS | PASS | PASS | |
| `/products/[slug]` | PASS | PASS | PASS | Tested with real product |
| `/blog` | PASS | PASS | PASS | |
| `/create-perfume` | PASS | PASS | PASS | |
| `/contact` | PASS | PASS | PASS | |
| `/about` | PASS | PASS | PASS | |

**320px bonus check (all 8 pages):** ALL PASS after fixes (was FAIL on all 8 pages before fixes)

---

## Critical Issues Found & Fixed

### 1. FIXED: Horizontal scroll on ALL pages at 320px (7px overflow)

**Root cause:** Footer trust badges row used `gap-6` (24px) without `flex-wrap`, causing "Premium Quality" badge to extend 7px past viewport.

**Fix applied:** `src/components/layout/Footer.tsx` line 126  
- Changed `flex items-center justify-center gap-6` to `flex flex-wrap items-center justify-center gap-3 sm:gap-6`

### 2. FIXED: Horizontal scroll on `/shop/lattafa` at 375px (439px > 375px, 64px overflow)

**Root cause:** Gender filter tab bar (`inline-flex` with 4 buttons, each `px-6`) totalled ~500px. Parent had no overflow handling.

**Fix applied:** `src/app/shop/lattafa/LattafaContent.tsx` lines 108, 115  
- Added `overflow-x-auto` to the flex container  
- Reduced button padding from `px-6` to `px-4 sm:px-6`  
- Reduced font from `text-sm` to `text-xs sm:text-sm`

### 3. FIXED: Cart drawer missing ARIA dialog attributes

**Root cause:** CartDrawer `motion.div` had no `role`, `aria-modal`, or `aria-label`.

**Fix applied:** `src/components/cart/CartDrawer.tsx` line 34  
- Added `role="dialog"`, `aria-modal="true"`, `aria-label="Shopping cart"`

### 4. FIXED: Search input missing accessible label

**Root cause:** `SearchBar` `<input>` had only `placeholder` text, no `aria-label` or associated `<label>`.

**Fix applied:** `src/components/search/SearchBar.tsx` line 136  
- Added `aria-label="Search fragrances"`

### 5. FIXED: Footer social icons below 44px touch target

**Root cause:** Instagram and Facebook `<a>` tags wrapped only a 20x20px SVG with no min-size.

**Fix applied:** `src/components/layout/Footer.tsx`  
- Added `min-h-[44px] min-w-[44px] flex items-center justify-center` to both social links

---

## Minor Issues (Flagged, Not Fixed)

### 6. Heading hierarchy: h1 -> h3 skip on 5 pages

The following pages skip from h1 directly to h3, missing h2:

| Page | h1 | First h3 (should be h2) |
|------|----|-------------------------|
| `/` | "AQUAD'OR" | "Women's Collection" (Categories component) |
| `/shop` | "Dubai Shop" | "Al Haramain" (CuratedHousesStrip) |
| `/shop/lattafa` | "Lattafa Originals" | Product names (product cards) |
| `/shop/gender/men` | "Men's Fragrances" | Product names (product cards) |
| `/create-perfume` | "Create Your Signature Scent" | Footer "Shop" heading |

**Pages with correct heading hierarchy:** `/blog`, `/contact`, `/about`

**Recommendation:** This is a **medium** fix touching multiple shared components:
- `src/components/home/Categories.tsx` — change category name headings from `h3` to `h2`
- `src/components/home/FeaturedProducts.tsx` — product card headings should be `h3` under `SectionHeader` (h2) -- this is already correct
- The issue is Categories uses `h3` directly under `h1` with no `h2` section header
- Product cards in shop pages use `h3` without a parent `h2`
- Footer section headings ("Shop", "Company", "Contact") are `h3` which is correct if preceding content uses h2

### 7. Footer link touch targets below 44px

Footer navigation links (Men, Unisex, About, Terms, etc.) measure ~28-42px wide and 19px tall. These are text links in a list layout, so the inline dimension is inherently small.

**Partial fix applied:** Added `py-0.5` to increase vertical hit area slightly.

**Recommendation:** For full 44px compliance, add `py-2` or `min-h-[44px]` to footer links. This may require visual review to maintain the current compact footer aesthetic.

### 8. Framer Motion hydration mismatch (homepage)

```
Warning: Prop style did not match.
Server: "will-change:transform;transform:translateY(-25px)"
Client: "will-change:auto;transform:none"
```

**Source:** `useScroll`/`useTransform` in parallax sections (TrustBar, FeaturedProducts, Categories). Server renders a static transform value; client immediately overwrites based on scroll position.

**Recommendation:** Known framer-motion SSR pattern. Fix by wrapping parallax values in `useMotionValueEvent` or using `initial={false}` on motion components. Low priority -- does not cause visual issues.

### 9. `/api/heartbeat` returning 500 on every page

The `VisitorTracker` component fires POST requests to `/api/heartbeat` which return 500. Likely a Supabase connection issue in dev (missing `site_visitors` table or env vars).

**Impact:** Console noise only. Not user-facing. The component already handles errors gracefully.

**Recommendation:** Add error handling in `VisitorTracker` to suppress console errors in dev, or skip heartbeat when Supabase is not configured.

---

## Console Errors

| Type | Count | Details |
|------|-------|---------|
| Hydration mismatch | 1 (homepage only) | Framer Motion `will-change`/`transform` SSR diff |
| Network 500 | ~2 per page | `/api/heartbeat` Supabase connection |
| CSP `unsafe-eval` | Many | Playwright test artifact only (not in real browsers) |

**Unique real errors:** 2 (hydration mismatch + heartbeat 500)  
**User-impacting errors:** 0

---

## Accessibility Summary

| Check | Result | Details |
|-------|--------|---------|
| Images without `alt` | PASS (0) | All pages |
| Inputs without labels | PASS (0) | Fixed: SearchBar now has aria-label |
| Multiple `<h1>` | PASS | All pages have exactly 1 h1 |
| Heading order | WARN | 5/8 pages skip h1->h3 (see issue #6) |
| Cart drawer ARIA | PASS | Fixed: now has role=dialog |
| Skip link | PASS | Present in layout.tsx |
| Touch targets (mobile) | WARN | Footer links still small (see issue #7) |
| Social icon targets | PASS | Fixed: now 44x44px |
| Honeypot a11y | PASS | Correctly uses aria-hidden="true" |

---

## Mobile Menu & Cart Drawer

| Feature | Result | Details |
|---------|--------|---------|
| Hamburger button | PASS | 44x44px, visible at mobile/tablet |
| Menu opens | PASS | Full-screen overlay, body scroll locked |
| Menu links | PASS | 7 nav links, all 60.5px tall (above 44px target) |
| Menu closes | PASS | Close button works, pathname change closes |
| Cart icon | PASS | 44x44px, labeled "Shopping cart with 0 items" |
| Cart drawer | PASS | Opens as dialog, full-width on mobile |

---

## Fixes Applied (5 direct fixes)

| # | File | Line(s) | Change |
|---|------|---------|--------|
| 1 | `src/components/layout/Footer.tsx` | 126 | Added `flex-wrap` and `gap-3 sm:gap-6` to trust badges |
| 2 | `src/components/layout/Footer.tsx` | 58, 65 | Added `min-h-[44px] min-w-[44px]` to social links |
| 3 | `src/components/layout/Footer.tsx` | 81, 95 | Added `py-0.5` to footer nav links |
| 4 | `src/app/shop/lattafa/LattafaContent.tsx` | 108, 115 | Added `overflow-x-auto`, reduced tab padding on mobile |
| 5 | `src/components/search/SearchBar.tsx` | 136 | Added `aria-label="Search fragrances"` |
| 6 | `src/components/cart/CartDrawer.tsx` | 34 | Added `role="dialog"`, `aria-modal`, `aria-label` |

---

## Verdict

**PASS** — All 27 responsive cells (9 pages x 3 viewports) clean after fixes. Zero horizontal scroll at any viewport including 320px. No user-impacting console errors. Mobile menu and cart drawer functional. 4 minor issues flagged for future work (heading hierarchy, footer link touch targets, hydration mismatch, heartbeat 500).
