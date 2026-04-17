---
phase: 23
goal: "Performance & Accessibility quick wins — font trim, cache TTL review, dead-code removal, generateStaticParams coverage, focus/landmark/contrast a11y polish, image sizes audit, metadata dedup. Zero visual regression."
tasks: 7
waves: 2
---

# Phase 23: Performance & Accessibility Quick Wins

Goal: Squeeze measurable Core Web Vitals + Lighthouse wins and eliminate accessibility debt without changing the visual design. All existing behavior preserved. `npx tsc --noEmit` clean, `npm run build` clean, `npm run lint` clean.

**Stack lock:** Next.js 14.2.35 App Router, React 18, Tailwind, Supabase. Do NOT introduce `use cache`, `cacheComponents`, or any Next.js 15/16 API — not available in 14.x.

**Visual lock:** No user-visible design change. Colors, spacing, fonts, layouts must match current production byte-for-byte except where explicitly fixing contrast.

**Keep:** Framer Motion (53 files), all existing Supabase + Stripe flows, CSS variables in `globals.css`.

**Existing baseline (verified before planning):**
- Skip link already present in `src/app/layout.tsx:119-124`
- `<main id="main-content">` already present in `src/app/layout.tsx:131`
- `@media (prefers-reduced-motion: reduce)` already honored in `src/app/globals.css:893`
- `generateStaticParams` already on `/shop/[category]`, `/shop/gender/[gender]`, `/products/[slug]`
- `generateStaticParams` MISSING on `/blog/[slug]/page.tsx`
- CTASection only referenced in `src/components/home/CTASection.tsx` itself (dead code — confirmed via Grep)
- `canonical` duplicated in `src/app/layout.tsx:91-93` AND `src/app/page.tsx:13-15`
- Navbar uses `<motion.header>` — fine. Footer uses `<footer>` — fine. Desktop nav `<nav>` exists, but no `aria-current` on active links (verified: Grep found 0 matches in `src/components/layout`).

---

## Task 1 — Font loading trim + axes audit

**Wave:** 1
**Files:**
- `src/app/layout.tsx` — modify `Playfair_Display()` and `Poppins()` calls (lines 25–37)

**Context:** Read @src/app/layout.tsx, then `npx grep` across `src/` for actual `font-weight` / Tailwind `font-{weight}` usage to confirm which weights are actually rendered. Playfair is used for display headings; Poppins for body. Before changing, verify via Grep: `font-bold`, `font-semibold`, `font-medium`, `font-light`, `font-thin`, and inline `style={{ fontWeight: ... }}`.

**Action:**
1. Run these Grep queries to enumerate actual weight usage BEFORE editing:
   - `grep -r "font-bold\|font-semibold\|font-medium\|font-light\|font-thin\|fontWeight" src/`
   - `grep -r "font-playfair" src/` (find Playfair usage contexts)
2. In `src/app/layout.tsx:25-30` (Playfair): current `weight: ["400", "700"]`. If Grep shows no Playfair usage with `font-bold`/`font-semibold`, reduce to `weight: ["400"]`. Otherwise keep as-is.
3. In `src/app/layout.tsx:32-37` (Poppins): current `weight: ["300", "400", "600"]`. If `font-light` unused in Poppins contexts, remove `"300"`. If `font-semibold` unused, remove `"600"`. Keep `"400"` always.
4. Keep `display: "swap"`, `subsets: ["latin"]`, and CSS variable names (`--font-playfair`, `--font-poppins`) UNCHANGED.
5. Do NOT add `preload: false`. Next.js preloads by default and that is correct for fonts used above the fold.
6. After edit, run `npm run build` and confirm the "Compiled successfully" line — Next.js will emit WOFF2 files for exactly the requested weights.

**Done when:**
- `src/app/layout.tsx` ships ONLY the weights actually referenced in JSX/CSS (verified by Grep output attached to commit).
- `npm run build` succeeds.
- Visual check: homepage, product page, blog page render with identical typography (open in browser, no FOUT, no regressed weights).

