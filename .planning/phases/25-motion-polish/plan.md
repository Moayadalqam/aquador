---
phase: 25
goal: "Elevate motion quality site-wide: consistent scroll reveals, polished parallax, luxury loading states, tasteful micro-interactions — all respecting prefers-reduced-motion at 60fps"
tasks: 5
waves: 2
type: standard
---

# Phase 25: Motion & UX Polish

Goal: Homepage and core flows feel hand-crafted — every section reveals with intentional staggering, parallax transforms stay smooth on scroll, buttons show meaningful loading feedback, and users with `prefers-reduced-motion: reduce` get a graceful static experience.

## Context Baseline (audit results)

Existing infrastructure we will reuse (DO NOT reinvent):
- `src/hooks/useReducedMotion.ts` — SSR-safe hook, already used in 15 files
- `src/components/ui/AnimatedSection.tsx` — stagger container with mobile-optimized variants
- `src/components/ui/ParallaxSection.tsx` — handles reduced-motion (33% speed via ACCESSIBILITY_CONFIG) and mobile auto-disable
- `src/components/ui/LuxurySkeleton.tsx` — gold shimmer skeletons (`LuxuryProductGridSkeleton`, `LuxuryHeroSkeleton`, `LuxuryFilterSkeleton`, `LuxurySkeleton`)
- `src/lib/animations/scroll-animations.ts` — `fadeInUp`, `staggerChildren()`, `mobileOptimized`, `EXPO_EASE = [0.16, 1, 0.3, 1]`
- `src/lib/animations/micro-interactions.ts` — `hoverVariants.lift/glow/scale`, `tapVariants.shrink`, `loadingVariants.spin`
- `src/components/providers/PageTransition.tsx` — already wired in `src/app/layout.tsx` (opacity-only fade, reduced-motion variant included)
- `src/app/globals.css` — global `@media (prefers-reduced-motion: reduce)` at lines 893–925 already forces 0.01ms on `*, *::before, *::after`

Specific defects found in audit (these must be fixed):
1. **CreateSection.tsx** lines 70/79/89: `viewport={{ once: false, amount: 0.5 }}` — these 3 blocks re-trigger on every scroll pass, causing jank. Should be `once: true`.
2. **CreateSection.tsx** line 116: `bgY` parallax `y` passed without `gpu-accelerated` class; not a defect but must verify transform3d composition.
3. **Footer.tsx** line 31–36: a single `motion.div` with no stagger on the 4 link columns — columns appear simultaneously instead of cascading.
4. **FeaturedProducts.tsx** line 133: `viewport={{ once: true }}` missing `amount`, triggers too early (0 threshold).
5. **Hero.tsx** — parallax `speed={0.45}` on ambient glow layer combined with speed `0.25` video may compose two `useParallax` hooks → acceptable but we must measure. No change unless measurable jank.
6. No `loading.tsx` for `/create-perfume` `/success` path exists — user sees blank during Stripe return. (Already exists for `/products/[slug]`, `/shop/*`, etc.)
7. `CheckoutButton.tsx` line 86–103: loading uses raw `Loader2` + text swap without `AnimatePresence` — abrupt compared to `AddToCartButton` reference.
8. No shared `Link` hover underline-draw primitive — each component re-invents it with CSS `scale-x-0 group-hover:scale-x-100`.

## Task 1 — Fix scroll-reveal consistency on homepage sections

**Wave:** 1
**Files:**
- `src/components/home/CreateSection.tsx` (modify)
- `src/components/home/FeaturedProducts.tsx` (modify)
- `src/components/layout/Footer.tsx` (modify)

**Action:**

In `src/components/home/CreateSection.tsx`:
- Lines 70, 79, 89: change `viewport={{ once: false, amount: 0.5 }}` → `viewport={{ once: true, amount: 0.4 }}` on the three header motion blocks (eyebrow, h2, subtitle). Keep the other `viewport={{ once: true, amount: 0.15 }}` on stage blocks as-is — they are already correct.
- Verify the three stage `motion.div` blocks (lines 100–110) use `clipPath` reveal — these are GPU-safe (compositor-only) and should stay.

