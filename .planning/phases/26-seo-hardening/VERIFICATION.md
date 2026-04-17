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
