# SEO Audit Report — Aquad'or Cyprus

**Date:** 2026-05-08
**Mode:** Local codebase
**Scope:** Full audit
**Live:** https://www.aquadorcy.com

## SEO Score: 88/100

| Category | Score | Notes |
|----------|------:|-------|
| Technical SEO (25%) | 23/25 | Sitemap dynamic + ISR, robots with AI blocks, canonical on all pages |
| Meta & Structured Data (20%) | 19/20 | Full metadata API; Product/Article/FAQ/BreadcrumbList/Organization/LocalBusiness/WebSite schemas |
| On-Page & Content (25%) | 21/25 | Single h1 enforced; 112 instances of sub-12px text hurts readability |
| Performance (15%) | 11/15 | LCP risk: 5.3MB hero video; bundle bloat from duplicate motion libs |
| Local SEO (5%) | 5/5 | LocalBusiness schema + NAP via Cyprus locale + Nicosia keyword |
| Off-Page (10%) | 9/10 | Solid social signals (OG/Twitter), AI crawlers blocked correctly |

## Executive Summary

The site has **near-best-in-class on-page SEO infrastructure** for a Next.js e-commerce store: Merchant-grade Product schema, Article + FAQ + BreadcrumbList on blog posts, dynamic sitemap with Supabase product/blog feeds, robots.ts with explicit AI-crawler disallows (GPTBot, CCBot, Google-Extended), Title template, Vercel Analytics + Speed Insights, viewport that respects user zoom, en-CY locale tagging.

The 3 things holding the score from 95+ are: (1) **degenerate hreflang** — `en-CY` and `en-GB` both point to the same root URL which Google treats as a duplicate signal, (2) **mobile readability** — 112 instances of `text-[10px]` on luxury product detail/eyebrow text, (3) **Core Web Vitals risk** from the 5.3MB hero video and duplicate animation library bloat.

No critical SEO blockers. The optimization wins are concentrated on CWV, not on missing metadata.

## Critical Issues

_(none)_

## High Priority (Fix This Week)

| # | Issue | Impact | Pages Affected | Fix |
|---|-------|--------|----------------|-----|
| S1 | Hero video 5.3MB blocks LCP on mobile | Lighthouse Perf -15-20pts on mobile, INP regression | `/` (homepage) | Transcode to VP9 720p WebM ~1.5MB, set as first `<source>`, add `fetchpriority="low"` *(also tracked as H4 in OPTIMIZE.md)* |
| S2 | Duplicate animation libraries in bundle | First Load JS +40-60KB | All pages | `npm uninstall framer-motion` *(H3 in OPTIMIZE.md)* |
| S3 | hreflang `en-CY` and `en-GB` resolve to same URL | Google may treat as duplicate; loses GB targeting opportunity | All pages | Either drop `en-GB` from `alternates.languages` OR create a `/uk/` path with GB-specific pricing/copy |

## Medium Priority (Fix This Month)

| # | Issue | Impact | Pages Affected | Fix |
|---|-------|--------|----------------|-----|
| S4 | Body font Poppins uses `display: "optional"` | Body text falls back to system font on slow networks → brand inconsistency hurts engagement signals | All pages | `display: "swap"` in `src/app/layout.tsx:20` |
| S5 | 112 instances of `text-[10px]` (mobile readability) | Below WCAG-recommended 12px; increases bounce on mobile | Product cards, eyebrow labels, footer | Raise to `text-xs` (12px) globally, keep `tracking-wider` |
| S6 | No client-side Sentry config | Browser errors invisible — can't catch JS issues that hurt UX/SEO | All pages | Create `sentry.client.config.ts` with `sendDefaultPii: false` |
| S7 | Maintenance page has empty `alt=""` on what may be a content image | If image is content (not decorative), screen readers + image search miss it | `src/app/maintenance/MaintenanceClient.tsx:79` | Verify image purpose; add descriptive alt or keep `alt=""` if purely decorative |
| S8 | No FAQ schema on shop category pages | Missed featured snippet opportunity for "how to choose perfume" / size / shipping queries | `/shop`, `/shop/[category]` | Add FAQPage schema to category pages with 3-5 common questions |
| S9 | LocalBusiness schema lacks `openingHoursSpecification`, `paymentAccepted`, `priceRange` | Reduced Google Business panel richness | `src/app/page.tsx` | Extend `localBusinessSchema` object |

