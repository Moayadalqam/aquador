import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import * as Sentry from '@sentry/nextjs';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatApiError } from '@/lib/api-utils';
import { checkRateLimit } from '@/lib/rate-limit';

export const maxDuration = 10;

const productCategoryEnum = z.enum([
  'men',
  'women',
  'niche',
  'essence-oil',
  'body-lotion',
  'lattafa-original',
  'al-haramain-originals',
  'victorias-secret-originals',
]);

const productTypeEnum = z.enum(['perfume', 'essence-oil', 'body-lotion']);
const productGenderEnum = z.enum(['men', 'women', 'unisex']);

const productSchema = z.object({
  name: z.string().min(1, 'Name is required').max(300),
  description: z.string().min(1, 'Description is required'),
  price: z.number().positive('Price must be positive'),
  sale_price: z.number().positive().nullable().optional(),
  category: productCategoryEnum,
  product_type: productTypeEnum,
  size: z.string().min(1, 'Size is required').max(50),
  image: z.string().url('Image must be a valid URL'),
  images: z.array(z.string().url()).max(5).nullable().optional(),
  in_stock: z.boolean().optional().default(true),
  is_active: z.boolean().optional().default(true),
  brand: z.string().max(200).nullable().optional(),
  gender: productGenderEnum.nullable().optional(),
  tags: z.array(z.string()).nullable().optional(),
});

// Product IDs are slugs (kebab-case text), not UUIDs — the `products.id` column is text-typed.
const productIdSchema = z
  .string()
  .min(1, 'Valid product ID required')
  .max(200, 'Valid product ID required')
  .regex(/^[a-z0-9][a-z0-9-]*$/, 'Valid product ID required');

const updateSchema = productSchema.extend({
  id: productIdSchema,
});

const deleteSchema = z.object({
  id: productIdSchema,
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

/** Revalidate storefront pages that display products */
function revalidateProductPaths(slug?: string) {
  revalidatePath('/shop');
  revalidatePath('/');
  if (slug) {
    revalidatePath(`/products/${slug}`);
  }
}

// POST — Create product
export async function POST(request: NextRequest) {
  const rateLimitResponse = await checkRateLimit(request, 'admin');
  if (rateLimitResponse) return rateLimitResponse;

  const auth = await verifyAdmin();
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const result = productSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || 'Invalid product data' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { data: product, error: insertError } = await supabase
      .from('products')
      .insert(result.data)
      .select('id')
      .single();

    if (insertError) {
      Sentry.captureException(insertError);
      return NextResponse.json(
        { error: 'Failed to create product: ' + insertError.message },
        { status: 500 }
      );
    }

    revalidateProductPaths(product.id);

    return NextResponse.json({ id: product.id }, { status: 201 });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(formatApiError(error, 'Failed to create product'), {
      status: 500,
    });
  }
}

// PUT — Update product
export async function PUT(request: NextRequest) {
  const rateLimitResponse = await checkRateLimit(request, 'admin');
  if (rateLimitResponse) return rateLimitResponse;

  const auth = await verifyAdmin();
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const result = updateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || 'Invalid product data' },
        { status: 400 }
      );
    }

    const { id, ...updateData } = result.data;
    const supabase = createAdminClient();

    const { error: updateError } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id);

    if (updateError) {
      Sentry.captureException(updateError);
      return NextResponse.json(
        { error: 'Failed to update product: ' + updateError.message },
        { status: 500 }
      );
    }

    revalidateProductPaths(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(formatApiError(error, 'Failed to update product'), {
      status: 500,
    });
  }
}

// DELETE — Delete product
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

    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', result.data.id);

    if (deleteError) {
      Sentry.captureException(deleteError);
      return NextResponse.json(
        { error: 'Failed to delete product: ' + deleteError.message },
        { status: 500 }
      );
    }

    revalidateProductPaths(result.data.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(formatApiError(error, 'Failed to delete product'), {
      status: 500,
    });
  }
}
