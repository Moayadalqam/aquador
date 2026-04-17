---
phase: 29
goal: "Fix 6 optimization findings (loading.tsx, error.tsx, a11y labels, CDN migration, JSON-LD unification, hardcoded hex) plus a comprehensive responsive/visual QA pass across all public pages"
tasks: 7
waves: 3
---

# Phase 29: Route Conventions + A11y + Responsive UX Polish

Goal: Every dynamic route has a branded loading skeleton and contextual error boundary. All interactive elements meet WCAG AA labeling requirements. External CDN dependencies are eliminated. JSON-LD serialization is unified. Hardcoded hex colors are replaced with CSS custom properties. Every public page passes responsive QA at 375px/768px/1440px.

## Task 1 -- Loading Skeletons for Dynamic Routes
**Wave:** 1
**Files:**
- `src/app/blog/[slug]/loading.tsx` (CREATE) -- exports `default function BlogPostLoading()`
- `src/app/shop/gender/[gender]/loading.tsx` (CREATE) -- exports `default function GenderLoading()`

**Action:**
Create two route-segment `loading.tsx` files using the existing `LuxurySkeleton` component family from `src/components/ui/LuxurySkeleton.tsx`.

For `src/app/blog/[slug]/loading.tsx`:
- Import `LuxurySkeleton` from `@/components/ui/LuxurySkeleton`
- Render a blog article skeleton: full-width hero image placeholder (aspect-[16/9]), title skeleton (h-10 w-3/4), author/date row (two small skeletons), then 6-8 paragraph line skeletons of varying widths (w-full, w-11/12, w-full, w-10/12, w-full, w-9/12) to simulate article body
- Wrap in `<main className="min-h-screen bg-gold-ambient pt-20 md:pt-24 pb-16">` with a `<div className="content-container">` inside, matching the blog post page layout
- Include the `luxuryShimmer` keyframe via `<style jsx global>` block (same pattern as `LuxuryHeroSkeleton`)

For `src/app/shop/gender/[gender]/loading.tsx`:
- Import `LuxuryHeroSkeleton`, `LuxuryFilterSkeleton`, `LuxuryProductGridSkeleton`, `LuxurySkeleton` from `@/components/ui/LuxurySkeleton`
- Copy the pattern from `src/app/shop/loading.tsx` exactly: hero skeleton, filter skeletons, then `LuxuryProductGridSkeleton` with `count={12}` in a 4x3 grid
- Use the same container classes: `<main className="min-h-screen bg-gold-ambient pt-20 md:pt-24 pb-16">`

**Context:** Read `@src/app/shop/loading.tsx` (reference pattern), `@src/components/ui/LuxurySkeleton.tsx` (available exports), `@src/app/blog/[slug]/page.tsx` (blog layout structure)
**Done when:** Both files exist, export a default function, import from `@/components/ui/LuxurySkeleton`, and `npx tsc --noEmit` passes with zero errors.

---

## Task 2 -- Error Boundaries for Dynamic Routes
**Wave:** 1
**Files:**
- `src/app/blog/[slug]/error.tsx` (CREATE) -- exports `default function BlogPostError()`
- `src/app/shop/[category]/error.tsx` (CREATE) -- exports `default function CategoryError()`
- `src/app/shop/gender/[gender]/error.tsx` (CREATE) -- exports `default function GenderError()`
- `src/app/products/[slug]/error.tsx` (CREATE) -- exports `default function ProductError()`

**Action:**
Create 4 Client Component error boundaries following the pattern in `src/app/error.tsx`. Each file must:

1. Start with `'use client';`
2. Import `{ useEffect }` from `'react'`, `Link` from `'next/link'`, `* as Sentry` from `'@sentry/nextjs'`, and `Button` from `@/components/ui/Button`
3. Import icons from `lucide-react`: `RefreshCw` always, plus a contextual icon (`BookOpen` for blog, `ShoppingBag` for shop/gender/products)
4. Accept props `{ error, reset }: { error: Error & { digest?: string }; reset: () => void }`
5. Call `Sentry.captureException(error)` inside a `useEffect` with `[error]` dependency
6. Match the dark gold aesthetic: `min-h-screen flex items-center justify-center bg-black px-4`, centered `max-w-md` card, gold bordered icon circle, `text-gradient-gold` heading, `text-gray-400` description
7. Two buttons: "Try Again" (calls `reset`) and a contextual back link

