import { z } from 'zod';
import type { CartItem } from '@/types/cart';
import { getProductsByIds } from '@/lib/supabase/product-service';
import { MIN_QUANTITY, MAX_QUANTITY } from '@/lib/constants';

// Aquador's own categories sell the same fragrance in multiple formats
// with fixed pricing that's not stored per-variant in the DB.
const AQUADOR_CATEGORIES = new Set(['women', 'men', 'niche']);

// Server-side source of truth for Aquador variant pricing
const AQUADOR_VARIANT_PRICES: Record<string, Record<string, number>> = {
  'perfume':     { '50ml': 29.99, '100ml': 49.99 },
  'essence-oil': { '10ml': 19.99 },
  'body-lotion': { '150ml': 29.99 },
};

/**
 * Zod schema for CartItem validation
 *
 * Validates all cart item fields to prevent malformed data from being processed.
 * Used for server-side validation before creating Stripe checkout sessions.
 */
export const cartItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  variantId: z.string()
    .min(1, 'Variant ID is required')
    .regex(
      /^[a-z0-9-]+-(?:perfume|essence-oil|body-lotion)-(?:10ml|50ml|100ml|150ml)$/,
      'Variant ID must match pattern {productId}-{productType}-{size}'
    ),
  quantity: z.number()
    .int('Quantity must be an integer')
    .min(MIN_QUANTITY, `Quantity must be at least ${MIN_QUANTITY}`)
    .max(MAX_QUANTITY, `Quantity cannot exceed ${MAX_QUANTITY}`),
  name: z.string()
    .min(1, 'Product name is required')
    .max(200, 'Product name too long'),
  image: z.string().min(1, 'Product image is required'),
  price: z.number().positive('Price must be positive'),
  size: z.enum(['10ml', '50ml', '100ml', '150ml'] as const, {
    message: 'Invalid product size',
  }),
  productType: z.enum(['perfume', 'essence-oil', 'body-lotion'] as const, {
    message: 'Invalid product type',
  }),
  customPerfume: z
    .object({
      name: z.string().min(1).max(60),
      topNote: z.string().min(1).max(40),
      heartNote: z.string().min(1).max(40),
      baseNote: z.string().min(1).max(40),
      specialRequests: z.string().max(500).optional(),
    })
    .optional(),
});

// Virtual productId for custom perfumes composed via /create-perfume.
// These are not stored in the products table — pricing is volume-based.
const CUSTOM_PERFUME_PRODUCT_ID = 'custom-perfume';
const CUSTOM_PERFUME_PRICES: Record<string, number> = {
  '50ml': 29.99,
  '100ml': 49.99,
};

/**
 * Validates cart items against the server-side product catalog and returns
 * corrected prices from the catalog.
 *
 * Security: Always uses catalog prices for checkout, never trusting client prices.
 * Uses batch query to avoid N+1 database calls.
 */
export async function validateCartPrices(items: CartItem[]): Promise<{
  valid: boolean;
  correctedItems?: CartItem[];
  errors?: Array<{ productId: string; reason: string }>;
}> {
  const errors: Array<{ productId: string; reason: string }> = [];

  // Batch fetch real products (custom perfumes skip DB lookup — handled separately below)
  const productIds = items
    .filter(i => i.productId !== CUSTOM_PERFUME_PRODUCT_ID)
    .map(i => i.productId);
  const products = productIds.length > 0 ? await getProductsByIds(productIds) : [];
  const productMap = new Map(products.map(p => [p.id, p]));

  const correctedItems: CartItem[] = [];

  for (const item of items) {
    // Custom perfumes: virtual product with fixed volume-based pricing
    if (item.productId === CUSTOM_PERFUME_PRODUCT_ID) {
      if (!item.customPerfume) {
        errors.push({
          productId: item.productId,
          reason: 'Custom perfume is missing composition metadata',
        });
        continue;
      }
      const volumePrice = CUSTOM_PERFUME_PRICES[item.size];
      if (!volumePrice) {
        errors.push({
          productId: item.productId,
          reason: `Custom perfume volume ${item.size} is not available`,
        });
        continue;
      }
      correctedItems.push({ ...item, price: volumePrice });
      continue;
    }

    const product = productMap.get(item.productId);

    if (!product) {
      errors.push({
        productId: item.productId,
        reason: `Product not found in catalog`,
      });
      continue;
    }

    // Reject deactivated products — they must not be purchasable
    if (product.is_active === false) {
      errors.push({
        productId: item.productId,
        reason: `Product "${product.name}" is no longer available`,
      });
      continue;
    }

    // Aquador's own products support virtual variants (perfume/oil/lotion)
    // with fixed pricing — the DB stores the base product, variants are derived.
    if (AQUADOR_CATEGORIES.has(product.category)) {
      const variantPrices = AQUADOR_VARIANT_PRICES[item.productType];
      const variantPrice = variantPrices?.[item.size];
      if (!variantPrice) {
        errors.push({
          productId: item.productId,
          reason: `Invalid variant: ${item.productType} / ${item.size}`,
        });
        continue;
      }
      correctedItems.push({ ...item, price: variantPrice });
      continue;
    }

    // Branded products: type and size must exactly match the catalog row
    if (item.productType !== product.product_type) {
      errors.push({
        productId: item.productId,
        reason: `Product type mismatch: client sent "${item.productType}", catalog has "${product.product_type}"`,
      });
      continue;
    }

    if (item.size !== product.size) {
      errors.push({
        productId: item.productId,
        reason: `Size mismatch: client sent "${item.size}", catalog has "${product.size}"`,
      });
      continue;
    }

    // Always use catalog price (sale price takes precedence)
    const catalogPrice = Number(product.sale_price ?? product.price);
    correctedItems.push({ ...item, price: catalogPrice });
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, correctedItems };
}
