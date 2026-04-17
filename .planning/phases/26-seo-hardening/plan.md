---
phase: 26
goal: "Elevate Aquad'or SEO from decent to excellent — complete structured data coverage, fixed sitemap/robots gaps, noindex on internal routes, CollectionPage/ItemList on listing pages, Merchant-grade Product schema (shippingDetails + hasMerchantReturnPolicy + priceValidUntil), dynamic OG image generation, and semantic/linking polish — all passing Rich Results Test."
tasks: 5
waves: 2
---

# Phase 26: SEO Hardening

Goal: Every indexable route ships correct metadata + canonical + OG, every content-bearing route ships valid JSON-LD that passes Google's Rich Results Test, every internal route is excluded from indexing, and the sitemap/robots files are complete and consistent.

## Audit Summary (what's already there vs. what's missing)

**Already present (keep):**
- Root `metadataBase`, title template, canonical, OG, Twitter, robots, icons in `src/app/layout.tsx`
- Homepage: `Organization`, `WebSite` (SearchAction), `Store` (LocalBusiness) JSON-LD in `src/app/page.tsx`
- Product page: `Product` + `BreadcrumbList` JSON-LD in `src/app/products/[slug]/page.tsx`
- Category page: `BreadcrumbList` in `src/app/shop/[category]/page.tsx`
- Gender page: `BreadcrumbList` in `src/app/shop/gender/[gender]/page.tsx`
- Blog post: `Article`, `BreadcrumbList`, `FAQPage` (conditional), `LocalBusiness` (conditional) in `src/app/blog/[slug]/page.tsx`
- `src/app/sitemap.ts` with static + product + blog entries
- `src/app/robots.ts` blocking `/api/` + `/admin/`
- Per-page metadata layouts for /about, /contact, /shipping, /privacy, /terms, /reorder, /create-perfume

**Gaps to close:**
1. **Sitemap gaps:** missing `/shop/gender/men|women|unisex`, missing `/shop/al-haramain-originals` category, missing per-locale if any. `dynamic = 'force-dynamic'` + `revalidate = 0` regenerates on every request — excessive for a catalog that changes daily.
2. **Robots gaps:** missing `/monitoring/` (Sentry tunnel), `/checkout/`, `/maintenance`, and `/admin/*` subroutes enforcement. Missing explicit `Host` directive.
3. **Admin pages are indexable:** `src/app/admin/layout.tsx` sets a title + description but no `robots: { index: false }`. Only protected by robots.txt (soft). Same risk on `/checkout/` and `/maintenance/`.
4. **Product JSON-LD incomplete for Merchant Listings:** missing `sku`, `priceValidUntil`, `itemCondition`, `hasMerchantReturnPolicy`, `shippingDetails`. Google now requires these for product rich results as of the 2024 Merchant Listings schema update.
5. **Product breadcrumb says "Dubai Shop"** — should be "Shop" (consistent with category/gender breadcrumbs).
6. **Category/gender/shop pages lack `CollectionPage` + `ItemList`** structured data — listing pages need this for carousel/sitelink rich results.
7. **Lattafa page has zero JSON-LD** (`src/app/shop/lattafa/page.tsx`).
8. **Blog listing (`/blog`) lacks `Blog` schema + `ItemList`** of posts.
9. **Contact page lacks `ContactPage` schema** and the `LocalBusiness` block isn't reinforced there.
10. **About page lacks `AboutPage` + `Organization`** reinforcement.
11. **Shipping page lacks `WebPage` schema** with `speakable` (for voice search).
12. **Create-perfume page lacks `Service` / `Product` schema** for the bespoke offering.
13. **FAQ page missing globally** — Aquad'or has FAQs scattered in blog posts, but a canonical `/faq` page with `FAQPage` schema would capture the "luxury perfume Cyprus" featured-snippet traffic. (Deferred — out of scope for this phase unless an FAQ page exists.)
14. **No dynamic OG images:** all pages use `/aquador.webp` as OG. Products should use the product image (partially done in product `generateMetadata`); blog posts use `cover_image` (already done). But categories and the homepage could benefit from `next/og` `ImageResponse` routes for per-page branded OG cards.
15. **No `hreflang`:** site is English-only today; add `alternates.languages` anyway with `en-CY` as the default locale (this is the correct semantic for Cyprus English) plus `x-default`. Skip actual multi-lang until translation work begins.
16. **Missing `verification` tags** in root metadata for Google Search Console / Bing Webmaster Tools (handled via DNS TXT today, but adding the meta tag fallback is defensive).
17. **Missing `theme-color` / `color-scheme`** meta — not strictly SEO but affects how search previews render on mobile.
18. **Locale mismatch:** root metadata says `locale: "en_US"` but Cyprus English uses `en_CY` or `en_GB`. Google treats this as a weak geo signal.

