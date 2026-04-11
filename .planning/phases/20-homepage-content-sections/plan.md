---
phase: 20
goal: "Fix homepage content sections: rewrite fragrance education, split featured collections, remove boutique section, add SVG social icons, custom chat widget icon"
tasks: 4
waves: 2
---

# Phase 20: Homepage Content Sections

Goal: Homepage accurately represents Aquad'or brand identity. Fragrance education section educates properly (evaporation timeline, correct order, no numbering). Featured products split into Aquad'or and Lattafa sections. "Our Boutique" section removed. Social icons are professional SVGs. Chat widget has branded icon.

## Task 1 -- Rewrite Fragrance Education Section (CreateSection)
**Wave:** 1
**Files:** `src/components/home/CreateSection.tsx`
**Action:**
The `stages` array (lines 11-33) currently has numbered steps ("01", "02", "03") with titles "Top Notes", "Heart Notes", "Base Notes" and only lists scent types, not functional explanation.

Rewrite the `stages` array with these changes:
1. Remove the `step` property entirely from each stage object (no more numbering).
2. Fix the order: Top Notes, then Middle Notes (Heart Notes), then Base Notes.
3. Rewrite each `description` to explain evaporation timeline and role in fragrance evolution:
   - **Top Notes:** "The first impression of a fragrance, top notes are light, volatile molecules that evaporate within 15-30 minutes. They create the opening burst -- think citrus zest, fresh herbs, and crisp spices -- drawing you into the scent before gracefully fading."
   - **Middle Notes (Heart Notes):** "Emerging as top notes fade, the heart reveals itself over 1-4 hours. These balanced, rounded accords -- florals, aromatics, soft spices -- form the true character of the fragrance and define its personality."
   - **Base Notes:** "The foundation that lingers for 6-24 hours, base notes are rich, heavy molecules that anchor everything above. Warm woods, deep musks, amber, and resins create the lasting memory others notice long after you have left."
4. Update the `title` of the second stage from "Heart Notes" to "Middle Notes".
5. Update the `accent` labels: "The Opening" (top), "The Character" (middle), "The Memory" (base).
6. Remove the large ghost step number rendering. Find the `motion.div` block (lines 125-139) that renders `{stage.step}` in text-6xl/7xl at `top-6 right-6` -- delete this entire block since `step` no longer exists.
7. Improve subtitle contrast: the description text at line 183 uses `text-gray-500` which is low contrast on the dark `#0a0a0a` background. Change it to `text-gray-300` and add `group-hover:text-gray-200` for better readability.
8. Similarly, the section intro paragraph at line 86 (`text-gray-500`) should become `text-gray-400` for better contrast.

**Context:** Read `@src/components/home/CreateSection.tsx`
**Done when:** CreateSection renders three cards in order Top/Middle/Base, no step numbers visible, descriptions explain evaporation timelines (15-30 min / 1-4 hours / 6-24 hours), subtitle text passes WCAG AA contrast on dark background. `grep -c "step" src/components/home/CreateSection.tsx` returns 0 (no step property or step number rendering).

## Task 2 -- Split Featured Collections into Aquad'or + Lattafa Sections
**Wave:** 1
**Files:** `src/components/home/FeaturedProducts.tsx`, `src/app/page.tsx`, `src/lib/supabase/product-service.ts`
**Action:**
Currently `page.tsx` fetches 6 featured products via `getFeaturedProducts(6)` which just returns the 6 newest in-stock products regardless of brand. This creates the problem where only Lattafa shows up.

