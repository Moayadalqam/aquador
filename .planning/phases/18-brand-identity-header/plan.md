---
phase: 18
goal: "Fix all brand identity issues in header/hero area reported by client"
tasks: 3
waves: 1
---

# Phase 18: Brand Identity & Header

Goal: All client-reported brand identity issues in the header, hero, and footer are corrected — logo is icon-only with gold color, year reads "Since May 2018", tagline reads "Scent of Luxury", cart uses a shopping bag icon, and decorative separator uses a single centered dot.

## Task 1 — Replace cart icon and fix decorative dots

**Wave:** 1
**Files:**
- `src/components/cart/CartIcon.tsx` — Replace custom perfume SVG with Lucide `ShoppingBag` icon
- `src/components/home/Hero.tsx` — Change two-dot separator to single centered dot, fix year from "Since 2024" to "Since May 2018"
- `src/components/home/CTASection.tsx` — Change two-dot separator to single centered dot

**Action:**

In `src/components/cart/CartIcon.tsx`:
- Remove the entire inline `<svg>` element (lines 17-37) that draws a perfume bottle outline
- Import `ShoppingBag` from `lucide-react`
- Replace the SVG with `<ShoppingBag className="w-[20px] h-[20px]" strokeWidth={1.5} />`
- Keep all surrounding motion.button wrapper, className, aria-label, and badge logic unchanged

In `src/components/home/Hero.tsx`:
- Line 90: Change `Cyprus &nbsp;&bull;&nbsp; Since 2024` to `Cyprus &nbsp;&bull;&nbsp; Since May 2018`
- Lines 113-122 (the separator div): Replace the 5-element separator (line, dot, line, dot, line) with a 3-element separator: line, single dot, line. Remove one of the two `<div className="w-1 h-1 rounded-full bg-gold/60" />` elements and the extra line between them. Result should be:
  ```
  <div className="w-12 h-px bg-gradient-to-r from-transparent to-gold/40" />
  <div className="w-1.5 h-1.5 rounded-full bg-gold/60" />
  <div className="w-12 h-px bg-gradient-to-l from-transparent to-gold/40" />
  ```
  (Single centered dot, slightly larger at w-1.5 h-1.5 for visual balance, flanked by symmetric fade lines)

In `src/components/home/CTASection.tsx`:
- Lines 126-132 (the separator div): Apply the same single-dot pattern:
  ```
  <div className="w-8 h-px bg-gold/30" />
  <div className="w-1.5 h-1.5 rounded-full bg-gold/60" />
  <div className="w-8 h-px bg-gold/30" />
  ```

**Context:** Read `@src/components/cart/CartIcon.tsx`, `@src/components/home/Hero.tsx`, `@src/components/home/CTASection.tsx`
**Done when:**
- CartIcon renders a Lucide ShoppingBag (not a perfume bottle SVG). Verify: `grep -c "ShoppingBag" src/components/cart/CartIcon.tsx` returns 2 (import + usage), and `grep -c "<svg" src/components/cart/CartIcon.tsx` returns 0.
- Hero separator has exactly 1 rounded-full dot element. Verify: `grep -c "rounded-full bg-gold" src/components/home/Hero.tsx` returns 1.
- CTASection separator has exactly 1 rounded-full dot element. Verify: `grep -c "rounded-full bg-gold" src/components/home/CTASection.tsx` returns 1.
- Hero displays "Since May 2018". Verify: `grep -c "Since May 2018" src/components/home/Hero.tsx` returns 1.
- No TypeScript errors: `npx tsc --noEmit` passes.

## Task 2 — Replace tagline everywhere

**Wave:** 1
**Files:**
- `src/components/home/Hero.tsx` — line 129: change visible tagline
- `src/components/layout/Navbar.tsx` — line 257: change mobile menu tagline
- `src/components/layout/Footer.tsx` — line 52: change footer tagline
- `src/app/api/webhooks/stripe/route.ts` — line 183: change email template tagline
- `src/app/layout.tsx` — lines 41, 56, 73: change metadata descriptions
- `src/app/page.tsx` — line 11: change page metadata description

**Action:**

Replace every occurrence of "Where Luxury Meets Distinction" with "Scent of Luxury" across all six files. Specifically:

1. `src/components/home/Hero.tsx` line 129: Change the text inside the `<motion.p>` from `Where Luxury Meets Distinction` to `Scent of Luxury`
2. `src/components/layout/Navbar.tsx` line 257: Change the mobile menu bottom text from `Where Luxury Meets Distinction` to `Scent of Luxury`
3. `src/components/layout/Footer.tsx` line 52: Change the italic tagline `<p>` from `Where Luxury Meets Distinction` to `Scent of Luxury`
4. `src/app/api/webhooks/stripe/route.ts` line 183: Change the email HTML paragraph from `Where Luxury Meets Distinction` to `Scent of Luxury`
5. `src/app/layout.tsx`:
   - Line 41 (metadata.description): Replace `"Where Luxury Meets Distinction. Discover..."` with `"Scent of Luxury. Discover..."`
   - Line 56 (openGraph.description): Same replacement
   - Line 73 (twitter.description): Same replacement
6. `src/app/page.tsx` line 11 (metadata.description): Replace `"Where Luxury Meets Distinction. Discover..."` with `"Scent of Luxury. Discover..."`