---

## Task 1 — Robots + Sitemap completeness & noindex internal routes
**Wave:** 1
**Files:**
- `src/app/robots.ts` (modify — expand disallow list, add host)
- `src/app/sitemap.ts` (modify — add missing routes, tune revalidate)
- `src/app/admin/layout.tsx` (modify — add `robots: { index: false, follow: false }`)
- `src/app/checkout/layout.tsx` (CREATE — adds `robots: { index: false }` metadata for `/checkout` tree)
- `src/app/maintenance/page.tsx` (modify — add `export const metadata` with noindex)
- `src/lib/categories.ts` (READ only — to enumerate all category slugs)

**Context:** Read `@src/app/sitemap.ts`, `@src/app/robots.ts`, `@src/lib/categories.ts`, `@src/app/shop/gender/[gender]/page.tsx` (lines 15-21 for gender list), `@src/app/admin/layout.tsx`, `@src/app/checkout` (ls it), `@src/app/maintenance/page.tsx`.

**Action:**

1. **Update `src/app/robots.ts`** — expand the disallow list and add the canonical host:

```ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/checkout/',
          '/maintenance',
          '/monitoring/',        // Sentry tunnel
          '/reorder/success',    // Transactional — not for index
          '/create-perfume/success',
          '/*?*utm_',            // UTM-tagged URLs
          '/*?*fbclid',
        ],
      },
      {
        userAgent: 'GPTBot',
        disallow: '/',
      },
      {
        userAgent: 'CCBot',
        disallow: '/',
      },
    ],
    sitemap: 'https://aquadorcy.com/sitemap.xml',
    host: 'https://aquadorcy.com',
  };
}
```

2. **Update `src/app/sitemap.ts`** — add gender routes and the `al-haramain-originals` category; switch to ISR. Replace lines 5-6 and the `staticRoutes` array:

```ts
// Replace the existing two lines:
// export const dynamic = 'force-dynamic';
// export const revalidate = 0;
// With:
export const revalidate = 3600; // Regenerate hourly — catalog changes daily
```

Extend `staticRoutes` to include (keep all existing entries and add these):

```ts
{ route: '/shop/al-haramain-originals', priority: 0.8, changeFrequency: 'daily' as const },
{ route: '/shop/gender/women', priority: 0.8, changeFrequency: 'daily' as const },
{ route: '/shop/gender/men', priority: 0.8, changeFrequency: 'daily' as const },
{ route: '/shop/gender/unisex', priority: 0.7, changeFrequency: 'daily' as const },
```

Also add a per-entry `lastModified` sourced from `new Date()` (already there) — leave that.

3. **Add `robots: { index: false, follow: false }`** to `src/app/admin/layout.tsx` metadata export:

```ts
export const metadata = {
  title: 'Admin Panel | Aquad\'or',
  description: 'Manage your Aquad\'or store',
  robots: { index: false, follow: false, nocache: true },
};
```

4. **Create `src/app/checkout/layout.tsx`** with:

```ts
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Checkout',
  robots: { index: false, follow: false, nocache: true },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
```

5. **Add metadata export** to `src/app/maintenance/page.tsx` (at the top, after imports):

```ts
export const metadata = {
  title: 'Maintenance',
  robots: { index: false, follow: false },
};
```

**Done when:**
- `curl -s https://aquadorcy.com/robots.txt` (post-deploy) lists all new disallows
- `curl -s https://aquadorcy.com/sitemap.xml | grep -c 'gender/women'` returns `1`
- `curl -s https://aquadorcy.com/sitemap.xml | grep -c 'al-haramain-originals'` returns `1`
- `grep -r "index: false" src/app/admin src/app/checkout src/app/maintenance` returns at least 3 matches
- `npx tsc --noEmit` passes with zero errors

---

## Task 2 — Merchant-grade Product schema + fix breadcrumbs
**Wave:** 1
**Files:**
- `src/app/products/[slug]/page.tsx` (modify — expand Product JSON-LD, fix breadcrumb label)
- `src/lib/seo/product-schema.ts` (CREATE — extract helper returning the full Product schema with shipping + returns)

**Context:** Read `@src/app/products/[slug]/page.tsx` (lines 113-162 — current Product + Breadcrumb schema), `@src/lib/supabase/product-service.ts` (lines 72-90 — `getProductBySlug` to see what fields exist: `id`, `slug`, `name`, `description`, `price`, `sale_price`, `image`, `images`, `in_stock`, `brand`, `gender`, `category`, `tags`), `@src/lib/currency.ts`.

**Action:**

1. **Create `src/lib/seo/product-schema.ts`** — exports `buildProductSchema(product, slug)` returning the full JSON-LD shape Google requires for Merchant Listings in 2024+:

