import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import * as Sentry from '@sentry/nextjs';
import { z } from 'zod';
import { CURRENCY_CODE, toCents } from '@/lib/currency';
import { formatApiError } from '@/lib/api-utils';
import { checkRateLimit } from '@/lib/rate-limit';
import { getProductTypeLabel, SHIPPING_COUNTRIES } from '@/lib/constants';
import { getStripe } from '@/lib/stripe';
import { cartItemSchema, validateCartPrices } from '@/lib/validation/cart';

export const maxDuration = 10;

const checkoutSchema = z.object({
  items: z.array(cartItemSchema).min(1, 'Cart is empty'),
});

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function POST(request: NextRequest) {
  // Check rate limit
  const rateLimitResponse = await checkRateLimit(request, 'checkout');
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const stripe = getStripe();
    const body = await request.json();
    const result = checkoutSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || 'Invalid cart data' },
        { status: 400 }
      );
    }
    const { items } = result.data;

    // SECURITY: Validate items against server-side catalog and get catalog prices
    const priceValidation = await validateCartPrices(items);
    if (!priceValidation.valid) {
      return NextResponse.json(
        { error: 'Invalid cart items', details: priceValidation.errors },
        { status: 400 }
      );
    }

    // Always use server-side catalog prices (never trust client prices)
    const verifiedItems = priceValidation.correctedItems!;

    // Create line items for Stripe
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = verifiedItems.map((item) => {
      const description = `${getProductTypeLabel(item.productType || 'perfume')} - ${item.size || ''}`;

      return {
        price_data: {
          currency: CURRENCY_CODE,
          product_data: {
            name: item.name,
            description,
            images: item.image ? [item.image] : undefined,
          },
          unit_amount: toCents(item.price),
        },
        quantity: item.quantity,
      };
    });

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      success_url: `${BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}/checkout/cancel`,
      shipping_address_collection: {
        allowed_countries: [...SHIPPING_COUNTRIES],
      },
      phone_number_collection: { enabled: true },
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
                value: 1,
              },
              maximum: {
                unit: 'business_day',
                value: 2,
              },
            },
          },
        },
      ],
      // Store minimal metadata (Stripe 500-char limit per key)
      // pid=productId, vid=variantId, qty=quantity
      // Webhook reconstructs full data from these identifiers
      metadata: {
        itemCount: verifiedItems.length.toString(),
        items: JSON.stringify(verifiedItems.map(i => ({
          pid: i.productId,
          vid: i.variantId,
          qty: i.quantity,
        }))),
      },
    });

    const response = NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
    response.headers.set('Cache-Control', 'no-store, no-cache');
    return response;
  } catch (error) {
    Sentry.captureException(error);

    const errorResponse = formatApiError(error, 'Failed to create checkout session');

    const response = NextResponse.json(errorResponse, { status: 500 });
    response.headers.set('Cache-Control', 'no-store, no-cache');
    return response;
  }
}
