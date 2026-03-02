# Roadmap: Aquad'or Security Audit Remediation

## Milestones

- ✅ **v1.0 Order/Payment System Fix** - Phases 1-4 (shipped 2026-03-01)
- ✅ **v1.1 Security Audit Remediation** - Phases 8-9 (code complete 2026-03-03, pending Supabase migration deploy)

## Phases

<details>
<summary>✅ v1.0 Order/Payment System Fix (Phases 1-4) - SHIPPED 2026-03-01</summary>

### Phase 1: Foundation
**Goal**: Set up project structure and core checkout API
**Plans**: 2 plans

Plans:
- [x] 01-01: Core checkout API implementation
- [x] 01-02: Stripe webhook event handling

### Phase 2: Payment Processing
**Goal**: Secure payment flow with validation and error handling
**Plans**: 2 plans

Plans:
- [x] 02-01: Server-side price validation
- [x] 02-02: Custom perfume payment flow

### Phase 3: Order Confirmation
**Goal**: Reliable order confirmation with email delivery
**Plans**: 2 plans

Plans:
- [x] 03-01: Success page enhancement
- [x] 03-02: Email notification system

### Phase 4: Security Hardening
**Goal**: Production-ready security measures
**Plans**: 1 plan

Plans:
- [x] 04-01: Security audit fixes

</details>

### ✅ v1.1 Security Audit Remediation (Code Complete)

**Milestone Goal:** Eliminate all CRITICAL and HIGH security vulnerabilities, optimize database performance, and prepare for production scale.

#### Phase 8: Security & Data Integrity

**Goal**: Eliminate all CRITICAL and HIGH security vulnerabilities, fix GDPR compliance, and add critical test coverage

**Depends on**: Phase 4

**Requirements**: SEC-01, SEC-02, SEC-03, SEC-04, SEC-05, SEC-06, SEC-07, TEST-01, TEST-02, ARCH-01, ARCH-02, ARCH-03, ARCH-04, PROD-01 (14 requirements)

**Success Criteria** (what must be TRUE):
  1. All Supabase tables enforce Row Level Security — anonymous users cannot read orders, customers, admin data
  2. Sentry respects GDPR — no customer PII (IPs, emails, cookies) sent to third-party monitoring
  3. Admin surfaces are attack-resistant — SQL injection via search and open redirect via login both fail
  4. Stripe webhook handles edge cases gracefully — duplicate events, malformed payloads, and failures do not crash or leak data
  5. Type system is unified — shop pages use consistent Supabase Product types, no legacy type confusion

**Plans**: 9 plans in 3 waves

**Wave Structure:**
- Wave 1 (parallel): Plans 01-04 — Database security, Sentry config, admin hardening, headers
- Wave 2 (parallel): Plans 05-07 — Webhook tests, type unification, error boundaries
- Wave 3 (parallel): Plans 08-09 — AI catalogue generation, API test expansion

Plans:
- [x] 08-01-PLAN.md — Enable RLS on all Supabase tables with appropriate policies
- [x] 08-02-PLAN.md — Configure Sentry for GDPR compliance and optimize trace sampling
- [x] 08-03-PLAN.md — Fix SQL injection and open redirect in admin panel
- [x] 08-04-PLAN.md — Tighten CSP and add Permissions-Policy header
- [x] 08-05-PLAN.md — Create comprehensive Stripe webhook test suite (TDD)
- [x] 08-06-PLAN.md — Unify product type system across shop pages
- [x] 08-07-PLAN.md — Replace fake error boundary and add cart validation
- [x] 08-08-PLAN.md — Generate AI catalogue from Supabase at build time
- [x] 08-09-PLAN.md — Expand API test coverage (6/14 routes, AI assistant skipped)

#### Phase 9: Performance & Polish

**Goal**: Optimize database performance, fix rendering issues, and clean up technical debt

**Depends on**: Phase 8

**Requirements**: TEST-03, ARCH-05, ARCH-06, PERF-01, PERF-02, PERF-03, PERF-04, PERF-05, PERF-06, PROD-02, PROD-03, CLEAN-01, CLEAN-02, CLEAN-03, CLEAN-04 (15 requirements)

**Success Criteria** (what must be TRUE):
  1. Database queries are indexed — category browsing, blog loading, and order lookups respond in <200ms
  2. Blog pages are statically rendered — no forced dynamic rendering, proper ISR/caching in place
  3. Shopping cart renders consistently — no hydration mismatches or loading flicker on page load
  4. Admin dashboard is responsive — consolidated queries reduce parallel requests from 10 to <5
  5. Bundle is leaner — Three.js removed saves ~600KB, dead code eliminated

**Plans**: 6 plans in 1 wave (all parallel)

**Wave Structure:**
- Wave 1 (parallel): All plans — Database indexes, blog ISR, cart hydration, query optimization, cleanup, accessibility

Plans:
- [x] 09-01-PLAN.md — Add database indexes for <200ms query performance
- [x] 09-02-PLAN.md — Blog ISR optimization + admin query consolidation
- [x] 09-03-PLAN.md — Fix cart hydration race + CartIcon test
- [x] 09-04-PLAN.md — Optimize product queries (N+1 + column selection)
- [x] 09-05-PLAN.md — Remove Three.js + dead code + category consolidation
- [x] 09-06-PLAN.md — Accessibility improvements + magic number extraction

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 8 → 9

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation | v1.0 | 2/2 | Complete | 2026-02-28 |
| 2. Payment Processing | v1.0 | 2/2 | Complete | 2026-02-28 |
| 3. Order Confirmation | v1.0 | 2/2 | Complete | 2026-03-01 |
| 4. Security Hardening | v1.0 | 1/1 | Complete | 2026-03-01 |
| 8. Security & Data Integrity | v1.1 | 9/9 | Complete | 2026-03-03 |
| 9. Performance & Polish | v1.1 | 6/6 | Complete | 2026-03-03 |

---
*Last updated: 2026-03-03 — Phase 9 complete (6/6 plans, 22 commits). v1.1 milestone code complete.*
