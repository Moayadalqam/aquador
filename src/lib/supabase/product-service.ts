import { cache } from 'react';
import * as Sentry from '@sentry/nextjs';
import { createPublicClient } from './public';
import type { Product, ProductCategory, ProductGender } from './types';
import { categories } from '../categories';

// Re-export categories since they're static
export { categories };

/** Escape PostgREST special characters in search queries */
function escapePostgrestQuery(query: string): string {
  return query.replace(/[%_\\*()[\]!,]/g, '\\$&');
}

/** Explicit column selection for product queries (avoids select(*) overhead) */
const PRODUCT_COLUMNS = 'id, name, description, price, sale_price, image, images, category, product_type, gender, brand, size, tags, in_stock, is_active, created_at, updated_at' as const;

/**
 * Aquad'or brand detection — products with null brand or brand containing "aquad" (case-insensitive).
 * Null brand = house products predating the brand column.
 */
function isAquadorBrand(p: Pick<Product, 'brand'>): boolean {
  const b = p.brand;
  if (b == null || b === '') return true;
  return /aquad/i.test(b);
}

/**
 * Stable sort that lifts Aquad'or-branded products to the front, preserving the
 * incoming order inside each group. Used on category/gender listing pages so the
 * first 8–12 cards are always Aquad'or house products.
 */
export function sortAquadorFirst<T extends Pick<Product, 'brand'>>(products: T[]): T[] {
  const aquador: T[] = [];
  const rest: T[] = [];
  for (const p of products) {
    if (isAquadorBrand(p)) aquador.push(p);
    else rest.push(p);
  }
  return [...aquador, ...rest];
}

// Get all products from Supabase (public-facing, filters inactive)
export async function getAllProducts(): Promise<Product[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_COLUMNS)
    .eq('is_active', true)
    .order('in_stock', { ascending: false })
    .order('created_at', { ascending: false })
    // Safety cap — prevents unbounded RSC payload as the catalog grows.
    // Paginated browsing should be introduced before this is hit in practice.
    .limit(500);

  if (error) {
    Sentry.addBreadcrumb({ category: 'product-service', message: 'Error fetching products', level: 'error', data: { error } });
    return [];
  }

  return sortAquadorFirst(data || []);
}

// Get product by ID (returns null if inactive)
export async function getProductById(id: string): Promise<Product | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_COLUMNS)
    .eq('id', id)
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    Sentry.addBreadcrumb({ category: 'product-service', message: 'Error fetching product', level: 'error', data: { error, id } });
    return null;
  }

  return data;
}

// Batch fetch products by IDs (single query, no N+1)
export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return [];

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_COLUMNS)
    .in('id', ids);

  if (error) {
    Sentry.addBreadcrumb({ category: 'product-service', message: 'Error batch fetching products', level: 'error', data: { error, ids } });
    return [];
  }

  return data || [];
}

// Get product by slug — cached per request to dedup generateMetadata + page component calls
export const getProductBySlug = cache(async (slug: string): Promise<Product | null> => {
  return getProductById(slug);
});

// Get products by category (filters inactive)
export async function getProductsByCategory(category: string): Promise<Product[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_COLUMNS)
    .eq('category', category as ProductCategory)
    .eq('is_active', true)
    .order('in_stock', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    Sentry.addBreadcrumb({ category: 'product-service', message: 'Error fetching products by category', level: 'error', data: { error, category } });
    return [];
  }

  return sortAquadorFirst(data || []);
}

// Get featured products (active + in stock only)
export async function getFeaturedProducts(count: number = 6): Promise<Product[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_COLUMNS)
    .eq('in_stock', true)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(count);

  if (error) {
    Sentry.addBreadcrumb({ category: 'product-service', message: 'Error fetching featured products', level: 'error', data: { error } });
    return [];
  }

  return data || [];
}

// Get featured Aquad'or house products (brand is null or matches "Aquad'or", active + in stock)
export async function getFeaturedAquadorProducts(count: number = 6): Promise<Product[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_COLUMNS)
    .eq('is_active', true)
    .eq('in_stock', true)
    .or('brand.is.null,brand.ilike.%aquad%')
    .order('created_at', { ascending: false })
    .limit(count);

  if (error) {
    Sentry.addBreadcrumb({ category: 'product-service', message: 'Error fetching featured Aquador products', level: 'error', data: { error } });
    return [];
  }

  return data || [];
}

// Get featured Lattafa original products (category = lattafa-original, active + in stock)
export async function getFeaturedLattafaProducts(count: number = 6): Promise<Product[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_COLUMNS)
    .eq('category', 'lattafa-original')
    .eq('is_active', true)
    .eq('in_stock', true)
    .order('created_at', { ascending: false })
    .limit(count);

  if (error) {
    Sentry.addBreadcrumb({ category: 'product-service', message: 'Error fetching featured Lattafa products', level: 'error', data: { error } });
    return [];
  }

  return data || [];
}

// Get all product slugs for static generation
export async function getAllProductSlugs(): Promise<string[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from('products')
    .select('id');

  if (error) {
    Sentry.addBreadcrumb({ category: 'product-service', message: 'Error fetching product slugs', level: 'error', data: { error } });
    return [];
  }

  return (data || []).map(p => p.id);
}

// Get related products (same category, excluding current, active only)
// Requires category parameter to avoid N+1 query (caller must pass product.category)
export async function getRelatedProducts(
  productId: string,
  category: ProductCategory,
  count: number = 4
): Promise<Product[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_COLUMNS)
    .eq('category', category)
    .eq('is_active', true)
    .neq('id', productId)
    .limit(count);

  if (error) {
    Sentry.addBreadcrumb({ category: 'product-service', message: 'Error fetching related products', level: 'error', data: { error, productId, category } });
    return [];
  }

  return data || [];
}

// Search products (active only, sanitized against PostgREST injection)
export async function searchProducts(query: string): Promise<Product[]> {
  const supabase = createPublicClient();
  const escaped = escapePostgrestQuery(query);
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_COLUMNS)
    .eq('is_active', true)
    .or(`name.ilike.%${escaped}%,description.ilike.%${escaped}%,brand.ilike.%${escaped}%`)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    Sentry.addBreadcrumb({ category: 'product-service', message: 'Error searching products', level: 'error', data: { error, query } });
    return [];
  }

  return data || [];
}

// Get products by gender (filters inactive)
// Men and Women pages include unisex products (common e-commerce pattern — "products a man/woman can wear").
// Unisex page shows only gender='unisex' for a focused browse.
export async function getProductsByGender(gender: ProductGender): Promise<Product[]> {
  const supabase = createPublicClient();
  const genderFilter: ProductGender[] =
    gender === 'unisex' ? ['unisex'] : [gender, 'unisex'];

  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_COLUMNS)
    .in('gender', genderFilter)
    .eq('is_active', true)
    .order('in_stock', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    Sentry.addBreadcrumb({ category: 'product-service', message: 'Error fetching products by gender', level: 'error', data: { error, gender } });
    return [];
  }

  return sortAquadorFirst(data || []);
}

// Get human-readable label for a gender value
export function getGenderLabel(gender: string): string {
  switch (gender) {
    case 'men':
      return "Men's Fragrances";
    case 'women':
      return "Women's Fragrances";
    case 'unisex':
      return 'Unisex Fragrances';
    default:
      return 'Fragrances';
  }
}

// Get category by slug
export function getCategoryBySlug(slug: string) {
  return categories.find((c) => c.slug === slug);
}

// Get all categories
export function getAllCategories() {
  return categories;
}
