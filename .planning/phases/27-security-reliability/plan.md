---
phase: 27
goal: "Fix 12 security and reliability findings from OPTIMIZE.md — close checkout hole, seal draft leak, add RLS/rate-limits/revalidation/timeouts/logging, harden CSP and cache headers"
tasks: 12
waves: 3
---

# Phase 27: Security + Reliability Hardening

Goal: Every finding numbered 1-4, 5, 6, 8-9, 10-12 from `.planning/OPTIMIZE.md` is resolved. No deactivated product can be purchased, no draft post leaks, all mutation endpoints revalidate cache, all API routes log to Sentry, live-chat tables have RLS, and CSP/cache headers are correct.

## Task 1 -- CRITICAL: Block checkout of deactivated products
**Wave:** 1
**Files:** `src/lib/validation/cart.ts`
**Action:**
In `validateCartPrices()`, immediately after `const product = productMap.get(item.productId);` and the not-found check (line 70-78), add an `is_active` guard:

```typescript
// Reject deactivated products — they must not be purchasable
if (product.is_active === false) {
  errors.push({
    productId: item.productId,
    reason: `Product "${product.name}" is no longer available`,
  });
  continue;
}
```

Insert this between line 78 and line 80 (before the `AQUADOR_CATEGORIES` check). Do NOT modify `getProductsByIds` in `product-service.ts` -- the webhook legitimately needs to look up inactive products for order reconstruction.

**Context:** Read `@src/lib/validation/cart.ts`, `@src/lib/supabase/product-service.ts`
**Done when:** `validateCartPrices` rejects items where `product.is_active === false` with a clear error message. The `getProductsByIds` function remains unchanged.

---

## Task 2 -- CRITICAL: Seal draft blog post leak on GET /api/blog/[slug]
**Wave:** 1
**Files:** `src/app/api/blog/[slug]/route.ts`
**Action:**
Rewrite the `GET` handler (lines 23-51). After creating the Supabase client (line 29), add an auth check following the pattern from `src/app/api/blog/route.ts` lines 39-56:

1. Attempt `supabase.auth.getUser()`.
2. If user exists, check `admin_users` table for their ID.
3. If admin: query without status filter (allow drafts).
4. If NOT admin (or anon): add `.eq('status', 'published')` to the query.

Replace lines 31-35 with:

```typescript
const { data: { user } } = await supabase.auth.getUser();
let isAdmin = false;
if (user) {
  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('id')
    .eq('id', user.id)
    .single();
  isAdmin = !!adminUser;
}

let query = supabase
  .from('blog_posts')
  .select('*')
  .eq('slug', slug);

if (!isAdmin) {
  query = query.eq('status', 'published');
}

const { data, error } = await query.single();
```

Keep the existing 404 and error handling below unchanged. Keep the Cache-Control header for published posts only -- wrap the cache header set in `if (!isAdmin)`.

**Context:** Read `@src/app/api/blog/[slug]/route.ts`, `@src/app/api/blog/route.ts` (lines 38-56 for the admin-check pattern)
**Done when:** Anonymous GET of a draft slug returns 404. Authenticated admin GET of a draft slug returns the post. Published posts remain accessible to everyone.

---

## Task 3 -- Rate-limit /api/admin/setup
**Wave:** 1
**Files:** `src/app/api/admin/setup/route.ts`
**Action:**
1. Add imports at top of file:
   ```typescript
   import { NextRequest } from 'next/server';
   import { checkRateLimit } from '@/lib/rate-limit';
   ```
2. Change `POST` signature from `(request: Request)` to `(request: NextRequest)`.
3. Add rate limit check as the FIRST line inside `POST`:
   ```typescript
   const rateLimitResponse = await checkRateLimit(request, 'checkout');
   if (rateLimitResponse) return rateLimitResponse;
   ```
4. Do the same for `PUT` -- change `(request: Request)` to `(request: NextRequest)` and add the same rate limit check as the first line.

Reuse the `checkout` limiter (5 req/min) since admin setup is even more sensitive than checkout.

**Context:** Read `@src/app/api/admin/setup/route.ts`, `@src/lib/rate-limit.ts`
**Done when:** Both `POST` and `PUT` handlers in `/api/admin/setup` call `checkRateLimit` before any other logic. The function signature uses `NextRequest`.

