import { createPublicClient } from '@/lib/supabase/public';
import type { BlogPost, BlogCategory, BlogListParams } from './blog-types';

// Re-export types and utilities for convenience
export type { BlogPost, BlogCategory, BlogListParams } from './blog-types';
export { formatBlogDate, generateSlug, estimateReadTime } from './blog-types';

/** Explicit column selection for blog queries (avoids select(*) overhead) */
const BLOG_POST_FULL_COLUMNS = 'id, slug, title, content, excerpt, category, status, featured, author_name, author_avatar, author_role, cover_image, meta_title, meta_description, tags, featured_products, read_time, published_at, created_at, updated_at' as const;
const BLOG_POST_LIST_COLUMNS = 'id, slug, title, excerpt, category, status, featured, author_name, author_avatar, author_role, cover_image, tags, read_time, published_at, created_at' as const;
const BLOG_CATEGORY_COLUMNS = 'id, slug, name, description, created_at' as const;

export async function getBlogPosts(params: BlogListParams = {}) {
  const { page = 1, limit = 9, category, featured, status = 'published' } = params;
  const supabase = createPublicClient();
  const offset = (page - 1) * limit;

  let query = supabase
    .from('blog_posts')
    .select(BLOG_POST_LIST_COLUMNS, { count: 'exact' })
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
  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from('blog_posts')
    .select(BLOG_POST_FULL_COLUMNS)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error) return null;
  return data as BlogPost;
}

export async function getFeaturedPost(): Promise<BlogPost | null> {
  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from('blog_posts')
    .select(BLOG_POST_FULL_COLUMNS)
    .eq('status', 'published')
    .eq('featured', true)
    .order('published_at', { ascending: false })
    .limit(1)
    .single();

  if (error) return null;
  return data as BlogPost;
}

export async function getRelatedPosts(category: string, excludeSlug: string, limit = 3): Promise<BlogPost[]> {
  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from('blog_posts')
    .select(BLOG_POST_LIST_COLUMNS)
    .eq('status', 'published')
    .eq('category', category)
    .neq('slug', excludeSlug)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data as BlogPost[]) || [];
}

export async function getBlogCategories(): Promise<BlogCategory[]> {
  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from('blog_categories')
    .select(BLOG_CATEGORY_COLUMNS)
    .order('name');

  if (error) return [];
  return (data as BlogCategory[]) || [];
}
