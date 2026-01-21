import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import * as Sentry from '@sentry/nextjs';
import type { CartItem } from '@/types/cart';
import { CURRENCY_CODE, toCents } from '@/lib/currency';
import { API_TIMEOUT, formatApiError } from '@/lib/api-utils';
import { checkRateLimit } from '@/lib/rate-limit';

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  // Sanitize the key to remove any invisible characters (newlines, carriage returns, etc.)
  const sanitizedKey = process.env.STRIPE_SECRET_KEY.replace(/[\r\n\s]/g, '');
  return new Stripe(sanitizedKey, {
    timeout: API_TIMEOUT,
  });
}

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

const productTypeLabels: Record<string, string> = {
  'perfume': 'Perfume',
  'essence-oil': 'Essence Oil',
  'body-lotion': 'Body Lotion',
};

export async function POST(request: NextRequest) {
  // Check rate limit
  const rateLimitResponse = await checkRateLimit(request, 'checkout');
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const stripe = getStripe();
    const body = await request.json();
    const { items } = body as { items: CartItem[] };

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      );
    }

    // Create line items for Stripe
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item) => ({
      price_data: {
        currency: CURRENCY_CODE,
        product_data: {
          name: item.name,
          description: `${productTypeLabels[item.productType]} - ${item.size}`,
          images: item.image ? [item.image] : undefined,
        },
        unit_amount: toCents(item.price),
      },
      quantity: item.quantity,
    }));

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      success_url: `${BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}/checkout/cancel`,
      shipping_address_collection: {
        allowed_countries: ['CY', 'GR', 'GB', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT'],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 0,
              currency: CURRENCY_CODE,
            },
            display_name: 'Free shipping',
            delivery_estimate: {
              minimum: {
                unit: 'business_day',
                value: 3,
              },
              maximum: {
                unit: 'business_day',
                value: 7,
              },
            },
          },
        },
      ],
      metadata: {
        itemCount: items.length.toString(),
        items: JSON.stringify(items.map(i => ({
          productId: i.productId,
          variantId: i.variantId,
          name: i.name,
          quantity: i.quantity,
          price: i.price,
        }))),
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    Sentry.captureException(error);
    console.error('Checkout error:', error);

    const errorResponse = formatApiError(error, 'Failed to create checkout session');

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
