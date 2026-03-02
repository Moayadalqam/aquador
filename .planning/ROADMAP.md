# Roadmap: Aquad'or Order/Payment System Fix

## Overview

Fix the complete order-to-payment-to-confirmation pipeline for Aquad'or's luxury perfume e-commerce. Three phases address critical security vulnerabilities, broken payment confirmation flows, and UX inconsistencies. Priority is closing security holes in checkout validation, then fixing the broken success page experience, then polishing admin security and messaging consistency.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Checkout Security & Validation** - Close critical security holes in payment flow
- [ ] **Phase 2: Success Pages & Email Reliability** - Fix broken confirmation experience
- [ ] **Phase 3: Admin Security & UX Polish** - Secure admin panel and standardize messaging

## Phase Details

### Phase 1: Checkout Security & Validation
**Goal**: Prevent price manipulation, cart tampering, metadata overflow, and duplicate sessions
**Depends on**: Nothing (first phase)
**Requirements**: SEC-01, SEC-02, SEC-04, PAY-04
**Success Criteria** (what must be TRUE):
  1. Checkout API rejects cart with manipulated prices (validates against product catalog)
  2. Checkout API rejects malformed cart items (Zod validation catches bad data)
  3. Large carts (10+ items) create Stripe sessions without metadata overflow errors
  4. Double-clicking checkout button does not create duplicate Stripe sessions
**Plans**: 2 plans in 1 wave

Plans:
- [ ] 01-01-PLAN.md — Server-side price validation and Zod schema validation
- [ ] 01-02-PLAN.md — Metadata optimization and checkout button protection

### Phase 2: Success Pages & Email Reliability
**Goal**: Customers see order details after payment and receive exactly one confirmation email
**Depends on**: Phase 1
**Requirements**: PAY-01, PAY-02, PAY-03
**Success Criteria** (what must be TRUE):
  1. Custom perfume success page shows order confirmation (not error state) after successful payment
  2. Cart checkout success page displays purchased items, total, and order number
  3. Custom perfume success page displays perfume composition, size, and order number
  4. Customer receives exactly one confirmation email even if Stripe retries webhook
**Plans**: TBD

Plans:
- [ ] 02-01: Fix custom perfume success page detection and enhance both success pages
- [ ] 02-02: Idempotent email sending in webhook

### Phase 3: Admin Security & UX Polish
**Goal**: Secure admin search and standardize all shipping messaging
**Depends on**: Phase 2
**Requirements**: SEC-03, UX-01, UX-02, CQ-01, CQ-02, CQ-03
**Success Criteria** (what must be TRUE):
  1. Admin order search cannot be exploited via PostgREST filter injection
  2. All checkout pages say "Free shipping" (no conditional "over €100" language)
  3. Both checkout flows show identical delivery estimate (3-7 business days)
  4. Codebase has no duplicate `escapeHtml` or shipping countries implementations
**Plans**: TBD

Plans:
- [ ] 03-01: Admin search security and code deduplication
- [ ] 03-02: Shipping messaging standardization

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Checkout Security & Validation | 0/2 | Not started | - |
| 2. Success Pages & Email Reliability | 0/2 | Not started | - |
| 3. Admin Security & UX Polish | 0/2 | Not started | - |
