# Requirements: Aquad'or

Single source of truth for what's been delivered and what's planned. Grouped by milestone. Status reflects current reality (verified 2026-05-10).

**Core Value:** A customer completes a purchase and knows it worked — they see their order details on screen, receive a confirmation email, and the store is notified. No silent failures, no misleading messages, no security holes.

---

## Milestone 1 · Order/Payment System Fix · ✅ Complete (2026-03-02)

| ID | Requirement | Status |
|---|---|---|
| ORDER-01 | Server-side cart validation with Zod schema and price verification against product catalog | Complete |
| ORDER-02 | Stripe metadata under 500-char limit (shortened keys pid/vid/qty) | Complete |
| ORDER-03 | Both success pages display order details from Stripe session | Complete |
| ORDER-04 | Idempotent email sending via database-based dedup | Complete |
| ORDER-05 | Webhook reconstructs full item data from shortened metadata | Complete |
| ORDER-06 | Admin search secured against SQL filter injection | Complete |
| ORDER-07 | Unconditional free shipping messaging + 3-7 business day delivery | Complete |
| ORDER-08 | Centralized escapeHtml + SHIPPING_COUNTRIES utilities | Complete |
| ORDER-09 | Custom perfume success page detects payment correctly | Complete |
| ORDER-10 | Duplicate checkout session prevention (isProcessing + AbortController) | Complete |

---

## Milestone 2 · Security Audit Remediation · ✅ Complete (2026-03-03)

| ID | Requirement | Status |
|---|---|---|
| SEC-01 | RLS enabled on all 9 Supabase tables with 24 policies | Complete |
| SEC-02 | Sentry GDPR compliant (sendDefaultPii: false, 10% prod sampling) | Complete |
| SEC-03 | SQL injection protection in admin product search | Complete |
| SEC-04 | Open redirect protection in admin login | Complete |
| SEC-05 | Permissions-Policy header (camera/mic/geolocation/FLoC disabled) | Complete |
| SEC-06 | CSP hardened (unsafe-eval removed, media-src restricted) | Complete |
| SEC-07 | Stripe webhook test suite (21 tests) | Complete |
| SEC-08 | API test coverage 6/14 routes (74 tests total) | Complete |
| SEC-09 | Real React error boundary with Sentry integration | Complete |
| SEC-10 | Zod cart validation on localStorage hydration | Complete |
| SEC-11 | Cart hydration race condition fixed (useReducer initializer) | Complete |
| SEC-12 | Consistent API error handling across all routes | Complete |
| SEC-13 | Database performance indexes (8 indexes) | Complete |
| SEC-14 | Blog ISR with 60s revalidation using public client | Complete |
| SEC-15 | N+1 query eliminated in getRelatedProducts | Complete |
| SEC-16 | Three.js removed (~600KB bundle reduction) | Complete |
| SEC-17 | Form accessibility (htmlFor/id, aria-labels, fieldset/legend) | Complete |

---

## Milestone 3 · Design Overhaul & Premium UX · ✅ Complete (2026-03-04)

| ID | Requirement | Status |
|---|---|---|
| VISUAL-01 | Premium typography hierarchy (Playfair + Poppins) site-wide | Complete |
| VISUAL-02 | Sophisticated color palette with gold accents and refined gradients | Complete |
| VISUAL-03 | Perfect spacing system (consistent margins, padding, gaps) | Complete |
| VISUAL-04 | Optimized image pipeline with blur placeholders | Complete |
| PRODUCT-01 | Multi-angle product gallery | Complete |
| PRODUCT-02 | Product image zoom for detailed viewing | Complete |
| PRODUCT-03 | Product presentation matches luxury e-commerce standards | Complete |
| INTERACT-01 | Mobile-safe scroll-triggered animations | Complete |
| INTERACT-02 | Smooth page transitions between navigation | Complete |
| INTERACT-03 | 60fps animation performance | Complete |

---

## Milestone 4 · Immersive Luxury Experience · ✅ Complete (2026-03-09)

| ID | Requirement | Status |
|---|---|---|
| VFX-01..06 | Parallax + cinematic transitions + scroll-triggered reveals + 60fps + micro-interactions + mobile parallax | Complete |
| 3D-01..06 | 3D rotation/zoom/lighting/builder/multi-angle/mobile perf | Complete |
| NAV-01..06 | Animated filtering + immersive browsing + progressive disclosure + hover states + touch + category transitions | Complete |
| PERF-01..06 | 60fps + fast loads + mobile perf + progressive 3D loading + minimal CLS + smooth across devices | Complete |
| TRACK-01..06 | 3D + scroll + product views + navigation patterns + cinematic + device perf tracking | Complete |
| LOAD-01..06 | Skeletons + progressive images + 3D preloaders + smooth transitions + contextual indicators + intelligent preloading | Complete |
| A11Y-01..06 | Reduced-motion + keyboard + vestibular-safe + screen reader + non-motion access + high contrast | Complete |

---

## Milestone 5 · Client Feedback Round · ✅ Complete (2026-04-11)

| ID | Requirement | Status |
|---|---|---|
| BRAND-01 | Logo, tagline, year, cart icon corrected | Complete |
| NAV-CLIENT-01 | Men/Women/Unisex categories restructured, Dubai Shop dropdown fixed | Complete |
| HOME-CLIENT-01 | Homepage fragrance education + featured collections | Complete |
| SEARCH-01 | Search bar + filtering repaired | Complete |
| DATA-01 | Product fragrance notes restored, compositions corrected, spelling fixed | Complete |
| POLISH-01 | Typography, gold contrast, TrustBar, footer polished | Complete |