```ts
import type { Product } from '@/lib/supabase/types';

const BASE_URL = 'https://aquadorcy.com';

export function buildProductSchema(product: Product, slug: string, imageUrls: string[]) {
  const price = product.sale_price ? Number(product.sale_price) : Number(product.price);
  // Price valid for 365 days from today — Google requires a future date
  const priceValidUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${BASE_URL}/products/${slug}#product`,
    name: product.name,
    description: product.description,
    image: imageUrls,
    sku: product.id,
    mpn: product.id,
    ...(product.brand && {
      brand: { '@type': 'Brand', name: product.brand },
    }),
    ...(product.category && {
      category: product.category,
    }),
    offers: {
      '@type': 'Offer',
      '@id': `${BASE_URL}/products/${slug}#offer`,
      url: `${BASE_URL}/products/${slug}`,
      priceCurrency: 'EUR',
      price: price.toFixed(2),
      priceValidUntil,
      itemCondition: 'https://schema.org/NewCondition',
      availability: product.in_stock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: "Aquad'or",
        url: BASE_URL,
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'CY',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 14,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn',
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: '0',
          currency: 'EUR',
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'CY',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 0,
            maxValue: 1,
            unitCode: 'DAY',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 3,
            unitCode: 'DAY',
          },
        },
      },
    },
  };
}

