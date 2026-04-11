---
phase: 21
goal: "Search bar returns relevant results, shop filtering works, product data issues fixed in database"
tasks: 3
waves: 2
---

# Phase 21: Search & Product Data

Goal: Users can search for products by name/brand/description from the navbar search bar and get clickable results that navigate to product pages. The shop page filtering works correctly across all product categories. Product data issues (missing fragrance notes, incorrect compositions, misspelled names) are corrected in the database.

## Task 1 — Fix Navbar Search Bar and Shop Page Search

**Wave:** 1
**Files:**
- `src/components/search/SearchBar.tsx` (modify — fix client-side Supabase query)
- `src/app/api/search/route.ts` (create — new server-side search API route)

**Action:**

The navbar `SearchBar.tsx` performs a client-side Supabase query (line 42-48) that has two bugs:

1. **No PostgREST escaping:** The query string is interpolated raw into `.or()`, so characters like `(`, `)`, `,` break PostgREST parsing and return zero results. The server-side `searchProducts()` in `product-service.ts` has `escapePostgrestQuery()` but SearchBar doesn't use it.

2. **Client-side query may fail silently:** The browser Supabase client query catches no errors — if the query fails (e.g., PostgREST parse error), `data` is null and results show empty.

Fix approach — create a server-side search API route and have SearchBar call it:

**Create `src/app/api/search/route.ts`:**
- Accept GET requests with `?q=` query parameter
- Validate: return 400 if `q` is missing or less than 2 characters
- Call the existing `searchProducts()` from `src/lib/supabase/product-service.ts` (which already escapes PostgREST characters and queries `name`, `description`, `brand` via ilike)
- Limit results to 8 items
- Return JSON: `{ results: Product[] }`
- Include proper error handling with try/catch

**Modify `src/components/search/SearchBar.tsx`:**
- Replace the direct Supabase client query (lines 41-48) with a `fetch('/api/search?q=...')` call
- Remove the `import { createClient } from '@/lib/supabase/client'` import (no longer needed)
- Add error handling: if fetch fails, set results to empty array and log to console
- Keep the 300ms debounce timer
- Keep the `onSearch` callback for shop-page variant (it filters client-side on pre-fetched products)
- For the `shop` variant, do NOT fetch from API — only call `onSearch(query)` since shop page does client-side filtering on its own product list. The API fetch should only happen when `variant === 'navbar'`.

**Context:** Read `@src/components/search/SearchBar.tsx`, `@src/lib/supabase/product-service.ts` (the `searchProducts` function and `escapePostgrestQuery`)

**Done when:**
- Typing a product name (e.g., "Coconut", "Musk", "Signature") in the navbar search dropdown shows matching product results within 500ms
- Clicking a result navigates to `/products/{id}`
- Pressing Enter navigates to `/shop?search={query}`
- Typing special characters like parentheses does not cause zero results or errors
- The "View all results" link at the bottom of dropdown works
- Shop page inline search still filters products client-side when typing
- `npx tsc --noEmit` passes with no errors in modified files
- Verify: `grep -c "escapePostgrestQuery\|/api/search" src/components/search/SearchBar.tsx` returns non-zero (confirms either API route usage or escaping)

## Task 2 — Fix Product Data in Database (Fragrance Notes, Compositions, Spelling)

**Wave:** 1
**Files:**
- `supabase/migrations/20260411_fix_product_data.sql` (create — SQL migration for product data fixes)

**Action:**

The client reported: missing fragrance notes, incorrect compositions, and the misspelling "Althar" instead of "Althair". Product fragrance notes are stored in the `description` column as HTML text (from the original Squarespace export). The original CSV at `old-website-pages/products_Jan-20_09-43-10AM.csv` contains the correct data.

Create a SQL migration file that:

1. **Fix "Althar" spelling:** Find the product with name containing "Althar" (likely "Althar by Parfums de Marly") and update the name to use the correct French spelling with diacritics: "Althair by Parfums de Marly". Also update the `id` field if it uses the misspelled slug (check with `WHERE id ILIKE '%althar%'` or `WHERE name ILIKE '%Althar%'`). Note: The original CSV shows the correct name is "Althair by Parfums de Marly" (with diacritics on the i).

2. **Fix Althair composition:** The CSV shows the correct Althair description should be:
   - Top Notes: Cinnamon, Cardamom, Orange Blossom and Bergamot
   - Middle Notes: Bourbon Vanilla and Elemi
   - Base Notes: Praline, Musk, Ambroxan, Guaiac Wood, Tonka and Candied Almond
   
   Update the description field to include these notes in clean HTML format.

