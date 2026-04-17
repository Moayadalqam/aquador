---
phase: 28
goal: "Fix 12 performance, bundle, and architecture findings from OPTIMIZE.md -- eliminate product page waterfall, restore /shop SSG, scope animation budget, add search index, remove dead code, gate 3D on capability, improve page transition speed, optimize ChatWidget, improve AI catalogue lookup, tune bundle config, fix FeaturedProducts import, memoize cart derivations"
tasks: 12
waves: 3
---

# Phase 28: Performance + Bundle + Architecture Cleanup (v3.2)

Goal: All 12 findings from `.planning/OPTIMIZE.md` HIGH #5-#6-#7-#10-#12, MEDIUM #20-#21-#23, LOW #25-#28-#29 are resolved. Build passes, bundle is smaller, /shop returns to static, product page streams related products, and animation budget no longer burns CPU on every route.

## Task 1 -- Product Page Suspense Streaming for Related Products
**Wave:** 1
**Files:**
- `src/app/products/[slug]/page.tsx` (modify -- extract related products into a new async server component)
- `src/components/products/RelatedProductsSection.tsx` (create -- async server component that fetches + transforms + renders)
- `src/components/products/RelatedProductsSkeleton.tsx` (create -- skeleton matching the 2x4 grid shape)

**Action:**
1. Create `src/components/products/RelatedProductsSkeleton.tsx`: a server component that renders a `<section>` with the same `mt-20 pt-12 border-t border-gray-300` wrapper as `RelatedProducts.tsx`, an `<h2>` placeholder, and a `grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 lg:gap-8` with 4 skeleton cards (each a `div` with `animate-pulse bg-gray-200 rounded-lg h-[280px]`).
2. Create `src/components/products/RelatedProductsSection.tsx`: an async server component that accepts `productId: string` and `category: string` props. Inside, call `getRelatedProducts(productId, category as ProductCategory)` (import from `@/lib/supabase/product-service`), transform the result to `LegacyProduct[]` format (same mapping currently on lines 104-118 of the page), and render `<RelatedProducts products={relatedProducts} />` if any exist. Export as default.
3. In `src/app/products/[slug]/page.tsx`:
   - Remove the `const relatedProductsData = await getRelatedProducts(...)` call (line 84).
   - Remove the `relatedProducts` transformation block (lines 104-118).
   - Remove the `RelatedProducts` import; add imports for `RelatedProductsSection` and `RelatedProductsSkeleton`.
   - Add `import { Suspense } from 'react'` (already may be unused -- verify).
   - Replace the `{relatedProducts.length > 0 && <RelatedProducts ... />}` block (lines 179-181) with:
     ```tsx
     <Suspense fallback={<RelatedProductsSkeleton />}>
       <RelatedProductsSection productId={product.id} category={product.category} />
     </Suspense>
     ```

**Context:** Read `@src/app/products/[slug]/page.tsx`, `@src/components/products/RelatedProducts.tsx`, `@src/lib/supabase/product-service.ts`
**Done when:** Product page renders main product content immediately. Related products stream in after. `grep -c "Suspense" src/app/products/[slug]/page.tsx` returns >= 1. `grep -c "getRelatedProducts" src/app/products/[slug]/page.tsx` returns 0 (moved to section component). `npx tsc --noEmit` passes.

---

## Task 2 -- Restore /shop to Static by Removing Server searchParams
**Wave:** 1
**Files:**
- `src/app/shop/page.tsx` (modify -- remove searchParams from server component)

**Action:**
1. Remove the `ShopPageProps` interface (line 29-31) and the `searchParams` parameter from the `ShopPage` function signature (line 33). The function becomes `export default async function ShopPage()`.
2. Remove lines 36-37 (`const searchQuery = searchParams.search?.trim() || ''` and `const isSearchMode = searchQuery.length > 0`).
3. Change the `products` filter to always apply the normal-mode filter: `const products = allProducts.filter(p => p.category !== 'lattafa-original' && p.product_type === 'perfume');` -- remove the `isSearchMode` ternary entirely.
4. Remove `isSearchMode` from the `<ShopContent>` props: change `<ShopContent products={products} categories={categories} isSearchMode={isSearchMode} />` to `<ShopContent products={products} categories={categories} />`.
5. Verify `ShopContent` (client component) already handles search via `useSearchParams()` on line 29-31 -- it reads `searchParams.get('search')` client-side.