In `src/components/home/FeaturedProducts.tsx`:
- Line 133: `viewport={{ once: true }}` → `viewport={{ once: true, amount: 0.3 }}` to prevent early trigger before the "View All" row is actually in view.
- Verify the `headerY` parallax transform (line 40, `useTransform(scrollYProgress, [0, 1], ['20px', '-20px'])`) correctly disables on reduced-motion (it does via `y: reducedMotion ? 0 : headerY` on line 47 — no change needed).

In `src/components/layout/Footer.tsx`:
- Replace the single `motion.div` wrapper (lines 31–37) with `AnimatedSection variant="stagger" staggerDelay={0.08} threshold={0.2}` from `@/components/ui/AnimatedSection`. Wrap the 4 column divs (logo col, shop col, company col, contact col) each in their own `motion.div` with `variants={fadeInUp}` imported from `@/lib/animations/scroll-animations`. This gives a cascading column reveal.
- Import: add `import { motion } from 'framer-motion';` (already there) and `import { AnimatedSection } from '@/components/ui/AnimatedSection';` and `import { fadeInUp } from '@/lib/animations/scroll-animations';`.

**Context:** Read `@src/components/ui/AnimatedSection.tsx`, `@src/lib/animations/scroll-animations.ts`, `@src/components/home/TrustBar.tsx` (reference — follow its stagger + reduced-motion pattern exactly), `@src/components/home/CreateSection.tsx`, `@src/components/home/FeaturedProducts.tsx`, `@src/components/layout/Footer.tsx`.

**Done when:**
- `grep -n "once: false" src/components/home/CreateSection.tsx` returns 0 matches.
- `grep -n "viewport={{ once: true }}" src/components/home/FeaturedProducts.tsx` returns 0 matches (all `once: true` are paired with an `amount`).
- `src/components/layout/Footer.tsx` imports `AnimatedSection` and the 4 footer columns each render inside a `motion.div` with `variants={fadeInUp}`.
- `npx tsc --noEmit` passes.
- Visual: on desktop, scroll to footer — the 4 columns cascade in 60–80ms apart; scroll to CreateSection — the header no longer "blinks" when scrolling up past it.

## Task 2 — Polish parallax performance and hero motion

**Wave:** 1
**Files:**
- `src/components/home/Hero.tsx` (modify)
- `src/components/home/Categories.tsx` (modify — add `will-change` hints)
- `src/components/home/CreateSection.tsx` (modify — add `gpu-accelerated` class on parallax inner divs)

**Action:**

In `src/components/home/Hero.tsx`:
- No structural change. Add `transform: 'translate3d(0,0,0)'` hint to the ambient glow `motion.div` (line 60–75) by adding `willChange: 'transform, opacity'` to its `style` prop when `isInView` is true. This ensures the compositor promotes it to its own layer only during the breathing animation.
- Verify the outer `motion.section` doesn't double-wrap `ParallaxSection` — no change; structure is correct.

In `src/components/home/Categories.tsx`:
- Line 62 and 115: the `motion.div` with `style={{ y: reducedMotion ? 0 : y1 }}` needs `willChange: 'transform'` added when `!reducedMotion`. Modify both motion.div `style` props to:
  ```tsx
  style={{ y: reducedMotion ? 0 : y1, willChange: reducedMotion ? 'auto' : 'transform' }}
  ```
- Same for the `y2` parallax (line 115).

In `src/components/home/CreateSection.tsx`:
- Line 115: the inner parallax `motion.div` `style={{ y: reducedMotion ? 0 : bgY, scale: 1.15 }}` needs `willChange` hint:
  ```tsx
  style={{ y: reducedMotion ? 0 : bgY, scale: 1.15, willChange: reducedMotion ? 'auto' : 'transform' }}
  ```

**Context:** Read `@src/components/home/Hero.tsx`, `@src/components/home/Categories.tsx`, `@src/components/home/CreateSection.tsx`, `@src/components/ui/ParallaxSection.tsx`, `@src/app/globals.css` lines 404–420 (gpu utilities reference).

