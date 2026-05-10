# Journey: Aquad'or

The full project arc — every milestone from kickoff to handoff. North Star for downstream planning.

**Project:** Aquad'or e-commerce platform
**Client:** Moayad Alqam (Cyprus, Limassol)
**Stack:** Next.js 14 App Router, React 18, TypeScript, Supabase, Stripe, Resend, Sentry, Vercel
**Production:** https://www.aquadorcy.com
**Started:** 2026-03-02
**Current milestone:** M10 — Premium Polish & Signature Experience

---

## Milestone Map

| # | Milestone | Phases | Status | Shipped |
|---|---|---|---|---|
| M1 | Order/Payment System Fix | 1-4 | Shipped | 2026-03-02 |
| M2 | Security Audit Remediation | 8-9 | Shipped | 2026-03-03 |
| M3 | Design Overhaul & Premium UX | 10-12 | Shipped | 2026-03-04 |
| M4 | Immersive Luxury Experience | 13-17 | Shipped | 2026-03-09 |
| M5 | Client Feedback Round | 18-22 | Shipped | 2026-04-11 |
| M6 | Quality & SEO Polish | 23-26 | Shipped | 2026-04-17 |
| M7 | Optimize All | 27-29 | Shipped | 2026-04-17 |
| M8 | Optimize Pass 2 | 30 | Shipped | 2026-04-17 |
| M9 | Cinematic Scroll + v3.9 Optimization Fixes | 31-32 | Shipped | 2026-05-08 |
| **M10** | **Premium Polish & Signature Experience** | **33-35** | **Current** | — |
| M11 | Handoff | 36-39 | Planned | — |

---

## M1 · Order/Payment System Fix
**Shipped 2026-03-02. Phases 1-4.**

**Why:** Payment pipeline had silent failures — customers couldn't see order details, emails sometimes duplicated, admin search was vulnerable.

**Exit criteria (met):**
- Customer completes a purchase, sees order details on screen, receives confirmation email
- No duplicate emails on webhook retries
- Server-side cart validation against catalog (no client-side trust)

---

## M2 · Security Audit Remediation
**Shipped 2026-03-03. Phases 8-9.**

**Why:** Pre-production security audit flagged RLS gaps, SQL injection in admin search, GDPR exposure via Sentry, CSP weaknesses.

**Exit criteria (met):**
- RLS enabled on all 9 Supabase tables (24 policies)
- All CRITICAL + HIGH security findings closed
- 74 API tests across 6 routes (Stripe webhook 21 tests)
- ~600KB bundle reduction (Three.js removed)

---

## M3 · Design Overhaul & Premium UX
**Shipped 2026-03-04. Phases 10-12.**

**Why:** v1.x shipped a working store; v1.2 elevated it to luxury-grade typography, color palette, spacing, and product photography UX.

**Exit criteria (met):**
- Premium typography hierarchy site-wide (Playfair + Poppins)
- Sophisticated gold/dark palette
- Product gallery with zoom + multi-angle
- Scroll-triggered animations with reduced-motion support

---

## M4 · Immersive Luxury Experience
**Shipped 2026-03-09. Phases 13-17.**

**Why:** Differentiate Aquad'or with cinematic motion, 3D product visualization, immersive navigation.

**Exit criteria (met):**
- Parallax scrolling + cinematic transitions, 60fps target
- 3D product showcase (R3F bottles + lighting)
- Immersive navigation with animated filters
- Engagement analytics (scroll depth, 3D interactions)
- Full a11y pass (motion preferences, keyboard, ARIA)

---

## M5 · Client Feedback Round
**Shipped 2026-04-11. Phases 18-22.**

**Why:** Client (Moayad Alqam) submitted ~40 issues across 10 categories — branding, navigation, content, search, product data, design polish.

**Exit criteria (met):**
- Brand identity corrections (logo, tagline, year, cart icon)
- Navigation restructure (Men/Women/Unisex categories, Dubai Shop dropdown)
- Homepage content overhaul (fragrance education, featured collections)
- Search functionality repaired
- Product data restored (notes, compositions, spelling)
- Typography/contrast/CTA polish, TrustBar, footer

---

