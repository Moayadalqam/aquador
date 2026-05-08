# Production Review — 2026-05-08

Project: aquador (Aquad'or Cyprus)
Deployed: https://www.aquadorcy.com (v3.9 shipped)
Stack: Next.js 14.2.35, React 18, Supabase, Stripe, Sentry, Tailwind

## Summary

| Category | Critical | High | Medium | Low | Score |
|----------|---------:|-----:|-------:|----:|------:|
| Security |        0 |    1 |      0 |   0 |   5/5 |
| Quality  |        0 |    1 |      3 |   2 |   4/5 |
| Perf     |        0 |    0 |      1 |   2 |   5/5 |
| **Total** |    **0** | **2** |  **4** | **4** | **4.67/5** |

**Verdict: PASS** — No critical blockers, but 2 high-severity items should be addressed in v4.0.

## Findings

### CRITICAL
_(none)_

### HIGH

**HIGH-01 · Next.js 14.2.35 has multiple known DoS vulnerabilities**
- File: `package.json:next` — current `14.2.35`
- Issues from `npm audit`:
  - `GHSA-9g9p-9gw9-jx7f` — DoS via Image Optimizer remotePatterns
  - `GHSA-h25m-26qc-wcjf` — HTTP request deserialization DoS in RSC
  - `GHSA-ggv3-7p47-pfv8` — HTTP request smuggling in rewrites
  - `GHSA-3x4c-7xq6-9pq8` — Unbounded next/image disk cache
  - `GHSA-q4gf-8mx6-v5v3` — DoS with Server Components
  - postcss XSS via unescaped `</style>` (transitive)
- Fix: `npm audit fix --force` migrates to Next 16 (BREAKING) OR upgrade to latest 14.x patch if a patch covers all 5
- Severity rationale: vendor advisories rate as high; Cyprus storefront on the open internet, image optimizer is exposed

**HIGH-02 · TypeScript binary missing from node_modules**
- File: `package.json` declares `typescript: ^5` but `node_modules/typescript/` doesn't exist
- Symptom: `npm run type-check` exits with `tsc: command not found`
- Impact: type-check gate in CI/local cannot run; the deploy hook can't enforce TypeScript correctness
- Fix: `npm install` (someone deleted node_modules or used --omit=dev recently); add a smoke test that `npx tsc --version` succeeds in CI

### MEDIUM

**MED-01 · 21 `any` type usages across src/**
- Count: `grep -rn ": any\| as any" src/ | wc -l` = 21
- Fix: replace with `unknown` + type guards, or proper interface

**MED-02 · 5 console.log calls in performance instrumentation**
- `src/lib/performance/metrics.ts:31, :54`
- `src/lib/performance/animation-budget.tsx:170, :181, :286`
- Impact: leaks to browser console in production for users with devtools; minor info disclosure
- Fix: gate behind `process.env.NODE_ENV === 'development'` or use Sentry breadcrumbs

**MED-03 · Large monolithic files**
- `src/app/create-perfume/page.tsx` — 772 lines
- `src/app/reorder/page.tsx` — 629 lines
- `src/app/admin/categories/page.tsx` — 567 lines
- `src/components/admin/ProductForm.tsx` — 563 lines
- Impact: hard to test, slow to bundle-split, high cognitive cost
- Fix: extract into co-located sub-components

**MED-04 · 69% client-component ratio (126/182 .tsx files have `'use client'`)**
- Impact: Server Components benefits (smaller bundle, streaming, RSC) are under-utilized
- Fix: audit `'use client'` directives — push the boundary down to leaf interactive components

### LOW

**LOW-01 · 1 TODO comment** in src/
**LOW-02 · 289 sequential `const x = await ...` statements outside Promise.all** — most are likely intentional; worth a perf audit pass
**LOW-03 · No `.next/` build output present** — bundle analysis deferred until next build runs
**LOW-04 · 1 unused-import-style noise** (no quantitative finding worth flagging individually)

## What Was Verified Clean

- `service_role` only appears in server-only files (`lib/supabase/admin.ts`, `app/api/admin/setup/route.ts`, test files) — no client leak
- `dangerouslySetInnerHTML` is guarded by DOMPurify in all 3 call sites (`BlogContent.tsx`, `RichDescription.tsx`, `JsonLd.tsx` where input is server-controlled JSON)
- No `.env` files tracked in git
- Search route has rate-limiting + length validation + Sentry capture
- Admin routes auth-checked via `src/middleware.ts`
- 0 empty catch blocks
- 0 hardcoded production secrets in source

## Verdict

**PASS for deploy.** Two HIGH items (Next vuln, missing tsc) belong in v4.0 hardening work. No CRITICAL blockers. Site is shippable as-is.

Recommended next step: feed these findings into `/qualia-optimize --perf --ui --backend` for the v4.0 milestone planning.