**Done when:**
- `grep -c "willChange" src/components/home/Categories.tsx` returns ≥ 2.
- `grep -c "willChange" src/components/home/CreateSection.tsx` returns ≥ 1.
- `grep -c "willChange" src/components/home/Hero.tsx` returns ≥ 1.
- `npx tsc --noEmit` passes.
- Manual (Chrome DevTools → Performance → record 5 seconds scrolling homepage): main thread stays <16ms per frame, no red "long task" bars during scroll. `transform` updates stay on compositor thread.

## Task 3 — Unify button loading states with AnimatePresence

**Wave:** 1
**Files:**
- `src/components/cart/CheckoutButton.tsx` (modify)

**Action:**

Refactor `src/components/cart/CheckoutButton.tsx` lines 86–103 (the `motion.button` children) to match the `AddToCartButton.tsx` pattern (see that file lines 135–182 for reference — idle/loading/success with `AnimatePresence mode="wait"`).

Specifically:
1. Import `AnimatePresence` from `framer-motion` (already imports `motion`).
2. Import `useReducedMotion` from `@/hooks/useReducedMotion` and call it at top of component.
3. Replace the ternary `isLoading ? ... : ...` with `<AnimatePresence mode="wait">` wrapping two `motion.span` keyed variants (`"loading"` and `"idle"`).
4. Loading state: `motion.span key="loading"` with `initial={{ opacity: 0 }}`, `animate={{ opacity: 1 }}`, `exit={{ opacity: 0 }}`. Inside: `motion.div` with `animate={!reducedMotion ? loadingVariants.spin : undefined}` (import from `@/lib/animations/micro-interactions`) wrapping a 5x5 border-t-black rounded-full div — mirror AddToCartButton.tsx line 144–147. Keep the "Processing..." text.
5. Idle state: `motion.span key="idle"` with same enter/exit opacity; just the "Proceed to Checkout" text.
6. Keep `disabled`, `whileHover`, `whileTap` logic intact; add `reducedMotion` guard: `whileHover={!reducedMotion && !isLoading ? { scale: 1.02 } : undefined}`.

**Context:** Read `@src/components/cart/CheckoutButton.tsx`, `@src/components/products/AddToCartButton.tsx` (exact pattern reference — replicate its AnimatePresence structure), `@src/lib/animations/micro-interactions.ts`, `@src/hooks/useReducedMotion.ts`.

**Done when:**
- `grep -c "AnimatePresence" src/components/cart/CheckoutButton.tsx` returns ≥ 1.
- `grep -c "useReducedMotion" src/components/cart/CheckoutButton.tsx` returns ≥ 1.
- `grep -c "loadingVariants" src/components/cart/CheckoutButton.tsx` returns ≥ 1.
- `npx tsc --noEmit` passes.
- Behavioral: click checkout with cart items → spinner fades in smoothly (not pop), button stays in loading state until redirect; with DevTools "Reduce motion: reduce" → spinner does not rotate but state still visible.

## Task 4 — Add luxury loading state for custom perfume success + link underline primitive

**Wave:** 1
**Files:**
- `src/app/create-perfume/success/loading.tsx` (create)
- `src/components/ui/AnimatedLink.tsx` (create)

**Action:**

**Create** `src/app/create-perfume/success/loading.tsx`:
```tsx
import { LuxurySkeleton } from '@/components/ui/LuxurySkeleton';

export default function CreatePerfumeSuccessLoading() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] pt-24 pb-16">
      <div className="container-wide">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          {/* Success icon placeholder */}
          <LuxurySkeleton className="w-20 h-20 rounded-full mx-auto" />
          {/* Title */}
          <LuxurySkeleton className="h-10 w-80 max-w-full mx-auto" />
          {/* Subtitle */}
          <LuxurySkeleton className="h-6 w-96 max-w-full mx-auto" />
          {/* Order detail block */}
          <div className="pt-6 space-y-3">
            <LuxurySkeleton className="h-4 w-full" />
            <LuxurySkeleton className="h-4 w-5/6" />
            <LuxurySkeleton className="h-4 w-4/6" />
          </div>
          {/* CTA placeholder */}
          <LuxurySkeleton className="h-12 w-48 mx-auto rounded-full" />
        </div>
      </div>
    </main>
  );
}
```

