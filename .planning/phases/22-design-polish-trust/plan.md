---
phase: 22
goal: "Design polish and trust elements — consistent typography, WCAG-compliant gold contrast, conversion-focused CTAs, uniform mobile spacing, social proof, brand-driven footer, reduced overlays"
tasks: 4
waves: 2
---

# Phase 22: Design Polish & Trust

Goal: The homepage has consistent typography hierarchy, all gold text meets WCAG AA contrast, CTA buttons drive urgency, mobile section spacing is uniform, trust/social proof is visible, the footer reflects Aquad'or brand identity, and dark overlays are reduced to improve product visibility. No TypeScript errors.

**Note on product images (item 5):** Product image style/lighting inconsistency is a photography/content issue, not a code issue. The client should reshoot or retouch product photos with consistent lighting, background, and angle. No code task for this.

## Task 1 — Typography Hierarchy & Gold Contrast Fix

**Wave:** 1
**Files:**
- `src/app/globals.css` — Add new WCAG-compliant gold contrast utility classes and standardize typography token usage
- `src/components/home/Hero.tsx` — Standardize eyebrow/tagline to use design system tokens; fix gold contrast on eyebrow text; add value proposition subtitle below tagline
- `src/components/home/Categories.tsx` — Standardize eyebrow labels, description text, and heading sizes to match global typography tokens; reduce dark overlays (brightness from 0.65 to 0.75, gradient from-black/90 to from-black/70)
- `src/components/home/CreateSection.tsx` — Standardize eyebrow, heading, description sizes to match other sections; reduce image brightness filter from 0.75 to 0.80; reduce gradient overlay opacity
- `src/components/home/FeaturedProducts.tsx` — Standardize eyebrow, heading, description, brand label, product name, and price sizes to use consistent tokens
- `src/components/ui/Section.tsx` — Standardize SectionHeader eyebrow, title, subtitle sizes to use the same tokens as all other sections

**Action:**

1. In `globals.css`, add two new utility classes for WCAG-compliant gold text:
   - `.text-gold-accessible` — use `oklch(72% 0.12 85)` (darker gold that meets 4.5:1 on white/cream backgrounds). This replaces scattered `text-gold/50`, `text-gold/60` usage on light backgrounds.
   - `.text-gold-on-dark` — use `oklch(82% 0.11 88)` (lighter gold that meets 4.5:1 on black/dark backgrounds). This replaces `text-gold/50`, `text-gold/60` usage on dark backgrounds.
   - Verify: `oklch(72% 0.12 85)` on `#FAFAF8` background >= 4.5:1 contrast ratio. `oklch(82% 0.11 88)` on `#0a0a0a` background >= 4.5:1 contrast ratio.

2. Standardize typography roles across ALL homepage sections using these consistent sizes (reference the existing CSS custom properties in globals.css):
   - **Eyebrow labels** (above section titles): `text-[11px] sm:text-xs uppercase tracking-[0.25em]` — currently varies between `text-[9px]` and `text-[10px]` across sections. Use 11px minimum for readability.
   - **Section titles**: Keep current `text-3xl md:text-4xl lg:text-5xl font-playfair` (already consistent via SectionHeader)
   - **Section subtitles**: `text-base md:text-lg text-gray-500` on light backgrounds, `text-gray-300` on dark backgrounds (currently some use `text-gray-400`)
   - **Micro labels** (card brands, category accents): `text-[10px] uppercase tracking-[0.15em]`

3. In `Hero.tsx`:
   - Change eyebrow from `text-[9px] sm:text-[10px] ... text-gold/50` to `text-[11px] sm:text-xs ... text-gold-on-dark` (new accessible class)
   - Change tagline from `text-[11px] sm:text-xs md:text-sm text-white/50` to `text-xs sm:text-sm text-white/70` (better contrast)
   - Add a value proposition line below the tagline, above the CTA buttons: `"Premium & Niche Fragrances in Cyprus | Free Shipping"` styled as `text-sm md:text-base text-white/60 tracking-wide` with `mb-10`