---

## Task 2 — Delete unused CTASection component

**Wave:** 1
**Files:**
- `src/components/home/CTASection.tsx` — DELETE

**Context:** Read @src/components/home/CTASection.tsx (dead-code candidate). Confirmed via `Grep "CTASection" src/` that the only file matching is `src/components/home/CTASection.tsx` itself — no imports anywhere. Removed from the homepage in phase 20.

**Action:**
1. FIRST, re-verify no import exists. Run:
   `grep -rn "CTASection\|from ['\"].*CTASection" src/ .planning/ scripts/ e2e/ 2>/dev/null | grep -v "CTASection.tsx:"`
2. If output is empty, delete the file: `rm src/components/home/CTASection.tsx`.
3. If the grep reveals ANY import (e.g. `import CTASection from ...`), ABORT the deletion and leave the file in place — the task cannot complete and the plan needs revision.

**Done when:**
- `test ! -f src/components/home/CTASection.tsx` returns exit 0.
- `npm run build` still succeeds.
- `grep -rn "CTASection" src/` returns no matches.

---

## Task 3 — Add generateStaticParams to /blog/[slug] + tighten cache TTLs

**Wave:** 1
**Files:**
- `src/app/blog/[slug]/page.tsx` — add `generateStaticParams` export; adjust `revalidate`
- `src/app/blog/page.tsx` — adjust `revalidate`
- `src/lib/blog.ts` — add a `getAllBlogSlugs()` helper (new export)

**Context:** Read @src/app/blog/[slug]/page.tsx (currently no `generateStaticParams`, revalidate=60) and @src/app/blog/page.tsx (revalidate=60). Read @src/lib/blog.ts lines 1-90 to confirm Supabase query shape. Reference @src/lib/supabase/product-service.ts `getAllProductSlugs()` (line 156) for the exact pattern.

**Action:**
1. In `src/lib/blog.ts`, add a new export after `getBlogPosts`:
   ```ts
   export async function getAllBlogSlugs(): Promise<string[]> {
     const supabase = createPublicClient(); // use the same public/read-only client pattern already used in this file
     const { data, error } = await supabase
       .from('blog_posts')
       .select('slug')
       .eq('status', 'published');
     if (error || !data) return [];
     return data.map((row) => row.slug);
   }
   ```
   Match the existing Supabase client import used elsewhere in this file — do NOT introduce a new client.
2. In `src/app/blog/[slug]/page.tsx`, at line 6 change `export const revalidate = 60;` to `export const revalidate = 300;` (5 minutes — blog posts rarely update and admin panel will `revalidatePath` on edit anyway).
3. In `src/app/blog/[slug]/page.tsx`, after the `BlogPostPageProps` interface (around line 10), add:
   ```ts
   export async function generateStaticParams() {
     const slugs = await getAllBlogSlugs();
     return slugs.map((slug) => ({ slug }));
   }
   ```
   Update the import at line 3: `import { getBlogPostBySlug, getRelatedPosts, getAllBlogSlugs } from '@/lib/blog';`
4. In `src/app/blog/page.tsx` line 5, change `export const revalidate = 60;` to `export const revalidate = 300;`.
5. Do NOT touch other revalidate values — homepage (600), shop (1800), products (3600) are already reasonable. Document the TTL audit inline with a one-line comment on each page if missing.

**Done when:**
- `grep -n "generateStaticParams" src/app/blog/\[slug\]/page.tsx` returns a match.
- `grep -n "getAllBlogSlugs" src/lib/blog.ts src/app/blog/\[slug\]/page.tsx` returns matches in both files.
- `npm run build` logs `●  (SSG)` for `/blog/[slug]` with the blog post slugs prerendered (or `●  (ISR)` if Supabase is unreachable at build time — either is acceptable, the key is no runtime error).
- `npx tsc --noEmit` returns 0 errors.