**Context:** Read `@src/app/shop/page.tsx`, `@src/app/shop/ShopContent.tsx`
**Done when:** `npm run build` output shows `/shop` with a static indicator (circle or filled circle, NOT `f` for dynamic). `grep -c "searchParams" src/app/shop/page.tsx` returns 0. `npx tsc --noEmit` passes.

---

## Task 3 -- Scope AnimationBudgetProvider to Animation-Heavy Routes Only
**Wave:** 1
**Files:**
- `src/app/layout.tsx` (modify -- remove `<AnimationBudgetProvider>` wrapper)
- `src/app/page.tsx` (modify -- wrap content with `<AnimationBudgetProvider>`)
- `src/app/create-perfume/page.tsx` (modify -- wrap content with `<AnimationBudgetProvider>`)
- `src/app/shop/ShopContent.tsx` (modify -- wrap content with `<AnimationBudgetProvider>`)

**Action:**
1. In `src/app/layout.tsx` line 144: remove the `<AnimationBudgetProvider>` wrapper around `<CartProvider>`. The tree becomes `<ErrorBoundary><CartProvider>...` directly. Remove the `AnimationBudgetProvider` import.
2. In `src/app/page.tsx`: import `AnimationBudgetProvider` from `@/lib/performance/animation-budget`. Wrap the returned JSX (the fragment `<>...</>`) with `<AnimationBudgetProvider>...</AnimationBudgetProvider>`.
3. In `src/app/create-perfume/page.tsx`: this is a `'use client'` component. Import `AnimationBudgetProvider` from `@/lib/performance/animation-budget`. Wrap the outermost returned element with `<AnimationBudgetProvider>`.
4. In `src/app/shop/ShopContent.tsx`: this is a `'use client'` component. Import `AnimationBudgetProvider` from `@/lib/performance/animation-budget`. Wrap the outermost returned element with `<AnimationBudgetProvider>`.

**Context:** Read `@src/app/layout.tsx`, `@src/app/page.tsx`, `@src/app/create-perfume/page.tsx`, `@src/app/shop/ShopContent.tsx`, `@src/lib/performance/animation-budget.tsx`
**Done when:** `grep -c "AnimationBudgetProvider" src/app/layout.tsx` returns 0. `grep -c "AnimationBudgetProvider" src/app/page.tsx` returns >= 1. `grep -c "AnimationBudgetProvider" src/app/create-perfume/page.tsx` returns >= 1. `grep -c "AnimationBudgetProvider" src/app/shop/ShopContent.tsx` returns >= 1. `npx tsc --noEmit` passes. No perpetual RAF on `/products/*`, `/blog/*`, or other non-animation routes.

---

## Task 4 -- Add pg_trgm Search Index Migration
**Wave:** 1
**Files:**
- `supabase/migrations/20260417_add_search_trgm_index.sql` (create)

**Action:**
Create the migration file with exactly this content:
```sql
-- Enable trigram extension for fuzzy text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- GIN index for fast ILIKE product search on name + brand + description
CREATE INDEX IF NOT EXISTS idx_products_search_trgm
  ON products
  USING GIN (
    (name || ' ' || COALESCE(brand, '') || ' ' || COALESCE(description, ''))
    gin_trgm_ops
  );
```
This supports the existing `searchProducts()` in `src/lib/supabase/product-service.ts` which uses `.ilike('name', ...)` and `.or(...)` patterns on name/brand/description.

