import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { estimateReadTime, generateSlug } from '@/lib/blog';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '9');
  const category = searchParams.get('category');
  const featured = searchParams.get('featured');
  const statusFilter = searchParams.get('status');
  const offset = (page - 1) * limit;

  const supabase = await createClient();

  let query = supabase
    .from('blog_posts')
    .select('*', { count: 'exact' });

  // Admin can request all posts; public only sees published
  if (statusFilter === 'all') {
    // Verify admin access
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: adminUser } = await supabase
        .from('admin_users')
        .select('id')
        .eq('id', user.id)
        .single();
      if (!adminUser) {
        query = query.eq('status', 'published');
      }
    } else {
      query = query.eq('status', 'published');
    }
  } else {
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

  return NextResponse.json({
    posts: data,
    total: count,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('id')
    .eq('id', user.id)
    .single();

  if (!adminUser) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const slug = body.slug || generateSlug(body.title);
  const read_time = estimateReadTime(body.content || '');

  const { data, error } = await supabase
    .from('blog_posts')
    .insert({
      ...body,
      slug,
      read_time,
      published_at: body.status === 'published' ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
