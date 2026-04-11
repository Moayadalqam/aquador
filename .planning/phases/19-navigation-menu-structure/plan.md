---
phase: 19
goal: "Restructure navigation to remove Blog, add Men/Women/Unisex categories, make Lattafa Originals standalone, and restructure Dubai Shop with brand subcategories"
tasks: 3
waves: 2
---

# Phase 19: Navigation & Menu Structure

Goal: When this phase is done, the site navigation (desktop and mobile) reflects the client's requested structure — Blog is gone, Men/Women/Unisex are prominent browse-by-gender items, Lattafa Originals is its own top-level item, and Dubai Shop contains brand-based subcategories. All nav links resolve to working routes.

## Task 1 — Add gender-based browse routes and product service query

**Wave:** 1
**Files:**
- `src/lib/supabase/product-service.ts` — add `getProductsByGender(gender: ProductGender)` function
- `src/app/shop/gender/[gender]/page.tsx` — new Server Component page for gender-based browsing (Men, Women, Unisex)
- `src/app/shop/gender/[gender]/GenderContent.tsx` — new client component for gender browse page UI

**Action:**

1. In `src/lib/supabase/product-service.ts`, add a new exported function:
   ```ts
   export async function getProductsByGender(gender: ProductGender): Promise<Product[]> {
   ```
   This queries the `products` table filtering by `gender` column (which is the `product_gender` enum: `men | women | unisex`), with `is_active = true`, ordered by `in_stock` desc then `created_at` desc. Use the existing `PRODUCT_COLUMNS` constant and `createPublicClient()` pattern. Add Sentry breadcrumb on error, return `[]` on failure.

2. Also add a helper function:
   ```ts
   export function getGenderLabel(gender: string): string {
   ```
   Returns `"Men's Fragrances"` for `"men"`, `"Women's Fragrances"` for `"women"`, `"Unisex Fragrances"` for `"unisex"`.

