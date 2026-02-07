import { products } from './products';
import type { LegacyProduct } from '@/types';

export const VALENTINE_GIFT_SET = {
  id: 'valentine-gift-set-2026',
  name: "Written in Scent",
  slug: 'valentine',
  sku: 'WS-VAL-24',
  price: 64.99,
  shortDescription:
    'A love story, written in fragrance. A limited gift set designed to be felt, worn, and remembered.',
  description:
    'Written in Scent is a limited-edition gift set created to transform fragrance into a lasting memory. Each set is carefully prepared and presented in our signature black gift packaging.',
  includes: [
    '100 ml Aquad\'or perfume (your choice of scent)',
    '100 ml Aquad\'or body lotion (your choice of scent)',
    'Rose-shaped candle',
    'Lacta chocolate',
    'Everlasting decorative rose (keepsake)',
    'Luxury gift packaging with window and rope handles',
  ],
  availability: 'Limited stock available. While supplies last.',
  badge: 'Limited Edition',
  image: '/images/valentine-gift-set.webp',
} as const;

/**
 * Returns only Aquad'or brand perfumes (no Lattafa or other branded products)
 */
export function getAquadorPerfumes(): LegacyProduct[] {
  return products.filter(
    (p) => p.brand === "Aquad'or" && p.productType === 'perfume' && p.inStock
  );
}

/**
 * Returns only Aquad'or brand body lotions
 */
export function getAquadorBodyLotions(): LegacyProduct[] {
  return products.filter(
    (p) => p.brand === "Aquad'or" && p.productType === 'body-lotion' && p.inStock
  );
}