export function buildProductBreadcrumb(productName: string, slug: string, categoryName?: string, categorySlug?: string) {
  const items: Array<{ '@type': string; position: number; name: string; item: string }> = [
    { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
    { '@type': 'ListItem', position: 2, name: 'Shop', item: `${BASE_URL}/shop` },
  ];

  if (categoryName && categorySlug) {
    items.push({
      '@type': 'ListItem',
      position: 3,
      name: categoryName,
      item: `${BASE_URL}/shop/${categorySlug}`,
    });
    items.push({
      '@type': 'ListItem',
      position: 4,
      name: productName,
      item: `${BASE_URL}/products/${slug}`,
    });
  } else {
    items.push({
      '@type': 'ListItem',
      position: 3,
      name: productName,
      item: `${BASE_URL}/products/${slug}`,
    });
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };
}
```

2. **Refactor `src/app/products/[slug]/page.tsx`** — replace the inline `jsonLd` and `breadcrumbSchema` objects (lines 113-162) with calls to the new helpers:

```ts
import { buildProductSchema, buildProductBreadcrumb } from '@/lib/seo/product-schema';
import { getCategoryBySlug } from '@/lib/supabase/product-service';

// Inside ProductPage, after fetching product:
const categoryMeta = product.category ? getCategoryBySlug(product.category) : null;
const allImages = [product.image, ...(product.images ?? [])].filter(Boolean);
const productSchema = buildProductSchema(product, slug, allImages);
const breadcrumbSchema = buildProductBreadcrumb(
  product.name,
  slug,
  categoryMeta?.name,
  categoryMeta?.slug,
);
```

Also **fix the UI breadcrumb link** on line 188 — replace the text `Back to Dubai Shop` with `Back to Shop` (matches the schema and the rest of the site).

**Done when:**
- `grep -c "hasMerchantReturnPolicy" src/lib/seo/product-schema.ts` returns `1`
- `grep -c "shippingDetails" src/lib/seo/product-schema.ts` returns `1`
- `grep -c "priceValidUntil" src/lib/seo/product-schema.ts` returns `1`
- `grep -c "Dubai Shop" src/app/products/[slug]/page.tsx` returns `0`
- On a real product URL in preview, view-source includes `"@type":"Product"` with all six fields: `sku`, `priceValidUntil`, `itemCondition`, `hasMerchantReturnPolicy`, `shippingDetails`, and `offers.availability`
- `npx tsc --noEmit` passes

---

## Task 3 — Listing-page schema: CollectionPage + ItemList on Shop, Category, Gender, Lattafa, Blog
**Wave:** 1
**Files:**
- `src/lib/seo/listing-schema.ts` (CREATE — helpers for `CollectionPage`, `ItemList`, `BreadcrumbList`)
- `src/app/shop/page.tsx` (modify — inject CollectionPage + ItemList for Dubai Shop listing)
- `src/app/shop/[category]/page.tsx` (modify — add CollectionPage + ItemList alongside existing breadcrumb)
- `src/app/shop/gender/[gender]/page.tsx` (modify — same)
- `src/app/shop/lattafa/page.tsx` (modify — add BreadcrumbList + CollectionPage + ItemList, currently has NONE)
- `src/app/blog/page.tsx` (modify — add `Blog` + `ItemList` of posts + BreadcrumbList)

**Context:** Read `@src/app/shop/page.tsx`, `@src/app/shop/[category]/page.tsx` (lines 70-104 current breadcrumb implementation), `@src/app/shop/gender/[gender]/page.tsx` (lines 66-99), `@src/app/shop/lattafa/page.tsx`, `@src/app/blog/page.tsx`.

**Action:**

1. **Create `src/lib/seo/listing-schema.ts`** — three helpers:

```ts
const BASE_URL = 'https://aquadorcy.com';

type ListingItem = {
  name: string;
  slug: string;
  image?: string;
  price?: number;
  inStock?: boolean;
  brand?: string;
};

export function buildCollectionPage(params: {
  name: string;
  description: string;
  url: string;
  items: ListingItem[];
  itemUrlPrefix: string; // e.g. '/products' for products, '/blog' for blog
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${params.url}#collection`,
    name: params.name,
    description: params.description,
    url: params.url,
    isPartOf: { '@type': 'WebSite', '@id': `${BASE_URL}/#website` },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: params.items.length,
      itemListElement: params.items.slice(0, 30).map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${BASE_URL}${params.itemUrlPrefix}/${item.slug}`,
        name: item.name,
        ...(item.image && { image: item.image }),
      })),
    },
  };
}

export function buildBreadcrumbList(crumbs: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: c.url,
    })),
  };
}

export function renderJsonLd(schemas: Array<Record<string, unknown>>): string {
  return schemas
    .map((s) => JSON.stringify(s).replace(/</g, '\\u003c'))
    .join('');
}
```

2. **`src/app/shop/page.tsx`** — inject `CollectionPage` + `ItemList` + `BreadcrumbList` before `<ShopContent>`. Also rename the page title from "Dubai Shop" to "Shop" (consistent canonical). Map products → ListingItem. Use the same `<script type="application/ld+json">` pattern used elsewhere on the site.

3. **`src/app/shop/[category]/page.tsx`** — after the existing `breadcrumbSchema` object, build a `collectionSchema` via `buildCollectionPage({ name: category.name + ' Perfumes', description: category.description, url: ..., items: products.map(...), itemUrlPrefix: '/products' })`. Emit both schemas.

4. **`src/app/shop/gender/[gender]/page.tsx`** — same pattern as category.

5. **`src/app/shop/lattafa/page.tsx`** — this page currently has NO JSON-LD. Add all three: `BreadcrumbList` (Home > Shop > Lattafa Originals), `CollectionPage`, `ItemList` — at the top of the returned JSX before `<LattafaContent>`.

6. **`src/app/blog/page.tsx`** — add:
   - `Blog` schema: `{ '@type': 'Blog', name: 'The Art of Scent', url: 'https://aquadorcy.com/blog', publisher: { '@type': 'Organization', name: "Aquad'or", url: 'https://aquadorcy.com' } }`
   - `ItemList` of the first-page posts (title, url, image)
   - `BreadcrumbList` (Home > Blog)

**Done when:**
- `grep -rc "CollectionPage" src/app/shop src/app/blog` returns at least 4 matches (shop, category, gender, lattafa)
- `grep -c "@type.*Blog" src/app/blog/page.tsx` returns ≥ 1
- `grep -c "application/ld+json" src/app/shop/lattafa/page.tsx` returns ≥ 3 (breadcrumb + collection + item list, or 1 if emitted together)
- Rich Results Test (https://search.google.com/test/rich-results) on `/shop/women` returns "Breadcrumbs" and "ItemList" as detected with 0 errors
- `npx tsc --noEmit` passes

---

## Task 4 — About, Contact, Shipping, Create-Perfume schemas + hreflang + locale fix + verification meta
**Wave:** 1
**Files:**
- `src/app/layout.tsx` (modify — fix locale, add alternates.languages, add verification block, add theme-color)
- `src/app/about/layout.tsx` (modify — add AboutPage + Organization schema inline)
- `src/app/contact/layout.tsx` (modify — add ContactPage + LocalBusiness schema)
- `src/app/shipping/layout.tsx` (modify — add WebPage + speakable schema)
- `src/app/create-perfume/layout.tsx` (modify — add Service schema for bespoke offering)
- `src/app/about/page.tsx` (modify — emit schema via `<script>`)
- `src/app/contact/page.tsx` (modify — emit schema)
- `src/app/shipping/page.tsx` (modify — emit schema)
- `src/app/create-perfume/page.tsx` (modify — emit schema)
- `src/lib/seo/page-schemas.ts` (CREATE — factory exports for these four page-level schemas)

**Context:** Read `@src/app/layout.tsx` (lines 39-100 for metadata), `@src/app/about/page.tsx`, `@src/app/contact/page.tsx`, `@src/app/shipping/page.tsx`, `@src/app/create-perfume/page.tsx` (confirm they exist — verify with `ls src/app/{about,contact,shipping,create-perfume}/page.tsx` first).

**Action:**

1. **Fix root metadata** (`src/app/layout.tsx`):
   - Change `locale: "en_US"` → `locale: "en_CY"`
   - Add below the existing `openGraph.locale`: `alternateLocale: ['en_GB']`
   - Add to `metadata` root:
     ```ts
     alternates: {
       canonical: 'https://aquadorcy.com',
       languages: {
         'en-CY': 'https://aquadorcy.com',
         'en-GB': 'https://aquadorcy.com',
         'x-default': 'https://aquadorcy.com',
       },
     },
     verification: {
       google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
       // Only emit if the env var is set — empty strings are fine, Next will skip
     },
     category: 'shopping',
     ```
   - Add to the `viewport` export: `themeColor: '#D4AF37'`

2. **Create `src/lib/seo/page-schemas.ts`** with four factories:

```ts
const BASE_URL = 'https://aquadorcy.com';

export const aboutPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  '@id': `${BASE_URL}/about#webpage`,
  url: `${BASE_URL}/about`,
  name: "About Aquad'or",
  description: "Cyprus's premier luxury fragrance house in Nicosia.",
  isPartOf: { '@type': 'WebSite', '@id': `${BASE_URL}/#website` },
  about: { '@type': 'Organization', '@id': `${BASE_URL}/#organization` },
};

export const contactPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  '@id': `${BASE_URL}/contact#webpage`,
  url: `${BASE_URL}/contact`,
  name: "Contact Aquad'or",
  description: 'Visit our Nicosia boutique or contact us for fragrance consultations.',
  mainEntity: {
    '@type': 'LocalBusiness',
    '@id': `${BASE_URL}/#business`,
    name: "Aquad'or",
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Ledra 145',
      addressLocality: 'Nicosia',
      postalCode: '1011',
      addressCountry: 'CY',
    },
    telephone: '+357-99-980809',
    email: 'info@aquadorcy.com',
    openingHoursSpecification: [
      { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], opens: '10:00', closes: '20:00' },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Sunday', opens: '12:00', closes: '18:00' },
    ],
  },
};