**Context:** Read `@supabase/migrations/20260303_add_performance_indexes.sql`, `@src/lib/supabase/product-service.ts` (lines 194-211)
**Done when:** `test -f supabase/migrations/20260417_add_search_trgm_index.sql && echo EXISTS` returns `EXISTS`. File contains `pg_trgm` and `gin_trgm_ops`. Migration is syntactically valid SQL.

---

## Task 5 -- Delete Dead Code and Unused Dependencies
**Wave:** 1
**Files:**
- `src/lib/animations/variants.ts` (delete)
- `src/components/3d/CustomPerfumeBottle.tsx` (delete)
- `package.json` (modify -- uninstall `@stripe/stripe-js` and `@react-three/gltfjsx`)
- `src/lib/animations/micro-interactions.ts` (modify -- remove comment referencing `variants.ts`)

**Action:**
1. Delete `src/lib/animations/variants.ts` (413 lines, zero imports anywhere).
2. Delete `src/components/3d/CustomPerfumeBottle.tsx` (orphan component, never imported).
3. Run `npm uninstall @stripe/stripe-js @react-three/gltfjsx` to remove both packages.
4. In `src/lib/animations/micro-interactions.ts` line 23, remove or update the comment `// Easing constants from variants.ts` since that file no longer exists. Change it to `// Easing constants` or remove the comment entirely.
5. Run `npx tsc --noEmit` to verify no compilation errors.
6. Run `npm run build` to verify the build succeeds.

**Context:** Read `@src/lib/animations/variants.ts`, `@src/components/3d/CustomPerfumeBottle.tsx`, `@src/lib/animations/micro-interactions.ts`
**Done when:** `test -f src/lib/animations/variants.ts && echo EXISTS || echo DELETED` returns `DELETED`. `test -f src/components/3d/CustomPerfumeBottle.tsx && echo EXISTS || echo DELETED` returns `DELETED`. `grep -c "@stripe/stripe-js" package.json` returns 0. `grep -c "@react-three/gltfjsx" package.json` returns 0. `npx tsc --noEmit` passes. `npm run build` succeeds.

---

## Task 6 -- Gate 3D Viewer on Device Capability Before Dynamic Import
**Wave:** 1
**Files:**
- `src/components/products/ProductGallery.tsx` (modify -- add capability check before rendering ProductViewer)
- `src/hooks/useDeviceCapabilities.ts` (read-only reference)

**Action:**
1. In `src/components/products/ProductGallery.tsx`, import `useDeviceCapabilities` from `@/hooks/useDeviceCapabilities`.
2. Inside the `ProductGallery` component, add: `const { supports3D } = useDeviceCapabilities();`
3. Find the 3D toggle button (around line 147, the `onClick={() => setShow3D(!show3D)}` button). Add a condition: only show the 3D toggle button when `supports3D` is true. Wrap the button in `{supports3D && ( ... )}`.
4. Find the conditional render of `<ProductViewer>` (around line 170-171). Change `{show3D ? ( <ProductViewer ... /> ) : ( ... )}` to `{show3D && supports3D ? ( <ProductViewer ... /> ) : ( ... )}`.
5. This prevents the dynamic import from even being triggered on unsupported devices, saving ~600KB of Three.js/R3F/drei downloads.

**Context:** Read `@src/components/products/ProductGallery.tsx`, `@src/hooks/useDeviceCapabilities.ts`, `@src/components/3d/ProductViewer.tsx`
**Done when:** `grep -c "useDeviceCapabilities" src/components/products/ProductGallery.tsx` returns >= 1. `grep -c "supports3D" src/components/products/ProductGallery.tsx` returns >= 2 (import destructure + usage). `npx tsc --noEmit` passes. On a low-end device (or with DevTools throttling), the 3D button is hidden and Three.js is not loaded.

---

## Task 7 -- Switch PageTransition to popLayout Mode
**Wave:** 2 (after Task 3 -- AnimationBudgetProvider removal from layout may affect provider nesting)
**Files:**
- `src/components/providers/PageTransition.tsx` (modify -- change AnimatePresence mode)