---

## Task 4 -- RLS migration for live_chat_sessions + live_chat_messages
**Wave:** 1
**Files:** `supabase/migrations/20260417_enable_rls_live_chat.sql` (new file)
**Action:**
Create a new migration following the pattern from `supabase/migrations/20260302_enable_rls_all_tables.sql`. The migration must:

1. Enable RLS on both tables:
   ```sql
   ALTER TABLE public.live_chat_sessions ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.live_chat_messages ENABLE ROW LEVEL SECURITY;
   ```

2. Sessions policies -- visitors identify via `visitor_id` column (a UUID stored as header, not auth.uid):
   ```sql
   -- Anon/authenticated can read their own sessions (visitor_id matched client-side)
   DROP POLICY IF EXISTS "Anon can read own chat sessions" ON public.live_chat_sessions;
   CREATE POLICY "Anon can read own chat sessions"
     ON public.live_chat_sessions
     FOR SELECT
     TO anon, authenticated
     USING (true);  -- visitor_id filtering happens at app layer; RLS prevents write abuse

   DROP POLICY IF EXISTS "Anon can insert chat sessions" ON public.live_chat_sessions;
   CREATE POLICY "Anon can insert chat sessions"
     ON public.live_chat_sessions
     FOR INSERT
     TO anon, authenticated, service_role
     WITH CHECK (true);

   DROP POLICY IF EXISTS "Anon can update own chat sessions" ON public.live_chat_sessions;
   CREATE POLICY "Anon can update own chat sessions"
     ON public.live_chat_sessions
     FOR UPDATE
     TO anon, authenticated, service_role
     USING (true);

   DROP POLICY IF EXISTS "Admin can delete chat sessions" ON public.live_chat_sessions;
   CREATE POLICY "Admin can delete chat sessions"
     ON public.live_chat_sessions
     FOR DELETE
     TO authenticated, service_role
     USING (public.is_admin() OR auth.role() = 'service_role');
   ```

3. Messages policies:
   ```sql
   DROP POLICY IF EXISTS "Anon can read chat messages" ON public.live_chat_messages;
   CREATE POLICY "Anon can read chat messages"
     ON public.live_chat_messages
     FOR SELECT
     TO anon, authenticated, service_role
     USING (true);

   DROP POLICY IF EXISTS "Anon can insert chat messages" ON public.live_chat_messages;
   CREATE POLICY "Anon can insert chat messages"
     ON public.live_chat_messages
     FOR INSERT
     TO anon, authenticated, service_role
     WITH CHECK (true);

   DROP POLICY IF EXISTS "Admin can update chat messages" ON public.live_chat_messages;
   CREATE POLICY "Admin can update chat messages"
     ON public.live_chat_messages
     FOR UPDATE
     TO authenticated, service_role
     USING (public.is_admin() OR auth.role() = 'service_role');

   DROP POLICY IF EXISTS "Admin can delete chat messages" ON public.live_chat_messages;
   CREATE POLICY "Admin can delete chat messages"
     ON public.live_chat_messages
     FOR DELETE
     TO authenticated, service_role
     USING (public.is_admin() OR auth.role() = 'service_role');
   ```

Note: These policies are permissive for reads/inserts (chat must work for anonymous visitors) but restrict delete/update to admins. The `public.is_admin()` function already exists from the v1.1 migration.

**Context:** Read `@supabase/migrations/20260302_enable_rls_all_tables.sql` for pattern reference
**Done when:** Migration file exists with RLS enabled on both tables and policies for all CRUD operations.

---

## Task 5 -- AI assistant fetch timeout
**Wave:** 1
**Files:** `src/app/api/ai-assistant/route.ts`
**Action:**
1. Add `fetchWithTimeout` to the existing import from `@/lib/api-utils` (line 4):
   ```typescript
   import { formatApiError, fetchWithTimeout } from '@/lib/api-utils';
   ```