1. **Add two new query functions** in `src/lib/supabase/product-service.ts`:
   - `getFeaturedAquadorProducts(count: number)`: Query products where `brand` is null OR `brand` ilike `%aquad%` (Aquad'or products don't have a brand field set, or it's "Aquad'or"). Also filter by `is_active = true` and `in_stock = true`. Order by `created_at` desc. Limit to `count`.
   - `getFeaturedLattafaProducts(count: number)`: Query products where `category = 'lattafa-original'` AND `is_active = true` AND `in_stock = true`. Order by `created_at` desc. Limit to `count`.

2. **Update `src/app/page.tsx`**:
   - Import the two new functions.
   - Fetch both in parallel: `const [aquadorData, lattafaData] = await Promise.all([getFeaturedAquadorProducts(6), getFeaturedLattafaProducts(6)])`.
   - Transform both arrays the same way `featuredProducts` is currently transformed (the map on lines 27-40).
   - Render two `<FeaturedProducts>` components instead of one:
     ```
     <FeaturedProducts products={aquadorProducts} title="Featured Aquad'or Perfumes" subtitle="Our signature collection, crafted exclusively for Aquad'or." eyebrow="House Collection" viewAllHref="/shop" viewAllLabel="View All Aquad'or" />
     <FeaturedProducts products={lattafaProducts} title="Best-Selling Lattafa Originals" subtitle="Authentic Lattafa perfumes, curated and imported directly." eyebrow="Lattafa Collection" viewAllHref="/shop/lattafa-original" viewAllLabel="View All Lattafa" />
     ```
   - Remove the old single `getFeaturedProducts` import if no longer used.

3. **Update `src/components/home/FeaturedProducts.tsx`**:
   - Add props to `FeaturedProductsProps`: `title?: string`, `subtitle?: string`, `eyebrow?: string`, `viewAllHref?: string`, `viewAllLabel?: string`.
   - Default values: `title = "Featured Collections"`, `subtitle = "Discover our most beloved fragrances..."`, `eyebrow = "Our Selection"`, `viewAllHref = "/shop"`, `viewAllLabel = "View All Products"`.
   - Pass `title`, `subtitle`, `eyebrow` to the `<SectionHeader>` component (lines 34-38).
   - Update the "View All" link (line 123-128) to use `viewAllHref` and `viewAllLabel` instead of hardcoded `/shop` and "View All Products".
   - If `products` array is empty, render nothing (return null early) so an empty Lattafa section doesn't show a blank grid.

**Context:** Read `@src/app/page.tsx`, `@src/components/home/FeaturedProducts.tsx`, `@src/lib/supabase/product-service.ts`, `@src/lib/supabase/types.ts` (for Product type)
**Done when:** Homepage shows two distinct featured sections with different headers. First section titled "Featured Aquad'or Perfumes" shows Aquad'or-branded products. Second section titled "Best-Selling Lattafa Originals" shows Lattafa products. Both have appropriate "View All" links. `npx tsc --noEmit` passes.

## Task 3 -- Remove "Our Boutique" Section + Replace Social Icons with SVGs
**Wave:** 1
**Files:** `src/components/home/CTASection.tsx`, `src/components/layout/Footer.tsx`, `src/app/page.tsx`
**Action:**
Two independent changes bundled because both are small:

**A. Remove "Our Boutique" (CTASection.tsx):**
The entire `CTASection` component IS the "Our Boutique" section -- line 120 says `<p className="eyebrow ...">Our Boutique</p>`. The client wants it removed entirely.

1. In `src/app/page.tsx`, remove the `<CTASection />` component from the JSX (line 144) and remove its import (line 7).
2. Do NOT delete the `CTASection.tsx` file yet (may be repurposed later), but it will no longer render.

**B. Replace "IG | FB" with SVG icons (Footer.tsx):**
Lines 49-53 in `Footer.tsx` render text links "IG" and "FB" with a pipe separator. Replace with proper SVG icons:

1. Replace the social links block (lines 49-53) with two `<a>` tags containing inline SVG icons:
   - Instagram icon: standard Instagram camera SVG (24x24 viewBox, `w-5 h-5` class). Use the official Instagram logo path: rounded square with circle and dot.
   - Facebook icon: standard Facebook "f" SVG (24x24 viewBox, `w-5 h-5` class). Use the official Facebook logo path.
2. Style both with: `className="text-white/40 hover:text-gold transition-colors duration-200"` and appropriate `aria-label`.
3. Remove the pipe separator `<span>` entirely.
4. Keep the `flex gap-3 mt-4` wrapper but adjust gap to `gap-4` for icon spacing.
5. Each SVG should use `fill="currentColor"` so the hover color transition works via text color inheritance.

SVG paths to use:
- **Instagram:** `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg>`
- **Facebook:** `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>`

**Context:** Read `@src/components/home/CTASection.tsx`, `@src/components/layout/Footer.tsx`, `@src/app/page.tsx`
**Done when:** "Our Boutique" section no longer appears on homepage. Footer shows Instagram and Facebook as recognizable SVG icons (not text). Icons change to gold on hover. `grep -c "Our Boutique" src/app/page.tsx` returns 0. `grep -c '"IG"' src/components/layout/Footer.tsx` returns 0.

## Task 4 -- Custom Branded Chat Widget Icon
**Wave:** 2 (after Task 1, 2, 3)
**Files:** `src/components/ai/ChatWidget.tsx`
**Action:**
Replace the generic `MessageCircle` (lucide) icon on the chat widget FAB button with a custom branded icon: a 50ml Aquad'or bottle silhouette with a question mark inside.

1. Create an inline SVG component within `ChatWidget.tsx` (or a small separate component above the default export). Name it `AquadorBottleIcon`. The SVG should be:
   - A simplified perfume bottle silhouette (rectangular body with narrow neck and cap) at 24x24 viewBox
   - A question mark "?" centered inside the bottle body
   - Use `currentColor` for fill so it inherits the button's text color (`text-dark`)
   - SVG path approach: 
     ```
     viewBox="0 0 24 24" fill="currentColor"
     - Bottle cap: rect from (9,1) to (15,3), rx=0.5
     - Bottle neck: rect from (10,3) to (14,6), rx=0.5  
     - Bottle body: rect from (7,6) to (17,21), rx=2
     - Question mark: text element or path at center (x=12, y=16), font-size ~8px, text-anchor middle
     ```
   - Keep it simple and recognizable at 24x24 size

2. In the FAB button (line 140-143), replace `<MessageCircle className="w-6 h-6 text-dark" />` with `<AquadorBottleIcon className="w-6 h-6 text-dark" />`.

3. The `AquadorBottleIcon` component should accept `className` prop and pass it to the root `<svg>` element.

4. Keep the green "online" dot indicator (`<span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-gold" />`) -- it should still appear on top of the new icon.

5. Remove the `MessageCircle` import from lucide-react if it's no longer used anywhere in the file (check: it's only used on line 142 for the FAB).

**Context:** Read `@src/components/ai/ChatWidget.tsx`
**Done when:** Chat widget FAB displays a perfume bottle silhouette with question mark instead of generic chat bubble. Icon is clearly recognizable as a bottle at the 56x56px button size. Gold gradient background still visible. `grep -c "MessageCircle" src/components/ai/ChatWidget.tsx` returns 0. `npx tsc --noEmit` passes.

## Success Criteria
- [ ] Fragrance education section shows Top Notes / Middle Notes / Base Notes (correct order), with evaporation timeline descriptions, no numbering, improved contrast
- [ ] Featured collections split: "Featured Aquad'or Perfumes" section + "Best-Selling Lattafa Originals" section with separate View All links
- [ ] "Our Boutique" section removed from homepage (CTASection no longer rendered)
- [ ] Footer social links use SVG Instagram and Facebook icons (no "IG | FB" text)
- [ ] Chat widget FAB shows custom perfume bottle icon with question mark
- [ ] `npx tsc --noEmit` passes with no errors