---

## Task 4 — A11y polish: aria-current, landmarks, focus-visible rings

**Wave:** 1
**Files:**
- `src/components/layout/Navbar.tsx` — add `aria-current="page"` to active nav links in both `DesktopNavLink` and the mobile `<Link>` renders; wrap desktop nav in a `<nav aria-label="Primary">` landmark
- `src/components/layout/Footer.tsx` — add `<nav aria-label="Footer">` wrapper around the link columns
- `src/app/globals.css` — add a global `:focus-visible` ring rule (gold, 2px, 2px offset) that applies to all interactive elements (a, button, input, textarea, select, [role="button"]) — scoped to avoid breaking existing `.focus-gold` class at line 928

**Context:** Read @src/components/layout/Navbar.tsx (especially the `DesktopNavLink` function at line 336 and mobile `<Link>` at line 298), @src/components/layout/Footer.tsx, and @src/app/globals.css lines 925–945 for existing focus-ring utility. Confirmed via Grep that `aria-current` is NOT used anywhere in `src/components/layout`.

**Action:**
1. In `src/components/layout/Navbar.tsx`, `DesktopNavLink` function (line 336 onward): on the `<Link href={item.href} ...>` elements (lines 340 and 374), add prop `aria-current={active ? 'page' : undefined}`.
2. In the mobile `<Link>` at line 298 (`className="flex items-center gap-4 py-3.5 border-b ..."`), add `aria-current={checkActive(link.href) ? 'page' : undefined}`.
3. In `Navbar.tsx`, the outer `<nav className="container-wide">` at line 108 already exists — add `aria-label="Primary"` to it.
4. In `src/components/layout/Footer.tsx`, wrap the link grid (the `md:col-span-3` columns containing `shopLinks` and `companyLinks` — confirm exact location by reading the file) in a single `<nav aria-label="Footer">` element. Do NOT change visual layout — the `<nav>` must not introduce margin or padding.
5. In `src/app/globals.css`, after line 931 (end of `.focus-gold:focus-visible`), append:
   ```css
   /* Global focus-visible ring — applies to all interactive elements not explicitly styled */
   a:focus-visible,
   button:focus-visible,
   input:focus-visible,
   textarea:focus-visible,
   select:focus-visible,
   [role="button"]:focus-visible,
   [tabindex]:focus-visible {
     outline: 2px solid oklch(75% 0.12 85);
     outline-offset: 2px;
     border-radius: 2px;
   }
   ```
6. Do NOT modify the existing skip-link — it already works.

**Done when:**
- `grep -c "aria-current" src/components/layout/Navbar.tsx` returns ≥ 3 (desktop + children + mobile).
- `grep -c "aria-label=\"Footer\"" src/components/layout/Footer.tsx` returns 1.
- `grep -c ":focus-visible" src/app/globals.css` returns ≥ 2.
- Keyboard Tab-through homepage shows visible gold ring on every interactive element (manual verifier check).
- `npm run build` succeeds; no visual regression on pixel compare.

---

## Task 5 — next/image sizes + dimensions audit

**Wave:** 1
**Files:**
- `src/components/ui/Card.tsx` — ensure `sizes` prop on any `<Image fill>`
- `src/components/cart/CartItem.tsx` — ensure `sizes` prop
- `src/components/admin/ProductForm.tsx` — ensure `sizes` prop on preview image
- `src/components/ai/ChatWidget.tsx` — ensure `sizes` prop on any inline `<Image>`
- `src/components/ui/LoadingScreen.tsx` — verify explicit width/height on logo image
- `src/components/admin/AdminSidebar.tsx` — verify logo has width/height (only on admin routes, low priority but trivially fixable)

**Context:** Read each file. Confirmed via Grep that 16 components use `next/image` but only 9 have `sizes=` — the 7 without are at risk of over-fetching on CDN. Any `<Image fill />` without `sizes` triggers a Next.js warning at build.