**Action:**
1. In `src/components/providers/PageTransition.tsx` line 62, change `<AnimatePresence mode="wait" initial={false}>` to `<AnimatePresence mode="popLayout" initial={false}>`.
2. This removes the 200-400ms blocking exit animation from every client-side navigation. With `popLayout`, the exiting page is removed from layout flow immediately (via `position: absolute`) and the new page renders without waiting.

**Context:** Read `@src/components/providers/PageTransition.tsx`
**Done when:** `grep -c 'mode="popLayout"' src/components/providers/PageTransition.tsx` returns 1. `grep -c 'mode="wait"' src/components/providers/PageTransition.tsx` returns 0. `npx tsc --noEmit` passes.

---

## Task 8 -- Optimize ChatWidget: Singleton Client + Realtime-Primary Polling
**Wave:** 2 (standalone, but after Wave 1 settles layout changes)
**Files:**
- `src/components/ai/ChatWidget.tsx` (modify)

**Action:**
1. Move the Supabase client creation out of the component to module scope. At the top of the file (after imports), add:
   ```ts
   import { createClient } from '@/lib/supabase/client';
   const supabaseClient = createClient();
   ```
2. Remove `const supabaseRef = useRef(createClient());` from inside the component (line 92).
3. Replace all `supabaseRef.current` references with `supabaseClient` (the module-scope singleton).
4. Refactor the polling + Realtime effect (lines 98-122):
   - Keep Realtime subscription as the **primary** delivery mechanism (the `.channel(...).on(...)` calls).
   - Change the polling interval from `3000` (3s) to `10000` (10s) -- this is the fallback.
   - Add error handling on the `.subscribe()` call: if the subscription status is `'CHANNEL_ERROR'` or `'TIMED_OUT'`, keep polling at 10s. If subscription succeeds (`'SUBSCRIBED'`), optionally increase poll interval further or keep at 10s as a safety net.
   - The subscribe callback provides a status. Use:
     ```ts
     const msgChannel = supabaseClient.channel(`live-chat-msgs-${sessionId}`)
       .on('postgres_changes', { ... }, (payload) => { ... })
       .subscribe((status) => {
         if (status === 'SUBSCRIBED') {
           // Realtime active -- polling is just a safety net
         }
       });
     ```
5. This reduces ~40 queries/min down to ~6/min (Realtime handles most) plus eliminates per-mount client creation overhead.

**Context:** Read `@src/components/ai/ChatWidget.tsx`, `@src/lib/supabase/client.ts`
**Done when:** `grep -c "useRef(createClient" src/components/ai/ChatWidget.tsx` returns 0. `grep -c "supabaseClient" src/components/ai/ChatWidget.tsx` returns >= 2. `grep "setInterval" src/components/ai/ChatWidget.tsx` contains `10000` (not `3000`). `npx tsc --noEmit` passes.

---

## Task 9 -- AI Catalogue: Map-Based Keyword Index + Expanded Keywords
**Wave:** 2 (standalone)
**Files:**
- `src/lib/ai/catalogue-data.ts` (modify -- add keyword index builder)
- `src/app/api/ai-assistant/route.ts` (modify -- use new index, expand keywords)

