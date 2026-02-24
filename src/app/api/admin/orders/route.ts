import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { createAdminClient } from '@/lib/supabase/admin';

interface ManualOrderItem {
  name: string;
  quantity: number;
  price: number;
  productType?: string;
}

interface ManualOrderBody {
  customerEmail: string;
  customerName?: string;
  items: ManualOrderItem[];
  total: number;
  notes?: string;
  shippingAddress?: {
    name?: string;
    address?: {
      line1?: string;
      line2?: string;
      city?: string;
      postal_code?: string;
      country?: string;
    };
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: ManualOrderBody = await request.json();

    if (!body.customerEmail || !body.total || body.total <= 0) {
      return NextResponse.json(
        { error: 'Customer email and total are required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Insert order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        stripe_session_id: null,
        order_source: 'manual',
        customer_email: body.customerEmail.trim().toLowerCase(),
        customer_name: body.customerName?.trim() || null,
        items: JSON.parse(JSON.stringify(body.items || [])),
        total: Math.round(body.total * 100), // Store in cents
        currency: 'eur',
        status: 'confirmed' as const,
        shipping_address: body.shippingAddress
          ? JSON.parse(JSON.stringify(body.shippingAddress))
          : null,
        tags: body.notes ? { notes: body.notes } : {},
      })
      .select()
      .single();

    if (orderError) {
      console.error('Failed to create manual order:', orderError);
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }

    // Upsert customer
    const now = new Date().toISOString();
    const email = body.customerEmail.trim().toLowerCase();

    const { data: existing } = await supabase
      .from('customers')
      .select('id, total_orders, total_spent, shipping_addresses')
      .eq('email', email)
      .single();

    if (existing) {
      const addresses = (existing.shipping_addresses as unknown[]) || [];
      if (body.shippingAddress?.address) {
        const addrStr = JSON.stringify(body.shippingAddress);
        const alreadyStored = addresses.some(a => JSON.stringify(a) === addrStr);
        if (!alreadyStored) addresses.push(body.shippingAddress);
      }

      await supabase
        .from('customers')
        .update({
          name: body.customerName?.trim() || undefined,
          total_orders: existing.total_orders + 1,
          total_spent: existing.total_spent + Math.round(body.total * 100),
          last_order_at: now,
          shipping_addresses: JSON.parse(JSON.stringify(addresses)),
        })
        .eq('id', existing.id);
    } else {
      await supabase.from('customers').insert({
        email,
        name: body.customerName?.trim() || null,
        total_orders: 1,
        total_spent: Math.round(body.total * 100),
        first_order_at: now,
        last_order_at: now,
        shipping_addresses: body.shippingAddress
          ? JSON.parse(JSON.stringify([body.shippingAddress]))
          : [],
      });
    }

    return NextResponse.json({ order });
  } catch (error) {
    Sentry.captureException(error);
    console.error('Manual order creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
