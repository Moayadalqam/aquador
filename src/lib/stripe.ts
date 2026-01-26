import Stripe from 'stripe';
import { API_TIMEOUT } from './api-utils';

let stripeInstance: Stripe | null = null;

/**
 * Get or create a singleton Stripe instance
 * Reuses the same instance across requests to avoid instantiation overhead
 */
export function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set');
    }
    // Sanitize the key to remove any invisible characters (newlines, carriage returns, etc.)
    const sanitizedKey = process.env.STRIPE_SECRET_KEY.replace(/[\r\n\s]/g, '');
    stripeInstance = new Stripe(sanitizedKey, {
      timeout: API_TIMEOUT,
    });
  }
  return stripeInstance;
}

// Legacy export for backward compatibility (lazy getter)
export const stripe = {
  get instance(): Stripe {
    return getStripe();
  },
};

export const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
