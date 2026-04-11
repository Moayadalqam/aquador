-- ============================================================================
-- Migration: Fix Product Data — Spelling, Compositions, Fragrance Notes
-- Date: 2026-04-11
-- Description:
--   1. Fix "Althar" -> "Althair" spelling in product name (and ID if slug-based)
--   2. Fix Althair composition with correct fragrance notes
--   3. Restore missing fragrance notes on Aquad'or house products from CSV data
--
-- All UPDATEs are idempotent — safe to re-run.
-- ============================================================================

BEGIN;

-- ============================================================================
-- FIX 1: Correct "Althar" spelling to "Althair" in product name
-- ============================================================================
-- The product "Althar by Parfums de Marly" should be "Althair by Parfums de Marly"
-- (with the correct French spelling). The CSV source of truth shows the name as
-- "Althair by Parfums de Marly" (with diacritics: Althai-r).

-- Fix the product name (match any variant of the misspelling)
UPDATE products
SET name = REPLACE(name, 'Althar', 'Althair'),
    updated_at = NOW()
WHERE name ILIKE '%Althar%'
  AND name NOT ILIKE '%Althair%';

-- Fix the product ID if it's a slug containing the misspelling
-- (Products may use slug-based IDs like "althar-by-parfums-de-marly")
-- NOTE: Changing primary keys requires careful handling. We update the ID
-- only if the misspelling exists in it.
UPDATE products
SET id = REPLACE(id, 'althar', 'althair'),
    updated_at = NOW()
WHERE id ILIKE '%althar%'
  AND id NOT ILIKE '%althair%';


-- ============================================================================
-- FIX 2: Fix Althair composition with correct fragrance notes
-- ============================================================================
-- Source of truth: CSV line 659 — "Althair by Parfums de Marly"
-- Top Notes: Cinnamon, Cardamom, Orange Blossom and Bergamot
-- Middle Notes: Bourbon Vanilla and Elemi
-- Base Notes: Praline, Musk, Ambroxan, Guaiac Wood, Tonka and Candied Almond

UPDATE products
SET description = '<p><strong>Top Notes:</strong> Cinnamon, Cardamom, Orange Blossom and Bergamot.</p><p><strong>Middle Notes:</strong> Bourbon Vanilla and Elemi.</p><p><strong>Base Notes:</strong> Praline, Musk, Ambroxan, Guaiac Wood, Tonka and Candied Almond.</p>',
    updated_at = NOW()
WHERE name ILIKE '%Althair%by%Parfums de Marly%'
  OR name ILIKE '%Althai_r%by%Parfums de Marly%';


-- ============================================================================
-- FIX 3: Restore missing fragrance notes on Aquad'or house products
-- ============================================================================
-- These are products where brand IS NULL or brand contains "aquad" and belong
-- to categories women/men/niche. The CSV contains the correct descriptions
-- with fragrance notes. We clean up Squarespace-specific HTML classes/styles
-- but keep <p> and <strong> tags.
--
-- Only products that HAD fragrance notes in the CSV are updated here.
-- Products with just prose descriptions (no "Notes:" text) are left as-is.

-- 3a. Pomegranate Musk — CSV line 22
-- Has: Top, Middle, Base Notes + extra info
UPDATE products
SET description = '<p><em>It has a creamy and thick texture</em></p><p><strong>Best suited as oil essence</strong></p><p><strong>Top Notes:</strong> Cinnamon and Pomegranate.</p><p><strong>Middle Notes:</strong> Agarwood (Oud) and Sandalwood.</p><p><strong>Base Notes:</strong> Vanilla and Musk.</p>',
    updated_at = NOW()
WHERE name ILIKE '%Pomegranate Musk%'
  AND (brand IS NULL OR brand ILIKE '%aquad%' OR brand = '')
  AND description NOT ILIKE '%Top Notes%'
  AND description NOT ILIKE '%Base Notes%';

-- 3b. Musk al Tahara — CSV line 26
-- Has: Fragrance Notes (single line)
UPDATE products
SET description = '<p><em>It has a creamy and thick texture</em></p><p><strong>Best suited as oil essence</strong></p><p><strong>Fragrance Notes:</strong> Musk, White Musk and Cotton Flower.</p>',
    updated_at = NOW()
WHERE name ILIKE '%Musk al Tahara%'
  AND (brand IS NULL OR brand ILIKE '%aquad%' OR brand = '')
  AND description NOT ILIKE '%Fragrance Notes%';

-- 3c. Signature (Designed by Aquad'or) — CSV line 30
-- Has: Top, Middle, Base Notes
UPDATE products
SET description = '<p><strong>Top Notes:</strong> Bergamot, Lavender, Nutmeg, and Mandarin Orange.</p><p><strong>Middle Notes:</strong> Leather, Violet Leaf, Cedarwood, and Clove.</p><p><strong>Base Notes:</strong> Vetiver, Patchouli, Oud, Amber, and Musk.</p>',
    updated_at = NOW()
WHERE name ILIKE '%Signature%'
  AND (brand IS NULL OR brand ILIKE '%aquad%' OR brand = '')
  AND description NOT ILIKE '%Top Notes%'
  AND description NOT ILIKE '%Base Notes%';

-- 3d. Cashmere Dubai Oud (Designed by Aquad'or) — CSV line 34
-- Has: Top, Middle, Base Notes
UPDATE products
SET description = '<p><strong>Top Notes:</strong> Cashmir Wood, Saffron, Black Currant and Plum.</p><p><strong>Middle Notes:</strong> Rose, Jasmine and Kashmir Wood.</p><p><strong>Base Notes:</strong> Agarwood (Oud), Kashmir Wood, Sandalwood, Vanilla and Musk.</p>',
    updated_at = NOW()
WHERE name ILIKE '%Cashmere Dubai Oud%'
  AND (brand IS NULL OR brand ILIKE '%aquad%' OR brand = '')
  AND description NOT ILIKE '%Top Notes%'
  AND description NOT ILIKE '%Base Notes%';

-- 3e. Gold Yellow Vanilla Dubai (Designed by Aquad'or) — CSV line 38
-- Has: Fragrance Notes (single line)
UPDATE products
SET description = '<p><strong>Fragrance Notes:</strong> White Oud, Arabic Vanilla, Musk, Milk Mousse, Amber, Sandalwood, and Soft Powdery Notes.</p>',
    updated_at = NOW()
WHERE name ILIKE '%Gold Yellow Vanilla Dubai%'
  AND (brand IS NULL OR brand ILIKE '%aquad%' OR brand = '')
  AND description NOT ILIKE '%Fragrance Notes%';

-- 3f. Troodos (Designed by Aquad'or) — CSV line 42
-- Has: Top, Middle, Base Notes
UPDATE products
SET description = '<p><strong>Top Notes:</strong> Rose, Cedar, Saffron and Black Bee Honey.</p><p><strong>Middle Notes:</strong> Cyprus Cedrus, Woodsy Notes, Tobacco and Cyprus Coffee.</p><p><strong>Base Notes:</strong> Vanilla (Oud), Tobacco and Incense.</p>',
    updated_at = NOW()
WHERE name ILIKE '%Troodos%'
  AND (brand IS NULL OR brand ILIKE '%aquad%' OR brand = '')
  AND description NOT ILIKE '%Top Notes%'
  AND description NOT ILIKE '%Base Notes%';

COMMIT;