## Low Priority (Nice to Have)

| # | Issue | Impact | Pages Affected | Fix |
|---|-------|--------|----------------|-----|
| S10 | No `verification.bing` or `verification.yandex` | Limits monitoring on those engines | Layout | Add verification meta (low priority for Cyprus market) |
| S11 | Sitemap caps blog posts at 100 | Past 100 posts won't be indexed via sitemap | `src/app/sitemap.ts:62` | Paginate or remove limit (not urgent until blog grows) |
| S12 | `priority` field on sitemap entries (Google ignores it) | None — purely cosmetic | sitemap.ts | Optional: remove `priority` field |
| S13 | No structured data on `/about` for `Person` (founder/perfumer) if relevant | Misses E-E-A-T signal for "About the perfumer" content | `/about` | Add Person schema if there's a named perfumer/founder |
| S14 | Reorder/checkout success pages are noindexed via robots — verify `/api/og` accessible to social crawlers | If `/api/og` accidentally landed in disallow path, OG previews break | robots.ts | Currently fine — `/api/` is disallowed but OG is fetched server-side by social platforms before crawl |

## Verified Clean (No Findings)

- Sitemap dynamic with `revalidate = 3600`, includes products + blog posts
- robots.ts blocks `/api`, `/admin`, `/checkout`, `/maintenance`, `/monitoring`, success pages, UTM/fbclid params
- AI crawlers GPTBot, CCBot, Google-Extended explicitly blocked
- Canonical URLs set per page (homepage, /about, /blog, /blog/[slug], /shop, /shop/[category], /products/[slug], /create-perfume, /contact, /privacy, /terms, /shipping)
- OG + Twitter Card meta on all key pages
- `/api/og` route generates dynamic OG images via Next.js ImageResponse
- Title template `%s | Aquad'or Cyprus` set
- Viewport with `maximumScale: 5` (respects user zoom — A11y win)
- `metadataBase` set correctly to production URL
- 0 raw `<img>` tags — all images use `next/image` with `sizes`
- Schema coverage:
  - Homepage: Organization + WebSite + LocalBusiness
  - About: AboutPage
  - Blog list: Blog + BreadcrumbList
  - Blog post: Article + BreadcrumbList + FAQPage (auto-detected)
  - Product: Product + Offer + Brand + BreadcrumbList (Merchant-grade)
  - Shop list: CollectionPage + ItemList + BreadcrumbList
  - Shop category: CollectionPage + BreadcrumbList
- Single h1 per page (enforced via v3.9 phase 32 success criterion C5)
- Skip link `<a href="#main-content">` + `<main id="main-content">` for keyboard nav
- Vercel Analytics + Speed Insights wired (Web Vitals collection)
- Google Site Verification env-driven (no leaked token)

## Top SEO Wins (highest ROI, ranked)

1. **Transcode hero video** — 30 min · Mobile LCP -2-3s, Perf score +15-20 (S1)
2. **Drop framer-motion package** — 5 min · -50KB First Load JS (S2)
3. **Fix hreflang OR add `/uk/` route** — 30 min config OR 1 day with content · prevents Google duplicate-content downgrade (S3)
4. **Body font `display: "swap"`** — 1 min · brand consistency on slow networks (S4)
5. **Raise tiny text from 10px to 12px** — 30 min global find-replace · mobile readability + bounce reduction (S5)
6. **Add FAQPage schema to shop pages** — 1 hr · featured-snippet opportunity (S8)

## Auto-Fix Candidates

These are safe to auto-apply:
- S4: `display: "optional"` → `"swap"` (one-line change in layout.tsx:20)
- S5: text-[10px] → text-xs global find-replace (mechanical)
- S6: Create sentry.client.config.ts from server config template (boilerplate)

These need confirmation:
- S1: Hero video transcode requires asset pipeline + new file
- S3: hreflang fix changes routing strategy — needs decision
- S8: FAQ content needs to be authored

## Next Steps

1. **Bundle into v4.0 phase plan** alongside OPTIMIZE.md HIGH/MEDIUM items.
2. **Run `/qualia-optimize --fix`** to auto-apply S4, S5, S6 (mechanical fixes).
3. **Decide on S3 hreflang** before next deploy — easiest path is dropping `en-GB` until UK routing exists.