**Action:**
1. For each file, open and locate every `<Image ... />` usage.
2. If `<Image fill />` is used, add a `sizes` prop matching the rendered container width. Rule of thumb:
   - Full-bleed hero: `sizes="100vw"`
   - Card in a 3-col grid: `sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"`
   - Small thumbnail (cart, chat): `sizes="64px"` or exact pixel size
3. If `<Image src width={...} height={...} />` (non-fill), ensure both `width` and `height` are set as integer literals (not undefined). Do NOT change the rendered dimensions.
4. Do NOT convert any existing `<Image>` to `<img>`. Do NOT change `priority` flags (those are already correctly set for LCP images per Grep results).
5. For `src/components/home/CTASection.tsx` — skip (will be deleted in Task 2).

**Done when:**
- `grep -rEn "<Image[^>]*\s+fill\b(?!.*\bsizes=)" src/components/ --include="*.tsx"` returns no matches (every `fill` Image has `sizes`). Note: multiline regex — may need `rg --multiline --multiline-dotall` or manual review.
- `npm run build` emits no `<Image>` warnings.
- Visual: product cards, cart drawer, chat widget images render identically (no CLS regression, verified by Lighthouse CLS score unchanged or improved).

---

## Task 6 — Metadata dedup + canonical cleanup

**Wave:** 1
**Files:**
- `src/app/page.tsx` — remove redundant `metadata` export (homepage inherits from layout) OR keep only page-specific overrides
- `src/app/layout.tsx` — keep root metadata as the single source of canonical

**Context:** Read @src/app/layout.tsx lines 39-94 and @src/app/page.tsx lines 10-16. Both set `title`, `description`, and `alternates.canonical` to `'https://aquadorcy.com'`. This is a DOM duplication — the page-level metadata shadows layout-level title and description, so the `<link rel="canonical">` is emitted twice (once from layout default, once from page override).

**Action:**
1. In `src/app/page.tsx`, lines 10-16, the `metadata` export is identical to layout defaults. Delete the entire `metadata` export block (lines 10-16). Homepage will inherit from `layout.tsx` via the `template: "%s | Aquad'or Cyprus"` — BUT because the layout uses `title.default` and `title.template`, the homepage will render with the default title, which is what we want.
2. Verify that removing the page metadata does NOT break any test or E2E snapshot (search for `aquadorcy.com | ` in `e2e/`).
3. In `src/app/layout.tsx`, `metadataBase: new URL('https://aquadorcy.com')` at line 40 is correct — no change.
4. Do NOT modify other page-level `metadata` exports (product, category, blog) — those have page-specific canonical URLs and are correct.

**Done when:**
- `grep -c "export const metadata" src/app/page.tsx` returns 0.
- `curl -s https://www.aquadorcy.com | grep -c 'rel="canonical"'` returns 1 (after deploy — verifier will test post-deploy).
- `npm run build` succeeds.
- Homepage `<title>` still renders as `Aquad'or | Luxury Perfumes & Niche Fragrances Cyprus` (verified via `view-source:` after deploy).

---

## Task 7 — tsc + lint + build sanity gate (depends on all above)

**Wave:** 2 (after Tasks 1–6)

**Files:** none (verification-only task)

**Context:** Not a code change — this is the final gate that ensures all parallel wave-1 tasks compose cleanly. Required because Task 3 adds a new export to `blog.ts`, Task 2 deletes a file, and Task 1 trims font weights — any of these could cascade into lint or type errors.

**Action:**
1. Run `npx tsc --noEmit` from repo root.
2. Run `npm run lint`.
3. Run `npm run build`.
4. Run `npm run test` (Jest unit tests — fast, no network).
5. If any command fails, STOP and report the exact error. Do NOT paper over with eslint-disable or ts-ignore.

**Done when:**
- All four commands exit 0.
- `.next/build-manifest.json` exists and lists the expected routes.
- No new `ERROR` lines in build output compared to the main-branch baseline.