Contextual copy for each:
- **blog/[slug]**: heading "Article Unavailable", description "We couldn't load this article. It may have been moved or is temporarily unavailable.", back link: "Back to Blog" -> `/blog`
- **shop/[category]**: heading "Collection Unavailable", description "We couldn't load this collection right now.", back link: "Back to Shop" -> `/shop`
- **shop/gender/[gender]**: heading "Collection Unavailable", description "We couldn't load this collection right now.", back link: "Back to Shop" -> `/shop`
- **products/[slug]**: heading "Product Unavailable", description "We couldn't load this product. It may have been removed or is temporarily unavailable.", back link: "Back to Shop" -> `/shop`

**Context:** Read `@src/app/error.tsx` (reference pattern)
**Done when:** All 4 files exist, each starts with `'use client'`, each calls `Sentry.captureException`, each has a contextual heading/description/back-link, and `npx tsc --noEmit` passes.

---

## Task 3 -- A11y Labels (CheckoutForm + ChatWidget)
**Wave:** 1
**Files:**
- `src/app/create-perfume/components/CheckoutForm.tsx` (MODIFY lines 123-202)
- `src/components/ai/ChatWidget.tsx` (MODIFY lines 205-241)

**Action:**

**CheckoutForm.tsx** (lines 123-202):
1. "Perfume Name *" label (line 123): Add `htmlFor="perfume-name"`. Add `id="perfume-name"` to the `<input>` on line 126.
2. "Select Volume *" label (line 148): Convert the wrapping `<motion.div>` to use `<fieldset>` and `<legend>` semantics. Replace the `<label>` with `<legend className="mb-3 block text-xs text-gray-400 tracking-[0.15em] uppercase">Select Volume *</legend>`. Each volume button already has visible text; add `role="radio"` and `aria-checked={selectedVolume === vol}` to each button, and `role="radiogroup"` to the parent grid div.
3. "Special Requests" label (line 185): Add `htmlFor="special-requests"`. Add `id="special-requests"` to the `<textarea>` on line 188.

**ChatWidget.tsx** (lines 205-241):
1. AI chat input (line 213): Add `aria-label="Ask about fragrances"` to the `<input>` element.
2. AI send button (line 214): Add `aria-label="Send message"` to the `<button>` element.
3. Live chat input (line 240): Add `aria-label="Type a message"` to the `<input>` element.
4. Live send button (line 241): Add `aria-label="Send message"` to the `<button>` element.
5. AI messages container (line 205, the `<div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">`): Add `role="log"` and `aria-live="polite"` attributes.
6. Live messages container (line 232, same pattern): Add `role="log"` and `aria-live="polite"` attributes.

**Context:** Read `@src/app/create-perfume/components/CheckoutForm.tsx` (lines 110-210), `@src/components/ai/ChatWidget.tsx` (lines 200-250)
**Done when:** `grep -c 'htmlFor="perfume-name"' src/app/create-perfume/components/CheckoutForm.tsx` returns 1. `grep -c 'htmlFor="special-requests"' src/app/create-perfume/components/CheckoutForm.tsx` returns 1. `grep -c 'role="radiogroup"' src/app/create-perfume/components/CheckoutForm.tsx` returns 1. `grep -c 'aria-label="Ask about fragrances"' src/components/ai/ChatWidget.tsx` returns 1. `grep -c 'role="log"' src/components/ai/ChatWidget.tsx` returns 2. `npx tsc --noEmit` passes.

---

## Task 4 -- Migrate External CDN Assets to Supabase Storage
**Wave:** 2 (after Wave 1 -- needs focused attention, no parallel risk)
**Files:**
- `src/components/home/Hero.tsx` (MODIFY line 40 -- video `src` URL)
- `src/lib/categories.ts` (MODIFY line 65 -- image URL)
- `next.config.mjs` (MODIFY line 85 -- remove `https://static1.squarespace.com https://images.squarespace-cdn.com` from `media-src` CSP directive)