3. Create `src/app/shop/gender/[gender]/page.tsx` as a Server Component:
   - `revalidate = 1800` (matches existing shop pages)
   - `generateStaticParams()` returns `[{ gender: 'men' }, { gender: 'women' }, { gender: 'unisex' }]`
   - `generateMetadata()` produces title like `"Men's Fragrances | Aquad'or Cyprus"` using `getGenderLabel()`
   - Default export fetches products via `getProductsByGender()`, filters to `product_type === 'perfume'` (matching existing pattern from shop page), passes to `GenderContent`
   - Include BreadcrumbList JSON-LD (Home > Shop > Men's Fragrances)
   - If gender param is not one of `men | women | unisex`, call `notFound()`

4. Create `src/app/shop/gender/[gender]/GenderContent.tsx` as a `'use client'` component:
   - Accept `{ gender: string; genderLabel: string; products: Product[] }` props
   - Render a `PageHero` with the gender label as title
   - Include search filtering (local text search on name/description/brand, same pattern as `ShopContent`)
   - Render products using the existing `ProductCard` component in a responsive grid
   - Show empty state when no products match
   - Import from: `@/components/ui/Section` (PageHero), `@/components/ui/ProductCard` (ProductCard), `@/lib/supabase/types` (Product type)

**Context:** Read `@src/app/shop/page.tsx`, `@src/app/shop/[category]/page.tsx`, `@src/app/shop/[category]/CategoryContent.tsx`, `@src/lib/supabase/product-service.ts`

**Done when:**
- `src/app/shop/gender/men/`, `/shop/gender/women/`, `/shop/gender/unisex/` all render without errors
- Each page shows only products matching that gender value from the database
- `npx tsc --noEmit` passes with no errors related to these files
- Visiting `/shop/gender/invalid` returns 404

## Task 2 — Restructure Navbar with new navigation links and dropdown for Dubai Shop

**Wave:** 2 (after Task 1 — needs gender routes to exist)
**Files:**
- `src/components/layout/Navbar.tsx` — rewrite `navLinks` array, add Dubai Shop dropdown with brand subcategories, remove Blog

**Action:**

1. Replace the `navLinks` array (currently 7 flat items) with a structured navigation that uses the existing `NavItem` interface from `@/types` (which already has `children?: NavItem[]`). The new structure:

   ```ts
   const navLinks: NavItem[] = [
     { label: 'Men', href: '/shop/gender/men' },
     { label: 'Women', href: '/shop/gender/women' },
     { label: 'Unisex', href: '/shop/gender/unisex' },
     { label: 'Lattafa Originals', href: '/shop/lattafa' },
     { label: 'Dubai Shop', href: '/shop', children: [
       { label: 'All Dubai Fragrances', href: '/shop' },
       { label: 'Al Haramain', href: '/shop/al-haramain-originals' },
       { label: 'Xerjoff', href: '/shop?brand=xerjoff' },
       { label: 'Niche Collection', href: '/shop/niche' },
     ]},
     { label: 'Create Your Own', href: '/create-perfume' },
     { label: 'About', href: '/about' },
     { label: 'Contact', href: '/contact' },
   ];
   ```

   Note: "Blog" is removed entirely. "Re-Order" is removed (it was not in the client's requested structure). Men/Women/Unisex are first (prominent position). Lattafa Originals is standalone (not nested). Dubai Shop has brand subcategories.

   Important: The `al-haramain-originals` category already exists in the database enum and products exist under it — so `/shop/al-haramain-originals` will work with the existing `[category]` dynamic route once the category is added to `src/lib/categories.ts` (handled in Task 3). For Xerjoff, use a query param `?brand=xerjoff` since Xerjoff products don't have their own category in the DB — they're in the `niche` category with `brand: 'Xerjoff'`.

2. Split nav links for desktop layout. Currently `leftLinks = navLinks.slice(0, 3)` and `rightLinks = navLinks.slice(3)`. Update the split so the logo remains centered:
   - `leftLinks`: Men, Women, Unisex, Lattafa Originals (4 items)
   - `rightLinks`: Dubai Shop, Create Your Own, About, Contact (4 items)

3. Add a **desktop dropdown** for the Dubai Shop item. When a `NavLink` has `children`, render a hover-triggered dropdown panel below the nav item:
   - Use CSS `group`/`group-hover` or a state-based approach for the dropdown
   - Dropdown: positioned absolute below the nav item, with `bg-white/98 backdrop-blur shadow-lg border border-gold/10 rounded-lg`
   - Each child link styled as a vertical list with hover state (text goes gold)
   - Add `200ms` transition for opacity/transform on enter/exit
   - Dropdown has `min-width: 200px`, padding `py-3 px-1`
   - Each item: `px-4 py-2 text-[11px] uppercase tracking-[0.14em]` matching existing nav link style

4. Update the **mobile menu** (the `AnimatePresence` overlay section, around lines 191-255). Currently iterates `navLinks` flat. Must now:
   - Skip items with `children` from the flat list OR render the parent with its children expanded below it
   - Recommended: Render Dubai Shop as a collapsible section. Tap "Dubai Shop" label to expand/collapse its children with a subtle rotate chevron icon
   - Children indented with `pl-10` and slightly smaller text `text-[18px]` vs parent `text-[21px]`
   - Use `ChevronDown` from lucide-react for the expand indicator (already a dependency)

5. Update `checkActive` function (line 63-66) to handle the new routes:
   - `/shop/gender/*` paths should NOT activate the "Dubai Shop" nav item
   - Gender links: `pathname.startsWith('/shop/gender/men')` activates "Men", etc.
   - Lattafa: `pathname === '/shop/lattafa'` or `pathname.startsWith('/shop/lattafa/')` activates "Lattafa Originals"
   - Dubai Shop: `pathname === '/shop'` or `pathname.startsWith('/shop/') && !pathname.startsWith('/shop/gender/') && !pathname.startsWith('/shop/lattafa')` activates "Dubai Shop"

6. Import `NavItem` from `@/types` and `ChevronDown` from `lucide-react`.

**Context:** Read `@src/components/layout/Navbar.tsx` (the entire file), `@src/types/index.ts` (NavItem interface)

**Done when:**
- Desktop nav shows: Men | Women | Unisex | Lattafa Originals | [LOGO] | Dubai Shop (with dropdown) | Create Your Own | About | Contact
- "Blog" does not appear anywhere in the navigation (desktop or mobile)
- Hovering "Dubai Shop" on desktop reveals a dropdown with subcategories
- Mobile menu shows all items with Dubai Shop as a collapsible section
- Active state highlighting works correctly for all routes
- All nav links are clickable and navigate to valid routes
- `npx tsc --noEmit` passes

## Task 3 — Add Al Haramain category to categories.ts and update shop page brand filtering

**Wave:** 2 (after Task 1)
**Files:**
- `src/lib/categories.ts` — add Al Haramain Originals category entry
- `src/types/index.ts` — no change needed (`al-haramain-originals` already in Category `id` union type)
- `src/app/shop/ShopContent.tsx` — add brand filter support for `?brand=` query param

**Action:**

1. In `src/lib/categories.ts`, add an `al-haramain-originals` entry to the `categories` array:
   ```ts
   {
     id: 'al-haramain-originals',
     name: 'Al Haramain Originals',
     slug: 'al-haramain-originals',
     description: 'Authentic Al Haramain Perfumes',
     image: '/aquador.webp', // Placeholder — use product image if available
   },
   ```
   This is required so that `/shop/al-haramain-originals` resolves via the existing `[category]` dynamic route (which calls `getCategoryBySlug` which looks up in this array). The `al-haramain-originals` value already exists in the DB enum and in the `Category` id union type.

2. In `src/app/shop/ShopContent.tsx`, add support for `?brand=` query parameter filtering:
   - Read `brand` from `searchParams.get('brand')`
   - If `brand` is set, filter `products` to only those where `product.brand?.toLowerCase() === brand.toLowerCase()`
   - Show the active brand filter as a pill/tag above the product grid (e.g., "Showing: Xerjoff") with a clear button
   - This enables the Dubai Shop dropdown link `?brand=xerjoff` to work correctly

3. In `src/app/shop/page.tsx`, update the metadata title from "Dubai Shop" to "Dubai Shop" (keep as is — this is the correct name). Make sure the Lattafa exclusion filter remains:
   ```ts
   const products = allProducts.filter(p => p.category !== 'lattafa-original' && p.product_type === 'perfume');
   ```
   This is already correct — Dubai Shop should NOT include Lattafa products (Lattafa has its own top-level nav item).

**Context:** Read `@src/lib/categories.ts`, `@src/types/index.ts`, `@src/app/shop/ShopContent.tsx`, `@src/app/shop/page.tsx`

**Done when:**
- `/shop/al-haramain-originals` renders the Al Haramain category page with products from that DB category
- `/shop?brand=xerjoff` filters the Dubai Shop to only show Xerjoff-branded products
- The brand filter pill appears when filtering by brand, and clearing it shows all Dubai Shop products
- `npx tsc --noEmit` passes
- The `generateStaticParams` in `[category]/page.tsx` now includes `al-haramain-originals` (automatically, since it reads from the categories array)

## Success Criteria
- [ ] "Blog" link does not appear in desktop navigation or mobile menu
- [ ] Men, Women, Unisex appear as top-level navigation items and link to `/shop/gender/men`, `/shop/gender/women`, `/shop/gender/unisex` respectively
- [ ] Each gender page loads and displays products filtered by that gender from the database
- [ ] "Lattafa Originals" is a standalone top-level navigation item (not nested under Dubai Shop)
- [ ] "Dubai Shop" has a hover dropdown on desktop with subcategories: All Dubai Fragrances, Al Haramain, Xerjoff, Niche Collection
- [ ] Dubai Shop dropdown subcategories all link to working routes
- [ ] Mobile menu reflects the same navigation structure with Dubai Shop as a collapsible section
- [ ] Active state highlighting correctly identifies which nav item matches the current route
- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] Responsive: navigation works on 375px mobile and 1440px desktop