**Create** `src/components/ui/AnimatedLink.tsx` — a reusable link with gold underline-draw hover animation (to replace ad-hoc `scale-x-0 group-hover:scale-x-100` patterns scattered through the codebase):
```tsx
'use client';

import Link, { type LinkProps } from 'next/link';
import { forwardRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedLinkProps extends LinkProps {
  children: ReactNode;
  className?: string;
  underlineColor?: 'gold' | 'white' | 'current';
}

/**
 * AnimatedLink — text link with gold underline-draw on hover.
 * Underline grows from left to right on hover/focus; retracts right-to-left on leave.
 * Respects prefers-reduced-motion via the global CSS rule in globals.css (transition-duration: 0.01ms).
 */
export const AnimatedLink = forwardRef<HTMLAnchorElement, AnimatedLinkProps>(
  ({ children, className, underlineColor = 'gold', ...linkProps }, ref) => {
    const colorClass = {
      gold: 'bg-gold',
      white: 'bg-white',
      current: 'bg-current',
    }[underlineColor];

    return (
      <Link
        ref={ref}
        {...linkProps}
        className={cn(
          'group relative inline-flex items-center transition-colors duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2',
          className
        )}
      >
        <span className="relative">
          {children}
          <span
            className={cn(
              'absolute -bottom-0.5 left-0 right-0 h-px origin-left',
              'scale-x-0 group-hover:scale-x-100 group-focus-visible:scale-x-100',
              'transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
              colorClass
            )}
            aria-hidden="true"
          />
        </span>
      </Link>
    );
  }
);

AnimatedLink.displayName = 'AnimatedLink';
```

**Context:** Read `@src/components/ui/LuxurySkeleton.tsx` (pattern reference), `@src/app/shop/loading.tsx` (pattern reference), `@src/app/products/[slug]/loading.tsx` (pattern reference), `@src/app/create-perfume/success/page.tsx` if exists (to match dimensions). Read `@src/lib/utils.ts` for `cn` helper.

**Done when:**
- `test -f src/app/create-perfume/success/loading.tsx && echo OK` → OK
- `test -f src/components/ui/AnimatedLink.tsx && echo OK` → OK
- `grep -c "LuxurySkeleton" src/app/create-perfume/success/loading.tsx` returns ≥ 3.
- `grep -c "scale-x-0 group-hover:scale-x-100" src/components/ui/AnimatedLink.tsx` returns ≥ 1.
- `npx tsc --noEmit` passes.
- Visually: navigate to `/create-perfume/success?payment_intent=test` — see gold-shimmer skeletons before content loads (no blank screen).

## Task 5 — Verify reduced-motion compliance site-wide + audit report

**Wave:** 2 (after Tasks 1, 2, 3, 4)
**Files:**
- `src/components/home/CreateSection.tsx` (modify — add reduced-motion guard on content reveal motion blocks)
- `.planning/phases/25-motion-polish/motion-audit.md` (create — audit output file)

**Action:**

Step A — fix remaining reduced-motion gaps in `CreateSection.tsx`:
- Lines 66–73 (eyebrow `motion.p`), lines 75–82 (h2 `motion.h2`), lines 85–93 (subtitle `motion.p`): these use raw `initial`/`whileInView` without a `reducedMotion` guard. Refactor to use the file's existing `useReducedMotion()` (already imported line 9, used for `bgY` only).

For each of those 3 motion blocks, replace:
```tsx
initial={{ opacity: 0, y: 20 }}
whileInView={{ opacity: 1, y: 0 }}
```
With:
```tsx
initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
whileInView={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
```
(Apply the same pattern to all three — eyebrow, h2, subtitle.)

