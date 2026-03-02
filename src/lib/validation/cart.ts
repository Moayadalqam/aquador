import { z } from 'zod';
import type { CartItem } from '@/types/cart';
import type { ProductType, ProductSize } from '@/types/product';
import { getProductById } from '@/lib/product-service';

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
    .min(1, 'Quantity must be at least 1')
    .max(100, 'Quantity cannot exceed 100'),
  name: z.string()
    .min(1, 'Product name is required')
    .max(200, 'Product name too long'),
  image: z.string().min(1, 'Product image is required'),
  price: z.number().positive('Price must be positive'),
  size: z.enum(['10ml', '50ml', '100ml', '150ml'], {
    errorMap: () => ({ message: 'Invalid product size' })
  }),
  productType: z.enum(['perfume', 'essence-oil', 'body-lotion'], {
    errorMap: () => ({ message: 'Invalid product type' })
  }),
});

/**
 * Validates cart item prices against the server-side product catalog.
 *
 * Security: Prevents client-side price manipulation by verifying each item's
 * price matches the catalog price (or sale price if available).
 *
 * @param items - Array of cart items to validate
 * @returns Validation result with errors if any items fail validation
 *
 * @example
 * const result = validateCartPrices(cartItems);
 * if (!result.valid) {
 *   return NextResponse.json(
 *     { error: 'Price mismatch', details: result.errors },
 *     { status: 400 }
 *   );
 * }
 */
export function validateCartPrices(items: CartItem[]): {
  valid: boolean;
  errors?: Array<{ productId: string; reason: string }>;
} {
  const errors: Array<{ productId: string; reason: string }> = [];

  for (const item of items) {
    // Fetch product from server-side catalog
    const product = getProductById(item.productId);

    // Product must exist in catalog
    if (!product) {
      errors.push({
        productId: item.productId,
        reason: `Product not found in catalog`,
      });
      continue;
    }

    // Get the expected catalog price (sale price takes precedence)
    const catalogPrice = product.salePrice ?? product.price;

    // Allow 1-cent tolerance for floating-point rounding errors
    const priceDifference = Math.abs(item.price - catalogPrice);
    if (priceDifference > 0.01) {
      errors.push({
        productId: item.productId,
        reason: `Price mismatch: client sent ${item.price.toFixed(2)}, catalog price is ${catalogPrice.toFixed(2)}`,
      });
      continue;
    }

    // Verify product type matches
    if (item.productType !== product.productType) {
      errors.push({
        productId: item.productId,
        reason: `Product type mismatch: client sent "${item.productType}", catalog has "${product.productType}"`,
      });
      continue;
    }

    // Verify size matches
    if (item.size !== product.size) {
      errors.push({
        productId: item.productId,
        reason: `Size mismatch: client sent "${item.size}", catalog has "${product.size}"`,
      });
      continue;
    }
  }

  // Return validation result
  if (errors.length > 0) {
    return {
      valid: false,
      errors,
    };
  }

  return {
    valid: true,
  };
}
