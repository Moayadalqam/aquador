# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Development server (localhost:3000)
npm run build        # Production build
npm run lint         # ESLint
npm run type-check   # TypeScript type checking
npm run test         # Jest unit tests
npm run test:watch   # Jest watch mode
npm run test:coverage # Coverage report
npm run test:e2e     # Playwright E2E tests (starts dev server automatically)
npm run test:e2e:ui  # Playwright with UI mode
npm run test:all     # lint + type-check + jest + playwright
```

Run a single test file:
```bash
npm test -- src/lib/perfume/__tests__/pricing.test.ts
npx playwright test e2e/cart.spec.ts
```

## Architecture

**Next.js 14 App Router** luxury perfume e-commerce site for Aquad'or Cyprus.

### Core Features

1. **Product Catalog** (`src/lib/products.ts`) - Static product data with ~100+ perfumes across categories (women, men, niche). Product types: Perfume, Essence Oil, Body Lotion.

2. **Custom Perfume Builder** (`src/app/create-perfume/`, `src/lib/perfume/`) - Interactive fragrance creation with three-layer composition (top, heart, base notes). Five fragrance categories: floral, fruity, woody, oriental, gourmand. Integrates with Stripe for payments.

3. **Shop by Category** (`src/app/shop/[category]/`) - Dynamic category pages using slug-based routing. Dedicated `/shop/lattafa` page for Lattafa brand products.

4. **AI Fragrance Consultant** (`src/components/ai/ChatWidget.tsx`, `src/app/api/ai-assistant/route.ts`) - Chat widget using OpenRouter (defaults to Gemini 2.0 Flash). Searches a separate catalogue dataset (`src/lib/ai/catalogue-data.ts`) for recommendations. Rate-limited via Upstash Redis (10 req/min).

5. **Blog** (`src/app/blog/`, `src/lib/blog.ts`) - Supabase-backed blog CMS with category filtering, pagination, and featured posts. Blog posts have rich SEO: Article + BreadcrumbList structured data, auto-detected FAQPage schema from `<details>` elements, and conditional LocalBusiness schema. Components in `src/components/blog/` include TableOfContents (auto-generated from headings) and ShareButtons.

6. **Contact Form** (`src/app/contact/`, `src/app/api/contact/route.ts`) - React Hook Form + Zod validation with honeypot anti-spam. Sends email via Resend. Rate-limited (3 req/min).

### Shopping Cart & Checkout

- **Cart State**: React Context with `useReducer` in `src/components/cart/CartProvider.tsx`
- **Persistence**: localStorage (`aquador_cart`)
- **Checkout API**: `src/app/api/checkout/route.ts` creates Stripe Checkout Session (5 req/min rate limit)
- **Webhook**: `src/app/api/webhooks/stripe/route.ts` handles `checkout.session.completed` (sends order confirmation email), `checkout.session.expired`, `payment_intent.payment_failed`
- **Currency**: EUR (€) - see `src/lib/currency.ts` for `formatPrice()`, `toCents()`, `CURRENCY_CODE`

### Custom Perfume Builder Payment

- API route: `src/app/api/create-perfume/payment/route.ts`
- Creates Stripe Checkout Session with perfume metadata
- Pricing: 50ml = €29.99, 100ml = €199.00
- Success page: `src/app/create-perfume/success/`

### API Routes

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/admin/setup` | POST | Initial admin user creation |
| `/api/ai-assistant` | POST | AI fragrance consultant (10 req/min) |
| `/api/blog` | GET, POST | List/create blog posts |
| `/api/blog/[slug]` | GET, PUT, DELETE | Individual blog post CRUD |
| `/api/blog/categories` | GET | Blog categories |
| `/api/blog/featured` | GET | Featured blog post |
| `/api/checkout` | POST | Stripe checkout session (5 req/min) |
| `/api/contact` | POST | Contact form email (3 req/min) |
| `/api/create-perfume/payment` | POST | Custom perfume checkout (5 req/min) |
| `/api/health` | GET | Health check (edge runtime) |
| `/api/webhooks/stripe` | POST | Stripe webhook handler |

### Perfume Library (`src/lib/perfume/`)

```
types.ts      - FragranceNote, PerfumeComposition, CustomPerfume interfaces
notes.ts      - fragranceDatabase with all available notes by category
composition.ts - Composition validation helpers
pricing.ts    - Volume-based price calculation
validation.ts - Form validation with Zod
```

### Design System

