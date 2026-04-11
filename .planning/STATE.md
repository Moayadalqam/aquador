# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-11)

**Core value:** A customer completes a purchase and knows it worked — they see their order details on screen, receive a confirmation email, and the store is notified. No silent failures, no misleading messages, no security holes.

**Current focus:** v3.0 Client Feedback Round — Brand corrections, navigation restructure, content fixes, search repair, design polish

## Current Position

Phase: 22 of 22 (Design Polish & Trust) — Built
Plan: All phases complete
Status: v3.0 all 5 phases built — merging to main and deploying
Last activity: 2026-04-11 - All phases built (18-22)

Progress: [████████████████████] 100% (5/5 phases built)

## Milestones

- ✅ **v1.0** Order/Payment System Fix — shipped 2026-03-02
- ✅ **v1.1** Security Audit Remediation — shipped 2026-03-03
- ✅ **v1.2** Design Overhaul & Premium UX — shipped 2026-03-04
- ✅ **v2.0** Immersive Luxury Experience — COMPLETE (Phases 13-17, 2026-03-09)
- 🔄 **v3.0** Client Feedback Round — started 2026-04-11

## v3.0 Phases

| Phase | Name | Status |
|-------|------|--------|
| 18 | Brand Identity & Header | ✅ Built |
| 19 | Navigation & Menu Structure | ✅ Built |
| 20 | Homepage Content Sections | ✅ Built |
| 21 | Search & Product Data | ✅ Built |
| 22 | Design Polish & Trust | ✅ Built |

### Phase 18 — Brand Identity & Header
- Replace logo with icon-only version (gold, high contrast) on mobile + desktop
- Fix year: "Since May 2018" (was incorrectly "Since 2024")
- Replace tagline: "Scent of Luxury" (was "Where Luxury Meets Distinction")
- Replace cart icon with shopping bag or 50ml bottle silhouette
- Fix decorative element: single centered dot (was two dots)

### Phase 19 — Navigation & Menu Structure
- Remove "Blog" from navigation entirely
- Add main categories: Men, Women, Unisex
- Move "Lattafa Originals" to own top-level category (not under Dubai Shop)
- Dubai Shop → brand-based subcategories (Al Haramain, Xerjoff, etc.)

### Phase 20 — Homepage Content Sections
- Rewrite fragrance education: explain evaporation timeline + role in fragrance evolution
- Remove numbering (01, 02, 03), fix order: Top → Middle (Heart) → Base
- Increase subtitle contrast and readability
- Featured collections: split into "Featured Aquad'or Perfumes" + "Best-Selling Lattafa Originals"
- Remove "Our Boutique" section entirely
- Replace "IG | FB" text with proper Instagram/Facebook icons
- Custom chat widget icon: 50ml Aquad'or bottle with question mark

### Phase 21 — Search & Product Data
- Fix non-functional main search bar
- Fix filtering system
- Restore missing fragrance notes on Aquad'or products
- Fix incorrect compositions (e.g., Althair description)
- Fix spelling: "Althar" → "Althair"

### Phase 22 — Design Polish & Trust
- Typography hierarchy consistency across sections
- Gold color contrast improvements (too low in multiple areas)
- CTA buttons: urgency and conversion focus
- Mobile spacing consistency between sections
- Product image style/lighting consistency
- Add trust elements: reviews, ratings, testimonials
- Clear value proposition above the fold
- Footer: brand-driven, not generic
- Visual emphasis on Aquad'or as primary brand
- Reduce dark overlay overuse (improves product visibility)

## Accumulated Context

### Decisions

All v1.0 + v1.1 + v1.2 decisions logged in PROJECT.md Key Decisions table.

