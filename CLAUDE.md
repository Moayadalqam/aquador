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

3. **Shop by Category** (`src/app/shop/[category]/`) - Dynamic category pages using slug-based routing.

### Shopping Cart & Checkout

- **Cart State**: React Context with `useReducer` in `src/components/cart/CartProvider.tsx`
- **Persistence**: localStorage (`aquador_cart`)
- **Checkout API**: `src/app/api/checkout/route.ts` creates Stripe Checkout Session
- **Webhook**: `src/app/api/webhooks/stripe/route.ts` handles payment confirmations
- **Currency**: EUR (€) - see `src/lib/currency.ts` for formatting utilities

### Custom Perfume Builder Payment

- API route: `src/app/api/create-perfume/payment/route.ts`
- Creates Stripe PaymentIntent with perfume metadata
- Pricing: 50ml = €29.99, 100ml = €199.00
- Success page: `src/app/create-perfume/success/`

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
- **Typography**: Playfair Display (headings), Poppins (body)
- **CSS**: Tailwind with custom gold/dark color palette and animations (shimmer, float, pulse-gold)
- **UI Components**: `src/components/ui/Button.tsx`
- **Animations**: Framer Motion throughout

### Admin Panel (`src/app/admin/`)

Supabase-backed admin dashboard for product management:
- `/admin` - Dashboard overview
- `/admin/products` - Product CRUD (list, create, edit)
- `/admin/categories` - Category management
- `/admin/settings` - Store settings
- `/admin/login` - Authentication (currently disabled for development)

**Auth Status**: Authentication is temporarily disabled with mock user data. Re-enable Supabase auth in `src/app/admin/layout.tsx` before production.

### Supabase Integration (`src/lib/supabase/`)

Database-backed product storage (parallel to static catalog):
- `client.ts` - Browser-side Supabase client
- `server.ts` - Server-side client with cookies
- `types.ts` - Generated TypeScript types from Supabase schema

**Database Tables**:
- `products` - Product catalog with enums for category, type, gender
- `admin_users` - Admin authentication with role-based access (admin, super_admin)

### Type System (`src/types/`)

Two product type systems coexist:
- **Legacy** (`LegacyProduct` in `index.ts`): Used by `src/lib/products.ts` static catalog
- **Variant-based** (`Product` in `product.ts`): Supports multiple variants per product (size, type)
- **Supabase** (`src/lib/supabase/types.ts`): Database schema types for admin panel
- **Cart** (`cart.ts`): Cart items use variant-based pricing

### Environment Variables

See `.env.example`:
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` / `STRIPE_SECRET_KEY` - Stripe payment keys
- `STRIPE_WEBHOOK_SECRET` - For production webhooks
- `NEXT_PUBLIC_APP_URL` - App base URL for redirects
- `RESEND_API_KEY` / `CONTACT_EMAIL_TO` - Email service for contact form
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase admin panel
- `SENTRY_DSN` / `SENTRY_AUTH_TOKEN` - Error tracking
- `UPSTASH_REDIS_*` - Optional rate limiting

## Deployment

- **Platform**: Vercel (auto-deploys from `main` branch)
- **Project**: `aquador-next`
- **Production URL**: https://aquadorcy.com (custom domain)
- **Preview URL**: https://aquador-next.vercel.app
- **Node**: v20 (see `.nvmrc`)
- Security headers configured in `next.config.mjs`

### Testing Structure

- **Unit tests**: `src/**/__tests__/*.test.ts(x)` - Jest with React Testing Library
- **E2E tests**: `e2e/*.spec.ts` - Playwright (chromium, firefox, webkit, mobile)
- **Path alias**: `@/` maps to `src/`

## Reference Materials

`old-website-pages/` contains archived Squarespace content including the original product CSV export and page content for reference.