- **Colors**: Gold (#D4AF37, #FFD700), Dark backgrounds (#0a0a0a, #1a1a1a)
- **Typography**: Playfair Display (headings), Poppins (body) via `next/font/google`
- **CSS**: Tailwind with custom gold/dark palette, animations (shimmer, float, pulse-gold, gradient)
- **Global classes**: `.glass-card` (glassmorphism), `.container-wide`, `.section-sm`/`.section-md`, `.bg-gold-ambient`
- **Animations**: Framer Motion throughout
- **3D Background**: `src/components/ui/animated-shader-background.tsx` - Three.js WebGL shader with gold-themed FBM noise particles. Used on Lattafa and category pages.

### Admin Panel (`src/app/admin/`)

Supabase-backed admin dashboard for products and blog:
- `/admin` - Dashboard overview
- `/admin/products` - Product CRUD (list, create, edit)
- `/admin/categories` - Category management
- `/admin/blog` - Blog post management (list, create, edit)
- `/admin/settings` - Store settings
- `/admin/login` - Authentication (currently disabled for development)

**Auth Status**: Authentication is temporarily disabled with mock user data. Re-enable Supabase auth in `src/app/admin/layout.tsx` before production.

### Supabase Integration (`src/lib/supabase/`)

Database-backed storage (parallel to static product catalog):
- `client.ts` - Browser-side Supabase client
- `server.ts` - Server-side client with cookies
- `types.ts` - Generated TypeScript types from Supabase schema

**Database Tables**:
- `products` - Product catalog with enums for category, type, gender
- `admin_users` - Admin authentication with role-based access (admin, super_admin)
- `blog_posts` - Blog content with slug, status, tags, featured_products, SEO fields
- `blog_categories` - Blog category management

### Type System (`src/types/`)

Two product type systems coexist:
- **Legacy** (`LegacyProduct` in `index.ts`): Used by `src/lib/products.ts` static catalog
- **Variant-based** (`Product` in `product.ts`): Supports multiple variants per product (size, type)
- **Supabase** (`src/lib/supabase/types.ts`): Database schema types for admin panel
- **Cart** (`cart.ts`): Cart items use variant-based pricing

### Product Service Layer (`src/lib/product-service.ts`)

Provides query functions for the static product catalog:
- `getAllProducts()`, `getProductById()`, `getProductBySlug()`
- `getProductsByCategory()`, `getFeaturedProducts()`
- `searchProducts()`, `getRelatedProducts()`

### Shared Utilities (`src/lib/`)

- `rate-limit.ts` - Upstash Redis per-endpoint rate limiters with automatic headers and graceful degradation if Redis not configured
- `api-utils.ts` - `fetchWithTimeout()`, `formatApiError()` (production-safe), `createLogEntry()` (structured logging with request ID)
- `utils.ts` - `cn()` (clsx), `slugify()`
- `stripe.ts` - Stripe singleton instance
- `blog.ts` / `blog-types.ts` - Blog Supabase queries and interfaces

### Middleware (`src/middleware.ts`)

- Protects `/admin/*` routes via Supabase auth (validates against `admin_users` table)
- Adds request ID header for debugging
- Applies to `/api/*` and `/admin/*` routes

### Error Tracking (Sentry)

- `src/instrumentation.ts` registers server/edge Sentry configs
- `sentry.server.config.ts` / `sentry.edge.config.ts` - production-only
- 100% trace sample rate; filters out Stripe signature errors and rate limit errors
- CSP in `next.config.mjs` allows Sentry domains
- Tunnel route: `/monitoring`

### Environment Variables

See `.env.example`:
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` / `STRIPE_SECRET_KEY` - Stripe payment keys
- `STRIPE_WEBHOOK_SECRET` - For production webhooks
- `NEXT_PUBLIC_APP_URL` - App base URL for redirects
- `RESEND_API_KEY` / `CONTACT_EMAIL_TO` - Email service for contact form
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase admin panel
- `SUPABASE_SERVICE_ROLE_KEY` - Admin setup only, keep secret
- `SENTRY_DSN` / `SENTRY_AUTH_TOKEN` - Error tracking
- `UPSTASH_REDIS_*` - Optional rate limiting (gracefully degrades if not set)
- `OPENROUTER_API_KEY` / `AI_MODEL` - AI fragrance consultant (defaults to `google/gemini-2.0-flash-001`)

## Deployment

- **Platform**: Vercel (auto-deploys from `main` branch)
- **Project**: `aquador-next`
- **Production URL**: https://aquadorcy.com (custom domain)
- **Preview URL**: https://aquador-next.vercel.app
- **Node**: v20 (see `.nvmrc`)
- Security headers configured in `next.config.mjs`
- Allowed image domains: unsplash, squarespace, i.ibb.co (formats: avif, webp)

### Testing

- **Unit tests**: `src/**/__tests__/*.test.ts(x)` - Jest with React Testing Library
- **E2E tests**: `e2e/*.spec.ts` - Playwright (chromium, firefox, webkit, mobile chrome, mobile safari)
- **Path alias**: `@/` maps to `src/`
- Playwright auto-starts the dev server; no manual setup needed

## Known Gaps

- **Sitemap**: `src/app/sitemap.ts` includes static routes, product pages, and blog posts (fetched from Supabase).
- **Admin Auth**: Disabled in dev with mock user data. Must re-enable Supabase auth before production.

## Reference Materials

`old-website-pages/` contains archived Squarespace content including the original product CSV export and page content for reference.