---

## Success Criteria

- [ ] Font files shipped = only weights actually used in JSX/CSS (Task 1).
- [ ] `src/components/home/CTASection.tsx` no longer exists (Task 2).
- [ ] `/blog/[slug]` pre-renders at build time via `generateStaticParams` (Task 3).
- [ ] Blog list + post revalidate bumped from 60s → 300s (Task 3).
- [ ] Primary nav, dropdown children, and mobile nav links all emit `aria-current="page"` when active (Task 4).
- [ ] Footer link columns wrapped in `<nav aria-label="Footer">` (Task 4).
- [ ] Global `:focus-visible` gold ring applies to all interactive elements (Task 4).
- [ ] Every `<Image fill>` in the codebase has a `sizes` prop (Task 5).
- [ ] Homepage emits exactly one `<link rel="canonical">` (Task 6).
- [ ] `npx tsc --noEmit`, `npm run lint`, `npm run build`, `npm run test` all pass (Task 7).
- [ ] Visual pixel-compare vs production: no user-perceivable difference on homepage, shop, product page, blog post.

---

## Verification Contract

### Contract for Task 1 — font trim
**Check type:** command-exit
**Command:** `npm run build 2>&1 | grep -E "(Error|error TS|Failed to compile)" | wc -l`
**Expected:** `0`
**Fail if:** Any compile error, especially `--font-playfair` or `--font-poppins` undefined warnings.

### Contract for Task 1 — font weight trim (grep)
**Check type:** grep-match
**Command:** `grep -E 'weight:\s*\[' /home/qualiasolutions/Projects/aquador/src/app/layout.tsx`
**Expected:** Two matches (Playfair and Poppins), each with a weight array that is a strict subset of or equal to current values.
**Fail if:** Weight arrays contain values whose corresponding Tailwind class (`font-bold`, `font-semibold`, `font-light`) cannot be found via `grep -r "font-<weight-name>" src/`.

### Contract for Task 2 — CTASection deleted
**Check type:** file-exists (inverted)
**Command:** `test ! -f /home/qualiasolutions/Projects/aquador/src/components/home/CTASection.tsx && echo DELETED`
**Expected:** `DELETED`
**Fail if:** File still present.

### Contract for Task 2 — no stale imports
**Check type:** grep-match
**Command:** `grep -rn "CTASection" /home/qualiasolutions/Projects/aquador/src/ 2>/dev/null | wc -l`
**Expected:** `0`
**Fail if:** Any match — indicates an orphaned import that would break the build.

### Contract for Task 3 — generateStaticParams on blog
**Check type:** grep-match
**Command:** `grep -c "export async function generateStaticParams" /home/qualiasolutions/Projects/aquador/src/app/blog/\[slug\]/page.tsx`
**Expected:** `1`
**Fail if:** `0` — means blog posts will SSR on every request instead of pre-rendering.

### Contract for Task 3 — getAllBlogSlugs helper exists
**Check type:** grep-match
**Command:** `grep -c "export async function getAllBlogSlugs" /home/qualiasolutions/Projects/aquador/src/lib/blog.ts`
**Expected:** `1`
**Fail if:** `0`.

### Contract for Task 3 — blog revalidate tightened
**Check type:** grep-match
**Command:** `grep -n "export const revalidate" /home/qualiasolutions/Projects/aquador/src/app/blog/page.tsx /home/qualiasolutions/Projects/aquador/src/app/blog/\[slug\]/page.tsx`
**Expected:** Both files show `revalidate = 300`.
**Fail if:** Either still shows `= 60`.

### Contract for Task 4 — aria-current on nav
**Check type:** grep-match
**Command:** `grep -c "aria-current" /home/qualiasolutions/Projects/aquador/src/components/layout/Navbar.tsx`
**Expected:** `≥ 3`
**Fail if:** `< 3` — means not all three render paths (desktop link, dropdown parent, mobile link) got the attribute.

