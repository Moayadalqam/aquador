# Roadmap: Aquador Audit Fix Plan

## Project Timeline: 3 Phases
**Approach**: Fix all issues found in the 2026-02-28 comprehensive audit
**Scope**: Security, code quality, and performance fixes

---

## Phase 1: Security Fixes
**Goal**: Eliminate all security vulnerabilities found in audit

### Tasks
1. **XSS Fix in BlogContent**
   - File: `src/components/blog/BlogContent.tsx:11`
   - Add DOMPurify sanitization to `dangerouslySetInnerHTML` (same pattern as `RichDescription.tsx`)

2. **Hardcoded Admin Setup Key**
   - File: `src/app/api/admin/setup/route.ts:19,74`
   - Move `'aquador-setup-2024'` to `ADMIN_SETUP_KEY` environment variable
   - Update `.env.example` with the new variable

3. **Strip PII from Stripe Webhook Logs**
   - File: `src/app/api/webhooks/stripe/route.ts`
   - Lines 121, 259, 305, 371: Remove or sanitize customer emails and payment details from console.log
   - Keep error logging but strip sensitive data

4. **Gitignore Gaps**
   - Add `.env.stripe`, `.env.vercel`, `.env.working`, `.stripe_key` to `.gitignore`

### Exit Criteria
- Zero `dangerouslySetInnerHTML` without sanitization
- No hardcoded secrets in source code
- No PII in production logs
- All sensitive files covered by `.gitignore`

---

## Phase 2: Code Quality Fixes
**Goal**: Fix Supabase client misuse and remove dead code

### Tasks
1. **Fix Admin Supabase Client Imports (13 files)**
   - Replace `import { createClient } from '@/lib/supabase/client'` with `import { createClient } from '@/lib/supabase/server'`
   - Files:
     - `src/components/admin/AdminHeader.tsx`
     - `src/components/admin/AdminShell.tsx`
     - `src/components/admin/ProductForm.tsx`
     - `src/components/admin/ProductsTable.tsx`
     - `src/app/admin/page.tsx`
     - `src/app/admin/login/page.tsx`
     - `src/app/admin/settings/page.tsx`
     - `src/app/admin/products/page.tsx`
     - `src/app/admin/products/[id]/page.tsx`
     - `src/app/admin/categories/page.tsx`
     - `src/app/admin/customers/page.tsx`
     - `src/app/admin/customers/[id]/page.tsx`
     - `src/app/admin/orders/page.tsx`
   - Note: These are client components ('use client'), so they need the browser client. Verify each file before changing — only server components should use server.ts.

2. **Delete Dead Code**
   - Delete `src/app/create/page.tsx` (393 lines, duplicates `/create-perfume`, zero inbound links)

3. **Fix ESLint Warning**
   - `src/components/admin/ProductForm.tsx:408` — replace `<img>` with `next/image` `<Image>`

### Exit Criteria
- All admin components use correct Supabase client for their context
- No dead/unreachable pages
- ESLint passes with 0 warnings

---

## Phase 3: Performance Fixes
**Goal**: Enable caching and optimize bundle size

### Tasks
1. **Enable ISR Caching on Major Pages**
   - `src/app/page.tsx:38` — change `revalidate = 0` to `revalidate = 600` (10 min)
   - `src/app/products/[slug]/page.tsx:12` — change to `revalidate = 3600` (1 hour)
   - `src/app/shop/page.tsx:7` — change to `revalidate = 1800` (30 min)
   - `src/app/shop/[category]/page.tsx:8` — change to `revalidate = 1800` (30 min)
   - `src/app/shop/lattafa/page.tsx:7` — change to `revalidate = 1800` (30 min)

2. **Tree-shake Three.js**
   - File: `src/components/ui/animated-shader-background.tsx:4`
   - Replace `import * as THREE from 'three'` with named imports for only the classes used

3. **Add Cache Headers to Blog API Routes**
   - `src/app/api/blog/route.ts` (GET handler)
   - `src/app/api/blog/[slug]/route.ts` (GET handler)
   - `src/app/api/blog/categories/route.ts` (GET handler)
   - `src/app/api/blog/featured/route.ts` (GET handler)
   - Add `Cache-Control: public, s-maxage=600, stale-while-revalidate=86400`

### Exit Criteria
- No pages with `revalidate = 0` (except admin/checkout)
- Three.js tree-shaken to named imports only
- Blog API routes return cache headers
- `npm run build` still passes clean

---

## Verification Gate (After All Phases)
- `npx tsc --noEmit` — clean
- `npx eslint src/` — 0 errors, 0 warnings
- `npm run build` — passes
- No `revalidate = 0` on public pages
- No `dangerouslySetInnerHTML` without DOMPurify
- No hardcoded secrets
- No PII in logs