**Action:**

Step 1: Download the two external assets locally:
```bash
curl -L -o /tmp/hero-video.mp4 "https://static1.squarespace.com/static/66901f0f8865462c0ac066ba/t/6899a19131e4b55cddf56fb2/1754898858755/download+%2820%29.mp4"
curl -L -o /tmp/lattafa-category.jpeg "https://images.squarespace-cdn.com/content/v1/66901f0f8865462c0ac066ba/39636dc6-a6c4-4b4d-968d-46a0f5bea78c/image_Pippit_202509201633.jpeg"
```

Step 2: Upload to Supabase Storage using the CLI. Create a `public-assets` bucket if it doesn't exist:
```bash
npx supabase storage create public-assets --public
npx supabase storage cp /tmp/hero-video.mp4 ss://public-assets/hero-video.mp4
npx supabase storage cp /tmp/lattafa-category.jpeg ss://public-assets/lattafa-category.jpeg
```
If CLI upload fails, use the Supabase MCP or Dashboard to upload manually. The public URLs will be: `https://hznpuxplqgszbacxzbhv.supabase.co/storage/v1/object/public/public-assets/hero-video.mp4` and `https://hznpuxplqgszbacxzbhv.supabase.co/storage/v1/object/public/public-assets/lattafa-category.jpeg`.

Step 3: Update `src/components/home/Hero.tsx` line 40: Replace the Squarespace URL with the Supabase Storage URL. Add a comment above: `// Migrated from Squarespace CDN 2026-04-17 — original URL in git history`.

Step 4: Update `src/lib/categories.ts` line 65: Replace the `images.squarespace-cdn.com` URL with the Supabase Storage URL. Add the same migration comment.

Step 5: Update `next.config.mjs` line 85: Remove `https://static1.squarespace.com https://images.squarespace-cdn.com` from the `media-src` CSP directive. The Supabase domain `https://*.supabase.co` is already whitelisted in `media-src`.

Step 6: Verify the video loads on `/` and the Lattafa category image loads on the homepage categories section.

**Context:** Read `@src/components/home/Hero.tsx` (line 40), `@src/lib/categories.ts` (line 65), `@next.config.mjs` (line 85)
**Done when:** `grep -c 'squarespace' src/components/home/Hero.tsx` returns 0. `grep -c 'squarespace' src/lib/categories.ts` returns 0. `grep -c 'squarespace' next.config.mjs` returns 0. `grep -c 'supabase.co/storage' src/components/home/Hero.tsx` returns 1. `npm run build` passes.

---

## Task 5 -- Unified JSON-LD Component
**Wave:** 1
**Files:**
- `src/components/seo/JsonLd.tsx` (CREATE) -- exports `default function JsonLd()`
- `src/app/page.tsx` (MODIFY) -- replace `safeStringify` + 3 raw `<script>` blocks with `<JsonLd>`
- `src/lib/seo/listing-schema.ts` (MODIFY) -- delete `jsonLdScript()` function, keep `buildCollectionPage`, `buildBreadcrumbList`, `buildBlogSchema`
- `src/app/products/[slug]/page.tsx` (MODIFY lines 138-145) -- replace 2 raw `<script>` blocks with `<JsonLd>`
- `src/app/shop/[category]/page.tsx` (MODIFY lines 111-118) -- replace 2 raw `<script>` blocks with `<JsonLd>`
- `src/app/shop/gender/[gender]/page.tsx` (MODIFY lines 107-114) -- replace 2 raw `<script>` blocks with `<JsonLd>`
- `src/app/blog/[slug]/page.tsx` (MODIFY lines 174-180) -- replace the `.map()` block with `<JsonLd>`

**Action:**

Step 1: Create `src/components/seo/JsonLd.tsx`:
```tsx
interface JsonLdProps {
  schema: Record<string, unknown> | Array<Record<string, unknown>>;
}

/**
 * Unified JSON-LD structured data component.
 * Escapes `<` to prevent XSS via </script> injection in JSON-LD payloads.
 * Server Component — zero client JS.
 */
export default function JsonLd({ schema }: JsonLdProps) {
  const json = JSON.stringify(schema).replace(/</g, '\\u003c');
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
```

