import type { Product } from './types';

/**
 * Pure variant-collapsing logic for product listing grids. No React or Supabase
 * imports, so it is safe to unit-test without a server runtime.
 *
 * Branded fragrances (non-Aquad'or houses) are stored as one row per size,
 * sharing a base slug:
 *   imagination-by-louis-vuitton          (50ml, the canonical base row)
 *   imagination-by-louis-vuitton-100ml    (100ml)
 *   imagination-by-louis-vuitton-essence-oil / -body-lotion
 * A listing grid must show each fragrance once; size is chosen on the product
 * page. (Aquad'or house products are a single row whose sizes are synthesized
 * client-side by ProductVariantSelector, so they collapse to themselves.)
 */
const VARIANT_SUFFIXES = ['-100ml', '-50ml', '-essence-oil', '-body-lotion'] as const;
const SIZE_RANK: Record<string, number> = { '50ml': 0, '100ml': 1, '10ml': 2, '150ml': 3 };

export function getVariantBaseId(id: string): string {
  return VARIANT_SUFFIXES.reduce(
    (base, suffix) => (base.endsWith(suffix) ? base.slice(0, -suffix.length) : base),
    id,
  );
}

// Lower rank wins as the card representative: the canonical base-slug row
// always beats a suffixed sibling, then smallest size, then anything else.
function variantRank(p: Pick<Product, 'id' | 'size'>): number {
  if (getVariantBaseId(p.id) === p.id) return -1;
  return SIZE_RANK[p.size ?? ''] ?? 99;
}

/**
 * Collapse size-variant rows into one card per fragrance for listing grids.
 * Groups by base slug and keeps the canonical representative (base row, else
 * smallest size). First-seen order is preserved so the caller's ordering
 * (sortAquadorFirst / in_stock / created_at) still drives the grid.
 */
export function collapseToFragranceCards<T extends Pick<Product, 'id' | 'size'>>(products: T[]): T[] {
  const rep = new Map<string, T>();
  const order: string[] = [];
  for (const product of products) {
    const baseId = getVariantBaseId(product.id);
    const current = rep.get(baseId);
    if (!current) {
      rep.set(baseId, product);
      order.push(baseId);
    } else if (variantRank(product) < variantRank(current)) {
      rep.set(baseId, product);
    }
  }
  return order.map((baseId) => rep.get(baseId)!);
}
