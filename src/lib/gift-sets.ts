import { products } from './products';
import type { LegacyProduct } from '@/types';

export const VALENTINE_GIFT_SET = {
  id: 'valentine-gift-set-2026',
  name: "Written in Scent",
  slug: 'valentine',
  price: 64.99,
  description:
    "A curated pairing of two signature Aquad'or creations — one 100 ml perfume and one 100 ml body lotion — chosen by you, wrapped in luxury. Because the most unforgettable gifts are the ones written in scent.",
  includes: [
    '1 × 100 ml Perfume (your choice)',
    '1 × 100 ml Body Lotion (your choice)',
    'Premium gift packaging',
  ],
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