Step 2: In `src/app/page.tsx`:
- Add `import JsonLd from '@/components/seo/JsonLd';` at the top
- Delete the `safeStringify` function (lines 121-122)
- Replace the three `<script type="application/ld+json" dangerouslySetInnerHTML=...>` blocks (lines 126-137) with:
  ```tsx
  <JsonLd schema={organizationSchema} />
  <JsonLd schema={websiteSchema} />
  <JsonLd schema={localBusinessSchema} />
  ```

Step 3: In `src/lib/seo/listing-schema.ts`:
- Delete the `jsonLdScript` function (lines 75-77). Add a `/** @deprecated Use <JsonLd> component instead */` comment above the deleted line as a tombstone if preferred, or just delete.
- Keep `buildCollectionPage`, `buildBreadcrumbList`, `buildBlogSchema` unchanged.

Step 4: In `src/app/products/[slug]/page.tsx`:
- Add `import JsonLd from '@/components/seo/JsonLd';`
- Replace lines 138-145 (two raw `<script>` blocks) with:
  ```tsx
  <JsonLd schema={jsonLd} />
  <JsonLd schema={breadcrumbSchema} />
  ```

Step 5: In `src/app/shop/[category]/page.tsx`:
- Add `import JsonLd from '@/components/seo/JsonLd';`
- Remove `jsonLdScript` from the `listing-schema` import
- Replace lines 111-118 with:
  ```tsx
  <JsonLd schema={breadcrumbSchema} />
  <JsonLd schema={collectionSchema} />
  ```

Step 6: In `src/app/shop/gender/[gender]/page.tsx`:
- Add `import JsonLd from '@/components/seo/JsonLd';`
- Remove `jsonLdScript` from the `listing-schema` import
- Replace lines 107-114 with:
  ```tsx
  <JsonLd schema={breadcrumbSchema} />
  <JsonLd schema={collectionSchema} />
  ```

Step 7: In `src/app/blog/[slug]/page.tsx`:
- Add `import JsonLd from '@/components/seo/JsonLd';`
- Replace the `.map()` block (lines 174-180) with:
  ```tsx
  {schemas.map((schema, i) => (
    <JsonLd key={i} schema={schema} />
  ))}
  ```

**Context:** Read `@src/app/page.tsx` (lines 120-137), `@src/lib/seo/listing-schema.ts` (lines 75-77), `@src/app/products/[slug]/page.tsx` (lines 138-145), `@src/app/shop/[category]/page.tsx` (lines 109-122), `@src/app/shop/gender/[gender]/page.tsx` (lines 105-118), `@src/app/blog/[slug]/page.tsx` (lines 172-183)
**Done when:** `src/components/seo/JsonLd.tsx` exists. `grep -rc 'safeStringify' src/app/page.tsx` returns 0. `grep -c 'jsonLdScript' src/lib/seo/listing-schema.ts` returns 0. `grep -c 'jsonLdScript' src/app/shop/` returns 0. `grep -rc 'dangerouslySetInnerHTML.*ld.json' src/app/` returns 0 (all JSON-LD now goes through `<JsonLd>`). `npx tsc --noEmit` passes. `npm run build` passes.

---

## Task 6 -- Extract Hardcoded Hex Colors
**Wave:** 1
**Files:**
- `src/app/create-perfume/page.tsx` (MODIFY lines 25-29, 502, 814) -- replace inline `style` hex gradients with CSS classes
- `src/app/globals.css` (MODIFY) -- add CSS utility classes for gold text gradients
- `src/lib/og-colors.ts` (CREATE) -- exports `OG_COLORS` constant
- `src/app/api/og/route.tsx` (MODIFY) -- import and use `OG_COLORS`
- `src/app/api/og/product/[slug]/route.tsx` (MODIFY) -- import and use `OG_COLORS`

**Action:**

