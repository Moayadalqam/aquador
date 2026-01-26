import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import * as Sentry from '@sentry/nextjs';
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

export async function POST(request: NextRequest) {
  // Check rate limit
  const rateLimitResponse = await checkRateLimit(request, 'payment');
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const stripe = getStripe();
    const body = await request.json();
    const { perfumeName, composition, volume, specialRequests } = body;

    // Validate required fields
    if (!perfumeName || !composition || !volume) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate price in cents
    const amount = volume === '100ml' ? 19900 : 2999;

    // Create Stripe Checkout Session (same as regular checkout)
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Custom Perfume: ${perfumeName}`,
              description: `${volume} - Top: ${composition.top}, Heart: ${composition.heart}, Base: ${composition.base}`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      success_url: `${BASE_URL}/create-perfume/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}/create-perfume`,
      shipping_address_collection: {
        allowed_countries: ['CY', 'GR', 'GB', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT'],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 0,
              currency: 'eur',
            },
            display_name: 'Free shipping',
            delivery_estimate: {
              minimum: {
                unit: 'business_day',
                value: 5,
              },
              maximum: {
                unit: 'business_day',
                value: 10,
              },
            },
          },
        },
      ],
      metadata: {
        productType: 'custom-perfume',
        perfumeName,
        topNote: composition.top,
        heartNote: composition.heart,
        baseNote: composition.base,
        volume,
        specialRequests: specialRequests || '',
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    Sentry.captureException(error);
    console.error('Create perfume payment error:', error);

    const errorResponse = formatApiError(error, 'Failed to create checkout session');

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
