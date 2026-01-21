import { products, categories } from './products';
import type { LegacyProduct } from '@/types';

// Get all products
export function getAllProducts(): LegacyProduct[] {
  return products;
}

// Get product by ID (slug)
export function getProductById(id: string): LegacyProduct | undefined {
  return products.find((p) => p.id === id);
}

// Get product by slug (same as ID in current structure)
export function getProductBySlug(slug: string): LegacyProduct | undefined {
  return products.find((p) => p.id === slug);
}

// Get products by category
export function getProductsByCategory(category: string): LegacyProduct[] {
  return products.filter((p) => p.category === category);
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

// Search products
export function searchProducts(query: string): LegacyProduct[] {
  const lowercaseQuery = query.toLowerCase();
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(lowercaseQuery) ||
      p.description.toLowerCase().includes(lowercaseQuery) ||
      p.brand?.toLowerCase().includes(lowercaseQuery)
  );
}

// Get related products (same category, excluding current)
export function getRelatedProducts(productId: string, count: number = 4): LegacyProduct[] {
  const product = getProductById(productId);
  if (!product) return [];

  return products
    .filter((p) => p.category === product.category && p.id !== productId)
    .slice(0, count);
}