Step 1: Add CSS utility classes to `src/app/globals.css`. Add after the existing utility layer or in a new section:
```css
/* Gold text gradient utilities — replaces hardcoded hex in inline styles */
.text-gold-gradient-hero {
  background: linear-gradient(180deg, #FFF8DC 0%, #FFD700 35%, #D4AF37 65%, #B8960C 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 2px 40px rgba(212,175,55,0.2));
}

.text-gold-gradient-soft {
  background: linear-gradient(180deg, #FFF8DC 0%, #D4AF37 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

Step 2: In `src/app/create-perfume/page.tsx`:
- Line 501-508 (h1 "Create Your Signature Scent"): Remove the `style={{ background: 'linear-gradient(180deg, #FFF8DC 0%, #FFD700 35%, #D4AF37 65%, #B8960C 100%)', ... }}` prop. Add `className="... text-gold-gradient-hero"` instead.
- Line 813-819 (h2 "Finalize Your Masterpiece"): Remove the `style={{ background: 'linear-gradient(180deg, #FFF8DC 0%, #D4AF37 100%)', ... }}` prop. Add `className="... text-gold-gradient-soft"` instead.
- Lines 25-29 (`categoryThemes` object): Leave as-is -- these are dynamic per-category theme colors used in JS logic, not suitable for CSS variables.

NOTE: Do NOT touch `src/components/3d/PerfumeBottle.tsx` SVG `<stop>` colors -- hex is intrinsic to SVG gradient definitions.

Step 3: Create `src/lib/og-colors.ts`:
```ts
/**
 * Shared color constants for OG image generation routes.
 * ImageResponse does not support CSS variables or Tailwind,
 * so hex values are intentional here.
 */
export const OG_COLORS = {
  bg: '#0a0a0a',
  bgGradient: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
  gold: '#D4AF37',
  goldLight: '#FFD700',
  textMuted: '#888',
} as const;
```

Step 4: In `src/app/api/og/route.tsx`:
- Add `import { OG_COLORS } from '@/lib/og-colors';`
- Replace `background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)'` with `background: OG_COLORS.bgGradient`
- Replace `color: '#D4AF37'` with `color: OG_COLORS.gold`
- Replace `color: '#FFD700'` with `color: OG_COLORS.goldLight`
- Replace `color: '#888'` with `color: OG_COLORS.textMuted`

Step 5: In `src/app/api/og/product/[slug]/route.tsx`:
- Add `import { OG_COLORS } from '@/lib/og-colors';`
- Replace `background: '#0a0a0a'` with `background: OG_COLORS.bg`
- Replace `color: '#D4AF37'` with `color: OG_COLORS.gold`
- Replace `color: '#FFD700'` with `color: OG_COLORS.goldLight`
- Replace `color: '#888'` with `color: OG_COLORS.textMuted`

**Context:** Read `@src/app/create-perfume/page.tsx` (lines 20-30, 496-510, 808-822), `@src/app/api/og/route.tsx`, `@src/app/api/og/product/[slug]/route.tsx`, `@src/app/globals.css`
**Done when:** `src/lib/og-colors.ts` exists. `grep -c 'OG_COLORS' src/app/api/og/route.tsx` returns >= 1. `grep -c 'OG_COLORS' src/app/api/og/product/[slug]/route.tsx` returns >= 1. `grep -c 'text-gold-gradient-hero' src/app/create-perfume/page.tsx` returns >= 1. `npx tsc --noEmit` passes.

---

## Task 7 -- Responsive Audit (Full QA Pass)
**Wave:** 3 (after all other tasks complete)
**Files:**
- `.planning/phases/29-conventions-a11y-responsive/responsive-audit.md` (CREATE) -- audit results
- Various source files as needed for minor fixes

**Action:**

Run the dev server (`npm run dev`) and systematically test every public page at 3 viewport widths: 375px (mobile), 768px (tablet), 1440px (desktop). Use Chrome DevTools device emulation.

