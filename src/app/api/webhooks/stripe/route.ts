import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import * as Sentry from '@sentry/nextjs';
import { fetchWithTimeout } from '@/lib/api-utils';
import { formatPrice } from '@/lib/utils';
import { createAdminClient } from '@/lib/supabase/admin';

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

// HTML-escape function to prevent XSS in email templates
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  productType?: string;
}

interface ShippingAddress {
  name?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    postal_code?: string;
    country?: string;
  };
}

async function persistOrder(
  session: Stripe.Checkout.Session,
  items: OrderItem[],
  shippingAddress: ShippingAddress | null,
  orderTags: Record<string, string>
) {
  try {
    const supabase = createAdminClient();
    const customerEmail = session.customer_details?.email;
    const customerName = session.customer_details?.name;

    if (!customerEmail) return;

    // Insert order (idempotent via unique stripe_session_id)
    const { error: orderError } = await supabase.from('orders').upsert(
      {
        stripe_session_id: session.id,
        customer_email: customerEmail,
        customer_name: customerName || null,
        items: JSON.parse(JSON.stringify(items)),
        total: session.amount_total || 0,
        currency: session.currency || 'eur',
        status: 'confirmed' as const,
        shipping_address: shippingAddress ? JSON.parse(JSON.stringify(shippingAddress)) : null,
        tags: Object.keys(orderTags).length > 0 ? orderTags : {},
      },
      { onConflict: 'stripe_session_id', ignoreDuplicates: true }
    );

    if (orderError) {
      console.error('Failed to persist order:', orderError);
      Sentry.captureMessage('Order persistence failed', {
        level: 'error',
        extra: { orderError, sessionId: session.id },
      });
      return;
    }

    // Upsert customer
    const now = new Date().toISOString();
    const { data: existing } = await supabase
      .from('customers')
      .select('id, total_orders, total_spent, shipping_addresses')
      .eq('email', customerEmail)
      .single();

    if (existing) {
      const addresses = (existing.shipping_addresses as ShippingAddress[]) || [];
      if (shippingAddress?.address) {
        const addrStr = JSON.stringify(shippingAddress);
        const alreadyStored = addresses.some(a => JSON.stringify(a) === addrStr);
        if (!alreadyStored) addresses.push(shippingAddress);
      }

      await supabase
        .from('customers')
        .update({
          name: customerName || undefined,
          total_orders: existing.total_orders + 1,
          total_spent: existing.total_spent + (session.amount_total || 0),
          last_order_at: now,
          shipping_addresses: JSON.parse(JSON.stringify(addresses)),
        })
        .eq('id', existing.id);
    } else {
      await supabase.from('customers').insert({
        email: customerEmail,
        name: customerName || null,
        total_orders: 1,
        total_spent: session.amount_total || 0,
        first_order_at: now,
        last_order_at: now,
        shipping_addresses: shippingAddress
          ? JSON.parse(JSON.stringify([shippingAddress]))
          : [],
      });
    }

    console.log('Order persisted for:', customerEmail);
  } catch (error) {
    Sentry.captureException(error, {
      tags: { action: 'persist_order' },
      extra: { sessionId: session.id },
    });
    console.error('Error persisting order:', error);
  }
}