4. In `Categories.tsx`:
   - Change "Featured" eyebrow from `text-[9px] ... text-gold/60` to `text-[11px] ... text-gold-on-dark`
   - Change mobile category description from `text-[10px] text-gray-400` to `text-[11px] text-gray-300`
   - Reduce overlays: change `brightness-[0.65]` to `brightness-[0.75]` on all images (feature and grid tiles)
   - Reduce gradient: change `from-black/90` to `from-black/70` on all gradient overlays
   - Change Explore link text from `text-[9px] ... text-gold ... opacity-50` to `text-[10px] ... text-gold-on-dark ... opacity-70`

5. In `CreateSection.tsx`:
   - Change eyebrow from `text-gold/50` to `text-gold-on-dark`
   - Change accent labels from `text-[9px] ... text-gold/50` to `text-[11px] ... text-gold-on-dark`
   - Change description from `text-gray-300` to `text-gray-200` for better readability on dark background
   - Change image brightness from `brightness-[0.75]` to `brightness-[0.80]`
   - Change bottom gradient from `from-black via-black/20` to `from-black/80 via-black/15`

6. In `FeaturedProducts.tsx`:
   - Change brand eyebrow from `text-[9px]` to `text-[10px]`
   - Ensure product name, price font sizes are consistent with the system

7. In `Section.tsx` `SectionHeader`:
   - Change eyebrow from `text-gold/70` to `text-gold-accessible` (on light bg)
   - Change subtitle from `text-gray-500` to `text-gray-400` for slightly better contrast

**Context:** Read `@src/app/globals.css` for existing CSS variables and utility classes. Read `@.planning/DESIGN.md` if it exists. Read each component file listed above.

**Done when:**
- All eyebrow labels across Hero, Categories, CreateSection, FeaturedProducts, and SectionHeader use 11px+ minimum size
- No instance of `text-gold/50` or `text-gold/60` remains in any homepage component (replaced with accessible alternatives)
- `grep -c "text-gold/50\|text-gold/60" src/components/home/*.tsx src/components/ui/Section.tsx` returns 0
- `grep -c "text-gold-accessible\|text-gold-on-dark" src/app/globals.css` returns 2+
- Dark overlay brightness values are 0.75+ (not 0.65) in Categories.tsx
- Hero has a value proposition line visible below the tagline
- `npx tsc --noEmit` passes with no errors


## Task 2 — CTA Buttons & Mobile Spacing

**Wave:** 1
**Files:**
- `src/components/ui/Button.tsx` — Increase visual prominence of primary variant; add `urgency` size variant
- `src/components/home/Hero.tsx` — Update CTA button text to action-oriented copy; use larger button size
- `src/components/home/Categories.tsx` — Normalize mobile section spacing
- `src/components/home/CreateSection.tsx` — Normalize section spacing to use consistent `section-lg` class
- `src/components/home/FeaturedProducts.tsx` — Normalize section spacing; update "View All" CTA text
- `src/app/globals.css` — Add consistent mobile section gap override if needed

**Action:**

1. In `Button.tsx`, enhance the primary variant for more visual prominence:
   - Add a subtle animated gold shimmer border on hover: update the primary `styleVariants` to include `border-2 border-gold/0 hover:border-gold-light/50`
   - Increase shadow on primary: change `shadow-[0_4px_20px_rgba(212,175,55,0.2)]` to `shadow-[0_4px_24px_rgba(212,175,55,0.25)]`
   - Increase hover shadow: change `hover:shadow-[0_6px_35px_rgba(212,175,55,0.4)]` to `hover:shadow-[0_8px_40px_rgba(212,175,55,0.45)]`
   - For the `lg` size, increase min-height: change `min-h-[52px]` to `min-h-[56px]` and padding to `px-10 py-4`

2. In `Hero.tsx`, update CTA button text:
   - Change "Explore Collection" to "Shop Now" (shorter, action-oriented)
   - Change "Create Your Own" to "Design Your Fragrance"
   - Both buttons should use `size="lg"`

3. In `FeaturedProducts.tsx`, update the "View All" CTA link:
   - Change the link style from `text-[11px]` to `text-xs` for better readability
   - Keep the arrow icon animation

4. **Normalize mobile section spacing** across all homepage sections to eliminate uneven gaps:
   - `Categories.tsx`: Change `py-1` to `py-0` (edge-to-edge image grid, no vertical padding needed on the image collage — the gap between tiles is sufficient)
   - `CreateSection.tsx`: Already uses `section-lg`, keep it
   - `FeaturedProducts.tsx`: Already uses `section-lg`, keep it
   - In `globals.css`, verify `--section-py-lg` has consistent mobile value via `clamp(5rem, 10vw, 8rem)` — this is already set. No change needed.
   - The key fix: Categories currently has `py-1` which creates an inconsistent 4px gap. Removing it creates a clean edge-to-edge image grid that flows naturally between the hero above and the content sections below.