Pages to audit:
1. `/` (homepage)
2. `/shop` (all products)
3. `/shop/lattafa` (Lattafa page)
4. `/shop/gender/men` (gender page)
5. `/products/{any-slug}` (product detail)
6. `/blog` (blog listing)
7. `/blog/{any-slug}` (blog post -- new loading.tsx should show skeleton)
8. `/create-perfume` (custom perfume builder)
9. `/contact`
10. `/about`

For each page, check:
- **No horizontal scroll** at 320px and 375px (open DevTools, check document width)
- **Text overflow** -- no truncation bugs, no text escaping containers
- **Touch targets** -- all buttons/links are >= 44x44px (use DevTools element inspector)
- **Cart drawer** -- opens/closes correctly on mobile, doesn't overflow viewport
- **Navbar** -- hamburger menu opens/closes, all links accessible, no z-index issues
- **Image aspect ratios** -- no squished or stretched images
- **Hero legibility** -- text readable over video/background at 320px
- **Form inputs** -- full-width on mobile, labels visible, no keyboard overlap issues
- **Footer** -- stacks correctly on mobile, links accessible
- **Fixed min/max widths** -- no elements causing horizontal overflow

Record results in `.planning/phases/29-conventions-a11y-responsive/responsive-audit.md` with this format:
```markdown
# Responsive Audit — Phase 29
Date: 2026-04-17
Tester: Builder agent

## Summary
Pages tested: 10
Issues found: N (X fixed, Y deferred)

## Results by Page

### / (Homepage)
| Check | 375px | 768px | 1440px | Notes |
|-------|-------|-------|--------|-------|
| No horizontal scroll | PASS/FAIL | ... | ... | ... |
| Text overflow | ... | ... | ... | ... |
...
```

Fix any **minor issues** directly (padding adjustments, overflow-hidden, min-width removal, text-wrap). For anything requiring significant rework (layout restructure, component rewrite), document it in the audit file as "deferred" with the file path and description.

**Context:** Read `@.planning/DESIGN.md` (if it exists), `@.planning/phases/29-conventions-a11y-responsive/plan.md` (this plan)
**Done when:** `.planning/phases/29-conventions-a11y-responsive/responsive-audit.md` exists with results for all 10 pages at all 3 viewports. Any minor fixes are committed. `npm run build` passes after all fixes.

---

## Success Criteria
- [ ] `/blog/[slug]` shows branded skeleton during ISR cache miss (not blank flash)
- [ ] `/shop/gender/[gender]` shows branded skeleton during ISR cache miss
- [ ] All 4 dynamic routes have contextual error boundaries with Sentry integration
- [ ] CheckoutForm labels are programmatically linked (`htmlFor`/`id`), volume selector uses `role="radiogroup"`
- [ ] ChatWidget inputs have `aria-label`, message containers have `role="log"` + `aria-live="polite"`
- [ ] Hero video and Lattafa category image load from Supabase Storage, not Squarespace
- [ ] CSP `media-src` no longer includes Squarespace domains
- [ ] All JSON-LD across the site uses the unified `<JsonLd>` component
- [ ] `safeStringify` deleted from homepage, `jsonLdScript` deleted from listing-schema
- [ ] Create-perfume gold gradients use CSS classes instead of inline hex
- [ ] OG routes use shared `OG_COLORS` constant
- [ ] Responsive audit document exists with pass/fail for all 10 pages at 375/768/1440px
- [ ] `npm run build` passes with zero errors

---

## Verification Contract

### Contract for Task 1 -- Blog Post Loading Skeleton
**Check type:** file-exists
**Command:** `test -f src/app/blog/[slug]/loading.tsx && echo EXISTS`
**Expected:** `EXISTS`
**Fail if:** File does not exist

### Contract for Task 1 -- Gender Loading Skeleton
**Check type:** file-exists
**Command:** `test -f src/app/shop/gender/[gender]/loading.tsx && echo EXISTS`
**Expected:** `EXISTS`
**Fail if:** File does not exist

### Contract for Task 1 -- Loading skeletons import LuxurySkeleton
**Check type:** grep-match
**Command:** `grep -c 'LuxurySkeleton' src/app/blog/[slug]/loading.tsx`
**Expected:** Non-zero (>= 1)
**Fail if:** Returns 0 -- skeleton component not imported

