import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { checkRateLimit } from '@/lib/rate-limit';
import { formatApiError } from '@/lib/api-utils';

export const maxDuration = 10;

const ORDER_STATUSES = [
  'pending', 'confirmed', 'processing', 'shipped',
  'delivered', 'cancelled', 'refunded',
] as const;

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(0).default(0),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  status: z.union([z.enum(ORDER_STATUSES), z.literal('all')]).default('all'),
  q: z.string().max(200).optional(),
});

// GET: list orders with filtering, search, pagination.
// Middleware (matcher /api/admin/:path*) already enforces admin auth.
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = listQuerySchema.safeParse({
      page: searchParams.get('page') ?? undefined,
      pageSize: searchParams.get('pageSize') ?? undefined,
      status: searchParams.get('status') ?? undefined,
      q: searchParams.get('q') ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid query parameters' },
        { status: 400 }
      );
    }

    const { page, pageSize, status, q } = parsed.data;
    const supabase = createAdminClient();

    let query = supabase
      .from('orders')
      .select(
        'id, stripe_session_id, status, total, currency, customer_email, customer_name, customer_phone, items, shipping_address, tags, order_source, created_at',
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    if (q && q.trim()) {
      const escaped = q.trim().replace(/[%_]/g, '\\$&');
      query = query.or(
        `customer_email.ilike.%${escaped}%,customer_name.ilike.%${escaped}%`
      );
    }

    const { data, count, error } = await query;

    if (error) {
      Sentry.captureException(error, { tags: { route: 'admin_orders_list' } });
      return NextResponse.json(
        formatApiError(error, 'Failed to fetch orders'),
        { status: 500 }
      );
    }

    return NextResponse.json({
      orders: data || [],
      total: count || 0,
      page,
      pageSize,
    });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      formatApiError(error, 'Failed to fetch orders'),
      { status: 500 }
    );
  }
}

const patchSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(ORDER_STATUSES),
});

// PATCH: update order status.
export async function PATCH(request: NextRequest) {
  const rateLimitResponse = await checkRateLimit(request, 'admin');
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid request' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from('orders')
      .update({ status: parsed.data.status })
      .eq('id', parsed.data.id);

    if (error) {
      Sentry.captureException(error, { tags: { route: 'admin_orders_patch' } });
      return NextResponse.json(
        formatApiError(error, 'Failed to update order'),
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      formatApiError(error, 'Failed to update order'),
      { status: 500 }
    );
  }
}

const manualOrderSchema = z.object({
  customerEmail: z.string().email('Valid email required'),
  customerName: z.string().max(200).optional(),
  customerPhone: z.string().max(30).optional(),
  items: z.array(z.object({
    name: z.string().min(1),
    quantity: z.number().int().positive(),
    price: z.number().positive(),
    productType: z.string().optional(),
  })).min(1, 'At least one item required'),
  total: z.number().positive('Total must be positive'),
  notes: z.string().max(1000).optional(),
  shippingAddress: z.object({
    name: z.string().optional(),
    address: z.object({
      line1: z.string().optional(),
      line2: z.string().optional(),
      city: z.string().optional(),
      postal_code: z.string().optional(),
      country: z.string().optional(),
    }).optional(),
  }).optional(),
});

export async function POST(request: NextRequest) {
  const rateLimitResponse = await checkRateLimit(request, 'admin');
  if (rateLimitResponse) return rateLimitResponse;

  try {
    // Verify user is authenticated
    const authSupabase = await createClient();
    const { data: { user } } = await authSupabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify user is an admin
    const { data: adminUser } = await authSupabase
      .from('admin_users')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (!adminUser) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    Sentry.setUser({ id: user.id, email: user.email });

    const body = await request.json();
    const result = manualOrderSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || 'Invalid order data' },
        { status: 400 }
      );
    }
    const orderData = result.data;

    const supabase = createAdminClient();

    // Insert order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        stripe_session_id: null,
        order_source: 'manual',
        customer_email: orderData.customerEmail.trim().toLowerCase(),
        customer_name: orderData.customerName?.trim() || null,
        customer_phone: orderData.customerPhone?.trim() || null,
        items: JSON.parse(JSON.stringify(orderData.items || [])),
        total: Math.round(orderData.total * 100), // Store in cents
        currency: 'eur',
        status: 'confirmed' as const,
        shipping_address: orderData.shippingAddress
          ? JSON.parse(JSON.stringify(orderData.shippingAddress))
          : null,
        tags: orderData.notes ? { notes: orderData.notes } : {},
      })
      .select()
      .single();

    if (orderError) {
      Sentry.captureException(orderError);
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }

    // Atomic customer upsert via RPC (eliminates race condition)
    const email = orderData.customerEmail.trim().toLowerCase();
    const { error: customerError } = await supabase.rpc('upsert_customer_on_order', {
      p_email: email,
      p_name: orderData.customerName?.trim() || null,
      p_phone: orderData.customerPhone?.trim() || null,
      p_order_total: Math.round(orderData.total * 100),
      p_shipping: orderData.shippingAddress
        ? JSON.parse(JSON.stringify(orderData.shippingAddress))
        : null,
    });

    if (customerError) {
      Sentry.captureMessage('Customer upsert RPC failed', {
        level: 'warning',
        extra: { customerError, email },
      });
    }

    return NextResponse.json({ order });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
