import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { estimateReadTime } from '@/lib/blog';
import { formatApiError } from '@/lib/api-utils';
import { checkRateLimit } from '@/lib/rate-limit';
import { z } from 'zod';

export const maxDuration = 10;

const blogPostUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  slug: z.string().max(200).optional(),
  excerpt: z.string().max(500).optional(),
  category: z.string().max(100).optional(),
  status: z.enum(['draft', 'published']).optional(),
  featured: z.boolean().optional(),
  cover_image: z.string().url().optional().nullable(),
  meta_title: z.string().max(200).optional(),
  meta_description: z.string().max(500).optional(),
  tags: z.array(z.string()).optional(),
  published_at: z.string().optional().nullable(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const supabase = await createClient();

    // Check if requester is an admin (admins can view drafts)
    const { data: { user } } = await supabase.auth.getUser();
    let isAdmin = false;
    if (user) {
      const { data: adminUser } = await supabase
        .from('admin_users')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();
      isAdmin = !!adminUser;
    }

    let query = supabase
      .from('blog_posts')
      .select('id, slug, title, content, excerpt, category, status, featured, author_name, author_avatar, author_role, cover_image, meta_title, meta_description, tags, featured_products, read_time, published_at, created_at, updated_at')
      .eq('slug', slug);

    if (!isAdmin) {
      query = query.eq('status', 'published');
    }

    const { data, error } = await query.single();

    if (error || !data) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const response = NextResponse.json(data);
    if (!isAdmin) {
      response.headers.set('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=86400');
    }
    return response;
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      formatApiError(error, 'Failed to fetch blog post'),
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const rateLimitResponse = await checkRateLimit(request, 'admin');
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { slug } = await params;
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
  const result = blogPostUpdateSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues[0]?.message || 'Invalid update data' },
      { status: 400 }
    );
  }
  const updatePayload: Record<string, unknown> = { ...result.data };
  if (result.data.content) {
    updatePayload.read_time = estimateReadTime(result.data.content);
  }
  if (result.data.status === 'published' && !result.data.published_at) {
    updatePayload.published_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('blog_posts')
    .update(updatePayload)
    .eq('slug', slug)
    .select()
    .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidatePath('/blog');
    revalidatePath(`/blog/${slug}`);
    if (data?.slug && data.slug !== slug) {
      revalidatePath(`/blog/${data.slug}`);
    }

    return NextResponse.json(data);
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      formatApiError(error, 'Failed to update blog post'),
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const rateLimitResponse = await checkRateLimit(request, 'admin');
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { slug } = await params;
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

  const { error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('slug', slug);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidatePath('/blog');
    revalidatePath(`/blog/${slug}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      formatApiError(error, 'Failed to delete blog post'),
      { status: 500 }
    );
  }
}