---

## Milestone 6 · Quality & SEO Polish · ✅ Complete (2026-04-17)

| ID | Requirement | Status |
|---|---|---|
| QUAL-01 | Blog SSG with image responsive sizes | Complete |
| QUAL-02 | Focus rings + a11y landmarks across site | Complete |
| QUAL-03 | Dubai Shop Arabian rebrand + €199 variant price fix | Complete |
| QUAL-04 | Motion polish (scroll reveals, willChange, loading states) | Complete |
| SEO-01 | Merchant schema (Product/Offer JSON-LD) | Complete |
| SEO-02 | Dynamic OG images per route | Complete |
| SEO-03 | hreflang for international targeting | Complete |

---

## Milestone 7 · Optimize All · ✅ Complete (2026-04-17)

| ID | Requirement | Status |
|---|---|---|
| OPT1-01 | is_active visibility block + draft leak fix + RLS extension + upsert RPC + Sentry unify | Complete |
| OPT1-02 | Suspense streaming + /shop static + dead code + 3D gate | Complete |
| OPT1-03 | loading.tsx/error.tsx routes + JsonLd + CDN migration + responsive parity 27/27 | Complete |

---

## Milestone 8 · Optimize Pass 2 · ✅ Complete (2026-04-17)

| ID | Requirement | Status |
|---|---|---|
| OPT2-01 | 33/33 optimization findings closed | Complete |
| OPT2-02 | 3 Supabase migrations applied to production | Complete |

---

## Milestone 9 · Cinematic Scroll + v3.9 Optimization Fixes · ✅ Complete (2026-05-08)

| ID | Requirement | Status |
|---|---|---|
| CIN-01 | WelcomeSplash entrance + ScrollProgress indicator + Hero3DScroll on homepage | Complete |
| OPT3-01 | Live chat anon SELECT blocked without session_secret (C1, C2, C3) | Complete |
| OPT3-02 | framer-motion → motion/react migration across 82 files (C4) | Complete |
| OPT3-03 | Admin dashboard <300ms with 1000+ orders (C5) | Complete |
| OPT3-04 | Homepage LCP <2.5s mobile, hero video <3MB WebM (C6, H10) | Complete |
| OPT3-05 | CartItem remove button + focus rings + single h1 + DOMPurify dynamic (C7, H1-H5, H8) | Complete |
| OPT3-06 | PageTransition removed + 3D Environment self-hosted HDRI + blog parallel fetches (H6, H9, H11) | Complete |
| OPT3-07 | All admin + blog mutation routes rate-limited (H12, H13) | Complete |
| OPT3-08 | Zod validation on /api/live-chat/notify, /api/blog GET, /api/checkout/session-details (H14, M19) | Complete |

---

## Milestone 10 · Premium Polish & Signature Experience · 🔧 Current

**Hard constraints:** No copy changes. No catalog changes. No checkout flow changes. Visual + motion delivery only.

### Phase 33 · Create-Your-Own Perfume Reinvention

| ID | Requirement | Status |
|---|---|---|
| PREM-01 | `/create-perfume` collects same data as today (top/heart/base notes, name, size, summary) | Pending |
| PREM-02 | Zero emoji icons, zero scent pictograms, zero perfume bottle illustrations on the page | Pending |
| PREM-03 | At least one signature interaction that's distinctive on first encounter | Pending |
| PREM-04 | Mobile experience matches desktop in clarity and delight (375px through 1920px) | Pending |

### Phase 34 · Premium Scroll Motion (Catalog & Category)

| ID | Requirement | Status |
|---|---|---|
| PREM-05 | Each category page has ≥ 3 distinct scroll-triggered motion patterns | Pending |
| PREM-06 | `prefers-reduced-motion` honored on all new motion (no motion if opted out) | Pending |
| PREM-07 | All product copy/names/prices/descriptions byte-identical to M9 (diff confirms zero copy changes) | Pending |

### Phase 35 · Homepage & Global Motion Language

| ID | Requirement | Status |
|---|---|---|
| PREM-08 | Homepage + product detail + blog share the same motion language | Pending |
| PREM-09 | Header transitions on scroll feel premium (no abrupt color flips, no jank) | Pending |
| PREM-10 | Performance budget held: LCP ≤ 2.5s mobile, INP ≤ 200ms, no CLS regression | Pending |

---

## Milestone 11 · Handoff · 📋 Planned

| ID | Requirement | Status |
|---|---|---|
| HAND-01 | All design rubric dimensions ≥ 3 across rendered pages | Pending |
| HAND-02 | Final SEO audit (titles, descriptions, OG, schema, sitemap, Search Console) | Pending |
| HAND-03 | Cross-browser + mobile + axe a11y QA pass | Pending |
| HAND-04 | Credentials walkthrough doc + domain transfer doc + support runbook | Pending |

---

## Out of Scope (post-handoff v2)

| Feature | Reason |
|---|---|
| Order tracking page for customers | Stripe receipt + email sufficient |
| Loyalty program / customer accounts | Out of current contract scope |
| Multi-language UI (Arabic, French) | EN-only confirmed; Arabic in product names is acceptable |
| VR / AR product try-on | Hardware adoption too limited |
| Subscription perfume box | Different business model |
| Native mobile app | Web-only confirmed |
| Auto-playing content | Never build — degrades UX |
| Conditional shipping pricing | Decided to keep all shipping free |

---

*Requirements defined retroactively: 2026-05-10. Source: tracking.json::lifetime.milestones, OPTIMIZE.md, MILESTONES.md, shipped phase folders. Last updated when M10 opened.*
