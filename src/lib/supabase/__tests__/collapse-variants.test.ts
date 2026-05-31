import { collapseToFragranceCards } from '../product-service';
import type { Product } from '../types';

/**
 * The products table stores each size/type as a separate row sharing a base
 * slug. collapseToFragranceCards folds those rows into one card per fragrance
 * so the shop grid never shows the same scent two-to-four times (size is then
 * chosen on the product page). These cases pin that contract.
 */
function makeProduct(
  id: string,
  product_type: Product['product_type'],
  size: string,
): Product {
  return {
    id,
    name: id,
    description: '',
    price: 0,
    sale_price: null,
    image: '',
    images: null,
    category: 'women',
    product_type,
    gender: null,
    brand: null,
    size,
    tags: null,
    in_stock: true,
    is_active: true,
    created_at: null,
    updated_at: null,
  } as Product;
}

describe('collapseToFragranceCards', () => {
  it('folds a fragrance 50ml + 100ml perfume into a single 50ml card', () => {
    const input = [
      makeProduct('imagination', 'perfume', '50ml'),
      makeProduct('imagination-100ml', 'perfume', '100ml'),
    ];

    const result = collapseToFragranceCards(input);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('imagination');
    expect(result[0].size).toBe('50ml');
  });

  it('folds all four variant rows (50ml, 100ml, oil, lotion) into one perfume card', () => {
    const input = [
      makeProduct('imagination', 'perfume', '50ml'),
      makeProduct('imagination-100ml', 'perfume', '100ml'),
      makeProduct('imagination-essence-oil', 'essence-oil', '10ml'),
      makeProduct('imagination-body-lotion', 'body-lotion', '150ml'),
    ];

    const result = collapseToFragranceCards(input);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('imagination');
    expect(result[0].product_type).toBe('perfume');
  });

  it('keeps distinct fragrances separate and preserves first-seen order', () => {
    const input = [
      makeProduct('alpha', 'perfume', '50ml'),
      makeProduct('beta', 'perfume', '50ml'),
      makeProduct('alpha-100ml', 'perfume', '100ml'),
    ];

    const result = collapseToFragranceCards(input);

    expect(result.map((p) => p.id)).toEqual(['alpha', 'beta']);
  });

  it('picks the lowest-sort-key representative regardless of input order', () => {
    const input = [
      makeProduct('imagination-100ml', 'perfume', '100ml'),
      makeProduct('imagination-essence-oil', 'essence-oil', '10ml'),
      makeProduct('imagination', 'perfume', '50ml'),
    ];

    const result = collapseToFragranceCards(input);

    expect(result).toHaveLength(1);
    expect(result[0].size).toBe('50ml');
  });

  it('represents an oil-only fragrance by its oil row (nothing dropped)', () => {
    const input = [makeProduct('rare-oud-essence-oil', 'essence-oil', '10ml')];

    const result = collapseToFragranceCards(input);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('rare-oud-essence-oil');
  });
});