export const shippingPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': `${BASE_URL}/shipping#webpage`,
  url: `${BASE_URL}/shipping`,
  name: 'Shipping & Returns',
  description: 'Same-day delivery in Nicosia, 1-3 days across Cyprus. 14-day returns on unopened items.',
  speakable: {
    '@type': 'SpeakableSpecification',
    cssSelector: ['h1', 'h2', '.shipping-summary'],
  },
};

export const createPerfumeServiceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': `${BASE_URL}/create-perfume#service`,
  name: 'Bespoke Perfume Creation',
  serviceType: 'Custom fragrance design',
  provider: { '@type': 'Organization', '@id': `${BASE_URL}/#organization` },
  areaServed: { '@type': 'Country', name: 'Cyprus' },
  offers: [
    { '@type': 'Offer', name: 'Custom Perfume 50ml', price: '29.99', priceCurrency: 'EUR' },
    { '@type': 'Offer', name: 'Custom Perfume 100ml', price: '199.00', priceCurrency: 'EUR' },
  ],
  description: 'Design your own custom perfume from floral, fruity, woody, oriental, and gourmand notes.',
};
```

3. **Emit the schemas** — on each of the four pages (`/about`, `/contact`, `/shipping`, `/create-perfume`), import the corresponding schema and render `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />` at the top of the page. If the page is a client component, emit in the layout route instead (layout.tsx for `/about` already exists).

**Done when:**
- `grep -c "en_CY" src/app/layout.tsx` returns ≥ 1
- `grep -c "alternates.*languages" src/app/layout.tsx` matches multi-line — verify by reading the file
- `grep -c "AboutPage" src/lib/seo/page-schemas.ts` returns `1`
- `grep -c "ContactPage" src/lib/seo/page-schemas.ts` returns `1`
- `grep -c "Service" src/lib/seo/page-schemas.ts` returns `1`
- `grep -c "application/ld+json" src/app/about/page.tsx src/app/contact/page.tsx src/app/shipping/page.tsx src/app/create-perfume/page.tsx` returns ≥ 4 (one per file)
- `npx tsc --noEmit` passes

---

## Task 5 — Dynamic OG image generation + verification
**Wave:** 2 (after Tasks 1-4 — uses helpers/routes that must exist first)
**Files:**
- `src/app/api/og/route.tsx` (CREATE — `next/og` ImageResponse for default branded OG)
- `src/app/api/og/product/[slug]/route.tsx` (CREATE — per-product OG with product image + name + price)
- `src/app/layout.tsx` (modify — update default OG image to `/api/og` instead of `/aquador.webp`)
- `src/app/products/[slug]/page.tsx` (modify — update `generateMetadata` to reference `/api/og/product/${slug}` as OG image fallback when product image dimensions are off)
- `.planning/phases/26-seo-hardening/VERIFICATION.md` (CREATE — runbook for Rich Results Test validation)

**Context:** Read `@src/app/layout.tsx` (OG section, lines 58-79), `@src/app/products/[slug]/page.tsx` (generateMetadata lines 24-67). Reference Next.js docs: https://nextjs.org/docs/app/api-reference/functions/image-response

**Action:**

1. **Create `src/app/api/og/route.tsx`** — default branded 1200×630 OG image:

```tsx
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
          color: '#D4AF37',
          fontFamily: 'serif',
        }}
      >
        <div style={{ fontSize: 96, fontWeight: 700, letterSpacing: -2 }}>Aquad&apos;or</div>
        <div style={{ fontSize: 32, color: '#FFD700', marginTop: 16, fontStyle: 'italic' }}>
          Scent of Luxury
        </div>
        <div style={{ fontSize: 24, color: '#888', marginTop: 48 }}>
          Luxury Perfumes · Cyprus
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
```

2. **Create `src/app/api/og/product/[slug]/route.tsx`** — product-specific OG:

```tsx
import { ImageResponse } from 'next/og';
import { getProductBySlug } from '@/lib/supabase/product-service';