5. In `Hero.tsx`, ensure consistent bottom spacing: the hero's `py-20 md:py-32 lg:py-40` on the content div provides generous spacing. Verify the bottom vignette `h-32` doesn't create extra visual gap.

**Context:** Read `@src/components/ui/Button.tsx`, `@src/components/home/Hero.tsx`, `@src/app/globals.css` for current spacing tokens.

**Done when:**
- Primary buttons have increased shadow (24px+ blur) and hover shadow (40px+ blur)
- Hero CTA says "Shop Now" (not "Explore Collection")
- `grep "Shop Now" src/components/home/Hero.tsx` returns a match
- Categories section uses `py-0` instead of `py-1`
- `lg` button size has `min-h-[56px]`
- `npx tsc --noEmit` passes


## Task 3 — Trust Elements & Social Proof

**Wave:** 2 (after Task 1, Task 2)
**Files:**
- `src/components/home/TrustBar.tsx` — **Create new file.** Static trust/social proof bar component with trust badges, stats, and a testimonial.
- `src/app/page.tsx` — Import and place TrustBar between Hero and Categories

**Action:**

Create a new `TrustBar` component that displays static social proof on the homepage. This is NOT a full review system — it is a hardcoded trust section using real business facts.

1. Create `src/components/home/TrustBar.tsx`:
   - This is a `'use client'` component (uses framer-motion for scroll reveal)
   - Layout: Full-width section with light background (`bg-gold-ambient-subtle`), using `section-sm` vertical padding
   - Content structure — two rows:

   **Row 1: Trust Stats** (3 stats in a row, centered)
   ```
   [200+ Fragrances]  [Free Shipping Cyprus]  [Since 2018]
   ```
   - Each stat: large number/icon + small label below
   - Numbers: `font-playfair text-2xl md:text-3xl text-gold-accessible` (use the new accessible gold class from Task 1)
   - Labels: `text-[11px] uppercase tracking-[0.15em] text-gray-500`
   - Use Lucide icons: `Package` for fragrances, `Truck` for shipping, `Award` for since 2018
   - Stats separated by thin vertical gold lines (`w-px h-8 bg-gold/20`)
   - On mobile: horizontal scroll or stack to 1 column

   **Row 2: Testimonial** (single centered quote)
   ```
   "The most exquisite fragrance selection in Nicosia. Absolutely premium quality."
   — Verified Customer
   ```
   - Quote: `font-playfair italic text-base md:text-lg text-gray-600 max-w-xl mx-auto text-center`
   - Attribution: `text-[11px] uppercase tracking-[0.15em] text-gray-400 mt-3`
   - Wrap in a subtle gold border-top rule above the testimonial

   - Use `motion.div` with `whileInView` fade-in animation (opacity 0 -> 1, y 20 -> 0, duration 0.6s)
   - Respect reduced motion via `useReducedMotion` hook
   - Semantic HTML: use `<figure>` and `<figcaption>` for testimonial, `<blockquote>` for quote text

2. In `src/app/page.tsx`:
   - Import TrustBar: `import TrustBar from '@/components/home/TrustBar'`
   - Place it between `<Hero />` and `<Categories />`:
     ```tsx
     <Hero />
     <TrustBar />
     <Categories />
     ```

**Context:** Read `@src/app/page.tsx` for current homepage layout. Read `@src/components/ui/Section.tsx` for Section/SectionHeader patterns. Read `@src/app/globals.css` for available utility classes.

**Done when:**
- `src/components/home/TrustBar.tsx` exists and exports a default component
- Homepage renders TrustBar between Hero and Categories
- TrustBar shows 3 trust stats (200+ Fragrances, Free Shipping, Since 2018) and 1 testimonial
- Stats use `text-gold-accessible` class (WCAG-compliant gold)
- Testimonial uses semantic HTML (`<figure>`, `<blockquote>`, `<figcaption>`)
- `npx tsc --noEmit` passes


## Task 4 — Brand-Driven Footer Redesign