Also the stage `motion.div` blocks (lines 100–180) use `clipPath` reveal without guard — add `reducedMotion` check that returns `{ opacity: 1 }` as both initial and whileInView when `reducedMotion` is true.

Step B — create audit report at `.planning/phases/25-motion-polish/motion-audit.md` documenting:
- All 53 files using framer-motion (`grep -rl "framer-motion" src/ | wc -l` result)
- Count of `useReducedMotion` usages after this phase (`grep -rl "useReducedMotion" src/ | wc -l`)
- List of files still using raw `whileInView` without a reduced-motion guard (run `grep -l "whileInView" src/` and manually cross-check against `useReducedMotion` usage; list the delta)
- Confirmation that `src/app/globals.css` line 893 global reduced-motion rule is the safety net covering anything missed.

**Context:** Read `@src/components/home/CreateSection.tsx`, `@src/hooks/useReducedMotion.ts`, `@src/app/globals.css` (lines 893–925 to confirm the global safety net).

**Done when:**
- `grep -c "reducedMotion ? { opacity: 1 }" src/components/home/CreateSection.tsx` returns ≥ 3.
- `.planning/phases/25-motion-polish/motion-audit.md` exists and lists every file using `whileInView`.
- Running in Chrome with `chrome://flags/#prefers-reduced-motion` (or DevTools Rendering → Emulate CSS media feature `prefers-reduced-motion: reduce`): homepage loads with no translation/fade animation; all text appears in final position immediately; no console errors.
- `npx tsc --noEmit` passes and `npm run lint` passes.

## Success Criteria
- [ ] Homepage scroll on desktop and mobile: every section (Hero → TrustBar → Categories → CreateSection → FeaturedProducts × 2 → Footer) reveals with a consistent fade-up pattern; staggers are 60–100ms between children.
- [ ] Hero ambient glow and Categories/CreateSection image parallax stay at 60fps on mid-tier mobile (target: Moto G4 CPU throttle in DevTools).
- [ ] Checkout button shows luxury spinner state (no pop-in) during Stripe redirect.
- [ ] `/create-perfume/success` shows gold shimmer skeleton during load — never a blank screen.
- [ ] Users with `prefers-reduced-motion: reduce` see static layout; no scroll-triggered movement; no console warnings; global CSS safety net (globals.css line 893) plus component-level guards keep the site functional.
- [ ] New `AnimatedLink` primitive exists and is available for future use (not required to refactor existing usages in this phase).
- [ ] No TypeScript errors (`npx tsc --noEmit`), no lint errors (`npm run lint`), no new dependencies in `package.json`.

## Verification Contract

### Contract for Task 1 — scroll-reveal consistency
**Check type:** grep-match
**Command:** `grep -c "once: false" /home/qualiasolutions/Projects/aquador/src/components/home/CreateSection.tsx`
**Expected:** `0`
**Fail if:** Any `once: false` remains — CreateSection headers will re-trigger on scroll-up.

### Contract for Task 1 — Footer stagger wiring
**Check type:** grep-match
**Command:** `grep -c "AnimatedSection" /home/qualiasolutions/Projects/aquador/src/components/layout/Footer.tsx`
**Expected:** Non-zero (≥ 1)
**Fail if:** Returns 0 — Footer is still a single fade block, columns not cascading.

### Contract for Task 1 — FeaturedProducts view-all threshold
**Check type:** grep-match
**Command:** `grep -E "viewport=\{\{ once: true \}\}" /home/qualiasolutions/Projects/aquador/src/components/home/FeaturedProducts.tsx | wc -l`
**Expected:** `0`
**Fail if:** Any `viewport={{ once: true }}` without `amount` remains.

### Contract for Task 2 — willChange hints on parallax elements
**Check type:** grep-match
**Command:** `grep -c "willChange" /home/qualiasolutions/Projects/aquador/src/components/home/Categories.tsx /home/qualiasolutions/Projects/aquador/src/components/home/CreateSection.tsx /home/qualiasolutions/Projects/aquador/src/components/home/Hero.tsx`
**Expected:** Each file returns ≥ 1
**Fail if:** Any of the three files returns 0 — parallax layers aren't hinted to the GPU.

