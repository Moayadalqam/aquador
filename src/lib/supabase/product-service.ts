import { createClient } from './server';
import type { Product, ProductCategory } from './types';
import { categories } from '../products';

// Re-export categories since they're static
export { categories };

// Get all products from Supabase (public-facing, filters inactive)
export async function getAllProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  return data || [];
}

// Get product by ID (returns null if inactive)
export async function getProductById(id: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    console.error('Error fetching product:', error);
    return null;
  }

  return data;
}

// Get product by slug (same as ID in our case)
export async function getProductBySlug(slug: string): Promise<Product | null> {
  return getProductById(slug);
}

// Get products by category (filters inactive)
export async function getProductsByCategory(category: string): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category as ProductCategory)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }

  return data || [];
}

// Get featured products (active + in stock only)
export async function getFeaturedProducts(count: number = 6): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('in_stock', true)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(count);

  if (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }

  return data || [];
}

// Get all product slugs for static generation
export async function getAllProductSlugs(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('id');

  if (error) {
    console.error('Error fetching product slugs:', error);
    return [];
  }

  return (data || []).map(p => p.id);
}

// Get related products (same category, excluding current, active only)
export async function getRelatedProducts(productId: string, count: number = 4): Promise<Product[]> {
  const product = await getProductById(productId);
  if (!product) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', product.category)
    .eq('is_active', true)
    .neq('id', productId)
    .limit(count);

  if (error) {
    console.error('Error fetching related products:', error);
    return [];
  }

  return data || [];
}

// Search products (active only)
export async function searchProducts(query: string): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .or(`name.ilike.%${query}%,description.ilike.%${query}%,brand.ilike.%${query}%`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error searching products:', error);
    return [];
  }

  return data || [];
}

// Get category by slug
export function getCategoryBySlug(slug: string) {
  return categories.find((c) => c.slug === slug);
}

// Get all categories
export function getAllCategories() {
  return categories;
}
