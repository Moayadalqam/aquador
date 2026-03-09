# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-09)

**Core value:** A customer completes a purchase and knows it worked — they see their order details on screen, receive a confirmation email, and the store is notified. No silent failures, no misleading messages, no security holes.

**Current focus:** v2.0 Immersive Luxury Experience - Phase 16 in progress (Plans 01 and 03 complete)

## Current Position

Phase: 16 of 17 (Analytics & Engagement Tracking) — In progress
Plan: 3 of 3 complete (plan 02 status unknown — check for SUMMARY.md)
Status: In progress
Last activity: 2026-03-09 — Completed 16-03 (Performance Monitoring & Cinematic Tracking)

Progress: [████████████████░░░░] 85% (40/47 total plans complete)

## Milestones

- ✅ **v1.0** Order/Payment System Fix — shipped 2026-03-02
- ✅ **v1.1** Security Audit Remediation — shipped 2026-03-03
- ✅ **v1.2** Design Overhaul & Premium UX — shipped 2026-03-04
- 🚧 **v2.0** Immersive Luxury Experience — in progress (Phases 13-17)

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
- **Phase 16-03:** getDeviceType inlined in performance-monitor.ts (16-01 engagement-tracker not yet present when plan ran)
- **Phase 16-03:** animation_budget_exceeded uses existing POOR threshold (45fps) to keep thresholds DRY
- **Phase 16-03:** createTrackedCinematicVariant returns plain props object (not HOC) for composability
- **Phase 16-03:** transitionStartRef over useState for timing — no re-render needed

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

## Session Continuity

Last session: 2026-03-09
Completed: Phase 16-03 — Performance Monitoring & Cinematic Tracking
Commits: 5f67064 (task 1), 864691a (task 2), 017624b (task 3)
Phase 16 Status: Plans 01 and 03 done; Plan 02 status unknown
Resume: .planning/phases/16-analytics-engagement-tracking/16-02-PLAN.md (if not done)

---
*Last updated: 2026-03-09 after Phase 16-03 completion*
