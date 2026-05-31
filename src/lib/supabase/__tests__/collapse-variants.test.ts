import { collapseToFragranceCards } from '../variants';
import type { Product } from '../types';

/**
 * Branded fragrances are stored as one row per size sharing a base slug.
 * collapseToFragranceCards folds those into one card per fragrance so a shop
 * grid never shows the same scent two-to-four times (size is chosen on the
 * product page). Aquad'or house products are a single row and must pass
 * through untouched. These cases pin that contract.
 */
function makeProduct(id: string, size: string): Product {
  return {
    id,
    name: id,
    description: '',
    price: 0,
    sale_price: null,
    image: '',
    images: null,
    category: 'niche',
    product_type: 'perfume',
    gender: null,
    brand: 'Louis Vuitton',
    size,
    tags: null,
    in_stock: true,
    is_active: true,
    created_at: null,
    updated_at: null,
  } as Product;
}

describe('collapseToFragranceCards', () => {
  it('folds a branded 50ml + 100ml pair into a single base-slug card', () => {
    const input = [
      makeProduct('imagination-by-louis-vuitton', '50ml'),
      makeProduct('imagination-by-louis-vuitton-100ml', '100ml'),
    ];

    const result = collapseToFragranceCards(input);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('imagination-by-louis-vuitton');
    expect(result[0].size).toBe('50ml');
  });

  it('folds all four size/type variant rows into one base card', () => {
    const input = [
      makeProduct('imagination-by-louis-vuitton', '50ml'),
      makeProduct('imagination-by-louis-vuitton-100ml', '100ml'),
      makeProduct('imagination-by-louis-vuitton-essence-oil', '10ml'),
      makeProduct('imagination-by-louis-vuitton-body-lotion', '150ml'),
    ];

    const result = collapseToFragranceCards(input);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('imagination-by-louis-vuitton');
  });

  it('keeps distinct fragrances separate and preserves first-seen order', () => {
    const input = [
      makeProduct('alpha', '50ml'),
      makeProduct('beta', '50ml'),
      makeProduct('alpha-100ml', '100ml'),
    ];

    const result = collapseToFragranceCards(input);

    expect(result.map((p) => p.id)).toEqual(['alpha', 'beta']);
  });

  it('prefers the base-slug row regardless of input order', () => {
    const input = [
      makeProduct('imagination-by-louis-vuitton-100ml', '100ml'),
      makeProduct('imagination-by-louis-vuitton', '50ml'),
    ];

    const result = collapseToFragranceCards(input);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('imagination-by-louis-vuitton');
  });

  it('leaves a single-row Aquad\'or house product untouched', () => {
    const input = [makeProduct('aquador-oud-royale', '50ml')];

    const result = collapseToFragranceCards(input);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('aquador-oud-royale');
  });

  it('represents a 100ml-only fragrance by its 100ml row (nothing dropped)', () => {
    const input = [makeProduct('rare-oud-100ml', '100ml')];

    const result = collapseToFragranceCards(input);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('rare-oud-100ml');
  });
});
