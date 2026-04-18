# Production Review — 2026-04-18

## Summary
| Category | Critical | High | Medium | Low | Score |
|----------|----------|------|--------|-----|-------|
| Security | 0 | 2 | 3 | 0 | 3/5 |
| Quality  | 0 | 0 | 2 | 2 | 4/5 |
| Perf     | 0 | 1 | 2 | 1 | 4/5 |
| **Total** | 0 | 3 | 7 | 3 | **3.7/5** |

## Findings

### CRITICAL
_(none — no service_role in client, no hardcoded secrets, no tracked .env, no eval())_

### HIGH
- **Next.js DoS advisory (GHSA-9g9p-9gw9-jx7f)** — `package.json` — Current Next.js (14.2.35) falls in the vulnerable 9.5.0–15.5.14 range for Image Optimizer remotePatterns DoS. Fix: `npm audit fix --force` or bump to `next@15.5.15+`. Verify SSR/ISR after the bump.
- **flatted high-severity transitive (GHSA-25h7-pfq9-p65f / GHSA-rf6f-7fwh-wjgh)** — prototype pollution + unbounded recursion. Fix: `npm audit fix` (non-breaking).
- **Bundle-heavy routes** — `/products/[slug]` 221 kB First Load, `/create-perfume` 196 kB, `create-perfume/page.tsx` is 772 LOC, 72% of TSX files are client components. Fix: move page shells to Server Components, keep client islands narrow, parallelize awaits with `Promise.all`.

### MEDIUM
- **11 API routes without auth checks** — `src/app/api/{ai-assistant,blog/categories,blog/featured,checkout,checkout/session-details,contact,create-perfume/payment,health,heartbeat,live-chat/notify,search}/route.ts`. Most are intentionally public; confirm `checkout/session-details` does not leak PII when called with a stranger's session ID. Fix: verify ownership or strip customer data before returning.
- **Admin panel does 24 client-side Supabase mutations** — `src/app/admin/live-chat/page.tsx`, `src/app/admin/orders/page.tsx`, `src/components/admin/ProductsTable.tsx`. Only safe if RLS on `orders`, `live_chat_*`, `products` restricts writes to admins. Fix: audit `supabase/migrations/` for `auth.uid() IN (SELECT user_id FROM admin_users)` guards.
- **dompurify moderate advisories** (5 CVEs, GHSA-h8r8-wccr-v5f2 et al.) used by `RichDescription.tsx`, `BlogContent.tsx`. Fix: `npm audit fix` to 3.3.4+.
- **21 `any`/`as any` casts** across `src/` — type holes. Fix: grep and replace with Supabase generic types or Stripe event types.
- **128/178 TSX files use `'use client'` (72%)** — bundle bloat. Fix: extract client islands from top-level pages, especially `create-perfume/page.tsx`.

### LOW
- **1 TODO/FIXME** — resolve or convert to issue.
- **5 `console.log` calls in production code** — replace with structured logger from `src/lib/api-utils.ts`.
- **Large files (>500 LOC)** — `create-perfume/page.tsx:772`, `reorder/page.tsx:629`, `admin/categories/page.tsx:566`, `ProductForm.tsx:562`, `webhooks/stripe/route.ts:517`. Split once active phase work settles.

## Notes (worth preserving)
- Zero TypeScript errors (`tsc --noEmit` clean).
- All three `dangerouslySetInnerHTML` sites are guarded: `JsonLd.tsx` escapes `<`, `RichDescription.tsx` + `BlogContent.tsx` run `DOMPurify.sanitize`.
- No service_role in client, no hardcoded secrets, no tracked `.env`, no `eval()`, no empty catch blocks.
- Checkout route has Zod + server-side price validation (`validateCartPrices`) + rate limiting.
- Middleware enforces admin auth via `admin_users` table lookup on `/admin/*`.

## Verdict
**PASS with advisories** — No critical blockers. 3 HIGH findings should be cleared before the next `/qualia-ship`; the Next.js CVE is the priority.

### Recommended next steps
1. `npm audit fix` — resolves flatted, dompurify, brace-expansion (non-breaking).
2. Bump Next.js to 15.5.15+ on a dedicated branch, run `npm run test:all`, verify `/products/[slug]` ISR.
3. Verify RLS on `orders`, `live_chat_*`, `products` via Supabase MCP.
4. Audit `/api/checkout/session-details` for PII leakage on foreign session IDs.
