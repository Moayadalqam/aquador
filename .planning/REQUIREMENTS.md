# Requirements: Aquad'or Order/Payment System Fix

**Defined:** 2026-03-02
**Core Value:** A customer completes a purchase and knows it worked — order details on screen, confirmation email received, store notified. No silent failures.

## v1 Requirements

### Security

- [ ] **SEC-01**: Checkout API validates item prices server-side against product catalog before creating Stripe session
- [ ] **SEC-02**: Checkout API validates cart items with Zod schema (types, bounds, required fields)
- [ ] **SEC-03**: Admin order search uses parameterized filtering instead of string interpolation
- [ ] **SEC-04**: Stripe metadata stays under 500-char limit by storing only essential item data (product IDs + quantities)

### Payment Flow

- [ ] **PAY-01**: Custom perfume success page correctly detects successful payment via `session_id` parameter
- [ ] **PAY-02**: Both success pages fetch and display order details (items, total, order number) from Stripe session
- [ ] **PAY-03**: Webhook checks if order already exists before sending emails (idempotent email sending)
- [ ] **PAY-04**: Checkout button prevents duplicate session creation during redirect

### UX Consistency

- [ ] **UX-01**: All shipping messaging says "Free shipping" without conditional "over €100" language
- [ ] **UX-02**: Shipping delivery estimates consistent across both checkout flows (3-7 business days)

### Code Quality

- [ ] **CQ-01**: Extract shared `escapeHtml` to `src/lib/utils.ts`
- [ ] **CQ-02**: Extract shared shipping countries list to `src/lib/constants.ts`
- [ ] **CQ-03**: Remove unused `Fragment` import from CartDrawer

## v2 Requirements

### Order Experience

- **ORD-01**: Customer can look up order status by email + order reference
- **ORD-02**: Shipping status email sent when admin marks order as shipped
- **ORD-03**: Order confirmation page persists (accessible via emailed link)

### Admin

- **ADM-01**: Admin order status changes use server-side Supabase client with proper auth
- **ADM-02**: Clear cart button requires confirmation dialog

## Out of Scope

| Feature | Reason |
|---------|--------|
| Conditional shipping pricing | Decided to keep all shipping free — simplifies messaging |
| Checkout UX redesign | Current flow works, just fixing bugs |
| New payment methods | Stripe handles this already |
| Mobile app checkout | Web only for this milestone |
| CSRF token on checkout | Low risk (creates Stripe session, not DB state change), rate limit sufficient |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| SEC-01 | Phase 1 | Pending |
| SEC-02 | Phase 1 | Pending |
| SEC-03 | Phase 3 | Pending |
| SEC-04 | Phase 1 | Pending |
| PAY-01 | Phase 2 | Pending |
| PAY-02 | Phase 2 | Pending |
| PAY-03 | Phase 2 | Pending |
| PAY-04 | Phase 1 | Pending |
| UX-01 | Phase 3 | Pending |
| UX-02 | Phase 3 | Pending |
| CQ-01 | Phase 3 | Pending |
| CQ-02 | Phase 3 | Pending |
| CQ-03 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 13 total
- Mapped to phases: 13
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-02*
*Last updated: 2026-03-02 after roadmap creation*
