export const CURRENCY = 'EUR' as const;
export const CURRENCY_CODE = 'eur' as const;
export const CURRENCY_SYMBOL = '\u20AC';

const formatter = new Intl.NumberFormat('en-CY', {
  style: 'currency',
  currency: CURRENCY,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatPrice(amount: number): string {
  return formatter.format(amount);
}

export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

export function fromCents(cents: number): number {
  return cents / 100;
}

export function calculateSubtotal(items: { price: number; quantity: number }[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}