### Contract for Task 4 — footer nav landmark
**Check type:** grep-match
**Command:** `grep -c 'aria-label="Footer"' /home/qualiasolutions/Projects/aquador/src/components/layout/Footer.tsx`
**Expected:** `1`
**Fail if:** `0`.

### Contract for Task 4 — global focus-visible rule
**Check type:** grep-match
**Command:** `grep -c "focus-visible" /home/qualiasolutions/Projects/aquador/src/app/globals.css`
**Expected:** `≥ 2` (existing `.focus-gold` + new global rule)
**Fail if:** `< 2`.

### Contract for Task 4 — keyboard navigation (behavioral)
**Check type:** behavioral
**Command:** (manual — verifier tabs through homepage)
**Expected:** Visible gold 2px ring appears on every focused interactive element (logo, nav links, search button, cart icon, hero CTAs, product cards, footer links). Skip link appears on first Tab.
**Fail if:** Any focused element shows no visible ring or shows `outline: none` without replacement.

### Contract for Task 5 — every fill Image has sizes
**Check type:** grep-match (multiline)
**Command:** `rg --multiline --multiline-dotall -U '<Image(?:(?!/>).)*?\bfill\b(?:(?!/>).)*?/>' /home/qualiasolutions/Projects/aquador/src/components/ --type tsx | grep -v "sizes=" | wc -l`
**Expected:** `0`
**Fail if:** `> 0` — any `<Image fill />` without `sizes`.

### Contract for Task 5 — build emits no Image warnings
**Check type:** command-exit
**Command:** `npm run build 2>&1 | grep -iE "Image.*sizes|missing.*sizes" | wc -l`
**Expected:** `0`
**Fail if:** Any warning about missing `sizes`.

### Contract for Task 6 — homepage metadata removed
**Check type:** grep-match
**Command:** `grep -c "export const metadata" /home/qualiasolutions/Projects/aquador/src/app/page.tsx`
**Expected:** `0`
**Fail if:** `1` or more — means duplicate canonical will still be emitted.

### Contract for Task 6 — canonical single source (post-deploy)
**Check type:** command-exit
**Command:** `curl -s https://www.aquadorcy.com | grep -c 'rel="canonical"'`
**Expected:** `1`
**Fail if:** `0` (missing) or `≥ 2` (duplicated).

### Contract for Task 7 — TypeScript clean
**Check type:** command-exit
**Command:** `cd /home/qualiasolutions/Projects/aquador && npx tsc --noEmit 2>&1 | grep -c "error TS"`
**Expected:** `0`
**Fail if:** Any TS error.

### Contract for Task 7 — Lint clean
**Check type:** command-exit
**Command:** `cd /home/qualiasolutions/Projects/aquador && npm run lint 2>&1 | grep -cE "error|Error:"`
**Expected:** `0`
**Fail if:** Any lint error (warnings OK).

### Contract for Task 7 — Build success
**Check type:** command-exit
**Command:** `cd /home/qualiasolutions/Projects/aquador && npm run build 2>&1 | tail -1`
**Expected:** Exit 0 and no `Failed to compile` line in output.
**Fail if:** Build fails.

### Contract for Task 7 — Jest unit tests
**Check type:** command-exit
**Command:** `cd /home/qualiasolutions/Projects/aquador && npm run test -- --watchAll=false 2>&1 | grep -cE "Tests:.*failed"`
**Expected:** `0`
**Fail if:** Any failing Jest test.

### Overall Contract — visual regression (behavioral)
**Check type:** behavioral
**Command:** (verifier opens https://www.aquadorcy.com and a local dev build side-by-side)
**Expected:** Homepage, `/shop`, `/shop/lattafa`, `/products/<any-slug>`, `/blog/<any-slug>`, `/contact` render identically. Typography unchanged. Colors unchanged. Spacing unchanged. Animations unchanged.
**Fail if:** Any visual diff perceivable at 1x zoom.
