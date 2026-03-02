# Requirements: Aquad'or Security Audit Remediation

**Defined:** 2026-03-02
**Core Value:** A customer completes a purchase and knows it worked — no silent failures, no security holes.

## v1.1 Requirements

Requirements for security audit remediation. Each maps to roadmap phases.

### Security (SEC)

- [ ] **SEC-01**: All Supabase tables have RLS enabled with appropriate read/write policies (products, orders, customers, blog_posts, admin_users)
- [ ] **SEC-02**: Sentry configs set sendDefaultPii: false — no customer IPs, emails, or cookies sent to third party (GDPR)
- [ ] **SEC-03**: Admin product search escapes user input before ilike() query (matching public search pattern)
- [ ] **SEC-04**: Admin login validates redirect param against allowlist — no open redirect via crafted URLs
- [ ] **SEC-05**: Permissions-Policy header locks down browser APIs (camera, microphone, geolocation)
- [ ] **SEC-06**: CSP tightened — remove unsafe-eval, restrict unsafe-inline where possible
- [ ] **SEC-07**: CSP media-src restricted from wildcard https: to specific domains

### Testing (TEST)

- [ ] **TEST-01**: Stripe webhook route has 10+ test cases covering happy path, duplicate events, malformed payloads, and failure scenarios
- [ ] **TEST-02**: API route test coverage expanded from 2/14 to at least 8/14 (payment, AI assistant, blog CRUD, health)
- [ ] **TEST-03**: CartIcon test fixed (data-testid mismatch)

### Architecture (ARCH)

- [ ] **ARCH-01**: Product type system unified — LegacyProduct deprecated, all shop pages use Supabase Product type
- [ ] **ARCH-02**: AI catalogue generated from Supabase at build time or queried on-demand (no static 354-product hardcoded file)
- [ ] **ARCH-03**: Real React error boundary replaces current AbortError suppressor — component crashes show fallback UI
- [ ] **ARCH-04**: Cart localStorage loading validates item shape with Zod — malformed data cleared instead of crashing
- [ ] **ARCH-05**: Cart hydration race condition fixed — consistent state between server render and client hydration
- [ ] **ARCH-06**: API error handling consistent — admin/setup and other routes return structured errors, not raw exceptions

### Performance (PERF)

- [ ] **PERF-01**: Database indexes added for products (category, slug, featured), blog_posts (status, slug, category), orders (created_at, customer)
- [ ] **PERF-02**: Blog functions use public.ts client for read-only queries — enables static/ISR rendering
- [ ] **PERF-03**: getRelatedProducts() consolidated to single query — no N+1
- [ ] **PERF-04**: Frequently accessed data (featured products, categories) cached with unstable_cache or revalidation
- [ ] **PERF-05**: Admin dashboard queries consolidated — reduce from 10 parallel to batched/aggregated
- [ ] **PERF-06**: Product queries use explicit column selection instead of select('*')

### Production (PROD)

- [ ] **PROD-01**: Sentry tracesSampleRate reduced from 1.0 to 0.1 in production
- [ ] **PROD-02**: Preconnect hints added for Supabase and Stripe domains in layout.tsx
- [ ] **PROD-03**: Form accessibility — all inputs have associated labels, icon buttons have aria-labels

### Cleanup (CLEAN)

- [ ] **CLEAN-01**: Three.js removed from dependencies (~600KB savings)
- [ ] **CLEAN-02**: Legacy Stripe export dead code removed from src/lib/stripe.ts
- [ ] **CLEAN-03**: Category definitions consolidated (currently in categories.ts, DB enum, and DB table)
- [ ] **CLEAN-04**: Magic numbers extracted to named constants in ProductForm, CartProvider, validation files

## v2 Requirements

Deferred — tracked but not in current roadmap.

- **PERF-07**: Framer Motion tree-shaking or lazy loading (53 files, ~330KB) — requires broad refactoring
- **ARCH-07**: Long file decomposition (reorder 610, ProductForm 568, categories 549, webhook 512) — low risk, future cleanup
- **PERF-08**: AI assistant catalogue loading optimized (32KB per request) — addressed partially by ARCH-02

## Out of Scope

| Feature | Reason |
|---------|--------|
| Full CSP nonce-based approach | Requires Next.js middleware changes, high complexity for marginal gain |
| Framer Motion replacement | 53 files affected, too broad for security-focused milestone |
| Admin dashboard redesign | Functional issues only, not UX overhaul |
| Webhook refactoring (512 lines) | Working correctly, test coverage more important than refactoring |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| SEC-01 | Phase 8 | Pending |
| SEC-02 | Phase 8 | Pending |
| SEC-03 | Phase 8 | Pending |
| SEC-04 | Phase 8 | Pending |
| SEC-05 | Phase 8 | Pending |
| SEC-06 | Phase 8 | Pending |
| SEC-07 | Phase 8 | Pending |
| TEST-01 | Phase 8 | Pending |
| TEST-02 | Phase 8 | Pending |
| TEST-03 | Phase 9 | Pending |
| ARCH-01 | Phase 8 | Pending |
| ARCH-02 | Phase 8 | Pending |
| ARCH-03 | Phase 8 | Pending |
| ARCH-04 | Phase 8 | Pending |
| ARCH-05 | Phase 9 | Pending |
| ARCH-06 | Phase 9 | Pending |
| PERF-01 | Phase 9 | Pending |
| PERF-02 | Phase 9 | Pending |
| PERF-03 | Phase 9 | Pending |
| PERF-04 | Phase 9 | Pending |
| PERF-05 | Phase 9 | Pending |
| PERF-06 | Phase 9 | Pending |
| PROD-01 | Phase 8 | Pending |
| PROD-02 | Phase 9 | Pending |
| PROD-03 | Phase 9 | Pending |
| CLEAN-01 | Phase 9 | Pending |
| CLEAN-02 | Phase 9 | Pending |
| CLEAN-03 | Phase 9 | Pending |
| CLEAN-04 | Phase 9 | Pending |

**Coverage:**
- v1.1 requirements: 29 total
- Mapped to phases: 29
- Unmapped: 0

---
*Requirements defined: 2026-03-02*
*Last updated: 2026-03-02 after audit analysis*