### Contract for Task 3 — CheckoutButton AnimatePresence + reduced motion
**Check type:** grep-match
**Command:** `grep -cE "AnimatePresence|useReducedMotion|loadingVariants" /home/qualiasolutions/Projects/aquador/src/components/cart/CheckoutButton.tsx`
**Expected:** ≥ 3 (one match for each pattern)
**Fail if:** Returns <3 — refactor incomplete.

### Contract for Task 4 — loading.tsx created
**Check type:** file-exists
**Command:** `test -f /home/qualiasolutions/Projects/aquador/src/app/create-perfume/success/loading.tsx && echo EXISTS`
**Expected:** `EXISTS`
**Fail if:** Missing — success page will show blank on navigation.

### Contract for Task 4 — AnimatedLink primitive created
**Check type:** file-exists
**Command:** `test -f /home/qualiasolutions/Projects/aquador/src/components/ui/AnimatedLink.tsx && echo EXISTS`
**Expected:** `EXISTS`
**Fail if:** Missing — primitive not available for future use.

### Contract for Task 4 — AnimatedLink underline animation wired
**Check type:** grep-match
**Command:** `grep -c "group-hover:scale-x-100" /home/qualiasolutions/Projects/aquador/src/components/ui/AnimatedLink.tsx`
**Expected:** Non-zero (≥ 1)
**Fail if:** Returns 0 — underline-draw animation not implemented.

### Contract for Task 5 — CreateSection reduced-motion guards
**Check type:** grep-match
**Command:** `grep -c "reducedMotion ? { opacity: 1 }" /home/qualiasolutions/Projects/aquador/src/components/home/CreateSection.tsx`
**Expected:** ≥ 3
**Fail if:** Returns <3 — header motion blocks still ignore reduced-motion preference.

### Contract for Task 5 — motion audit written
**Check type:** file-exists
**Command:** `test -f /home/qualiasolutions/Projects/aquador/.planning/phases/25-motion-polish/motion-audit.md && echo EXISTS`
**Expected:** `EXISTS`
**Fail if:** Missing — no record of reduced-motion coverage.

### Contract for full phase — TypeScript clean
**Check type:** command-exit
**Command:** `cd /home/qualiasolutions/Projects/aquador && npx tsc --noEmit 2>&1 | grep -c "error TS"`
**Expected:** `0`
**Fail if:** Any TypeScript compile error.

### Contract for full phase — lint clean
**Check type:** command-exit
**Command:** `cd /home/qualiasolutions/Projects/aquador && npm run lint 2>&1 | grep -Ec "error|Error:"`
**Expected:** `0` new errors introduced (baseline = pre-phase count)
**Fail if:** New lint errors introduced.

### Contract for full phase — no new dependencies
**Check type:** command-exit
**Command:** `cd /home/qualiasolutions/Projects/aquador && git diff package.json | grep -c "^+.*\".*\":"`
**Expected:** `0`
**Fail if:** Any line added to `dependencies` or `devDependencies` in `package.json`.

### Contract for full phase — reduced-motion behavioral
**Check type:** behavioral
**Command:** (manual) Chrome DevTools → Rendering → Emulate CSS media feature `prefers-reduced-motion: reduce` → reload homepage → scroll top to bottom.
**Expected:** All content visible in final position immediately on scroll-into-view; no translate/fade motion; no console errors; parallax layers stay static (0 transform).
**Fail if:** Any element animates on scroll; ambient glow still breathes; parallax layers still translate.

### Contract for full phase — 60fps scroll behavioral
**Check type:** behavioral
**Command:** (manual) Chrome DevTools → Performance → record 5s scrolling the homepage top-to-bottom at 4x CPU throttle.
**Expected:** No red "long task" bars; frame time <16ms; parallax transforms composite on the GPU (look for compositor layer for parallax divs).
**Fail if:** Long tasks >50ms appear during scroll; main-thread churn visible.
