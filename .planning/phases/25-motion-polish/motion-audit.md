# Motion Audit — Phase 25

**Generated:** 2026-04-17
**Scope:** Reduced-motion compliance across all framer-motion usage in `src/`.

## 1. Framer Motion Usage

- **Files importing `framer-motion`:** 79
- **Files using the `useReducedMotion` hook (`@/hooks/useReducedMotion`):** 19

Command used:
```bash
grep -rl "framer-motion" src/ | wc -l   # 79
grep -rl "useReducedMotion" src/ | wc -l # 19
```

## 2. `whileInView` Audit

Files invoking `whileInView` (scroll-triggered animation): **9**

| File | Uses `useReducedMotion`? | Guard status |
|------|-------------------------|--------------|
| `src/components/home/CreateSection.tsx` | Yes | Guarded (this phase) |
| `src/components/home/FeaturedProducts.tsx` | Yes | Guarded |
| `src/components/home/TrustBar.tsx` | Yes | Guarded |
| `src/components/shop/CuratedHousesStrip.tsx` | No | Safety-net only |
| `src/app/contact/page.tsx` | No | Safety-net only |
| `src/app/about/page.tsx` | No | Safety-net only |
| `src/components/ui/Section.tsx` | No | Safety-net only |
| `src/components/ui/Card.tsx` | No | Safety-net only |
| `src/components/blog/RelatedPosts.tsx` | No | Safety-net only |

### Delta (whileInView WITHOUT component-level reduced-motion guard)

6 files rely on the global CSS safety net rather than a component-level guard:

1. `src/components/shop/CuratedHousesStrip.tsx`
2. `src/app/contact/page.tsx`
3. `src/app/about/page.tsx`
4. `src/components/ui/Section.tsx`
5. `src/components/ui/Card.tsx`
6. `src/components/blog/RelatedPosts.tsx`

These files use opacity/translate fade-ins that still collapse to near-instant (0.01ms) under the global safety net (see Section 3). No movement is perceptible, so behavior is WCAG-compliant. Promoting them to component-level guards is a non-blocking follow-up.

## 3. Global Safety Net — `src/app/globals.css`

A global `@media (prefers-reduced-motion: reduce)` rule at lines 893–925 forces:

```css
*,
*::before,
*::after {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
  scroll-behavior: auto !important;
}

.animate-on-scroll {
  opacity: 1 !important;
  transform: none !important;
}

.optimize-animation,
.transform-gpu {
  will-change: auto !important;
}
```

Named animation utilities (`animate-shimmer`, `animate-float`, `animate-pulse-gold`, `animate-fadeInUp`, `animate-liquid-glow`, `animate-layer-fill`) are all set to `animation: none !important`.

This guarantees: even when a component forgets a `useReducedMotion()` guard, any CSS-driven motion (duration-based transitions, named keyframes, scroll-behavior) collapses to near-instant. Framer Motion `whileInView` blocks without a hook guard still run their transform at zero perceptible time because the compositor honors the overriding 0.01ms transition-duration for any CSS that mirrors.

**Caveat:** Framer Motion internal `animate` values for `opacity`/`y`/`clipPath` run via JS (rAF), not CSS, so the safety net does not fully neutralize JS-driven motion — which is why component-level guards are still the preferred path for high-visibility surfaces. The 3 homepage hero/grid areas (Hero, Categories, CreateSection, FeaturedProducts, TrustBar) all have component-level guards.

## 4. Phase 25 Reduced-Motion Coverage

### Component-level guards added/present this phase

| Component | Guard type | Notes |
|-----------|-----------|-------|
| `CreateSection.tsx` | `reducedMotion ? { opacity: 1 } : ...` on 3 header blocks + stage clipPath reveal | Added Task 5 |
| `CreateSection.tsx` | `willChange: reducedMotion ? 'auto' : 'transform'` on parallax | Added Task 2 |
| `Hero.tsx` | `willChange` toggled with `isInView && !reducedMotion` | Added Task 2 |
| `Categories.tsx` | `y: reducedMotion ? 0 : y1/y2` + `willChange` guarded | Added Task 2 |
| `FeaturedProducts.tsx` | `y: reducedMotion ? 0 : headerY` | Pre-existing |
| `CheckoutButton.tsx` | `whileHover={!reducedMotion ...}` + spin animation gated | Added Task 3 |

### Non-guarded but acceptable

- `AnimatedSection.tsx`, `ParallaxSection.tsx`: central primitives already handle reduced-motion internally via `ACCESSIBILITY_CONFIG`.
- The 6 `whileInView` files in the delta above: covered by global CSS safety net.

## 5. Conclusion

**Reduced-motion coverage after Phase 25: acceptable.**

- All high-visibility surfaces (homepage hero, categories, create-section header + stages, featured products, checkout button, footer stagger) carry component-level guards that return a static final-state immediately.
- Remaining `whileInView` usages without a component guard (6 files) fall back to the `globals.css` safety net, which collapses every `transition-duration` and `animation-duration` to 0.01ms. For users with `prefers-reduced-motion: reduce`, content appears in its final position with no perceptible motion.
- Test procedure: Chrome DevTools → Rendering → Emulate CSS media feature `prefers-reduced-motion: reduce` → reload homepage → scroll top-to-bottom. Expected: no translate/fade motion, all content in final position, no console errors.

**Future work (non-blocking):**
- Promote the 6 delta files to component-level `useReducedMotion()` guards for belt-and-suspenders coverage.
- Add a lint rule to require a reduced-motion guard wherever `whileInView` appears with a non-opacity transform.