### Contract for Task 1 -- Gender loading matches shop pattern
**Check type:** grep-match
**Command:** `grep -c 'LuxuryProductGridSkeleton' src/app/shop/gender/[gender]/loading.tsx`
**Expected:** Non-zero (>= 1)
**Fail if:** Returns 0 -- product grid skeleton missing

### Contract for Task 2 -- Error boundaries exist
**Check type:** command-exit
**Command:** `test -f src/app/blog/[slug]/error.tsx && test -f src/app/shop/[category]/error.tsx && test -f src/app/shop/gender/[gender]/error.tsx && test -f src/app/products/[slug]/error.tsx && echo ALL_EXIST`
**Expected:** `ALL_EXIST`
**Fail if:** Any file missing

### Contract for Task 2 -- Error boundaries are client components
**Check type:** command-exit
**Command:** `for f in src/app/blog/[slug]/error.tsx src/app/shop/[category]/error.tsx src/app/shop/gender/[gender]/error.tsx src/app/products/[slug]/error.tsx; do head -1 "$f" | grep -q "use client" || echo "MISSING_USE_CLIENT: $f"; done`
**Expected:** No output (all files have 'use client')
**Fail if:** Any file prints MISSING_USE_CLIENT

### Contract for Task 2 -- Error boundaries integrate Sentry
**Check type:** command-exit
**Command:** `grep -l 'Sentry.captureException' src/app/blog/[slug]/error.tsx src/app/shop/[category]/error.tsx src/app/shop/gender/[gender]/error.tsx src/app/products/[slug]/error.tsx | wc -l`
**Expected:** `4`
**Fail if:** Less than 4 -- some error boundaries missing Sentry integration

### Contract for Task 3 -- CheckoutForm htmlFor labels
**Check type:** grep-match
**Command:** `grep -c 'htmlFor="perfume-name"' src/app/create-perfume/components/CheckoutForm.tsx`
**Expected:** `1`
**Fail if:** Returns 0 -- label not linked to input

### Contract for Task 3 -- CheckoutForm special-requests label
**Check type:** grep-match
**Command:** `grep -c 'htmlFor="special-requests"' src/app/create-perfume/components/CheckoutForm.tsx`
**Expected:** `1`
**Fail if:** Returns 0

### Contract for Task 3 -- CheckoutForm radiogroup
**Check type:** grep-match
**Command:** `grep -c 'role="radiogroup"' src/app/create-perfume/components/CheckoutForm.tsx`
**Expected:** `1`
**Fail if:** Returns 0 -- volume selector not using radiogroup semantics

### Contract for Task 3 -- ChatWidget aria-labels
**Check type:** grep-match
**Command:** `grep -c 'aria-label="Ask about fragrances"' src/components/ai/ChatWidget.tsx`
**Expected:** `1`
**Fail if:** Returns 0

### Contract for Task 3 -- ChatWidget role="log"
**Check type:** grep-match
**Command:** `grep -c 'role="log"' src/components/ai/ChatWidget.tsx`
**Expected:** `2` (one for AI chat, one for live chat)
**Fail if:** Less than 2

### Contract for Task 4 -- Squarespace removed from Hero
**Check type:** grep-match
**Command:** `grep -c 'squarespace' src/components/home/Hero.tsx`
**Expected:** `0`
**Fail if:** Non-zero -- external CDN reference still present

### Contract for Task 4 -- Squarespace removed from categories
**Check type:** grep-match
**Command:** `grep -c 'squarespace' src/lib/categories.ts`
**Expected:** `0`
**Fail if:** Non-zero

### Contract for Task 4 -- Squarespace removed from CSP
**Check type:** grep-match
**Command:** `grep -c 'squarespace' next.config.mjs`
**Expected:** `0`
**Fail if:** Non-zero

### Contract for Task 4 -- Supabase Storage URL in Hero (wiring)
**Check type:** grep-match
**Command:** `grep -c 'supabase.co/storage' src/components/home/Hero.tsx`
**Expected:** `1`
**Fail if:** Returns 0 -- URL not updated to Supabase