## M6 · Quality & SEO Polish
**Shipped 2026-04-17. Phases 23-26.**

**Why:** Pre-launch quality + organic discoverability. Blog ISR, image responsive sizes, focus rings, accessible landmarks. Dubai Shop rebrand. Motion polish. SEO hardening with merchant schema, dynamic OG, hreflang.

**Exit criteria (met):**
- Blog SSG, focus rings everywhere, a11y landmarks present
- Dubai Shop rebrand + €199 variant price fix
- Merchant schema + dynamic OG + hreflang
- Motion polish (scroll reveals, willChange hints, loading states)

---

## M7 · Optimize All
**Shipped 2026-04-17. Phases 27-29.**

**Why:** Optimization pass — security/reliability gaps, bundle/performance, conventions/a11y/responsive parity at 27/27 routes.

**Exit criteria (met):**
- is_active visibility block, draft leak fix, RLS extension, upsert RPC, Sentry unify
- Suspense streaming, /shop static rendering, dead code removal, 3D gate
- loading.tsx/error.tsx routes, JsonLd, CDN migration
- Responsive parity 27/27

---

## M8 · Optimize Pass 2
**Shipped 2026-04-17. Phase 30.**

**Why:** Second optimization sweep — 33 findings closed, 3 Supabase migrations applied.

**Exit criteria (met):**
- 33/33 findings closed
- 3 migrations applied to production

---

## M9 · Cinematic Scroll + v3.9 Optimization Fixes
**Shipped 2026-05-08. Phases 31-32.**

**Why:** Cinematic scroll layer (WelcomeSplash, ScrollProgress, Hero3DScroll) + v3.9 optimization remediation closing 7 critical + 14 high findings from OPTIMIZE.md v3.9. Live chat security hardening, framer-motion → motion/react migration, admin perf, homepage LCP, focus rings, route stability.

**Exit criteria (met):**
- Live chat anon access blocked without session_secret
- Framer-motion replaced with motion/react across 82 files
- Admin dashboard <300ms with 1000+ orders
- Homepage LCP <2.5s mobile
- Focus rings, single h1, route stability fixes
- All build/lint/type-check clean

---

## M10 · Premium Polish & Signature Experience  · **CURRENT**
**Open. Phases 33-35.**

**Why now:** Site is feature-complete and shipped. The remaining gap is *delivery* — same content, same products, same text, but the experience itself can climb from "good luxury e-commerce" to "memorable brand moment." `/create-perfume` is the flagship: today it leans on emoji scent icons and a static SVG bottle mockup that read as cosmetic. M10 replaces those with a real interaction so the page feels singular, not stocky.

**Scope contract:**
- **No copy changes.** All product names, descriptions, category labels, CTAs, body text remain byte-for-byte identical.
- **No catalog changes.** Men, Women, Niche, Lattafa Original, Al Haramain, Victoria's Secret, Dubai Shop — all products and variants remain.
- **No pricing changes.** 50ml = €29.99, 100ml = €199.00 unchanged. Cart and Stripe flows untouched.
- **Visual delivery elevates.** Scroll motion, hierarchy refinement, and one signature interaction on `/create-perfume`.

**Exit criteria:**
1. `/create-perfume` is a wow-grade experience: no scent emojis, no decorative bottle illustration/SVG mockup, no icon clichés. Same information collected (top/heart/base notes, name, size, summary), but the interaction itself is the brand moment.
2. Category pages (`/shop/[category]`, `/shop/lattafa`, `/shop/dubai-shop`) gain premium scroll motion (reveal patterns, parallax accents, staggered grids) without altering text or product data.
3. Homepage + product detail pages share the same motion language so the site reads as one cohesive premium experience.
4. Reduced-motion respected everywhere; no CLS regression; LCP ≤ 2.5s mobile retained; Lighthouse Performance ≥ 85 mobile.
5. Existing checkout flows (cart + custom perfume) work unchanged; Stripe + webhook + email pipeline untouched.

### Phases

#### Phase 33 · Create-Your-Own Perfume Reinvention
**Goal:** Replace `/create-perfume` with a distinctive, memorable interaction. Same information collected, same Stripe flow on submit, same prices. The page itself becomes the brand's signature moment.

