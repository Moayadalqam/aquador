---
date: 2026-05-09 14:50
mode: full
critical: 0
high: 5
medium: 11
low: 4
status: needs_attention
auto_fixed: 13
---

# Optimization Report

**Project:** aquador-next | **Mode:** full | **Date:** 2026-05-09

## Summary

Three-agent parallel audit (frontend / backend / performance) over 180 TypeScript files. 13 issues auto-fixed in this run; 7 remaining require human judgment (architectural refactors or env-policy decisions).

## Auto-Fixed in This Run

| # | Dim | Finding | Location |
|---|-----|---------|----------|
| 1 | FE | Decorative hero video exposed to screen readers | `PremiumHomeExperience.tsx:170` |
| 2 | FE | CartProvider context value not memoized | `CartProvider.tsx:199-217` |
| 3 | FE | CollectionMap nav links missing aria-current | `PremiumHomeExperience.tsx:293` |
| 4 | FE | container-wide stretches edge-to-edge on ultrawide | `globals.css:232` |
| 5 | Perf | priority on below-fold ProductShelf images | `PremiumHomeExperience.tsx:452` |
| 6 | BE | Admin setup leaks Supabase auth error messages | `admin/setup/route.ts:80,97,155` |
| 7 | BE | Live-chat session_secret non-timing-safe compare | `live-chat/{send,notify,session}/route.ts` |
| 8 | BE | Blog API leaks Supabase error messages | `api/blog/route.ts`, `[slug]/route.ts` |
| 9 | BE | Blog pagination off-by-one (page=0 → negative range) | `api/blog/route.ts:14` |
| 10 | BE | Webhook hardcodes custom-perfume prices | `webhooks/stripe/route.ts:404,438` |
| 11 | BE | session-details doesn't filter custom-perfume | `checkout/session-details/route.ts:112` |
| 12 | BE | session-details hardcodes custom-perfume prices | `checkout/session-details/route.ts:142` |
| 13 | Arch | New `lib/crypto-safe.ts` for Node-only timingSafeEqual | `lib/crypto-safe.ts` |

## Deferred — Require Human Judgment

| # | Dim | Finding | Why Deferred |
|---|-----|---------|--------------|
| H1 | FE | `<Link><Button>` invalid `<a><button>` nesting | Cross-cutting refactor, Button-as-anchor pattern needed |
| H2 | BE | Rate limit silently disabled when Upstash absent | Env-policy: fail-closed in prod vs in-memory fallback |
| H3 | Perf | `motion.div` w/ `layout` on every product grid card | UX trade-off |
| H4 | Perf | PremiumHomeExperience monolithic 487-line client component | Multi-file refactor with regression risk |
| M1 | BE | session-details authless (Stripe session_id alone) | HMAC token requires checkout flow change |
| M2 | BE | Webhook doesn't handle `async_payment_succeeded` | Latent (no SEPA/bank methods enabled) |
| M3 | Perf | Trigram GIN index unused by ilike-per-column query | Requires RPC or index reshape |

## Score

`(0×8) + (5×4) + (11×2) + (4×1) = 46. category_score = max(1, 5 − floor(46/8)) = max(1, 5 − 5) = 1` pre-fix. Post-fix (13 resolved → 4 HIGH, 8 MEDIUM, 3 LOW remaining): `35 → score 1`. Lifting score requires addressing one of H1–H4.
