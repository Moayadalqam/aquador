/**
 * ========================================================================
 * SINGLE SOURCE OF TRUTH: Category Definitions for Homepage Display
 * ========================================================================
 *
 * This file defines the canonical list of product categories displayed on
 * the homepage. These categories are intentionally hardcoded for performance
 * and design consistency.
 *
 * CATEGORY SYSTEM ARCHITECTURE:
 *
 * 1. **This file (categories.ts)**: Homepage category cards
 *    - Purpose: Static category list with curated images and descriptions
 *    - Used by: Homepage, shop navigation
 *    - Source of truth for: UI presentation
 *
 * 2. **DB table `product_categories`**: Admin-managed category metadata
 *    - Purpose: Admin panel category management (CRUD operations)
 *    - Used by: /admin/categories page, ProductForm dropdown
 *    - NOT used by: Product categorization (products don't reference this table)
 *    - Status: Active but functionally redundant with enum
 *
 * 3. **DB enum `product_category`**: Actual product categorization
 *    - Purpose: Enforces allowed values for products.category column
 *    - Used by: products table, product queries, filtering
 *    - Source of truth for: Product categorization in database
 *
 * ADDING NEW CATEGORIES:
 * 1. Add to this file for homepage display
 * 2. Update `product_category` enum in database migration
 * 3. Optionally add to `product_categories` table if using admin panel
 *
 * NOTE: The product_categories table is NOT required for products to work.
 * Products reference the enum directly. The table exists solely for admin UI.
 */
import type { Category } from '@/types';

export const categories: Category[] = [
  {
    id: 'women',
    name: "Women's Collection",
    slug: 'women',
    description: 'Timeless Elegance in Every Drop',
    image: 'https://i.ibb.co/KNGND0M/GK0-0065.webp',
  },
  {
    id: 'men',
    name: "Men's Collection",
    slug: 'men',
    description: 'Bold Character, Lasting Impression',
    image: 'https://i.ibb.co/1rQyrdW/DSC-0666.jpg',
  },
  {
    id: 'niche',
    name: 'Niche Collection',
    slug: 'niche',
    description: 'Rare Scents for Connoisseurs',
    image: 'https://i.ibb.co/Mg00Phx/DSC-1932.jpg',
  },
  {
    id: 'lattafa-original',
    name: 'Lattafa Originals',
    slug: 'lattafa-original',
    description: 'Original Lattafa Perfumes',
    // Migrated from Squarespace CDN 2026-04-17 — original URL in git history
    image: '/images/categories/lattafa-original.jpeg',
    contain: false,
  },
  {
    id: 'al-haramain-originals',
    name: 'Al Haramain Originals',
    slug: 'al-haramain-originals',
    description: 'Authentic Al Haramain Perfumes',
    image: '/aquador.webp',
  },
];
