import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { estimateReadTime, generateSlug } from '@/lib/blog';
import { formatApiError } from '@/lib/api-utils';
import { checkRateLimit } from '@/lib/rate-limit';
import { createPublicClient } from '@/lib/supabase/public';
import { z } from 'zod';

export const maxDuration = 10;

const blogListQuerySchema = z.object({
  page: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(50).default(9),
  category: z.string().max(100).optional(),
  status: z.enum(['all', 'published', 'draft']).optional(),
  featured: z.enum(['true', 'false']).optional(),
});

const blogPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  content: z.string().min(1, 'Content is required'),
  slug: z.string().max(200).optional(),
  excerpt: z.string().max(500).optional(),
  category: z.string().max(100).optional(),
  status: z.enum(['draft', 'published']).optional(),
  featured: z.boolean().optional(),
  cover_image: z.string().url().optional().nullable(),
  meta_title: z.string().max(200).optional(),
  meta_description: z.string().max(500).optional(),
  tags: z.array(z.string()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = blogListQuerySchema.safeParse({
      page: searchParams.get('page') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
      category: searchParams.get('category') ?? undefined,
      status: searchParams.get('status') ?? undefined,
      featured: searchParams.get('featured') ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid query parameters' },
        { status: 400 }
      );
    }

    const { page, limit, category, status: statusFilter, featured } = parsed.data;
    const offset = (page - 1) * limit;

    // Use public client for cacheable public reads; server client only when admin auth is needed
    const isAdminRequest = statusFilter === 'all';

    let isAdmin = false;
    if (isAdminRequest) {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: adminUser } = await supabase
          .from('admin_users')
          .select('id')
          .eq('id', user.id)
          .maybeSingle();
        isAdmin = !!adminUser;
      }
    }

    // Use public client for non-admin requests (cacheable), server client for admin
    const queryClient = isAdminRequest ? await createClient() : createPublicClient();

    let query = queryClient
      .from('blog_posts')
      .select('*', { count: 'exact' });

    // Only admins requesting status=all can see non-published posts
    if (!(isAdminRequest && isAdmin)) {
      query = query.eq('status', 'published');
    }

    query = query.order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    if (featured === 'true') {
      query = query.eq('featured', true);
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const response = NextResponse.json({
      posts: data,
      total: count,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    });
    if (!isAdminRequest) {
      response.headers.set('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=86400');
    }
    return response;
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      formatApiError(error, 'Failed to fetch blog posts'),
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const rateLimitResponse = await checkRateLimit(request, 'admin');
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (!adminUser) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const result = blogPostSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues[0]?.message || 'Invalid blog post data' },
      { status: 400 }
    );
  }
  const postData = result.data;
  const slug = postData.slug || generateSlug(postData.title);
  const read_time = estimateReadTime(postData.content || '');

  const { data, error } = await supabase
    .from('blog_posts')
    .insert({
      ...postData,
      slug,
      read_time,
      published_at: postData.status === 'published' ? new Date().toISOString() : null,
    })
    .select()
    .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidatePath('/blog');
    revalidatePath(`/blog/${slug}`);

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      formatApiError(error, 'Failed to create blog post'),
      { status: 500 }
    );
  }
}
