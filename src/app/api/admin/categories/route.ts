import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import * as Sentry from '@sentry/nextjs';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatApiError } from '@/lib/api-utils';
import { checkRateLimit } from '@/lib/rate-limit';

export const maxDuration = 10;

const categoryCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  slug: z.string().min(1, 'Slug is required').max(200),
  description: z.string().max(1000).nullable().optional(),
  is_active: z.boolean().optional().default(true),
  display_order: z.number().int().nonnegative().optional(),
});

const categoryUpdateSchema = categoryCreateSchema.extend({
  id: z.string().uuid('Valid category ID required'),
});

const deleteSchema = z.object({
  id: z.string().uuid('Valid category ID required'),
});

/** Verify the caller is an authenticated admin */
async function verifyAdmin(): Promise<
  | { user: { id: string; email?: string }; error?: never }
  | { user?: never; error: NextResponse }
> {
  const authSupabase = await createClient();
  const {
    data: { user },
  } = await authSupabase.auth.getUser();

  if (!user) {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  const { data: adminUser } = await authSupabase
    .from('admin_users')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (!adminUser) {
    return {
      error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    };
  }

  Sentry.setUser({ id: user.id, email: user.email });
  return { user };
}

/** Revalidate storefront pages that show categories */
function revalidateCategoryPaths(slug?: string) {
  revalidatePath('/shop');
  if (slug) {
    revalidatePath(`/shop/${slug}`);
  }
}

// POST — Create category
export async function POST(request: NextRequest) {
  const rateLimitResponse = await checkRateLimit(request, 'admin');
  if (rateLimitResponse) return rateLimitResponse;

  const auth = await verifyAdmin();
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const result = categoryCreateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || 'Invalid category data' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { data: category, error: insertError } = await supabase
      .from('product_categories')
      .insert(result.data)
      .select('id, slug')
      .single();

    if (insertError) {
      Sentry.captureException(insertError);
      return NextResponse.json(
        { error: 'Failed to create category: ' + insertError.message },
        { status: 500 }
      );
    }

    revalidateCategoryPaths(category.slug);

    return NextResponse.json({ id: category.id }, { status: 201 });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      formatApiError(error, 'Failed to create category'),
      { status: 500 }
    );
  }
}

// PUT — Update category
export async function PUT(request: NextRequest) {
  const rateLimitResponse = await checkRateLimit(request, 'admin');
  if (rateLimitResponse) return rateLimitResponse;

  const auth = await verifyAdmin();
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const result = categoryUpdateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || 'Invalid category data' },
        { status: 400 }
      );
    }

    const { id, ...updateData } = result.data;
    const supabase = createAdminClient();

    const { error: updateError } = await supabase
      .from('product_categories')
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (updateError) {
      Sentry.captureException(updateError);
      return NextResponse.json(
        { error: 'Failed to update category: ' + updateError.message },
        { status: 500 }
      );
    }

    revalidateCategoryPaths(updateData.slug);

    return NextResponse.json({ success: true });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      formatApiError(error, 'Failed to update category'),
      { status: 500 }
    );
  }
}

// DELETE — Delete category
export async function DELETE(request: NextRequest) {
  const rateLimitResponse = await checkRateLimit(request, 'admin');
  if (rateLimitResponse) return rateLimitResponse;

  const auth = await verifyAdmin();
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const result = deleteSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || 'Invalid request' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Fetch slug before delete so we can revalidate the right path
    const { data: cat } = await supabase
      .from('product_categories')
      .select('slug')
      .eq('id', result.data.id)
      .single();

    const { error: deleteError } = await supabase
      .from('product_categories')
      .delete()
      .eq('id', result.data.id);

    if (deleteError) {
      Sentry.captureException(deleteError);
      return NextResponse.json(
        { error: 'Failed to delete category: ' + deleteError.message },
        { status: 500 }
      );
    }

    revalidateCategoryPaths(cat?.slug);

    return NextResponse.json({ success: true });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      formatApiError(error, 'Failed to delete category'),
      { status: 500 }
    );
  }
}
