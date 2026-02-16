/**
 * Shared constants used across the application
 */

import type { ProductType } from '@/types/product';

/**
 * Human-readable labels for product types
 */
export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  'perfume': 'Perfume',
  'essence-oil': 'Essence Oil',
  'body-lotion': 'Body Lotion',
} as const;

/**
 * Get the label for a product type
 */
export function getProductTypeLabel(type: string): string {
  return PRODUCT_TYPE_LABELS[type as ProductType] || type;
}