**Action:**
1. In `src/lib/ai/catalogue-data.ts`, after the `catalogueProducts` array, add a `buildKeywordIndex()` function:
   ```ts
   /** Pre-built keyword -> product[] index for O(1) lookup */
   const keywordIndex: Map<string, CatalogueProduct[]> = new Map();

   function buildKeywordIndex() {
     for (const product of catalogueProducts) {
       const terms = new Set<string>();
       // Add brand (lowercased, individual words)
       product.brand.toLowerCase().split(/\s+/).forEach(w => terms.add(w));
       // Add name words
       product.name.toLowerCase().split(/\s+/).forEach(w => terms.add(w));
       // Add gender
       terms.add(product.gender.toLowerCase());
       // Add type
       terms.add(product.type);
       // Add searchTerms
       (product.searchTerms || []).forEach(t => terms.add(t.toLowerCase()));

       for (const term of terms) {
         if (term.length < 2) continue; // skip single chars
         const existing = keywordIndex.get(term) || [];
         existing.push(product);
         keywordIndex.set(term, existing);
       }
     }
   }
   buildKeywordIndex(); // Run at module load

   /** Fast keyword lookup — returns products matching any of the given keywords */
   export function searchByKeywords(keywords: string[]): CatalogueProduct[] {
     const seen = new Set<string>();
     const results: CatalogueProduct[] = [];
     for (const kw of keywords) {
       const matches = keywordIndex.get(kw.toLowerCase()) || [];
       for (const p of matches) {
         if (!seen.has(p.number)) {
           seen.add(p.number);
           results.push(p);
         }
       }
     }
     return results;
   }

   /** Get all unique brand names from catalogue */
   export function getAllBrands(): string[] {
     const brands = new Set(catalogueProducts.map(p => p.brand).filter(b => b !== '-'));
     return Array.from(brands).sort();
   }

   /** Get all unique category keywords (brand names + genders) for matching */
   export function getCatalogueKeywords(): string[] {
     return Array.from(keywordIndex.keys());
   }
   ```

2. In `src/app/api/ai-assistant/route.ts`:
   - Import `searchByKeywords, getAllBrands` from `@/lib/ai/catalogue-data` (add to existing import).
   - Replace the hardcoded `noteKeywords` array (line 93) with a dynamic list that includes the original notes PLUS all brand names (lowercased, split into words):
     ```ts
     const baseNotes = ['jasmine', 'rose', 'vanilla', 'oud', 'musk', 'leather', 'amber', 'sandalwood', 'tobacco', 'cherry', 'floral', 'fruity', 'woody'];
     const brandKeywords = getAllBrands().flatMap(b => b.toLowerCase().split(/\s+/)).filter(w => w.length > 2);
     const allKeywords = [...new Set([...baseNotes, ...brandKeywords])];
     const mentionedKeywords = allKeywords.filter(kw => userMessage.includes(kw));
     ```
   - Replace the `searchCatalogue(mentionedNotes[0])` call (line 97) with `searchByKeywords(mentionedKeywords)` to search ALL mentioned keywords at once.
   - Update the `catalogueContext` building to use `mentionedKeywords` instead of `mentionedNotes`.
   - Update the SYSTEM_PROMPT (line 32) to include brand count: replace `our ${catalogueProducts.length} products` with `our ${catalogueProducts.length} products from ${getAllBrands().length} brands`.

**Context:** Read `@src/lib/ai/catalogue-data.ts`, `@src/app/api/ai-assistant/route.ts`
**Done when:** `grep -c "searchByKeywords" src/app/api/ai-assistant/route.ts` returns >= 1. `grep -c "keywordIndex" src/lib/ai/catalogue-data.ts` returns >= 3. `grep -c "getAllBrands" src/lib/ai/catalogue-data.ts` returns >= 1. `npx tsc --noEmit` passes. The AI assistant now matches brand names (e.g., "Amouage", "Tom Ford") in user queries, not just the 13 hardcoded note keywords.

---

## Task 10 -- Add three + @react-three/drei to optimizePackageImports
**Wave:** 1
**Files:**
- `next.config.mjs` (modify -- extend optimizePackageImports array)

**Action:**
1. In `next.config.mjs` line 18, change:
   ```js
   optimizePackageImports: ['framer-motion', 'lucide-react'],
   ```
   to:
   ```js
   optimizePackageImports: ['framer-motion', 'lucide-react', 'three', '@react-three/drei'],
   ```

**Context:** Read `@next.config.mjs`
**Done when:** `grep "optimizePackageImports" next.config.mjs` shows `three` and `@react-three/drei` in the array. `npm run build` succeeds.

---

## Task 11 -- Fix FeaturedProducts dynamic(ssr:true) No-Op Import
**Wave:** 1
**Files:**
- `src/app/page.tsx` (modify -- replace dynamic import with static import)