3. **Restore missing fragrance notes on Aquad'or products:** The builder must query the current products table to find which Aquad'or products (where `brand IS NULL` or `brand ILIKE '%aquad%'`, and `category IN ('women', 'men', 'niche')`) have descriptions that do NOT contain "Top Notes" or "Fragrance Notes" or "Middle Notes" or "Base Notes" text. Cross-reference with the CSV file at `old-website-pages/products_Jan-20_09-43-10AM.csv` to find the original descriptions with fragrance notes and write UPDATE statements to restore them.

   The builder should:
   - Read the CSV file to extract all products that had fragrance note data (descriptions containing "Top Notes", "Middle Notes", "Base Notes", or "Fragrance Notes")
   - Query the database to find which of these products are currently missing their notes
   - Write SQL UPDATE statements to restore the descriptions from the CSV data
   - Clean up the HTML: strip Squarespace-specific classes/styles but keep the `<strong>` tags for note labels and `<p>` tags for structure

4. **Write as idempotent SQL:** Use `UPDATE ... WHERE` conditions that check current state, so the migration is safe to re-run.

**Important:** The migration file should be well-commented, with each fix clearly labeled. Use `BEGIN; ... COMMIT;` transaction wrapping.

**Context:** Read `@old-website-pages/products_Jan-20_09-43-10AM.csv` (source of truth for product descriptions), `@src/lib/supabase/types.ts` (product schema — description is `text`, no separate note columns)

**Done when:**
- Migration file exists at `supabase/migrations/20260411_fix_product_data.sql`
- SQL is valid and idempotent (can be run twice without error)
- The migration includes fixes for: Althar->Althair name, Althair composition, and at least 5 Aquad'or products with restored fragrance notes
- After applying: querying `SELECT name, description FROM products WHERE name ILIKE '%althair%'` returns the correctly spelled name with correct composition notes
- After applying: querying `SELECT name FROM products WHERE (brand IS NULL OR brand ILIKE '%aquad%') AND description NOT ILIKE '%notes%'` returns fewer rows than before (ideally zero for products that had notes in the CSV)

## Task 3 — Verify Search End-to-End and Fix Shop Page Search Integration

**Wave:** 2 (after Task 1, 2)
**Files:**
- `src/app/shop/ShopContent.tsx` (modify — ensure search query from URL param triggers search)
- `src/app/shop/page.tsx` (modify — pass all products to ShopContent when search query is present, not just Dubai Shop filtered products)

**Action:**

After Task 1 fixes the navbar search, there's still a data flow issue: when a user presses Enter in the navbar search or clicks "View all results", they navigate to `/shop?search=query`. But the shop page (`page.tsx` line 32) filters products to only show `category !== 'lattafa-original' && product_type === 'perfume'`, which means search results won't include Lattafa products or non-perfume products like essence oils.

Fix the shop page to show ALL matching products when a search query is present:

**Modify `src/app/shop/page.tsx`:**
- Read the `searchParams` prop (Next.js provides this to server components)
- If `searchParams.search` exists and is non-empty, pass ALL active products (unfiltered `allProducts`) to `ShopContent` instead of the Dubai-Shop-filtered subset
- Update the page title/subtitle dynamically when search is active (e.g., "Search Results" instead of "Dubai Shop")

**Modify `src/app/shop/ShopContent.tsx`:**
- Accept an optional `isSearchMode` prop to indicate we're showing search results
- When in search mode, change the hero title to "Search Results" and subtitle to something like "Showing results for '{query}'"
- When in search mode, hide the category filter pills (they don't make sense for cross-category search results)
- Ensure the search bar is pre-populated with the URL search query (this already works via `urlSearchQuery` state on line 28)

**Context:** Read `@src/app/shop/page.tsx`, `@src/app/shop/ShopContent.tsx`

**Done when:**
- Searching "Lattafa" from the navbar and pressing Enter shows Lattafa products on the shop page
- Searching "essence" or "oil" shows essence oil products (not filtered out)
- The shop page title shows "Search Results" when a search query is in the URL
- Category filter pills are hidden during search mode
- Clearing the search returns to normal "Dubai Shop" view with category filters
- No TypeScript errors: `npx tsc --noEmit` passes

## Success Criteria
- [ ] Navbar search bar returns relevant product results for queries like "Musk", "Coconut", "Signature", "Lattafa"
- [ ] Search results in dropdown are clickable and navigate to `/products/{id}`
- [ ] Pressing Enter in search navigates to `/shop?search={query}` and shows all matching products (including Lattafa, essence oils)
- [ ] Shop page inline search filters the displayed products correctly
- [ ] Product "Althair" is correctly spelled in the database (not "Althar")
- [ ] Althair has correct composition notes (Cinnamon, Cardamom, Orange Blossom, Bergamot / Bourbon Vanilla, Elemi / Praline, Musk, Ambroxan, Guaiac Wood, Tonka, Candied Almond)
- [ ] Aquad'or products that had fragrance notes in the original data have them restored
- [ ] No TypeScript errors (`npx tsc --noEmit` passes)
