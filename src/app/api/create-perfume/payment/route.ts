import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();
    const body = await request.json()
    const { perfumeName, composition, volume, specialRequests } = body

    // Validate required fields
    if (!perfumeName || !composition || !volume) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Calculate price
    const amount = volume === '100ml' ? 19900 : 2999 // in cents

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      metadata: {
        perfumeName,
        topNote: composition.top,
        heartNote: composition.heart,
        baseNote: composition.base,
        volume,
        specialRequests: specialRequests || '',
        productType: 'custom-perfume',
      },
      description: `Custom Perfume: ${perfumeName} (${volume})`,
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      amount: paymentIntent.amount,
    })
  } catch (error) {
    console.error('Payment intent creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}