**Action:**
1. Remove lines 1 and 8-10:
   ```ts
   import dynamic from 'next/dynamic';
   const FeaturedProducts = dynamic(() => import('@/components/home/FeaturedProducts'), {
     ssr: true,
   });
   ```
2. Replace with a static import:
   ```ts
   import FeaturedProducts from '@/components/home/FeaturedProducts';
   ```
3. Remove the `dynamic` import from `next/dynamic` if it's no longer used elsewhere in the file.

**Context:** Read `@src/app/page.tsx`
**Done when:** `grep -c "dynamic" src/app/page.tsx` returns 0. `grep -c "import FeaturedProducts from" src/app/page.tsx` returns 1. `npx tsc --noEmit` passes.

---

## Task 12 -- Memoize itemCount and subtotal in CartProvider
**Wave:** 1
**Files:**
- `src/components/cart/CartProvider.tsx` (modify -- wrap derivations in useMemo)

**Action:**
1. Add `useMemo` to the existing `import { ... } from 'react'` statement if not already imported.
2. Replace lines 187-188:
   ```ts
   const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
   const subtotal = calculateSubtotal(cart.items);
   ```
   with:
   ```ts
   const itemCount = useMemo(() => cart.items.reduce((sum, item) => sum + item.quantity, 0), [cart.items]);
   const subtotal = useMemo(() => calculateSubtotal(cart.items), [cart.items]);
   ```

**Context:** Read `@src/components/cart/CartProvider.tsx`
**Done when:** `grep -c "useMemo" src/components/cart/CartProvider.tsx` returns >= 2. `npx tsc --noEmit` passes.

---

## Success Criteria
- [ ] Product page (`/products/[slug]`) renders main content without waiting for related products -- related products stream in via Suspense
- [ ] `/shop` shows as static (SSG) in `npm run build` output -- not forced dynamic
- [ ] `AnimationBudgetProvider` RAF loop only runs on homepage, create-perfume, and shop -- not on every page
- [ ] `supabase/migrations/20260417_add_search_trgm_index.sql` exists with valid pg_trgm index
- [ ] `variants.ts` and `CustomPerfumeBottle.tsx` deleted; `@stripe/stripe-js` and `@react-three/gltfjsx` removed from package.json
- [ ] 3D viewer only loads on devices where `supports3D` is true
- [ ] Page transitions use `popLayout` mode (no 200-400ms blocking exit)
- [ ] ChatWidget uses module-scope Supabase client; polling interval is 10s not 3s
- [ ] AI assistant matches brand names and category keywords, not just 13 hardcoded notes
- [ ] `three` and `@react-three/drei` in `optimizePackageImports`
- [ ] `FeaturedProducts` uses static import (no pointless `dynamic(ssr:true)`)
- [ ] `itemCount` and `subtotal` wrapped in `useMemo`
- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] `npm run build` succeeds with no errors

---

## Verification Contract

### Contract for Task 1 -- Suspense streaming (file exists)
**Check type:** file-exists
**Command:** `test -f src/components/products/RelatedProductsSection.tsx && test -f src/components/products/RelatedProductsSkeleton.tsx && echo EXISTS`
**Expected:** `EXISTS`
**Fail if:** Either file does not exist

### Contract for Task 1 -- Suspense streaming (wiring)
**Check type:** grep-match
**Command:** `grep -c "Suspense" src/app/products/[slug]/page.tsx`
**Expected:** >= 1
**Fail if:** Returns 0 -- Suspense boundary not added to product page

### Contract for Task 1 -- Suspense streaming (waterfall removed)
**Check type:** grep-match
**Command:** `grep -c "getRelatedProducts" src/app/products/[slug]/page.tsx`
**Expected:** 0
**Fail if:** Returns > 0 -- sequential fetch still in page component

### Contract for Task 1 -- Suspense streaming (wiring in section)
**Check type:** grep-match
**Command:** `grep -c "getRelatedProducts" src/components/products/RelatedProductsSection.tsx`
**Expected:** >= 1
**Fail if:** Returns 0 -- section component doesn't fetch related products