2. Replace the bare `fetch` call on lines 113-127 with `fetchWithTimeout`:
   ```typescript
   const response = await fetchWithTimeout(API_ENDPOINT, {
     method: 'POST',
     timeout: 15000,
     headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${API_KEY}`,
       'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://aquadorcy.com',
       'X-Title': "Aquad'or Fragrance Assistant",
     },
     body: JSON.stringify({
       model: MODEL,
       messages: fullMessages,
       max_tokens: 300,
       temperature: 0.7,
     }),
   });
   ```

The `fetchWithTimeout` function from `src/lib/api-utils.ts` already handles `AbortController` and cleanup. The 15s timeout is appropriate since `maxDuration` is 30s.

**Context:** Read `@src/app/api/ai-assistant/route.ts`, `@src/lib/api-utils.ts` (lines 36-54 for `fetchWithTimeout` signature)
**Done when:** The AI assistant route uses `fetchWithTimeout` with a 15000ms timeout instead of bare `fetch`.

---

## Task 6 -- revalidatePath after blog mutations
**Wave:** 2 (after Task 2 -- both touch blog route files)
**Files:** `src/app/api/blog/route.ts`, `src/app/api/blog/[slug]/route.ts`
**Action:**

In `src/app/api/blog/route.ts` **POST handler**:
1. Add import at top: `import { revalidatePath } from 'next/cache';`
2. After the successful insert and before returning the response (between lines 135 and 141), add:
   ```typescript
   revalidatePath('/blog');
   ```

In `src/app/api/blog/[slug]/route.ts` **PUT handler**:
1. Add import at top: `import { revalidatePath } from 'next/cache';`
2. After the successful update (after line 97, before return on line 103), add:
   ```typescript
   revalidatePath('/blog');
   revalidatePath(`/blog/${slug}`);
   ```

In `src/app/api/blog/[slug]/route.ts` **DELETE handler**:
1. After the successful delete (after line 139, before the success response on line 145), add:
   ```typescript
   revalidatePath('/blog');
   revalidatePath(`/blog/${slug}`);
   ```

**Context:** Read `@src/app/api/blog/route.ts`, `@src/app/api/blog/[slug]/route.ts`
**Done when:** All three mutation handlers (POST, PUT, DELETE) call `revalidatePath` for `/blog` and (where applicable) `/blog/${slug}` after successful database operations.

---

## Task 7 -- Atomic customer upsert via Postgres RPC
**Wave:** 2 (migration can go parallel with Task 6; app changes depend on migration existing)
**Files:** `supabase/migrations/20260417_upsert_customer_rpc.sql` (new file), `src/app/api/webhooks/stripe/route.ts`, `src/app/api/admin/orders/route.ts`
**Action:**

**Migration file** -- create a Postgres function that atomically upserts a customer:

```sql
-- Atomic customer upsert: eliminates read-then-write race condition
-- on concurrent orders from the same email.
CREATE OR REPLACE FUNCTION public.upsert_customer_on_order(
  p_email TEXT,
  p_name TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_order_total BIGINT DEFAULT 0,
  p_shipping JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
  v_now TIMESTAMPTZ := now();
BEGIN
  INSERT INTO customers (email, name, phone, total_orders, total_spent, first_order_at, last_order_at, shipping_addresses)
  VALUES (
    p_email,
    p_name,
    p_phone,
    1,
    p_order_total,
    v_now,
    v_now,
    CASE WHEN p_shipping IS NOT NULL THEN jsonb_build_array(p_shipping) ELSE '[]'::jsonb END
  )
  ON CONFLICT (email) DO UPDATE SET
    name       = COALESCE(EXCLUDED.name, customers.name),
    phone      = COALESCE(EXCLUDED.phone, customers.phone),
    total_orders = customers.total_orders + 1,
    total_spent  = customers.total_spent + p_order_total,
    last_order_at = v_now,
    shipping_addresses = CASE
      WHEN p_shipping IS NOT NULL
        AND NOT customers.shipping_addresses @> jsonb_build_array(p_shipping)
      THEN customers.shipping_addresses || jsonb_build_array(p_shipping)
      ELSE customers.shipping_addresses
    END
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;
```

**Webhook route** (`src/app/api/webhooks/stripe/route.ts`):
Replace the entire read-then-write block (lines 76-115 -- from `// Upsert customer` through the else/insert block) with a single `.rpc()` call:

```typescript
// Atomic customer upsert via RPC (eliminates race condition)
await supabase.rpc('upsert_customer_on_order', {
  p_email: customerEmail,
  p_name: customerName || null,
  p_phone: customerPhone || null,
  p_order_total: session.amount_total || 0,
  p_shipping: shippingAddress ? JSON.parse(JSON.stringify(shippingAddress)) : null,
});
```

**Admin orders route** (`src/app/api/admin/orders/route.ts`):
Replace the equivalent read-then-write block (lines 103-145) with:

```typescript
// Atomic customer upsert via RPC
const email = orderData.customerEmail.trim().toLowerCase();
await supabase.rpc('upsert_customer_on_order', {
  p_email: email,
  p_name: orderData.customerName?.trim() || null,
  p_phone: orderData.customerPhone?.trim() || null,
  p_order_total: Math.round(orderData.total * 100),
  p_shipping: orderData.shippingAddress ? JSON.parse(JSON.stringify(orderData.shippingAddress)) : null,
});
```

**Context:** Read `@src/app/api/webhooks/stripe/route.ts` (lines 70-125), `@src/app/api/admin/orders/route.ts` (lines 100-155)
**Done when:** Both webhook and admin order routes call `supabase.rpc('upsert_customer_on_order', ...)` instead of the read-then-write pattern. Migration file creates the function with `INSERT ON CONFLICT DO UPDATE`.

---

## Task 8 -- Rate-limit /api/search
**Wave:** 1
**Files:** `src/lib/rate-limit.ts`, `src/app/api/search/route.ts`
**Action:**

In `src/lib/rate-limit.ts`:
1. Add a `search` limiter to the `rateLimiters` object (after the `'live-chat-notify'` entry, before the closing `}`):
   ```typescript
   // Search: 20 requests per minute (sliding window)
   search: isConfigured && redis
     ? new Ratelimit({
         redis,
         limiter: Ratelimit.slidingWindow(20, '1 m'),
         analytics: true,
         prefix: 'ratelimit:search',
       })
     : null,
   ```

In `src/app/api/search/route.ts`:
1. Add import: `import { checkRateLimit } from '@/lib/rate-limit';`
2. Change the import of `NextRequest` (already imported on line 1).
3. Add rate limit check as the FIRST line inside the `GET` handler (line 6), before the try block:
   ```typescript
   const rateLimitResponse = await checkRateLimit(request, 'search');
   if (rateLimitResponse) return rateLimitResponse;
   ```

**Context:** Read `@src/lib/rate-limit.ts`, `@src/app/api/search/route.ts`
**Done when:** `rateLimiters` object contains a `search` key with 20/min sliding window. The search route calls `checkRateLimit(request, 'search')` before processing.

---

## Task 9 -- Strip service config from /api/health
**Wave:** 1
**Files:** `src/app/api/health/route.ts`
**Action:**
Replace the entire `health` object (lines 8-18) with:

```typescript
const health = {
  status: 'ok',
  timestamp: new Date().toISOString(),
  version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || 'local',
};
```

Remove the `environment` field and the entire `checks` object. These leak which third-party services are configured (Stripe, Resend, Sentry booleans). The response should contain ONLY `status`, `timestamp`, and `version`.

**Context:** Read `@src/app/api/health/route.ts`
**Done when:** `/api/health` returns only `{status, timestamp, version}` with no `environment` or `checks` fields.

---

## Task 10 -- Unify error logging with Sentry across 12 API routes
**Wave:** 3 (after Tasks 2, 3, 6, 8, 9 -- all modify catch blocks in overlapping files)
**Files:**
- `src/app/api/search/route.ts` (line 29)
- `src/app/api/heartbeat/route.ts` (line 59)
- `src/app/api/health/route.ts` (line 27)
- `src/app/api/blog/route.ts` (lines 87, 143)
- `src/app/api/blog/featured/route.ts` (line 11)
- `src/app/api/blog/categories/route.ts` (line 11)
- `src/app/api/blog/[slug]/route.ts` (lines 45, 105, 147)
- `src/app/api/admin/setup/route.ts` (lines 100, 155)

**Action:**
For each file listed above, apply this pattern in every `catch` block:

1. Add `import * as Sentry from '@sentry/nextjs';` at the top (if not already imported).
2. Add `import { formatApiError } from '@/lib/api-utils';` at the top (if not already imported).
3. Replace `console.error('...', error);` with `Sentry.captureException(error);`.
4. Replace the inline error response `{ error: error instanceof Error ? error.message : 'Internal server error' }` with `formatApiError(error, '<context-specific fallback>')`.

Specific fallback messages per route:
- `search/route.ts`: `'Failed to search products'` (already has Sentry on line 30 -- just replace the console.error on line 29 and use formatApiError for the response)
- `heartbeat/route.ts`: `'Heartbeat failed'`
- `health/route.ts`: `'Health check failed'`
- `blog/route.ts` GET catch: `'Failed to fetch blog posts'`
- `blog/route.ts` POST catch: `'Failed to create blog post'`
- `blog/featured/route.ts`: `'Failed to fetch featured post'`
- `blog/categories/route.ts`: `'Failed to fetch blog categories'`
- `blog/[slug]/route.ts` GET catch: `'Failed to fetch blog post'`
- `blog/[slug]/route.ts` PUT catch: `'Failed to update blog post'`
- `blog/[slug]/route.ts` DELETE catch: `'Failed to delete blog post'`
- `admin/setup/route.ts` POST catch: `'Admin setup failed'`
- `admin/setup/route.ts` PUT catch: `'Password update failed'`

Example transformed catch block (from `heartbeat/route.ts`):
```typescript
} catch (error) {
  Sentry.captureException(error);
  return NextResponse.json(
    formatApiError(error, 'Heartbeat failed'),
    { status: 500 }
  );
}
```

Note: `search/route.ts` already has `Sentry.captureException` on line 30 -- just remove the `console.error` on line 29 and replace the response with `formatApiError`. For `blog/featured/route.ts` and `blog/categories/route.ts`, add both imports since neither currently imports Sentry or formatApiError.

**Context:** Read `@src/lib/api-utils.ts` (lines 66-85 for `formatApiError` signature), `@src/app/api/checkout/route.ts` (lines 116-121 for the reference pattern)
**Done when:** Zero `console.error` calls remain in any of the 12 listed files. Every catch block uses `Sentry.captureException(error)` + `formatApiError(error, '...')`.

---

## Task 11 -- Add openrouter.ai to CSP connect-src
**Wave:** 1
**Files:** `next.config.mjs`
**Action:**
On line 85, in the `Content-Security-Policy` value string, find the `connect-src` directive. It currently ends with `wss://*.supabase.co;`. Add `https://openrouter.ai` before the semicolon:

Change:
```
connect-src 'self' https://api.stripe.com https://vercel.live https://*.vercel.app wss://ws-us3.pusher.com https://*.sentry.io https://*.supabase.co wss://*.supabase.co;
```

To:
```
connect-src 'self' https://api.stripe.com https://vercel.live https://*.vercel.app wss://ws-us3.pusher.com https://*.sentry.io https://*.supabase.co wss://*.supabase.co https://openrouter.ai;
```

This is a single-line change. The AI calls currently happen server-side so this is proactive, but it prevents CSP violations if the AI assistant ever moves client-side.

**Context:** Read `@next.config.mjs` (line 85)
**Done when:** `grep -c "openrouter.ai" next.config.mjs` returns 1.

---

## Task 12 -- Cache-Control: no-store on POST routes
**Wave:** 1
**Files:** `src/app/api/checkout/route.ts`, `src/app/api/ai-assistant/route.ts`
**Action:**

In `src/app/api/checkout/route.ts`, replace the success response (lines 112-115):
```typescript
const response = NextResponse.json({
  sessionId: session.id,
  url: session.url,
});
response.headers.set('Cache-Control', 'no-store, no-cache');
return response;
```

In `src/app/api/ai-assistant/route.ts`, replace the success response (lines 142-145):
```typescript
const response = NextResponse.json({
  message: assistantMessage,
  conversationId: data.id,
});
response.headers.set('Cache-Control', 'no-store, no-cache');
return response;
```

**Context:** Read `@src/app/api/checkout/route.ts` (lines 112-115), `@src/app/api/ai-assistant/route.ts` (lines 142-145)
**Done when:** Both POST routes set `Cache-Control: no-store, no-cache` on successful responses.

---

## Success Criteria
- [ ] Deactivated products are rejected by `validateCartPrices` with a clear error message
- [ ] Anonymous GET of a draft blog post by slug returns 404; admin GET returns the draft
- [ ] `/api/admin/setup` POST and PUT are rate-limited (5 req/min)
- [ ] `live_chat_sessions` and `live_chat_messages` have RLS enabled with appropriate policies
- [ ] AI assistant fetch has a 15-second timeout via `fetchWithTimeout`
- [ ] Blog POST/PUT/DELETE call `revalidatePath` after successful mutations
- [ ] Customer upsert in webhook and admin orders uses atomic Postgres RPC (no read-then-write)
- [ ] `/api/search` is rate-limited at 20 req/min
- [ ] `/api/health` returns only `{status, timestamp, version}` -- no service config
- [ ] All 12 `console.error` calls replaced with `Sentry.captureException` + `formatApiError`
- [ ] CSP `connect-src` includes `https://openrouter.ai`
- [ ] Checkout and AI assistant POST routes return `Cache-Control: no-store, no-cache`

## Verification Contract

### Contract for Task 1 -- is_active guard in validateCartPrices
**Check type:** grep-match
**Command:** `grep -c "is_active" src/lib/validation/cart.ts`
**Expected:** Non-zero (>= 1)
**Fail if:** Returns 0 -- the deactivated product guard was not added

### Contract for Task 1 -- getProductsByIds unchanged
**Check type:** grep-match
**Command:** `grep -c "is_active" src/lib/supabase/product-service.ts`
**Expected:** 0 (function must NOT filter by is_active)
**Fail if:** Non-zero -- getProductsByIds was modified when it should not have been (webhook needs inactive lookup)

### Contract for Task 2 -- draft filter on blog slug GET
**Check type:** grep-match
**Command:** `grep -c "eq.*status.*published" src/app/api/blog/[slug]/route.ts`
**Expected:** Non-zero (>= 1)
**Fail if:** Returns 0 -- no status filter was added to the GET handler

### Contract for Task 2 -- admin check in blog slug GET
**Check type:** grep-match
**Command:** `grep -c "admin_users" src/app/api/blog/[slug]/route.ts`
**Expected:** >= 3 (GET + PUT + DELETE all check admin_users)
**Fail if:** < 3 -- the GET handler is missing the admin check

### Contract for Task 3 -- rate limit in admin setup
**Check type:** grep-match
**Command:** `grep -c "checkRateLimit" src/app/api/admin/setup/route.ts`
**Expected:** >= 2 (one in POST, one in PUT)
**Fail if:** < 2 -- one or both handlers are missing rate limiting

### Contract for Task 3 -- NextRequest import
**Check type:** grep-match
**Command:** `grep -c "NextRequest" src/app/api/admin/setup/route.ts`
**Expected:** Non-zero (>= 1)
**Fail if:** Returns 0 -- still using bare Request type

### Contract for Task 4 -- RLS migration exists
**Check type:** file-exists
**Command:** `test -f supabase/migrations/20260417_enable_rls_live_chat.sql && echo EXISTS`
**Expected:** `EXISTS`
**Fail if:** File does not exist

### Contract for Task 4 -- RLS enabled on both tables
**Check type:** grep-match
**Command:** `grep -c "ENABLE ROW LEVEL SECURITY" supabase/migrations/20260417_enable_rls_live_chat.sql`
**Expected:** 2
**Fail if:** Not exactly 2 -- one or both tables missing RLS

### Contract for Task 5 -- fetchWithTimeout in AI assistant
**Check type:** grep-match
**Command:** `grep -c "fetchWithTimeout" src/app/api/ai-assistant/route.ts`
**Expected:** >= 2 (one import, one call)
**Fail if:** < 2 -- either import or usage is missing

### Contract for Task 5 -- 15s timeout value
**Check type:** grep-match
**Command:** `grep -c "timeout: 15000" src/app/api/ai-assistant/route.ts`
**Expected:** 1
**Fail if:** 0 -- timeout value not set or wrong

### Contract for Task 6 -- revalidatePath in blog routes
**Check type:** grep-match
**Command:** `grep -rc "revalidatePath" src/app/api/blog/`
**Expected:** >= 4 (1 in blog/route.ts POST, 2 in blog/[slug]/route.ts PUT, 2 in blog/[slug]/route.ts DELETE -- some lines have two calls)
**Fail if:** 0 -- no revalidation was added

### Contract for Task 6 -- revalidatePath import
**Check type:** grep-match
**Command:** `grep -c "from 'next/cache'" src/app/api/blog/route.ts`
**Expected:** 1
**Fail if:** 0 -- import missing

### Contract for Task 7 -- RPC migration exists
**Check type:** file-exists
**Command:** `test -f supabase/migrations/20260417_upsert_customer_rpc.sql && echo EXISTS`
**Expected:** `EXISTS`
**Fail if:** File does not exist

### Contract for Task 7 -- RPC function definition
**Check type:** grep-match
**Command:** `grep -c "upsert_customer_on_order" supabase/migrations/20260417_upsert_customer_rpc.sql`
**Expected:** >= 1
**Fail if:** 0 -- function not defined

### Contract for Task 7 -- webhook uses RPC
**Check type:** grep-match
**Command:** `grep -c "upsert_customer_on_order" src/app/api/webhooks/stripe/route.ts`
**Expected:** >= 1
**Fail if:** 0 -- webhook still uses read-then-write pattern

### Contract for Task 7 -- admin orders uses RPC
**Check type:** grep-match
**Command:** `grep -c "upsert_customer_on_order" src/app/api/admin/orders/route.ts`
**Expected:** >= 1
**Fail if:** 0 -- admin orders still uses read-then-write pattern

### Contract for Task 8 -- search limiter in rate-limit.ts
**Check type:** grep-match
**Command:** `grep -c "'ratelimit:search'" src/lib/rate-limit.ts`
**Expected:** 1
**Fail if:** 0 -- search limiter not added

### Contract for Task 8 -- search route calls checkRateLimit
**Check type:** grep-match
**Command:** `grep -c "checkRateLimit" src/app/api/search/route.ts`
**Expected:** >= 1
**Fail if:** 0 -- rate limit not wired into search route

### Contract for Task 9 -- health endpoint stripped
**Check type:** grep-match
**Command:** `grep -c "checks" src/app/api/health/route.ts`
**Expected:** 0
**Fail if:** Non-zero -- service config still exposed

### Contract for Task 9 -- no environment field
**Check type:** grep-match
**Command:** `grep -c "environment" src/app/api/health/route.ts`
**Expected:** 0
**Fail if:** Non-zero -- environment field still exposed

### Contract for Task 10 -- no console.error in target files
**Check type:** command-exit
**Command:** `grep -rl "console.error" src/app/api/search/route.ts src/app/api/heartbeat/route.ts src/app/api/health/route.ts src/app/api/blog/route.ts src/app/api/blog/featured/route.ts src/app/api/blog/categories/route.ts src/app/api/blog/[slug]/route.ts src/app/api/admin/setup/route.ts 2>/dev/null | wc -l`
**Expected:** 0
**Fail if:** Non-zero -- console.error calls remain in one or more files

### Contract for Task 10 -- Sentry imported in all target files
**Check type:** command-exit
**Command:** `grep -rL "Sentry" src/app/api/blog/featured/route.ts src/app/api/blog/categories/route.ts src/app/api/heartbeat/route.ts src/app/api/health/route.ts 2>/dev/null | wc -l`
**Expected:** 0
**Fail if:** Non-zero -- Sentry not imported in one or more files that previously lacked it

### Contract for Task 11 -- openrouter.ai in CSP
**Check type:** grep-match
**Command:** `grep -c "openrouter.ai" next.config.mjs`
**Expected:** 1
**Fail if:** 0 -- CSP connect-src not updated

### Contract for Task 12 -- Cache-Control on checkout POST
**Check type:** grep-match
**Command:** `grep -c "no-store" src/app/api/checkout/route.ts`
**Expected:** >= 1
**Fail if:** 0 -- Cache-Control header not set

### Contract for Task 12 -- Cache-Control on AI assistant POST
**Check type:** grep-match
**Command:** `grep -c "no-store" src/app/api/ai-assistant/route.ts`
**Expected:** >= 1
**Fail if:** 0 -- Cache-Control header not set

### Contract for full phase -- TypeScript compiles
**Check type:** command-exit
**Command:** `npx tsc --noEmit 2>&1 | grep -c "error TS"`
**Expected:** 0
**Fail if:** Any TypeScript compilation errors
