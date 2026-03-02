# Aquad'or Order/Payment System Fix

## What This Is

A luxury perfume e-commerce site (Next.js 14, Stripe, Supabase, Resend) with a fully secured and reliable order-to-payment-to-confirmation pipeline. Two checkout flows (cart and custom perfume) converge at a single Stripe webhook for order persistence and email delivery.

## Core Value

A customer completes a purchase and knows it worked — they see their order details on screen, receive a confirmation email, and the store is notified. No silent failures, no misleading messages, no security holes.

## Requirements

### Validated

- ✓ Cart state management with localStorage persistence — existing
- ✓ Stripe Checkout Session creation for cart items — existing
- ✓ Stripe Checkout Session creation for custom perfumes — existing
- ✓ Stripe webhook signature verification — existing
- ✓ Order persistence to Supabase (orders + customers tables) — existing
- ✓ Customer confirmation email via Resend — existing
- ✓ Store notification email via Resend — existing
- ✓ Admin panel order management — existing
- ✓ Rate limiting on checkout/payment endpoints — existing
- ✓ Sentry error tracking on payment failures — existing
- ✓ Server-side price validation against product catalog — v1.0
- ✓ Zod schema validation on checkout cart items — v1.0
- ✓ Stripe metadata under 500-char limit (shortened keys) — v1.0
- ✓ Duplicate checkout session prevention (isProcessing + AbortController) — v1.0
- ✓ Custom perfume success page detects payment correctly — v1.0
- ✓ Both success pages display order details from Stripe session — v1.0
- ✓ Idempotent email sending (database-based dedup) — v1.0
- ✓ Webhook reconstructs full item data from shortened metadata — v1.0
- ✓ Admin search secured against SQL filter injection — v1.0
- ✓ Unconditional free shipping messaging — v1.0
- ✓ Consistent 3-7 business day delivery estimates — v1.0
- ✓ Centralized escapeHtml and SHIPPING_COUNTRIES utilities — v1.0

### Active

(None — next milestone requirements TBD)

### Out of Scope

- Full order tracking page for customers — future enhancement
- Conditional shipping pricing — decided to keep all shipping free
- Checkout UX redesign — current flow works
- Mobile app checkout — web only
- CSRF token on checkout — low risk, rate limit sufficient

## Context

**Codebase:** Next.js 14 App Router, React 18, TypeScript, Supabase (ref: hznpuxplqgszbacxzbhv), Stripe, Resend, Vercel deployment.

**Current state (post-v1.0):** 30 files modified, 3,209 lines added. Checkout pipeline fully secured with server-side validation, success pages display order details, emails are idempotent, and webhook correctly handles both metadata formats.

**Two checkout flows:**
1. **Cart checkout** — `/api/checkout` → Stripe Checkout Session → `/checkout/success`
2. **Custom perfume checkout** — `/api/create-perfume/payment` → Stripe Checkout Session → `/create-perfume/success`

Both converge at `/api/webhooks/stripe` which persists orders and sends emails.

**Key files:**
- `src/app/api/checkout/route.ts` — cart checkout with Zod validation and price verification
- `src/app/api/checkout/session-details/route.ts` — session data API for success pages
- `src/app/api/create-perfume/payment/route.ts` — custom perfume checkout
- `src/app/api/webhooks/stripe/route.ts` — webhook (order persistence + idempotent emails + metadata reconstruction)
- `src/lib/validation/cart.ts` — Zod schemas and price validation
- `src/lib/product-service.ts` — product catalog queries
- `src/lib/utils.ts` — shared utilities (escapeHtml)
- `src/lib/constants.ts` — shared constants (SHIPPING_COUNTRIES)

## Constraints

- **Tech stack**: Next.js 14, Stripe, Supabase, Resend — no new dependencies
- **Backward compatible**: Existing Stripe webhook secret and checkout flow must keep working
- **No downtime**: Changes must be deployable without breaking live orders
- **Supabase schema**: Orders and customers tables already exist

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Server-side price validation against product catalog | Client-sent prices cannot be trusted — core e-commerce security | ✓ Good |
| Standardize shipping as always free | Simplifies messaging, matches current behavior | ✓ Good |
| Enhance success pages with Stripe session data | Customers deserve to see what they ordered | ✓ Good |
| Use order record to gate email sending | Prevents duplicate emails on webhook retries | ✓ Good |
| Shortened metadata keys (pid/vid/qty) | Stay under Stripe 500-char limit on large carts | ✓ Good |
| Session-based order confirmation | Stripe session is single source of truth for success pages | ✓ Good |
| Order number = last 8 chars of session ID | Simple, unique, no extra DB column needed | ✓ Good |
| Database-based email idempotency | upsert ignoreDuplicates returns isNewOrder flag | ✓ Good |
| Centralize shared utilities | Eliminate code duplication across webhook and routes | ✓ Good |
| Webhook metadata reconstruction | Parse shortened format and rebuild from product catalog | ✓ Good |

---
*Last updated: 2026-03-02 after v1.0 milestone*
