# Roadmap: Aquad'or — M10 Premium Polish & Signature Experience

For full project arc see `JOURNEY.md`. For shipped milestone history see `MILESTONES.md`. This file holds the **current milestone's** phase detail only.

**Current milestone:** M10 — Premium Polish & Signature Experience
**Phases:** 33-35
**Status:** Setup — awaiting `/qualia-plan 1`

---

## Milestone Goal

Same content, same products, same text — elevated visual delivery. The flagship is `/create-perfume`: it becomes a distinctive, memorable interaction without emoji scent icons or decorative bottle illustrations. Other pages get premium scroll motion that doesn't change information architecture or copy.

## Hard Constraints (do not violate)

1. **No copy changes.** Every product name, description, category label, CTA, body sentence remains byte-for-byte identical to M9.
2. **No catalog changes.** Every product (Men, Women, Niche, Lattafa Original, Al Haramain, Victoria's Secret, Dubai Shop) and every variant remains.
3. **No pricing changes.** 50ml = €29.99, 100ml = €199.00 unchanged. Cart and Stripe flows untouched.
4. **No checkout flow changes.** `/api/checkout`, `/api/create-perfume/payment`, `/api/webhooks/stripe`, email pipeline — all untouched.
5. **No new dependencies that bloat bundle.** Use motion/react (already installed) for animations. Avoid framer-motion (replaced in M9).

## Exit Criteria (milestone-level)

1. `/create-perfume` is a wow-grade experience: no scent emojis, no decorative bottle illustration/SVG mockup, no icon clichés. Same information collected, but the interaction itself is the brand moment.
2. Category pages gain premium scroll motion without altering text or product data.
3. Homepage + product detail + blog share the same motion language.
4. Reduced-motion respected everywhere; no CLS regression; LCP ≤ 2.5s mobile retained; Lighthouse Performance ≥ 85 mobile.
5. Existing checkout flows work unchanged; smoke test of cart + custom perfume purchases passes.

---

## Phase 33 · Create-Your-Own Perfume Reinvention

**Goal:** Replace `/create-perfume` with a distinctive, memorable interaction. Same information collected, same Stripe flow on submit, same prices. The page itself becomes the brand's signature moment.

**Files in scope (read before changing):**
- `src/app/create-perfume/page.tsx` (and its sub-routes/components)
- `src/components/perfume/*` (current builder components)
- `src/lib/perfume/notes.ts`, `composition.ts`, `pricing.ts`, `validation.ts`, `types.ts`
- `src/app/create-perfume/success/page.tsx`
- `public/` — remove any bottle SVG/illustrations referenced by the route

**What MUST be removed:**
- All emoji unicode used as scent category indicators
- The static SVG bottle mockup added in commit 24c96c7
- Any decorative perfume-bottle illustrations or icons
- Any "scent category" pictograms / clipart

**What MUST be preserved:**
- Three-layer composition (top, heart, base notes) with all current notes
- Five fragrance categories (floral, fruity, woody, oriental, gourmand)
- Volume choice (50ml / 100ml)
- Custom name input + summary text
- All current copy — every label, helper text, button text byte-identical
- `/api/create-perfume/payment` route unchanged
- Stripe PaymentIntent flow + success page

**Success criteria:**
1. Diff against current `/create-perfume` shows zero copy changes (text strings unchanged)
2. Grep for emoji unicode in route directory returns zero matches
3. No `<img>` or `<svg>` of a perfume bottle in the page tree (visual audit + asset audit)
4. Page has at least one signature interaction that a user would describe as "memorable" (e.g., layered note typography, scroll-driven composition build, kinetic note merging)
5. Mobile parity: same flow works at 375px width with no horizontal scroll
6. End-to-end test: user can complete a custom perfume purchase from `/create-perfume` to `/create-perfume/success` with the redesigned UI
7. Lighthouse Performance ≥ 85 mobile on this route, no CLS

**Requirements covered:** PREM-01, PREM-02, PREM-03, PREM-04

---

## Phase 34 · Premium Scroll Motion (Catalog & Category)

**Goal:** Apply premium scroll-triggered motion to category and shop pages. Text and product data unchanged.

**Files in scope:**
- `src/app/shop/[category]/page.tsx`
- `src/app/shop/lattafa/*`
- `src/app/shop/dubai-shop/*` (or whatever path it lives at)
- `src/components/shop/*` (ProductCard, filters, grid components)
- Motion utility added in this phase: `src/components/motion/*` (new, reusable)

**Success criteria:**
1. Each category page has ≥ 3 distinct scroll-triggered motion patterns (e.g., staggered card reveal, sticky filter shadow on scroll, parallax hero accent)
2. `prefers-reduced-motion` honored — no motion if user opts out (test with macOS Reduce Motion enabled)
3. 60fps on mid-tier mobile (CPU 4× throttled in DevTools, frame timing verified)
4. No CLS regression vs. M9 baseline (Web Vitals comparison in production)
5. Diff confirms zero changes to product copy/names/prices/descriptions
6. Same motion utility module used across phases 34 and 35 (no duplicated motion code)

**Requirements covered:** PREM-05, PREM-06, PREM-07

---

## Phase 35 · Homepage & Global Motion Language

**Goal:** Homepage, blog, contact, header/footer, and product detail pages get the same motion language so the site reads as one cohesive experience.

**Files in scope:**
- `src/app/page.tsx` and homepage section components
- `src/app/products/[slug]/page.tsx` and gallery/info components
- `src/app/blog/*`
- `src/app/contact/page.tsx`
- `src/components/Header.tsx`, `Footer.tsx`, navigation components

**Success criteria:**
1. Homepage hero + content sections use the same reveal patterns as Phase 34
2. Header transitions on scroll feel premium (no abrupt color flips, no jank)
3. Product detail pages animate gallery + info column with reduced-motion respect
4. Blog index + post pages get reveal polish (text/content unchanged)
5. Performance budget held: LCP ≤ 2.5s mobile, INP ≤ 200ms
6. Final visual sweep — site feels like one designer made it

**Requirements covered:** PREM-08, PREM-09, PREM-10

---

## Progress

| Phase | Goal | Plans | Status |
|---|---|---|---|
| 33 | Create-Your-Own Perfume Reinvention | TBD | Setup |
| 34 | Premium Scroll Motion (Catalog & Category) | TBD | Pending |
| 35 | Homepage & Global Motion Language | TBD | Pending |

---

*Roadmap defined: 2026-05-10. Next action: `/qualia-plan 1` to break Phase 33 into executable plans.*