### Contract for Task 2 -- /shop static (searchParams removed)
**Check type:** grep-match
**Command:** `grep -c "searchParams" src/app/shop/page.tsx`
**Expected:** 0
**Fail if:** Returns > 0 -- server searchParams still present, forcing dynamic

### Contract for Task 2 -- /shop static (build output)
**Check type:** command-exit
**Command:** `npm run build 2>&1 | grep "/shop " | grep -v "f " | head -1`
**Expected:** Line containing `/shop` with static indicator (circle symbol, not `f`)
**Fail if:** `/shop` shows `f` (dynamic) or is not present in build output

### Contract for Task 3 -- AnimationBudgetProvider removed from root
**Check type:** grep-match
**Command:** `grep -c "AnimationBudgetProvider" src/app/layout.tsx`
**Expected:** 0
**Fail if:** Returns > 0 -- still in root layout, running on every page

### Contract for Task 3 -- AnimationBudgetProvider scoped to home
**Check type:** grep-match
**Command:** `grep -c "AnimationBudgetProvider" src/app/page.tsx`
**Expected:** >= 1
**Fail if:** Returns 0 -- not mounted on homepage

### Contract for Task 3 -- AnimationBudgetProvider scoped to create-perfume
**Check type:** grep-match
**Command:** `grep -c "AnimationBudgetProvider" src/app/create-perfume/page.tsx`
**Expected:** >= 1
**Fail if:** Returns 0 -- not mounted on create-perfume page

### Contract for Task 3 -- AnimationBudgetProvider scoped to shop
**Check type:** grep-match
**Command:** `grep -c "AnimationBudgetProvider" src/app/shop/ShopContent.tsx`
**Expected:** >= 1
**Fail if:** Returns 0 -- not mounted on shop content

### Contract for Task 4 -- pg_trgm migration exists
**Check type:** file-exists
**Command:** `test -f supabase/migrations/20260417_add_search_trgm_index.sql && echo EXISTS`
**Expected:** `EXISTS`
**Fail if:** Migration file does not exist

### Contract for Task 4 -- pg_trgm migration content
**Check type:** grep-match
**Command:** `grep -c "gin_trgm_ops" supabase/migrations/20260417_add_search_trgm_index.sql`
**Expected:** >= 1
**Fail if:** Returns 0 -- migration doesn't create trigram index

### Contract for Task 5 -- Dead code deleted (variants.ts)
**Check type:** command-exit
**Command:** `test -f src/lib/animations/variants.ts && echo EXISTS || echo DELETED`
**Expected:** `DELETED`
**Fail if:** Returns `EXISTS` -- dead file not removed

### Contract for Task 5 -- Dead code deleted (CustomPerfumeBottle)
**Check type:** command-exit
**Command:** `test -f src/components/3d/CustomPerfumeBottle.tsx && echo EXISTS || echo DELETED`
**Expected:** `DELETED`
**Fail if:** Returns `EXISTS` -- orphan file not removed

### Contract for Task 5 -- Unused deps removed (@stripe/stripe-js)
**Check type:** grep-match
**Command:** `grep -c "@stripe/stripe-js" package.json`
**Expected:** 0
**Fail if:** Returns > 0 -- unused package still in dependencies

### Contract for Task 5 -- Unused deps removed (@react-three/gltfjsx)
**Check type:** grep-match
**Command:** `grep -c "gltfjsx" package.json`
**Expected:** 0
**Fail if:** Returns > 0 -- unused package still in devDependencies

### Contract for Task 5 -- Build still passes
**Check type:** command-exit
**Command:** `npx tsc --noEmit 2>&1 | tail -1`
**Expected:** No error output (exit code 0)
**Fail if:** TypeScript compilation errors after deletions

### Contract for Task 6 -- Device capability check in ProductGallery
**Check type:** grep-match
**Command:** `grep -c "useDeviceCapabilities" src/components/products/ProductGallery.tsx`
**Expected:** >= 1
**Fail if:** Returns 0 -- capability check not added

