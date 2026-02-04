import { createClient } from '@/lib/supabase/server';
import type { BlogPost, BlogCategory, BlogListParams } from './blog-types';

// Re-export types and utilities for convenience
export type { BlogPost, BlogCategory, BlogListParams } from './blog-types';
export { formatBlogDate, generateSlug, estimateReadTime } from './blog-types';

export async function getBlogPosts(params: BlogListParams = {}) {
  const { page = 1, limit = 9, category, featured, status = 'published' } = params;
  const supabase = await createClient();
  const offset = (page - 1) * limit;

  let query = supabase
    .from('blog_posts')
    .select('*', { count: 'exact' })
    .eq('status', status)
    .order('published_at', { ascending: false });

  if (category) {
    query = query.eq('category', category);
  }

  if (featured !== undefined) {
    query = query.eq('featured', featured);
  }

  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    posts: (data as BlogPost[]) || [],
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error) return null;
  return data as BlogPost;
}

export async function getFeaturedPost(): Promise<BlogPost | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .eq('featured', true)
    .order('published_at', { ascending: false })
    .limit(1)
    .single();

  if (error) return null;
  return data as BlogPost;
}

export async function getRelatedPosts(category: string, excludeSlug: string, limit = 3): Promise<BlogPost[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .eq('category', category)
    .neq('slug', excludeSlug)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data as BlogPost[]) || [];
}

export async function getBlogCategories(): Promise<BlogCategory[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('blog_categories')
    .select('*')
    .order('name');

  if (error) return [];
  return (data as BlogCategory[]) || [];
}