async function sendOrderConfirmationEmail(
  customerEmail: string,
  orderDetails: {
    sessionId: string;
    items: OrderItem[];
    total: number;
    currency: string;
    shippingAddress?: ShippingAddress | null;
  }
): Promise<boolean> {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    console.log('Order confirmation email skipped (RESEND_API_KEY not configured)');
    return false;
  }

  const itemsHtml = orderDetails.items
    .map(item => {
      return `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">${escapeHtml(item.name)}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${formatPrice(item.price)}</td>
        </tr>
      `;
    })
    .join('');

  const shippingHtml = orderDetails.shippingAddress?.address ? `
    <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #333; margin-top: 0;">Shipping Address</h3>
      <p style="color: #555; margin: 0;">
        ${escapeHtml(orderDetails.shippingAddress.name || '')}<br>
        ${escapeHtml(orderDetails.shippingAddress.address.line1 || '')}<br>
        ${orderDetails.shippingAddress.address.line2 ? escapeHtml(orderDetails.shippingAddress.address.line2) + '<br>' : ''}
        ${escapeHtml(orderDetails.shippingAddress.address.city || '')}, ${escapeHtml(orderDetails.shippingAddress.address.postal_code || '')}<br>
        ${escapeHtml(orderDetails.shippingAddress.address.country || '')}
      </p>
    </div>
  ` : '';

  try {
    const response = await fetchWithTimeout('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "Aquad'or <orders@aquadorcy.com>",
        to: [customerEmail],
        subject: `Order Confirmation - Aquad'or #${orderDetails.sessionId.slice(-8).toUpperCase()}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff;">
            <div style="background: #0a0a0a; padding: 30px; text-align: center;">
              <h1 style="color: #D4AF37; margin: 0; font-family: Georgia, serif;">Aquad'or</h1>
              <p style="color: #888; margin: 10px 0 0;">Where Luxury Meets Distinction</p>
            </div>

            <div style="padding: 30px;">
              <h2 style="color: #333; border-bottom: 2px solid #D4AF37; padding-bottom: 10px;">
                Thank You for Your Order!
              </h2>

              <p style="color: #555; line-height: 1.6;">
                Your order has been confirmed and is being prepared. You'll receive another email when your order ships.
              </p>

              <p style="color: #888; font-size: 14px;">
                Order Reference: <strong style="color: #333;">#${orderDetails.sessionId.slice(-8).toUpperCase()}</strong>
              </p>

              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <thead>
                  <tr style="background: #f9f9f9;">
                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #D4AF37;">Item</th>
                    <th style="padding: 12px; text-align: center; border-bottom: 2px solid #D4AF37;">Qty</th>
                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid #D4AF37;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="2" style="padding: 12px; text-align: right; font-weight: bold;">Total:</td>
                    <td style="padding: 12px; text-align: right; font-weight: bold; color: #D4AF37;">
                      ${formatPrice(orderDetails.total / 100)}
                    </td>
                  </tr>
                </tfoot>
              </table>

              ${shippingHtml}

              <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-top: 30px;">
                <h3 style="color: #333; margin-top: 0;">Need Help?</h3>
                <p style="color: #555; margin: 0;">
                  Contact us at <a href="mailto:info@aquadorcy.com" style="color: #D4AF37;">info@aquadorcy.com</a><br>
                  or call +357 99 980809
                </p>
              </div>
            </div>

            <div style="background: #0a0a0a; padding: 20px; text-align: center;">
              <p style="color: #888; font-size: 12px; margin: 0;">
                &copy; ${new Date().getFullYear()} Aquad'or Cyprus. All rights reserved.<br>
                Ledra 145, 1011, Nicosia, Cyprus
              </p>
            </div>
          </div>
        `,
      }),
      timeout: 10000,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to send order confirmation email:', errorData);
      Sentry.captureMessage('Order confirmation email failed', {
        level: 'warning',
        tags: { service: 'resend' },
        extra: { errorData, sessionId: orderDetails.sessionId },
      });
      return false;
    }

    console.log('Order confirmation email sent to:', customerEmail);
    return true;
  } catch (error) {
    Sentry.captureException(error, {
      tags: { service: 'resend', action: 'order_confirmation' },
    });
    console.error('Error sending order confirmation email:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    Sentry.captureException(err, {
      tags: { webhook: 'stripe', error_type: 'signature_verification' },
    });
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;

      // Log the successful order
      console.log('Order completed:', {
        sessionId: session.id,
        customerEmail: session.customer_details?.email,
        amountTotal: session.amount_total,
        currency: session.currency,
        metadata: session.metadata,
      });

      // Parse items, shipping, and order tags
      const customerEmail = session.customer_details?.email;
      let items: OrderItem[] = [];
      let shippingAddress: ShippingAddress | null = null;

      const orderTags: Record<string, string> = {};

      if (session.metadata?.items) {
        try {
          items = JSON.parse(session.metadata.items);
        } catch (parseError) {
          Sentry.captureException(parseError, {
            tags: { action: 'parse_order_items' },
            extra: { sessionId: session.id },
          });
          console.error('Failed to parse order items:', parseError);
        }
      }

      const shippingDetails = session.collected_information?.shipping_details;
      if (shippingDetails) {
        shippingAddress = {
          name: shippingDetails.name ?? undefined,
          address: shippingDetails.address ? {
            line1: shippingDetails.address.line1 ?? undefined,
            line2: shippingDetails.address.line2 ?? undefined,
            city: shippingDetails.address.city ?? undefined,
            postal_code: shippingDetails.address.postal_code ?? undefined,
            country: shippingDetails.address.country ?? undefined,
          } : undefined,
        };
      }

      // Persist order + customer to Supabase
      await persistOrder(session, items, shippingAddress, orderTags);

      // Send confirmation email
      if (customerEmail && items.length > 0) {
        await sendOrderConfirmationEmail(customerEmail, {
          sessionId: session.id,
          items,
          total: session.amount_total || 0,
          currency: session.currency || 'eur',
          shippingAddress,
        });
      }

      break;
    }

    case 'checkout.session.expired': {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log('Checkout session expired:', session.id);
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log('Payment failed:', {
        id: paymentIntent.id,
        error: paymentIntent.last_payment_error?.message,
      });
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
