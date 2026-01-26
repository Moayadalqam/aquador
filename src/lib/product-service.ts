import { products, categories } from './products';
import type { LegacyProduct } from '@/types';

// Simple memoization caches for repeated queries
const searchCache = new Map<string, LegacyProduct[]>();
const categoryCache = new Map<string, LegacyProduct[]>();

// Pre-computed lookup maps for O(1) access
const productById = new Map(products.map(p => [p.id, p]));

// Get all products
export function getAllProducts(): LegacyProduct[] {
  return products;
}

// Get product by ID (slug) - O(1) lookup
export function getProductById(id: string): LegacyProduct | undefined {
  return productById.get(id);
}

// Get product by slug (same as ID in current structure) - O(1) lookup
export function getProductBySlug(slug: string): LegacyProduct | undefined {
  return productById.get(slug);
}

// Get products by category (memoized)
export function getProductsByCategory(category: string): LegacyProduct[] {
  const cached = categoryCache.get(category);
  if (cached) return cached;

  const results = products.filter((p) => p.category === category);
  categoryCache.set(category, results);
  return results;
}

// Get featured products (first 6)
export function getFeaturedProducts(count: number = 6): LegacyProduct[] {
  return products.slice(0, count);
}

// Get all product slugs for static generation
export function getAllProductSlugs(): string[] {
  return products.map((p) => p.id);
}

// Get all categories
export function getAllCategories() {
  return categories;
}

// Get category by slug
export function getCategoryBySlug(slug: string) {
  return categories.find((c) => c.slug === slug);
}

// Search products (memoized)
export function searchProducts(query: string): LegacyProduct[] {
  const lowercaseQuery = query.toLowerCase().trim();
  if (!lowercaseQuery) return [];

  const cached = searchCache.get(lowercaseQuery);
  if (cached) return cached;

  const results = products.filter(
    (p) =>
      p.name.toLowerCase().includes(lowercaseQuery) ||
      p.description.toLowerCase().includes(lowercaseQuery) ||
      p.brand?.toLowerCase().includes(lowercaseQuery)
  );

  // Limit cache size to prevent memory issues
  if (searchCache.size > 100) {
    const firstKey = searchCache.keys().next().value;
    if (firstKey) searchCache.delete(firstKey);
  }

  searchCache.set(lowercaseQuery, results);
  return results;
}

// Get related products (same category, excluding current)
export function getRelatedProducts(productId: string, count: number = 4): LegacyProduct[] {
  const product = getProductById(productId);
  if (!product) return [];

  return products
    .filter((p) => p.category === product.category && p.id !== productId)
    .slice(0, count);
}