**Constraints:**
- No emoji icons of any kind
- No SVG/illustration/3D model of a perfume bottle
- No "scent category" pictograms
- All current copy preserved verbatim
- All notes (top/heart/base × 5 categories) retained

**Success criteria:**
1. `/create-perfume` collects the same data: top notes, heart notes, base notes, fragrance name, volume (50ml/100ml), summary review — verified by reading current `src/app/create-perfume/` against the redesigned version
2. Visual audit: zero emoji, zero bottle illustrations, zero scent pictograms (grep for emoji unicode + image/svg references in the route confirms)
3. At least one signature interaction (e.g., note layering, dynamic typographic composition, scroll-driven build) that's distinctive on first encounter
4. Mobile experience matches desktop in clarity and delight (375px through 1920px tested)
5. Stripe checkout still works: `/api/create-perfume/payment` route unchanged, success page reachable
6. Lighthouse Performance ≥ 85 mobile, no layout shift introduced

**Requirements covered:** PREM-01, PREM-02, PREM-03, PREM-04

#### Phase 34 · Premium Scroll Motion (Catalog & Category)
**Goal:** Apply premium scroll-triggered motion to category and shop pages. Text and product data unchanged.

**Pages in scope:**
- `/shop/[category]` (women, men, niche, lattafa-original, al-haramain-originals, victorias-secret-originals)
- `/shop/lattafa`
- `/shop/dubai-shop`
- `/products/[slug]` (where motion patterns reinforce hierarchy)

**Success criteria:**
1. Each category page gains ≥ 3 distinct scroll-triggered motion patterns (e.g., staggered card reveal, sticky filter on scroll, parallax hero accent)
2. `prefers-reduced-motion` honored everywhere — no motion if user opts out
3. 60fps verified on mid-tier mobile (CPU 4× throttled in DevTools)
4. No CLS regression (Lighthouse / Web Vitals comparison vs. M9 baseline)
5. All product copy, names, prices, descriptions identical to M9 — diff confirms zero copy changes

**Requirements covered:** PREM-05, PREM-06, PREM-07

#### Phase 35 · Homepage & Global Motion Language
**Goal:** Homepage, blog, contact, and global header/footer get the same motion language so the site reads as one cohesive experience. Product detail pages get gallery/info column motion polish.

**Success criteria:**
1. Homepage hero + content sections use the same reveal patterns as Phase 34
2. Header transitions on scroll feel premium (no abrupt color flips, no jank)
3. Product detail pages animate gallery + info column with respect for reduced-motion
4. Blog index + post pages get reveal polish (text and content unchanged)
5. Performance budget held: LCP ≤ 2.5s mobile, INP ≤ 200ms
6. Final visual sweep — site feels like one designer made it

**Requirements covered:** PREM-08, PREM-09, PREM-10

---

## M11 · Handoff
**Planned. Phases 36-39 (standard handoff template).**

**Why now:** Final milestone — formalize the handover so the site is operationally owned by the client.

#### Phase 36 · Final Polish
Any design-rubric dimension scoring < 3 gets fixed. Visual sweep across all pages, all viewports.

#### Phase 37 · Content + SEO Refresh
Final pass on titles, descriptions, OG images, schema. Sitemap regeneration. Search Console verification.

#### Phase 38 · Final QA
Cross-browser (Chrome/Safari/Firefox), mobile (iOS/Android), axe a11y, Lighthouse, smoke test of all checkout flows.

#### Phase 39 · Handoff
Credentials walkthrough document, domain transfer doc, support runbook, post-launch monitor checklist.

---

## Out of Scope (post-handoff v2)

- Order tracking page for customers (deferred — current Stripe receipt + email sufficient)
- Loyalty program / customer accounts beyond admin
- Multi-language UI (currently EN-only; Arabic content in product names is acceptable)
- VR / AR product try-on
- Subscription perfume box
- Native mobile app

---

*Journey defined: 2026-05-10. Built retroactively from MILESTONES.md, REQUIREMENTS.md, tracking.json, and shipped phase folders. M10 is the first milestone planned forward in this journey format.*