**Wave:** 2 (after Task 1)
**Files:**
- `src/components/layout/Footer.tsx` — Redesign footer with Aquad'or brand identity, remove Blog link, add brand storytelling and trust elements

**Action:**

Redesign the footer to be brand-specific rather than generic. Keep the existing structure (grid layout with logo, links, contact) but elevate it with brand storytelling and remove stale links.

1. **Remove Blog link** from `companyLinks` array (Blog was removed from navigation in Phase 19)

2. **Update shop links** to match current navigation structure:
   ```ts
   const shopLinks = [
     { label: 'Women', href: '/shop/women' },
     { label: 'Men', href: '/shop/men' },
     { label: 'Unisex', href: '/shop/niche' },
     { label: 'Lattafa Originals', href: '/shop/lattafa' },
     { label: 'Dubai Shop', href: '/shop/dubai-shop' },
     { label: 'Create Your Fragrance', href: '/create-perfume' },
   ];
   ```

3. **Add brand storytelling** below the logo/tagline in the left column:
   - Add a short brand description: `"Premium & niche fragrances curated in Nicosia, Cyprus since 2018. Every scent tells a story."` 
   - Style: `text-white/50 text-[13px] leading-relaxed mt-3 max-w-[240px]`

4. **Enhance brand emphasis** in footer:
   - Change the top gold line from `via-gold/30` to `via-gold/40` (slightly more visible)
   - Change section headings from `text-[9px] ... text-gold/50` to `text-[11px] ... text-gold-on-dark` (use the new accessible class from Task 1)
   - Change link text from `text-white/60` to `text-white/70` for better contrast
   - Change contact info icons from `text-gold/40` to `text-gold-on-dark`
   - Change copyright text from `text-white/30` to `text-white/50`

5. **Add trust badges row** between the main grid and the bottom bar:
   - A centered row with 3 small badges: `Free Shipping` | `Secure Payment` | `Premium Quality`
   - Style: `text-[10px] uppercase tracking-[0.15em] text-white/40` with small Lucide icons (`Truck`, `ShieldCheck`, `Gem`)
   - Separated by small dots or vertical lines
   - Wrapped in a `py-6` container with `border-t border-white/[0.06]` above

6. **Fix contrast issues**:
   - The "Designed and Developed by" Qualia attribution: change from `text-white/30` to `text-white/40` and `text-gold/50 hover:text-gold` to `text-gold-on-dark hover:text-gold`

**Context:** Read `@src/components/layout/Footer.tsx` for current structure. Read `@src/app/globals.css` for the new `text-gold-on-dark` class added in Task 1.

**Done when:**
- Blog link is removed from footer: `grep -c "Blog" src/components/layout/Footer.tsx` returns 0
- Footer has brand description text containing "since 2018"
- Footer section headings use `text-gold-on-dark` (not `text-gold/50`)
- Footer has trust badges row (Free Shipping, Secure Payment, Premium Quality)
- Shop links include "Lattafa Originals" and "Dubai Shop"
- All text meets WCAG AA contrast on dark background (no `text-white/30` remaining — minimum `text-white/40`)
- `npx tsc --noEmit` passes


## Success Criteria

- [ ] Consistent typography scale: all eyebrow labels 11px+, all section titles use same Playfair scale, all subtitles use same size
- [ ] Gold colors meet WCAG AA: no `text-gold/50` or `text-gold/60` on homepage components; replaced with `text-gold-accessible` (light bg) or `text-gold-on-dark` (dark bg)
- [ ] CTA buttons visually prominent: primary buttons have enhanced shadow, hero says "Shop Now"
- [ ] Consistent section spacing on mobile: Categories uses `py-0` (edge-to-edge), all other sections use `section-lg`
- [ ] Trust/social proof visible: TrustBar component between Hero and Categories with 3 stats + 1 testimonial
- [ ] Value proposition clear above fold: Hero shows "Premium & Niche Fragrances in Cyprus | Free Shipping"
- [ ] Footer is brand-specific: brand description, updated shop links, no Blog link, trust badges row
- [ ] Dark overlays reduced: Categories brightness >= 0.75, gradients from-black/70 (not /90)
- [ ] No TypeScript errors: `npx tsc --noEmit` passes cleanly
- [ ] Product image note: flagged as content issue for client (no code task)
