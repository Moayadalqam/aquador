---
phase: 24
goal: "Rebrand /shop into a distinctive Dubai Shop landing with Arabian-inspired luxury treatment, AND fix the stale 100ml price in the variant selector while auditing variant UX across all product detail pages."
tasks: 4
waves: 2
---

# Phase 24: Dubai Shop Rebrand + Product Variant Selector

Goal: `/shop` reads as a distinctive Middle Eastern / Dubai luxury destination (not a generic category page), and every user who lands on a product detail page can select the correct variant (type + size) before adding to cart, with accurate pricing.

## Current State (verified by exploration)

Evidence from reading existing files before planning:

- **Variant selector exists** at `src/components/products/ProductVariantSelector.tsx`. It is wired into `src/components/products/ProductDetails.tsx` behind a gate `AQUADOR_CATEGORIES = ['women', 'men', 'niche']` (line 14). Branded products (Lattafa, Al Haramain, Xerjoff, Victoria's Secret) deliberately show only the DB-stored variant.
- **STALE PRICE BUG** — `ProductVariantSelector.tsx` line 15 hardcodes `100ml: €49.99`. Commit `c47a66e` (`fix(critical): 100ml pricing €49.99→€199.00`) already corrected this elsewhere, but this file was missed. This ships wrong prices to the cart for any Aquador product when a user picks 100ml.
- **Cart displays variant correctly.** `src/components/cart/CartItem.tsx` line 55 renders `{getProductTypeLabel(item.productType)} - {item.size}`. `CartItem` type already carries `productType` + `size`. No schema change needed.
- **Touch targets OK.** Variant selector buttons are `px-5 py-3` (min 44px). Quantity buttons are `w-12 h-12` (48px). Cart qty buttons are `w-7 h-7` (28px) — **below** the 44px minimum, flagged for Task 3.
- **Dubai Shop already lives at `/shop`.** `src/app/shop/page.tsx` sets `title: "Dubai Shop"`. A separate `/shop/dubai` route would break SEO (canonical already set, metadata indexed). Keep URL, elevate the content.
- **No variants in Supabase schema.** `src/lib/supabase/types.ts` products table stores single price/size/product_type per row. The existing client-side `PRODUCT_VARIANTS` array (hardcoded 3 variants) is intentional — Aquador's own line sells the same scent in three formats at fixed prices. Keep this approach; **do not** model variants in the DB (out of scope, backwards-compatible constraint).

**Conclusion:** Variant selector works but has one critical price bug + one unaudited branded-product case. Dubai Shop needs a real hero + storytelling + subtle Arabian visual language.

---

## Task 1 — Fix stale 100ml variant price and verify branded-product variant UX
**Wave:** 1
**Files:**
- `src/components/products/ProductVariantSelector.tsx` (modify)
- `src/components/products/ProductDetails.tsx` (modify — minor)

**Action:**
1. In `src/components/products/ProductVariantSelector.tsx`, update `PRODUCT_VARIANTS[0].sizes[1]` from `{ size: '100ml', price: 49.99 }` to `{ size: '100ml', price: 199.00 }`. Match the price used across the rest of the site (see commit `c47a66e`).
2. In the same file, extract the price constants into named values so this can't drift again:
   ```ts
   const PRICE = { perfume50ml: 29.99, perfume100ml: 199.00, essenceOil10ml: 19.99, bodyLotion150ml: 29.99 } as const;
   ```
   Use `PRICE.*` inside `PRODUCT_VARIANTS`.
3. Add a matching `getDefaultVariant()` update if any hardcoded `49.99` remains (it does — line 47). Drive it from `PRICE.perfume50ml`.
4. In `src/components/products/ProductDetails.tsx`, audit the branded-product path. Currently when `isAquador` is false, the selector is hidden and only the DB values render. Add a subtle "Volume:" pill next to the existing `{product.size}` display (lines 60–68) so branded buyers see the size chip consistently. No logic change — purely visual consistency. Keep the existing stock pill and price format.
5. Do NOT introduce variants for branded products. Supabase rows are the source of truth for Lattafa / Al Haramain / Xerjoff / Victoria's Secret. Confirmed by schema inspection.

**Context:** Read `@src/components/products/ProductVariantSelector.tsx`, `@src/components/products/ProductDetails.tsx`, `@src/components/products/AddToCartButton.tsx` (to confirm price flow into cart item).

**Done when:**
- `grep -n "49.99" src/components/products/ProductVariantSelector.tsx` returns **zero** matches.
- `grep -n "199" src/components/products/ProductVariantSelector.tsx` returns **at least 1** match (either `199.00` or `199` in PRICE constant).
- `npx tsc --noEmit` passes.
- Manual: load any Aquador product (category men/women/niche), pick 100ml, observe price updates to €199.00 in both the header price line and the Add-to-Cart button area. Add to cart → open cart drawer → confirm €199.00 shows on the line item.

---

## Task 2 — Variant selector mobile/touch audit + branded product chip polish
**Wave:** 1
**Files:**
- `src/components/cart/CartItem.tsx` (modify)
- `src/components/products/ProductVariantSelector.tsx` (modify — a11y only)

**Action:**
1. **Cart quantity buttons too small.** In `src/components/cart/CartItem.tsx` lines 64 & 72, the decrement/increment buttons are `w-7 h-7` (28px). Enlarge to `w-11 h-11` (44px) with an inner icon that stays `w-3 h-3`. Preserve the existing border/hover classes. This is a WCAG AA fix (rule `rules/frontend.md`: 44x44 minimum touch target).
2. In `src/components/products/ProductVariantSelector.tsx`, add `aria-pressed={isActive}` to both the type buttons (lines 81–93) and the size buttons (lines 103–121). Add `aria-label={`Select ${variant.label}`}` and `aria-label={`Select ${size} size, €${price.toFixed(2)}`}` respectively. This gives screen-reader users state feedback for the segmented controls.
3. Wrap each of the two button groups in a `role="radiogroup"` with `aria-label="Product type"` / `aria-label="Size"` on the parent `<div>` (lines 77 & 102).
4. Do NOT change visual layout. This task is strictly a11y + touch-target.

**Context:** Read `@src/components/cart/CartItem.tsx`, `@src/components/products/ProductVariantSelector.tsx`, `@~/.claude/rules/frontend.md` (touch target standards).

**Done when:**
- `grep -n "w-11 h-11" src/components/cart/CartItem.tsx` returns at least 2 matches.
- `grep -c "aria-pressed" src/components/products/ProductVariantSelector.tsx` returns ≥ 2.
- `grep -c "role=\"radiogroup\"" src/components/products/ProductVariantSelector.tsx` returns ≥ 2.
- `npx tsc --noEmit` passes.
- Manual on 375px viewport: cart qty buttons are easily tappable with a thumb; variant selector announces state via VoiceOver/TalkBack.

---

## Task 3 — Dubai Shop hero: Arabian-inspired SVG pattern + darker gold treatment
**Wave:** 1
**Files:**
- `src/components/shop/DubaiShopHero.tsx` (create)
- `src/components/shop/ArabianPattern.tsx` (create — inline SVG, no external asset)

**Action:**
1. Create `src/components/shop/ArabianPattern.tsx` — a pure SVG component exporting a subtle geometric tessellation (8-pointed star / girih-style). Keep it abstract: no literal mosques, no dunes. Use `currentColor` so the parent controls hue. Output `<svg role="presentation" aria-hidden="true" ...>`. Tile-ready: single unit cell that can be repeated via CSS `background-image: url("data:image/svg+xml;utf8,...")` OR repeated `<defs>` `<pattern>` element. Suggested: one repeating `<pattern>` with `patternUnits="userSpaceOnUse"` at 64×64 so it reads as texture, not motif. Opacity kept at ~0.06–0.08 so it's a whisper.
2. Create `src/components/shop/DubaiShopHero.tsx` (client component — uses framer-motion like the existing `PageHero`). Props: `title`, `subtitle`, `eyebrow?`. Layout:
   - Tall hero: `pt-32 md:pt-40 lg:pt-44 pb-20 md:pb-28`.
   - Background: darker gold-on-black treatment instead of the white `bg-gold-ambient` used site-wide. Use a layered gradient: base `#0a0a0a` → overlay `radial-gradient(ellipse 70% 50% at 50% 40%, rgba(184,134,11,0.18) 0%, transparent 70%)` → subtle linear top-to-bottom `rgba(212,175,55,0.04)` to `transparent`.
   - `<ArabianPattern />` absolutely positioned, full-bleed, `text-gold/8` (or `color: rgba(212,175,55,0.06)`). This gives the girih pattern at 6% opacity over the dark base.
   - Eyebrow: "From Dubai, with luxury" — uppercase, tracking-[0.32em], gold.
   - Title: use `font-playfair` at clamp-scaling, color `text-gradient-gold` class (already in project per `Section.tsx` line 115).
   - Subtitle: single refined sentence — "A curated selection of fragrances from Al Haramain, Xerjoff and the niche houses defining contemporary Middle Eastern perfumery." (white/70).
   - Decorative detail: three-dot divider (8-pointed micro-star glyph from ArabianPattern, between two hairlines) instead of the current plain `w-8 h-px bg-gold/20` found in `PageHero`.
   - Respect `prefers-reduced-motion` — skip the opening motion.div translate if set.
3. Do NOT delete `PageHero` from `src/components/ui/Section.tsx` — it's used elsewhere (category pages, lattafa page, etc.). `DubaiShopHero` is purpose-built for `/shop` only.

**Context:** Read `@src/components/ui/Section.tsx` (existing `PageHero` for patterns to follow), `@~/.claude/rules/frontend.md` (color rules: dark-mode rethink surfaces, not inverted).

**Done when:**
- `test -f src/components/shop/DubaiShopHero.tsx && test -f src/components/shop/ArabianPattern.tsx && echo OK` prints `OK`.
- `grep -c "ArabianPattern" src/components/shop/DubaiShopHero.tsx` returns ≥ 1.
- `grep -n "pattern" src/components/shop/ArabianPattern.tsx` shows the SVG pattern element.
- `npx tsc --noEmit` passes.
- Manual: component renders in isolation without console errors; pattern opacity is subtle (looks like texture, not wallpaper).

---

## Task 4 — Wire DubaiShopHero into /shop and add curated-houses strip
**Wave:** 2 (after Task 3)
**Files:**
- `src/app/shop/ShopContent.tsx` (modify)
- `src/components/shop/CuratedHousesStrip.tsx` (create)

**Action:**
1. Create `src/components/shop/CuratedHousesStrip.tsx` — a horizontal scroll / 3-column grid on desktop that surfaces the three featured Dubai houses. Each card:
   - House name: "Al Haramain" / "Xerjoff" / "Niche Collection"
   - One-sentence blurb (Al Haramain: "Heritage Arabian oud houses since 1970." / Xerjoff: "Torino meets Dubai — haute parfumerie." / Niche Collection: "Hand-picked, small-batch scents.")
   - CTA arrow → deep-link: `/shop/al-haramain-originals`, `/shop?brand=xerjoff`, `/shop/niche` (these three destinations already exist per `Navbar.tsx` lines 19–22).
   - Dark card treatment to match new hero: `bg-[#111111]` with `border border-gold/15`, gold hover border, transition 200ms.
   - Playfair title, Poppins body (already the site-wide stack).
2. In `src/app/shop/ShopContent.tsx`:
   - Replace the `<PageHero ... titleVariant="white" />` call (lines 110–118) with `<DubaiShopHero title="Dubai Shop" subtitle="A curated selection of fragrances from Al Haramain, Xerjoff and the niche houses defining contemporary Middle Eastern perfumery." eyebrow="From Dubai, with luxury" />`. Keep the search-mode branch rendering the standard `<PageHero />` — the search state uses generic styling.
   - Insert `<CuratedHousesStrip />` **between** the hero and the existing "Search and Filters" section — only when `!isSearchMode && !hasActiveFilters` (so it disappears when users drill in). Wrap in a `<section className="container-wide py-8 md:py-12">`.
   - Imports: add `import DubaiShopHero from '@/components/shop/DubaiShopHero'` and `import CuratedHousesStrip from '@/components/shop/CuratedHousesStrip'`. Remove the `PageHero` import only if it becomes unused (it's still used for search mode — keep it).
3. Update `src/app/shop/page.tsx` metadata `description` to: `"Dubai's finest fragrance houses — Al Haramain, Xerjoff, and curated niche scents. Free shipping in Cyprus over €50."` to mirror the new hero copy and improve SEO match. Title can stay as is.
4. Do NOT change any other shop page (category pages, lattafa page, gender pages). They keep the standard `PageHero`.

**Context:** Read `@src/app/shop/ShopContent.tsx`, `@src/app/shop/page.tsx`, `@src/components/layout/Navbar.tsx` (to confirm the three Dubai destinations the strip links to), `@.planning/phases/24-dubai-variants/plan.md` (this file — Task 3 output).

**Done when:**
- `test -f src/components/shop/CuratedHousesStrip.tsx && echo OK` prints `OK`.
- `grep -c "DubaiShopHero" src/app/shop/ShopContent.tsx` returns ≥ 2 (import + usage).
- `grep -c "CuratedHousesStrip" src/app/shop/ShopContent.tsx` returns ≥ 2.
- `grep -n "/shop/al-haramain-originals\|brand=xerjoff\|/shop/niche" src/components/shop/CuratedHousesStrip.tsx` shows all three deep links.
- `npx tsc --noEmit` passes.
- `npm run build` succeeds (static generation of `/shop` must still work — `revalidate = 1800` preserved).
- Manual: navigating to `/shop` shows the dark Arabian hero + three-house strip on top of the existing filter bar and product grid. Switching to search mode (`/shop?search=oud`) hides the strip and falls back to the standard hero.

---

## Success Criteria

- [ ] A user browsing any Aquador women/men/niche product can pick 100ml and see **€199.00** (not €49.99) reflected in the price header, the Add-to-Cart button, and the cart drawer line item.
- [ ] A user on branded products (Lattafa, Al Haramain, Xerjoff, Victoria's Secret) still sees a consistent size chip and can add-to-cart — no regressions.
- [ ] Variant selector is keyboard + screen-reader accessible (radiogroup semantics, aria-pressed state).
- [ ] Cart quantity buttons meet 44×44 touch target on mobile.
- [ ] `/shop` presents as a distinctive Dubai destination — dark Arabian hero, subtle girih SVG pattern (no literal mosques/dunes/stock photos), three-house curated strip, darker-gold visual tone — while still hosting the existing filter bar and product grid below.
- [ ] All other shop pages (`/shop/[category]`, `/shop/lattafa`, `/shop/gender/*`) are visually unchanged.
- [ ] `npx tsc --noEmit` + `npm run build` both pass.
- [ ] No new heavy dependencies added (grep `package.json` diff).

---

## Verification Contract

### Contract for Task 1 — Variant price fix
**Check type:** grep-match
**Command:** `grep -c "49.99" /home/qualiasolutions/Projects/aquador/src/components/products/ProductVariantSelector.tsx`
**Expected:** `0`
**Fail if:** Any occurrence of `49.99` remains — the stale price bug is still live.

### Contract for Task 1 — Variant price fix (positive assertion)
**Check type:** grep-match
**Command:** `grep -cE "199(\.00)?" /home/qualiasolutions/Projects/aquador/src/components/products/ProductVariantSelector.tsx`
**Expected:** Non-zero (≥ 1)
**Fail if:** Returns 0 — the correct €199 price is not present.

### Contract for Task 1 — getDefaultVariant alignment
**Check type:** grep-match
**Command:** `grep -A 5 "getDefaultVariant" /home/qualiasolutions/Projects/aquador/src/components/products/ProductVariantSelector.tsx | grep -c "price:"`
**Expected:** ≥ 1
**Fail if:** `getDefaultVariant()` returns a stale price literal.

### Contract for Task 2 — Cart touch target
**Check type:** grep-match
**Command:** `grep -c "w-11 h-11" /home/qualiasolutions/Projects/aquador/src/components/cart/CartItem.tsx`
**Expected:** ≥ 2
**Fail if:** Returns < 2 — qty buttons still below 44px.

### Contract for Task 2 — Variant selector a11y
**Check type:** grep-match
**Command:** `grep -c "aria-pressed\|role=\"radiogroup\"" /home/qualiasolutions/Projects/aquador/src/components/products/ProductVariantSelector.tsx`
**Expected:** ≥ 4 (2 aria-pressed + 2 radiogroup)
**Fail if:** Returns < 4 — missing screen-reader semantics.

### Contract for Task 3 — DubaiShopHero exists
**Check type:** file-exists
**Command:** `test -f /home/qualiasolutions/Projects/aquador/src/components/shop/DubaiShopHero.tsx && test -f /home/qualiasolutions/Projects/aquador/src/components/shop/ArabianPattern.tsx && echo EXISTS`
**Expected:** `EXISTS`
**Fail if:** Either file missing.

### Contract for Task 3 — No external image deps
**Check type:** grep-match
**Command:** `grep -E "next/image|url\(['\"]\/|\.png|\.jpg|\.webp" /home/qualiasolutions/Projects/aquador/src/components/shop/DubaiShopHero.tsx /home/qualiasolutions/Projects/aquador/src/components/shop/ArabianPattern.tsx | wc -l`
**Expected:** `0`
**Fail if:** Any raster image reference — hero must be pure SVG/CSS per the constraint "no images of dunes/mosques".

### Contract for Task 3 — Pattern SVG renders a pattern element
**Check type:** grep-match
**Command:** `grep -c "<pattern" /home/qualiasolutions/Projects/aquador/src/components/shop/ArabianPattern.tsx`
**Expected:** ≥ 1
**Fail if:** Returns 0 — not actually a tiled pattern.

### Contract for Task 4 — Hero wired into ShopContent
**Check type:** grep-match
**Command:** `grep -c "DubaiShopHero" /home/qualiasolutions/Projects/aquador/src/app/shop/ShopContent.tsx`
**Expected:** ≥ 2
**Fail if:** Returns < 2 — component exists but isn't imported/used in the page (the #1 failure mode).

### Contract for Task 4 — Curated strip wired in
**Check type:** grep-match
**Command:** `grep -c "CuratedHousesStrip" /home/qualiasolutions/Projects/aquador/src/app/shop/ShopContent.tsx`
**Expected:** ≥ 2
**Fail if:** Returns < 2 — strip isn't connected to the page.

### Contract for Task 4 — Deep links correct
**Check type:** grep-match
**Command:** `grep -E "/shop/al-haramain-originals|brand=xerjoff|/shop/niche" /home/qualiasolutions/Projects/aquador/src/components/shop/CuratedHousesStrip.tsx | wc -l`
**Expected:** ≥ 3
**Fail if:** Returns < 3 — one or more of the three featured houses isn't linked correctly.

### Contract for Task 4 — Build passes
**Check type:** command-exit
**Command:** `cd /home/qualiasolutions/Projects/aquador && npx tsc --noEmit 2>&1 | grep -c "error TS"`
**Expected:** `0`
**Fail if:** Any TypeScript error — branded-product chip or strip has a type mismatch.

### Contract for Task 4 — Full build passes
**Check type:** command-exit
**Command:** `cd /home/qualiasolutions/Projects/aquador && npm run build 2>&1 | tail -20 | grep -c "Compiled successfully\|Collecting page data\|Generating static pages"`
**Expected:** ≥ 1
**Fail if:** Build fails — most likely cause: client/server boundary violation in the new components. Ensure `'use client'` at top of any component using `useState`/`motion`.

### Contract for Task 4 — Conditional rendering preserved
**Check type:** behavioral
**Command:** (manual) Visit `/shop` → see Arabian hero + three-house strip. Visit `/shop?search=oud` → search-mode hero (standard PageHero), **no** three-house strip. Visit `/shop/men` → unchanged standard PageHero.
**Expected:** Dubai treatment only on the base `/shop` route in non-search mode.
**Fail if:** Strip shows up on sub-pages or in search mode, OR Dubai hero replaces every shop page hero.