**Context:** Read `@src/components/home/Hero.tsx`, `@src/components/layout/Navbar.tsx`, `@src/components/layout/Footer.tsx`, `@src/app/api/webhooks/stripe/route.ts` (lines 175-190), `@src/app/layout.tsx`, `@src/app/page.tsx`
**Done when:**
- Zero occurrences of "Where Luxury Meets Distinction" remain in the codebase. Verify: `grep -r "Where Luxury Meets Distinction" src/` returns no results.
- "Scent of Luxury" appears in all 6 files. Verify: `grep -rl "Scent of Luxury" src/` returns at least 6 file paths.
- No TypeScript errors: `npx tsc --noEmit` passes.

## Task 3 — Create icon-only logo SVG component and replace logo in Navbar and Footer

**Wave:** 1
**Files:**
- `src/components/ui/AquadorLogo.tsx` — NEW: Create an SVG logo component (icon-only, no "fragrances" text)
- `src/components/layout/Navbar.tsx` — Replace `<Image src="/aquador.webp" ...>` with `<AquadorLogo />` component
- `src/components/layout/Footer.tsx` — Replace `<Image src="/aquador.webp" ...>` with `<AquadorLogo />` component

**Action:**

Create `src/components/ui/AquadorLogo.tsx`:
- Export a `'use client'` React component `AquadorLogo` with props: `size?: 'sm' | 'md' | 'lg' | 'xl'` (for footer/navbar sizing), `className?: string`
- The component renders an SVG with the text "AQUAD'OR" in a luxury serif style using a `<text>` element
- Apply a gold gradient via SVG `<linearGradient>` using the brand gold palette: `#FFF8DC` (top) -> `#FFD700` (35%) -> `#D4AF37` (65%) -> `#B8960C` (bottom) — matching the Hero.tsx gradient exactly
- Size mapping: `sm` = h-8 (footer mobile), `md` = h-10 (footer desktop), `lg` = h-12 (navbar default), `xl` = h-14 (navbar large screens)
- Add `aria-label="Aquad'or"` and `role="img"` on the SVG
- Do NOT include the word "fragrances" anywhere — this is icon/wordmark only
- Include a `data-testid="aquador-logo"` for verification
- NOTE: This is a text-based wordmark SVG (not a complex icon). The current logo is a webp showing "Aquad'or fragrances" — we are creating an SVG that shows only "AQUAD'OR" with the gold gradient. The actual icon-only logo asset will come from the client later; this wordmark without "fragrances" is the correct interim solution per the client's request.

In `src/components/layout/Navbar.tsx`:
- Remove the `Image` import from `next/image` (check if used elsewhere in file first — it is not)
- Import `AquadorLogo` from `@/components/ui/AquadorLogo`
- Replace the `<Image src="/aquador.webp" ...>` on line 123-129 with `<AquadorLogo size="lg" className="h-[40px] sm:h-[48px] xl:h-[44px] 2xl:h-[52px] w-auto" />`
- The logo should still be wrapped in the existing `<Link href="/">` with its absolute centering classes

In `src/components/layout/Footer.tsx`:
- Remove the `Image` import from `next/image`
- Import `AquadorLogo` from `@/components/ui/AquadorLogo`
- Replace the `<Image src="/aquador.webp" ...>` on line 43-49 with `<AquadorLogo size="sm" className="h-10 md:h-12 w-auto" />`
- Keep the surrounding `<Link href="/">` wrapper

Important: Do NOT change `aquador.webp` references in metadata/OG images, ChatWidget, AdminSidebar, admin login, or maintenance pages — those should keep the raster image. Only Navbar and Footer get the new SVG component.

**Context:** Read `@src/components/layout/Navbar.tsx`, `@src/components/layout/Footer.tsx`, `@src/components/home/Hero.tsx` (for the gold gradient values on lines 100-105)
**Done when:**
- `src/components/ui/AquadorLogo.tsx` exists and exports a default component
- The component contains an SVG with gold gradient and "AQUAD'OR" text, no "fragrances". Verify: `grep -c "fragrances" src/components/ui/AquadorLogo.tsx` returns 0, and `grep -c "AQUAD" src/components/ui/AquadorLogo.tsx` returns at least 1.
- Navbar uses AquadorLogo, not Image for the center logo. Verify: `grep -c "AquadorLogo" src/components/layout/Navbar.tsx` returns at least 1, and `grep -c 'src="/aquador.webp"' src/components/layout/Navbar.tsx` returns 0.
- Footer uses AquadorLogo, not Image for the logo. Verify: `grep -c "AquadorLogo" src/components/layout/Footer.tsx` returns at least 1, and `grep -c 'src="/aquador.webp"' src/components/layout/Footer.tsx` returns 0.
- No TypeScript errors: `npx tsc --noEmit` passes.
- Logo renders with gold gradient on both mobile (375px) and desktop (1440px) viewports.
- The existing `aquador.webp` references in OG metadata, ChatWidget, AdminSidebar, admin login, and maintenance pages remain untouched.

## Success Criteria

- [ ] Logo renders as gold SVG wordmark ("AQUAD'OR" only, no "fragrances") in Navbar and Footer on all viewports
- [ ] Year displays "Since May 2018" in Hero section (was "Since 2024")
- [ ] Tagline reads "Scent of Luxury" everywhere — Hero, Navbar mobile menu, Footer, email template, and all metadata descriptions (zero occurrences of old tagline remain)
- [ ] Cart icon is a Lucide ShoppingBag (no custom perfume bottle SVG)
- [ ] Single centered dot in Hero and CTASection separators (not two dots)
- [ ] No TypeScript compilation errors (`npx tsc --noEmit` passes)
- [ ] No regressions in responsive layout — Navbar centering, Footer layout, Hero animations all intact
- [ ] OG images and non-layout logo references (ChatWidget, admin pages) still use aquador.webp unchanged