### Contract for Task 5 -- JsonLd component exists
**Check type:** file-exists
**Command:** `test -f src/components/seo/JsonLd.tsx && echo EXISTS`
**Expected:** `EXISTS`
**Fail if:** File does not exist

### Contract for Task 5 -- safeStringify removed from homepage
**Check type:** grep-match
**Command:** `grep -c 'safeStringify' src/app/page.tsx`
**Expected:** `0`
**Fail if:** Non-zero -- old serialization pattern still present

### Contract for Task 5 -- jsonLdScript removed from listing-schema
**Check type:** grep-match
**Command:** `grep -c 'jsonLdScript' src/lib/seo/listing-schema.ts`
**Expected:** `0`
**Fail if:** Non-zero -- old helper function still exported

### Contract for Task 5 -- No raw dangerouslySetInnerHTML JSON-LD in app pages
**Check type:** command-exit
**Command:** `grep -r 'dangerouslySetInnerHTML.*ld.json\|dangerouslySetInnerHTML.*json.*ld\|ld.json.*dangerouslySetInnerHTML' src/app/page.tsx src/app/products/[slug]/page.tsx src/app/shop/[category]/page.tsx src/app/shop/gender/[gender]/page.tsx src/app/blog/[slug]/page.tsx | wc -l`
**Expected:** `0`
**Fail if:** Non-zero -- some pages still use raw script injection instead of JsonLd component

### Contract for Task 5 -- JsonLd imported in all consuming pages (wiring)
**Check type:** command-exit
**Command:** `grep -l "from '@/components/seo/JsonLd'" src/app/page.tsx src/app/products/[slug]/page.tsx src/app/shop/[category]/page.tsx src/app/shop/gender/[gender]/page.tsx src/app/blog/[slug]/page.tsx | wc -l`
**Expected:** `5`
**Fail if:** Less than 5 -- some page not importing the unified component

### Contract for Task 6 -- OG colors file exists
**Check type:** file-exists
**Command:** `test -f src/lib/og-colors.ts && echo EXISTS`
**Expected:** `EXISTS`
**Fail if:** File does not exist

### Contract for Task 6 -- OG route uses OG_COLORS
**Check type:** grep-match
**Command:** `grep -c 'OG_COLORS' src/app/api/og/route.tsx`
**Expected:** Non-zero (>= 1)
**Fail if:** Returns 0

### Contract for Task 6 -- Product OG route uses OG_COLORS
**Check type:** grep-match
**Command:** `grep -c 'OG_COLORS' src/app/api/og/product/[slug]/route.tsx`
**Expected:** Non-zero (>= 1)
**Fail if:** Returns 0

### Contract for Task 6 -- CSS gradient class in create-perfume
**Check type:** grep-match
**Command:** `grep -c 'text-gold-gradient-hero' src/app/create-perfume/page.tsx`
**Expected:** Non-zero (>= 1)
**Fail if:** Returns 0 -- inline hex gradient not replaced

### Contract for Task 7 -- Responsive audit document exists
**Check type:** file-exists
**Command:** `test -f .planning/phases/29-conventions-a11y-responsive/responsive-audit.md && echo EXISTS`
**Expected:** `EXISTS`
**Fail if:** File does not exist

### Contract for Task 7 -- Audit covers all 10 pages
**Check type:** grep-match
**Command:** `grep -c '###' .planning/phases/29-conventions-a11y-responsive/responsive-audit.md`
**Expected:** Non-zero (>= 10)
**Fail if:** Less than 10 -- some pages not audited

### Contract for all tasks -- Build passes
**Check type:** command-exit
**Command:** `cd /home/qualiasolutions/Projects/aquador && npm run build 2>&1 | tail -5`
**Expected:** Build completes successfully (exit code 0)
**Fail if:** Build fails with any error

### Contract for all tasks -- TypeScript compiles
**Check type:** command-exit
**Command:** `cd /home/qualiasolutions/Projects/aquador && npx tsc --noEmit 2>&1 | grep -c 'error TS'`
**Expected:** `0`
**Fail if:** Any TypeScript compilation errors
