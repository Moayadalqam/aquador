# Aquad'or Order/Payment System Fix

## What This Is

A systematic fix of the entire Aquad'or e-commerce order-to-payment-to-confirmation pipeline. Aquad'or is a luxury perfume e-commerce site (Next.js 14, Stripe, Supabase, Resend) serving customers in Cyprus and Europe. The ordering system has critical bugs, security gaps, and UX issues discovered during a thorough code review.

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

### Active

- [ ] Fix custom perfume success page (always shows error state)
- [ ] Server-side price validation on checkout (prevent price manipulation)
- [ ] Webhook email idempotency (prevent duplicate emails on Stripe retries)
- [ ] Enhanced success pages with order details from Stripe session
- [ ] Standardize shipping messaging (always free, remove conditional language)
- [ ] Fix Stripe metadata size limit risk on large carts
- [ ] Input validation with Zod on checkout API route
- [ ] Sanitize admin order search to prevent PostgREST filter injection
- [ ] Protect against duplicate checkout session creation (double-click)
- [ ] Deduplicate shared code (escapeHtml, shipping countries)
- [ ] Remove unused imports (Fragment in CartDrawer)

### Out of Scope

- Full order tracking page for customers — future enhancement, not this milestone
- Conditional shipping pricing (paid under €100) — decided to keep all shipping free
- Redesign of checkout UX — current flow works, just fixing bugs
- Mobile app checkout — web only
- Adding new payment methods — Stripe handles this already

## Context

**Codebase:** Next.js 14 App Router, React 18, TypeScript, Supabase (ref: hznpuxplqgszbacxzbhv), Stripe, Resend, Vercel deployment.

**Two checkout flows exist:**
1. **Cart checkout** — `/api/checkout` → Stripe Checkout Session → `/checkout/success`
2. **Custom perfume checkout** — `/api/create-perfume/payment` → Stripe Checkout Session → `/create-perfume/success`

Both flows converge at the same Stripe webhook (`/api/webhooks/stripe`) which handles order persistence and email sending, differentiating by metadata (`items` vs `productType: custom-perfume`).

**Key files:**
- `src/app/api/checkout/route.ts` — cart checkout API
- `src/app/api/create-perfume/payment/route.ts` — custom perfume checkout API
- `src/app/api/webhooks/stripe/route.ts` — webhook handler (persist + email)
- `src/app/checkout/success/page.tsx` — cart success page
- `src/app/create-perfume/success/success-content.tsx` — custom perfume success page (BROKEN)
- `src/components/cart/CartProvider.tsx` — cart state
- `src/components/cart/CheckoutButton.tsx` — checkout trigger
- `src/lib/stripe.ts` — Stripe singleton
- `src/lib/currency.ts` — EUR formatting
- `src/lib/rate-limit.ts` — Upstash rate limiting

**Review findings (20 issues):**
- 3 CRITICAL: broken success page, metadata size limit, no price validation
- 6 HIGH: duplicate emails, shipping inconsistency, SQL filter injection, admin client-side updates
- 5 MEDIUM: no order details on success, session not verified, double-click risk
- 5 LOW: code duplication, unused imports, hardcoded values

## Constraints

- **Tech stack**: Next.js 14, Stripe, Supabase, Resend — no new dependencies
- **Backward compatible**: Existing Stripe webhook secret and checkout flow must keep working
- **No downtime**: Changes must be deployable without breaking live orders
- **Supabase schema**: Orders and customers tables already exist — migrations only if needed
- **Feature branch**: All work on a feature branch, not main

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Standardize shipping as always free | Simplifies messaging, matches current behavior (€0 shipping for all orders) | — Pending |
| Enhance success pages with Stripe session data | Customers deserve to see what they ordered after paying | — Pending |
| Server-side price validation against product catalog | Client-sent prices cannot be trusted — core e-commerce security | — Pending |
| Use order record to gate email sending | Prevents duplicate emails on webhook retries | — Pending |

---
*Last updated: 2026-03-02 after initialization*