export const runtime = 'nodejs'; // Need Supabase which uses Node APIs

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return new Response('Not found', { status: 404 });
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: '#0a0a0a',
          color: '#D4AF37',
        }}
      >
        <div
          style={{
            width: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 40,
          }}
        >
          <img
            src={product.image}
            alt={product.name}
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
          />
        </div>
        <div
          style={{
            width: '50%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: 60,
          }}
        >
          <div style={{ fontSize: 24, color: '#888', textTransform: 'uppercase', letterSpacing: 4 }}>
            {product.brand || "Aquad'or"}
          </div>
          <div style={{ fontSize: 64, fontWeight: 700, marginTop: 12, lineHeight: 1.1 }}>
            {product.name}
          </div>
          <div style={{ fontSize: 40, color: '#FFD700', marginTop: 24 }}>
            €{Number(product.price).toFixed(2)}
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
```

3. **Update `src/app/layout.tsx`** — change the default OG image from `/aquador.webp` to `/api/og`:

```ts
openGraph: {
  // ... existing fields
  images: [
    {
      url: '/api/og',
      width: 1200,
      height: 630,
      alt: "Aquad'or — Luxury Perfumes Cyprus",
    },
  ],
},
twitter: {
  card: 'summary_large_image',
  title: "Aquad'or | Luxury Perfumes & Niche Fragrances Cyprus",
  description: "Scent of Luxury...",
  images: ['/api/og'],
},
```

4. **Update `generateMetadata` in `src/app/products/[slug]/page.tsx`** — prepend a 1200×630 OG variant from the API route so the product card fits standard OG dimensions even if the product image is square:

```ts
openGraph: {
  // ... existing
  images: [
    { url: `/api/og/product/${slug}`, width: 1200, height: 630, alt: product.name },
    { url: product.image, width: 800, height: 800, alt: product.name },
    ...(product.images ?? []).map(...)
  ],
},
twitter: {
  ...
  images: [`/api/og/product/${slug}`],
},
```

5. **Create `.planning/phases/26-seo-hardening/VERIFICATION.md`** — a manual runbook for the verifier to execute post-deploy. Include:

```markdown
# SEO Hardening — Verification Runbook

## Automated checks (run before deploy)
- [ ] `npx tsc --noEmit` → 0 errors
- [ ] `npm run lint` → 0 errors
- [ ] `npm run build` → succeeds
- [ ] `grep -rc "application/ld+json" src/app` → ≥ 10 matches