**Recent decisions affecting v2.0:**
- v1.2: CSS-only backgrounds replaced Three.js (600KB savings) — informs 3D approach
- v1.2: Framer Motion in 53 files — needs optimization for parallax/3D features
- v1.2: Disable parallax on mobile Safari — pattern for v2.0 performance
- **Phase 13-01:** Framer Motion useScroll/useTransform for parallax (zero bundle increase)
- **Phase 13-01:** Speed-based parallax API (0.3=slow, 0.5=medium, 0.8=fast) over distance-based
- **Phase 13-01:** Parallax disabled by default on mobile (<768px) for Safari performance
- **Phase 14-01:** React Three Fiber v8 for React 18 compatibility (v9 requires React 19)
- **Phase 14-01:** Procedural geometry fallback over GLB model (unblock development, defer sourcing)
- **Phase 14-01:** Environment preset="city" for studio-like HDRI lighting
- **Phase 14-01:** AccumulativeShadows temporal rendering (100 frames) for performance
- **Phase 14-01:** Simplified lighting mode built proactively for Plan 04 mobile optimization
- **Phase 15-01:** Spring animations (stiffness 400, damping 25) for filter pills - snappy luxury feel
- **Phase 15-01:** AnimatePresence mode="popLayout" for smooth product grid transitions
- **Phase 15-01:** 30ms stagger delay for product reveals (elegant sequential animation)
- **Phase 15-02:** Image zoom timing 700ms for luxury feel (slower = more intentional)
- **Phase 15-02:** Mobile tap-to-reveal pattern (first tap = quick view, second tap = navigate)
- **Phase 15-03:** Swipe threshold 50px + 300ms velocity (prevents scroll conflicts)
- **Phase 15-03:** Gold shimmer skeleton screens over gray pulse (maintains luxury brand identity)
- **Phase 14-03:** Heart note color drives liquid visualization (top/base reserved for future gradient)
- **Phase 14-03:** Toggle between 2D SVG and 3D preview (user choice for performance)
- **Phase 14-03:** Auto-rotation at 0.3 rad/s for smooth showcase effect
- **Phase 14-04:** PerformanceMonitor for adaptive DPR (auto-scales 1.0-2.0 based on frame rate)
- **Phase 14-04:** useDeviceCapabilities hook for mobile/memory detection
- **Phase 14-04:** Simplified lighting (no shadows) on mobile via device detection
- **Phase 16-01:** try/catch wraps all track() calls — analytics never blocks UI or 3D
- **Phase 16-01:** rotateStartTimeRef at component top level (not inside useEffect)
- **Phase 16-01:** Parallax engagement threshold >1000ms to filter accidental visibility
- **Phase 16-01:** Scroll depth dedup via sessionStorage keyed by pathname
- **Phase 16-01:** try/catch wraps all track() calls — analytics never blocks UI or 3D
- **Phase 16-01:** rotateStartTimeRef at component top level (not inside useEffect)
- **Phase 16-01:** Parallax engagement threshold >1000ms to filter accidental visibility
- **Phase 16-01:** Scroll depth dedup via sessionStorage keyed by pathname
- **Phase 16-02:** getDeviceType co-located in product-engagement.ts (engagement-tracker.ts parallel plan not yet compiled)
- **Phase 16-02:** Zero-render 'use client' wrapper (ProductViewTracker renders null) keeps product page as Server Component
- **Phase 16-02:** isInitializedRef (useRef not useState) blocks SSR hydration from firing filter analytics events
- **Phase 16-02:** trackCategoryTransition in CategoryContent only — ShopContent category filter = filter_change event
- **Phase 16-03:** animation_budget_exceeded uses existing POOR threshold (45fps) to keep thresholds DRY
- **Phase 16-03:** createTrackedCinematicVariant returns plain props object (not HOC) for composability
- **Phase 16-03:** transitionStartRef over useState for timing — no re-render needed
- **Phase 17-01:** 33% speed reduction for reduced-motion parallax (WCAG 2.3.3) — not full disable, retains visual depth
- **Phase 17-01:** useKeyboardControls fires callbacks, Scene.tsx owns OrbitControls mutation — decoupled hook design
- **Phase 17-01:** localStorage for hints dismissal — dismissed once, gone forever across sessions
    - **Phase 17-02:** aria-live=polite (not assertive) for 3D state — avoids interrupting ongoing screen reader speech
    - **Phase 17-02:** Decorative parallax gets role=presentation + aria-hidden; ariaLabel prop unlocks meaningful variant
    - **Phase 17-02:** isHighContrastMode adds outline:2px solid currentColor — uses currentColor so it inherits theme
- **Phase 17-03:** Loading state machine pattern: stages defined in states.ts, consumed via ProgressiveLoader
- **Phase 17-03:** supports3D false only on mobile AND (low-end OR data-saving) — desktop always gets 3D
- **Phase 17-03:** link[rel="prefetch"] over Next.js router.prefetch for hover preload — no client router dependency
- **Phase 17-03:** 300ms hover debounce for prefetch, cancel via ref on mouseLeave
- **Phase 17-03:** ProgressiveLoader does NOT re-export LoadingStage — consumers import from states.ts directly

### Pending Checkpoints

- ✅ ~~Supabase migrations~~ — DEPLOYED
- ✅ ~~AI catalogue generation~~ — Working on Vercel

### Open Blockers

**v2.0 Technical Considerations:**
- ✅ ~~3D library decision~~ - React Three Fiber v8 chosen (Phase 14-01)
- ⚠️ Bundle size monitoring needed - Three.js r168 added after v1.2 removed it for 600KB savings
- ⚠️ Procedural bottle geometry temporary - need to source/optimize production GLB model
- Framer Motion bundle optimization required for heavy animation workload
- Mobile performance critical for parallax/3D features

### Quick Tasks Completed

| # | Description | Date | Commit |
|---|-------------|------|--------|
| 2 | Project monitoring dashboard with 3D blocks | 2026-03-05 | 64a0b55 |
| 3 | White luxury theme with gold accents and black borders | 2026-03-09 | 0551265 |
| 4 | Review quick wins — font trim, cache TTL, CTASection, generateStaticParams, a11y | 2026-03-10 | 7f43e94 |
| 5 | Scroll animations, parallax polish, loading states | 2026-03-10 | 3a27377 |
| 6 | Dubai Shop rebrand + product variant selector | 2026-03-10 | fff0d69 |
| 7 | Modern high-end responsive design redesign | 2026-03-11 | a065e9d |

## Session Continuity

Last session: 2026-04-11
Started: v3.0 Client Feedback Round — 5 phases (18-22)
Source: Client issue list from Moayad Alqam (10 categories, ~40+ items)
Next: /qualia-plan 18

---
*Last updated: 2026-04-11 — v3.0 milestone created from client feedback*