### Contract for Task 6 -- supports3D gating
**Check type:** grep-match
**Command:** `grep -c "supports3D" src/components/products/ProductGallery.tsx`
**Expected:** >= 2
**Fail if:** Returns < 2 -- needs both destructure and conditional usage

### Contract for Task 7 -- popLayout mode
**Check type:** grep-match
**Command:** `grep -c 'mode="popLayout"' src/components/providers/PageTransition.tsx`
**Expected:** 1
**Fail if:** Returns 0 -- still using mode="wait"

### Contract for Task 7 -- wait mode removed
**Check type:** grep-match
**Command:** `grep -c 'mode="wait"' src/components/providers/PageTransition.tsx`
**Expected:** 0
**Fail if:** Returns > 0 -- blocking exit animation still active

### Contract for Task 8 -- Module-scope Supabase client
**Check type:** grep-match
**Command:** `grep -c "useRef(createClient" src/components/ai/ChatWidget.tsx`
**Expected:** 0
**Fail if:** Returns > 0 -- still creating client per mount

### Contract for Task 8 -- Polling interval increased
**Check type:** grep-match
**Command:** `grep "setInterval" src/components/ai/ChatWidget.tsx | grep -c "10000"`
**Expected:** >= 1
**Fail if:** Returns 0 -- polling still at 3s (3000)

### Contract for Task 9 -- Map-based keyword index
**Check type:** grep-match
**Command:** `grep -c "keywordIndex" src/lib/ai/catalogue-data.ts`
**Expected:** >= 3
**Fail if:** Returns < 3 -- index not built (need declaration, population, usage)

### Contract for Task 9 -- searchByKeywords used in route
**Check type:** grep-match
**Command:** `grep -c "searchByKeywords" src/app/api/ai-assistant/route.ts`
**Expected:** >= 1
**Fail if:** Returns 0 -- still using old linear searchCatalogue

### Contract for Task 9 -- Brand keywords in route
**Check type:** grep-match
**Command:** `grep -c "getAllBrands" src/app/api/ai-assistant/route.ts`
**Expected:** >= 1
**Fail if:** Returns 0 -- brand names not being used for keyword matching

### Contract for Task 10 -- optimizePackageImports updated
**Check type:** grep-match
**Command:** `grep "optimizePackageImports" next.config.mjs | grep -c "three"`
**Expected:** >= 1
**Fail if:** Returns 0 -- three not added to optimizePackageImports

### Contract for Task 10 -- drei included
**Check type:** grep-match
**Command:** `grep "optimizePackageImports" next.config.mjs | grep -c "drei"`
**Expected:** >= 1
**Fail if:** Returns 0 -- @react-three/drei not added

### Contract for Task 11 -- Static import for FeaturedProducts
**Check type:** grep-match
**Command:** `grep -c "import FeaturedProducts from" src/app/page.tsx`
**Expected:** 1
**Fail if:** Returns 0 -- still using dynamic import

### Contract for Task 11 -- dynamic removed
**Check type:** grep-match
**Command:** `grep -c "dynamic(" src/app/page.tsx`
**Expected:** 0
**Fail if:** Returns > 0 -- pointless dynamic(ssr:true) still present

### Contract for Task 12 -- useMemo for cart derivations
**Check type:** grep-match
**Command:** `grep -c "useMemo" src/components/cart/CartProvider.tsx`
**Expected:** >= 2
**Fail if:** Returns < 2 -- both itemCount and subtotal need memoization

### Contract for all tasks -- TypeScript compiles
**Check type:** command-exit
**Command:** `npx tsc --noEmit 2>&1 | grep -c "error TS"`
**Expected:** 0
**Fail if:** Any TypeScript compilation errors

### Contract for all tasks -- Build succeeds
**Check type:** command-exit
**Command:** `npm run build 2>&1 | tail -5 | grep -c "error"`
**Expected:** 0
**Fail if:** Build fails