## Post-deploy validation (manual)
1. **robots.txt** — `curl https://aquadorcy.com/robots.txt` — confirm all new Disallow entries present
2. **sitemap.xml** — `curl https://aquadorcy.com/sitemap.xml | grep -c '<url>'` — count matches staticRoutes + products + posts
3. **Rich Results Test** (https://search.google.com/test/rich-results):
   - Home `/` → Organization + Website + LocalBusiness detected, 0 errors
   - `/products/{any-slug}` → Product + BreadcrumbList detected, 0 errors, all Merchant fields present
   - `/shop/women` → BreadcrumbList + ItemList detected
   - `/shop/gender/men` → BreadcrumbList + ItemList detected
   - `/shop/lattafa` → BreadcrumbList + ItemList detected (was empty before)
   - `/blog` → Blog + ItemList + BreadcrumbList detected
   - `/blog/{any-slug}` → Article + BreadcrumbList detected
   - `/contact` → ContactPage + LocalBusiness detected
   - `/about` → AboutPage detected
4. **Schema.org Validator** (https://validator.schema.org/) — same URLs, 0 errors
5. **OG image preview** (https://opengraph.xyz/) — confirm `/`, `/shop/women`, `/products/{slug}` all show branded Aquad'or OG cards
6. **Google Search Console** — submit `sitemap.xml` and verify no coverage errors increase within 48h
7. **Bing Webmaster Tools** — same
8. **`/admin` noindex** — `curl -s https://aquadorcy.com/admin/login | grep -c "noindex"` → ≥ 1
9. **`/checkout` noindex** — same check for checkout pages
```

**Done when:**
- `test -f src/app/api/og/route.tsx && test -f src/app/api/og/product/\[slug\]/route.tsx && echo OK` prints `OK`
- Visiting `/api/og` locally returns a 1200×630 PNG
- Visiting `/api/og/product/{any-real-slug}` returns a 1200×630 PNG with the product
- `grep -c "/api/og" src/app/layout.tsx` returns ≥ 2 (OG + Twitter)
- `grep -c "/api/og/product" src/app/products/\[slug\]/page.tsx` returns ≥ 2
- `test -f .planning/phases/26-seo-hardening/VERIFICATION.md && echo OK` prints `OK`
- `npm run build` completes without errors

---

## Success Criteria
- [ ] Every indexable route emits valid JSON-LD that passes the Rich Results Test with 0 errors
- [ ] `robots.txt` blocks `/api/`, `/admin/`, `/checkout/`, `/maintenance`, `/monitoring/`, and AI crawlers (`GPTBot`, `CCBot`)
- [ ] `sitemap.xml` includes all static routes (shop, gender, categories, lattafa, al-haramain, blog, static pages), all product slugs, and all published blog slugs
- [ ] `/admin/*`, `/checkout/*`, `/maintenance` emit `<meta name="robots" content="noindex, nofollow">` at the document level
- [ ] Product detail pages emit Google-Merchant-grade `Product` schema: `sku`, `priceValidUntil`, `itemCondition`, `availability`, `hasMerchantReturnPolicy`, `shippingDetails`, `brand`, `offers.seller`
- [ ] Shop/category/gender/lattafa pages emit `CollectionPage` + `ItemList` + `BreadcrumbList`
- [ ] Blog listing page emits `Blog` + `ItemList` + `BreadcrumbList`
- [ ] About/Contact/Shipping/Create-Perfume emit `AboutPage`/`ContactPage`/`WebPage`/`Service` schemas respectively, with `LocalBusiness` reinforced on Contact
- [ ] Root metadata uses `en_CY` locale and advertises `alternates.languages` with `en-CY`, `en-GB`, `x-default`
- [ ] Dynamic OG routes at `/api/og` and `/api/og/product/[slug]` render branded 1200×630 previews; homepage and product pages reference them
- [ ] Product page UI breadcrumb text says "Back to Shop" (not "Back to Dubai Shop")
- [ ] `npx tsc --noEmit`, `npm run lint`, `npm run build` all pass with zero errors
- [ ] Semantic HTML review: every page has exactly one `<h1>`, `<main>` landmark present (already in `src/app/layout.tsx` line 131), `<nav>` in Navbar + Footer, `<article>` on blog posts — verify via grep (no new work expected unless a grep reveals a missing landmark)

---

## Verification Contract

### Contract for Task 1 — robots + sitemap + noindex
**Check type:** grep-match
**Command:** `grep -cE "Disallow.*(monitoring|checkout|maintenance|GPTBot)" src/app/robots.ts`
**Expected:** ≥ 3
**Fail if:** Returns < 3 — not all new disallows present

### Contract for Task 1 — sitemap includes gender + al-haramain
**Check type:** grep-match
**Command:** `grep -cE "(gender/women|gender/men|al-haramain-originals)" src/app/sitemap.ts`
**Expected:** 3
**Fail if:** Returns < 3

### Contract for Task 1 — admin noindex
**Check type:** grep-match
**Command:** `grep -c "index: false" src/app/admin/layout.tsx`
**Expected:** ≥ 1
**Fail if:** Returns 0 — admin still indexable via metadata

### Contract for Task 1 — checkout noindex layout exists
**Check type:** file-exists
**Command:** `test -f src/app/checkout/layout.tsx && grep -c "index: false" src/app/checkout/layout.tsx`
**Expected:** ≥ 1
**Fail if:** File missing or noindex missing

### Contract for Task 2 — product schema helper exists with Merchant fields
**Check type:** grep-match
**Command:** `grep -cE "(hasMerchantReturnPolicy|shippingDetails|priceValidUntil|itemCondition)" src/lib/seo/product-schema.ts`
**Expected:** ≥ 4
**Fail if:** Returns < 4 — missing required Merchant Listings fields

### Contract for Task 2 — product page uses the helper
**Check type:** grep-match
**Command:** `grep -c "buildProductSchema\|buildProductBreadcrumb" src/app/products/\[slug\]/page.tsx`
**Expected:** ≥ 2
**Fail if:** Returns < 2 — inline schema not replaced

### Contract for Task 2 — breadcrumb text fixed
**Check type:** grep-match
**Command:** `grep -c "Dubai Shop" src/app/products/\[slug\]/page.tsx`
**Expected:** 0
**Fail if:** Returns ≥ 1 — stale "Dubai Shop" breadcrumb still in UI

### Contract for Task 3 — listing helper exists
**Check type:** grep-match
**Command:** `grep -c "CollectionPage\|ItemList" src/lib/seo/listing-schema.ts`
**Expected:** ≥ 2
**Fail if:** Returns < 2

### Contract for Task 3 — all listing pages emit JSON-LD
**Check type:** grep-match
**Command:** `grep -lE "application/ld\\+json" src/app/shop/page.tsx src/app/shop/\[category\]/page.tsx src/app/shop/gender/\[gender\]/page.tsx src/app/shop/lattafa/page.tsx src/app/blog/page.tsx | wc -l`
**Expected:** 5
**Fail if:** Returns < 5 — at least one listing page missing schema

### Contract for Task 3 — Lattafa page gained schema
**Check type:** grep-match
**Command:** `grep -cE "(BreadcrumbList|CollectionPage|ItemList)" src/app/shop/lattafa/page.tsx`
**Expected:** ≥ 2
**Fail if:** Returns 0 — Lattafa page still has no structured data

### Contract for Task 4 — locale fixed
**Check type:** grep-match
**Command:** `grep -c "en_CY\|en-CY" src/app/layout.tsx`
**Expected:** ≥ 1
**Fail if:** Returns 0 — still using en_US

### Contract for Task 4 — hreflang languages added
**Check type:** grep-match
**Command:** `grep -c "x-default" src/app/layout.tsx`
**Expected:** ≥ 1
**Fail if:** Returns 0 — alternates.languages missing

### Contract for Task 4 — four page schemas created
**Check type:** grep-match
**Command:** `grep -cE "(AboutPage|ContactPage|Service|SpeakableSpecification)" src/lib/seo/page-schemas.ts`
**Expected:** 4
**Fail if:** Returns < 4 — missing one or more page schemas

### Contract for Task 4 — schemas emitted on pages
**Check type:** command-exit
**Command:** `for f in src/app/about/page.tsx src/app/contact/page.tsx src/app/shipping/page.tsx src/app/create-perfume/page.tsx; do grep -l "application/ld+json" "$f" || exit 1; done; echo OK`
**Expected:** `OK` (exit 0)
**Fail if:** Any file missing JSON-LD script

### Contract for Task 5 — OG routes exist
**Check type:** file-exists
**Command:** `test -f src/app/api/og/route.tsx && test -f src/app/api/og/product/\[slug\]/route.tsx && echo OK`
**Expected:** `OK`
**Fail if:** Either file missing

### Contract for Task 5 — layout references /api/og
**Check type:** grep-match
**Command:** `grep -c "/api/og" src/app/layout.tsx`
**Expected:** ≥ 2
**Fail if:** Returns < 2 — OG and Twitter not both updated

### Contract for Task 5 — product page references /api/og/product
**Check type:** grep-match
**Command:** `grep -c "/api/og/product" src/app/products/\[slug\]/page.tsx`
**Expected:** ≥ 2
**Fail if:** Returns < 2

### Contract: overall TypeScript compile
**Check type:** command-exit
**Command:** `cd /home/qualiasolutions/Projects/aquador && npx tsc --noEmit 2>&1 | grep -c "error TS"`
**Expected:** `0`
**Fail if:** Any TS errors introduced

### Contract: overall build
**Check type:** command-exit
**Command:** `cd /home/qualiasolutions/Projects/aquador && npm run build 2>&1 | tail -5 | grep -c "Compiled successfully\|Build complete"`
**Expected:** ≥ 1
**Fail if:** Build fails

### Contract: behavioral — Rich Results Test
**Check type:** behavioral
**Command:** (verifier opens https://search.google.com/test/rich-results and tests the 9 URLs in VERIFICATION.md)
**Expected:** 0 errors across all URLs, all expected schema types detected
**Fail if:** Any URL reports errors or missing required fields (e.g. Product without `offers.priceValidUntil`)

### Contract: behavioral — schema.org Validator
**Check type:** behavioral
**Command:** (verifier pastes each production URL into https://validator.schema.org/)
**Expected:** 0 errors
**Fail if:** Any warning or error on Product, Article, or CollectionPage schemas
