# SEO Hardening — Verification Runbook

## Automated checks (pre-deploy)
- [ ] `npx tsc --noEmit` — 0 errors
- [ ] `npm run lint` — 0 errors
- [ ] `npm run build` — succeeds
- [ ] `grep -rc "application/ld+json" src/app | grep -v ":0$" | wc -l` — ≥ 10 matches

## Post-deploy validation (manual)
1. **robots.txt** — `curl https://aquadorcy.com/robots.txt` — confirm new Disallow (monitoring, checkout, maintenance, GPTBot, CCBot)
2. **sitemap.xml** — `curl https://aquadorcy.com/sitemap.xml | grep -c '<url>'`
3. **Rich Results Test** — https://search.google.com/test/rich-results
   - `/` — Organization + Website detected
   - `/products/{slug}` — Product + BreadcrumbList with Merchant fields
   - `/shop` — CollectionPage + ItemList
   - `/shop/women` — CollectionPage + BreadcrumbList
   - `/shop/gender/men` — CollectionPage + BreadcrumbList
   - `/shop/lattafa` — BreadcrumbList + CollectionPage
   - `/blog` — Blog + BreadcrumbList
   - `/blog/{slug}` — Article + BreadcrumbList
   - `/contact` — ContactPage + LocalBusiness
   - `/about` — AboutPage
4. **Schema.org Validator** — https://validator.schema.org/ — 0 errors across above URLs
5. **OG image preview** — https://opengraph.xyz/ — confirm /api/og and /api/og/product/{slug} render branded cards
6. **Google Search Console** — submit sitemap, verify no new errors
7. **`/admin` noindex** — `curl -s https://aquadorcy.com/admin/login | grep -c "noindex"` ≥ 1
8. **`/checkout` noindex** — same check

## Success criteria
- Every content-bearing route emits valid JSON-LD passing Rich Results Test
- Internal routes (admin, checkout, maintenance) emit noindex
- Dynamic OG images render correctly on social share previews
- Product pages include Merchant-grade fields (priceValidUntil, hasMerchantReturnPolicy, shippingDetails)

## Browser QA (Phases 23-26 Spot Check)

**Date:** 2026-04-17
**Dev server:** http://localhost:3001 (running, responsive)
**Method:** HTTP + SSR HTML inspection. See "BLOCKED" note below for runtime checks.

> ### BLOCKED: Playwright MCP browser tools not available in this session
> `mcp__playwright__browser_*` tools were not exposed to the agent. Visual
> layout, viewport reflow at 375/768/1440, tab-focus rings, click handlers,
> runtime console errors, and cart-drawer touch targets could NOT be driven.
>
> What was verified below uses `curl` + SSR HTML diffing only. Any issue
> that only surfaces after hydration is not covered. Run again once the
> Playwright MCP is connected for full coverage.

### HTTP status (all PASS)
| URL | Status | Time |
|-----|--------|------|
| / | 200 | 57 ms |
| /shop | 200 | fast |
| /products/acqua-di-gi-parfum-by-giorgio-armani | 200 | fast |
| /shop/lattafa | 200 | fast |
| /blog | 200 | fast |
| /contact | 200 | fast |

### Phase 24 — Dubai hero + curated houses (SSR markup)
- `/shop` SSR contains the eyebrow string **"From Dubai, with luxury"** — PASS
- `/shop` SSR contains **Al Haramain (4x), Xerjoff (3x), Niche Collection (3x)** — all 3 curated-house cards rendered — PASS
- `/shop` emits `"@type":"CollectionPage"` + `ItemList` (32 ListItems) — PASS

### Phase 24 — Variant pricing regression
- `/products/acqua-di-gi-parfum-by-giorgio-armani` SSR shows **€199.00** for 100ml variant — **no €49.99 anywhere in markup** — PASS
- Product page breadcrumb is **"Back to Shop"** (not "Back to Dubai Shop") — PASS
- Volume markers: 50ml (2), 100ml (1) rendered — PASS

### Phase 26 — SEO / JSON-LD coverage
| Page | Expected schema | Present |
|------|-----------------|---------|
| / | Organization, WebSite, Store, SearchAction | YES |
| /shop | CollectionPage, ItemList, BreadcrumbList | YES |
| /shop/lattafa | CollectionPage, ItemList (33), BreadcrumbList | YES (was previously empty) — PASS |
| /products/{slug} | Product, Offer, Brand, MerchantReturnPolicy, ShippingDetails, BreadcrumbList | YES |
| /blog | Blog, BlogPosting (7), BreadcrumbList, Organization | YES |
| /contact | ContactPage, LocalBusiness, PostalAddress, OpeningHoursSpecification (2) | YES |

### Homepage sections (Phase 20/25)
- CreateSection: 1 ref — PASS
- FeaturedProducts: 3 refs (matches Aquador + Lattafa dual rails) — PASS
- TrustBar: 1 ref — PASS
- Dubai Shop: 2 refs (nav + link target) — PASS

### Navbar (Phase 19 regression)
SSR markup contains: **Men (6), Women (6), Unisex (3), Lattafa Originals (8), Dubai Shop (2)** — PASS

### Images
- Every `<img>` scanned on `/shop` carries a non-empty `alt` attribute (no `alt=""` found, 10 imgs / 10 alts)
- Sample external image (squarespace-cdn) — HTTP 200
- Blur placeholders + srcSet + sizes present on product cards — PASS

### NOT verified (needs Playwright)
- [ ] Horizontal scroll at 375px on each route
- [ ] Hero animation + CreateSection scroll reveal + footer cascade (Phase 25 motion polish)
- [ ] Navbar dropdown opens/closes on click
- [ ] Cart drawer +/- buttons are 44px touch targets (not 28px)
- [ ] Focus-ring visibility when tabbing through CTAs
- [ ] Variant selector interaction on product page (click 100ml toggle)
- [ ] Footer link click navigates correctly
- [ ] Runtime console errors (hydration mismatch, 404 on fonts, React key warnings)

### Verdict
**CONDITIONAL PASS** on SSR-observable checks. All schema, all pricing, all nav strings, all required structural elements are in the markup. **Full browser QA still required** — the runtime/interactive verification was not possible this run. Re-run this agent once the Playwright MCP is available.
